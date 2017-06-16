//Комната
function Room( parameters ){

  var parameters = parameters || {};
  var self = this;

  this.id = THREE.Math.generateUUID(),

  this.type = 'Room';
  this.name = 'room';

  this.closedRoom = true;

  this._type = parameters.hasOwnProperty("_type") ? parameters["_type"] : 'closedRoom';
  this.external = parameters.hasOwnProperty("external") ? parameters["external"] : false;

  this.nodes = parameters.hasOwnProperty("nodes") ? parameters["nodes"] : [];
  this.chain = parameters.hasOwnProperty("chain") ? parameters["chain"] : [];
  this.walls =  [];
  this.wallsParams =  [];
  this.external_walls = [];
  this.elements = [];
  this.isClockWise = parameters.hasOwnProperty("isClockWise") ? parameters["isClockWise"] : false;
  this.surfaces = [];
  this.counturLine = null;
  this.floor = null;

  this.init();

}

Room.prototype = Object.assign( {}, {
  constructor: Room,

  init: function(){

    if( this._type != 'freeRoom'){

      this.countur = this.getCountur( this.chain );
      this.walls = this.getWalls( this.chain );
      this.objArea = this.getArea( this.countur );
      this.area = this.getArea( this.countur );
      this.area_coords_3D = this.getAreaCoords( this.countur );
      this.area_coords = { x: this.area_coords_3D.x, y: this.area_coords_3D.z };


      //отрисовка контура комнаты
      if( !this.external ){

        this.addCounturLine( this.chain, this.nodes );
        this.showCounturLine();

        this.defineAreaNotification();
        this.showAreaNotification();

        this.addSelectAllWallsTool();
        this.hideSelectAllWallsTool();

        this.floor = new RoomFloor( this );
        scene.add( this.floor );
        this.hideFloor();

      }

    } else {

      this.closedRoom = false;
      this.walls = this.getWalls( this.chain );
      this.area = 0;
      this.area_coords = {x: 0, y: 0};
      this.area_coords_3D = 0;
      this.isClockWise = 0;

    }

    this.surfaces = this.getSurfaces( this.chain );
    this.combineColinearSurfaces( this.surfaces );

    this.hideSurfaces();

    this.doorways = this.getDoorways ( this.chain );


  },

  getCountur: function( chain ){
    var countur = [];
    var nodes = this.nodes;
    chain.forEach(function( item ){
//      if( ! countur.length == 0 && ! nodes[item.source.id] )debugger;
      if( countur.length == 0 ){
        countur.push( new THREE.Vector2( nodes[item.source.id].position.x, nodes[item.source.id].position.z ) );
        countur.push( new THREE.Vector2( nodes[item.target.id].position.x, nodes[item.target.id].position.z ) );
      } else if(countur[countur.length-1].x == nodes[item.target.id].position.x && countur[countur.length-1].y == nodes[item.target.id].position.z && nodes[item.source.id] ){
        countur.push( new THREE.Vector2( nodes[item.source.id].position.x, nodes[item.source.id].position.z ) );
      } else {
        countur.push( new THREE.Vector2( nodes[item.target.id].position.x, nodes[item.target.id].position.z ) );
      }

    });

    countur.length = countur.length - 1;

    return countur;

  },
  getWalls: function( chain ){
    var self = this;
    var walls = [];
    chain.forEach(function( item ){

      if( walls.indexOf( item.wall_uuid ) == -1 ){

        walls.push( item.wall_uuid );

      } else {

        var wall = scene.getObjectByProperty( 'uuid', item.wall_uuid );

        //в случае внутренней перегородки (но не "толстой" стены)
        if( wall.mover.v1_neighbors.length == 0 || wall.mover.v2_neighbors.length == 0){

          self.externalWallsAdd(item.wall_uuid, false);
          wall.external_wall = false;

        }

      }

    });

    return walls;

  },

  getElements: function(){

    var self = this;
    var elements = [];

    //исключаем площадь колонн, лестниц?
    $wallEditor.walls.forEach(function( item ){

      if( self.walls.indexOf( item.uuid) == -1)
      switch ( item.bearingType ) {
        case 'stairs':

          if( $wallEditor.isPointInCountur( self.walls, item.v1) || $wallEditor.isPointInCountur( self.walls, item.v2 ) ){

            var position = item.axisLine.getCenter();
            elements.push({
              position: {
                x: position.x,
                y: position.z
              },
              size: {
                width: item.axisLength,
                height: item.width
              },
              angle: 0,
              id: item.uuid,
              basic_class: "plan",
              sysname: "stairs2"
            });
          }

          break;

        case 'something else':
        break;
      }


    });


    this.elements = elements;
    return elements;
  },
  getArea: function( countur ){

    var nativeArea = THREE.ShapeUtils.area( countur );
    var area = Math.abs( nativeArea );
    return  area ;

  },
  getAreaWithoutOpenings: function(){

    var self = this;
    var area = this.getArea( this.countur );
    var countur = this.getCountur( this.chain );

    //исключаем площадь колонн, лестниц?
    $wallEditor.walls.forEach(function( item ){

      if( self.walls.indexOf( item.uuid) == -1)
      switch ( item.bearingType ) {
        case 'pillar':
        case 'partition_wall':
        case 'stairs':

          if( $wallEditor.isPointInCountur( self.walls, item.v1) || $wallEditor.isPointInCountur( self.walls, item.v2 ) ){
            area -= item.getPlanArea();
          }

          break;

        case 'something else':
        break;
      }


    })
     return area;
  },
  getAreaCoords: function( countur ){

    var area_coord = new THREE.Vector3();
    var max_area = 0;
    var triangles = THREE.ShapeUtils.triangulate( countur );

    if(triangles)
    triangles.forEach(function( item2 ){

      var triangle = new THREE.Triangle(
                                    new THREE.Vector3(item2[0].x, 0, item2[0].y),
                                    new THREE.Vector3(item2[1].x, 0, item2[1].y),
                                    new THREE.Vector3(item2[2].x, 0, item2[2].y)
                                    );


      var current_area = triangle.area();
      if( current_area > max_area ){
        max_area = current_area;
        area_coord = triangle.midpoint();
      }

    });


    return area_coord;

  },
  defineAreaNotification: function(){

    //приведение единиц измерения для отображения
    var area = (this.area * area_unit.c).toFixed( area_accuracy_measurements );

    if( this.areaNotification ){

      this.areaNotification.position.copy( this.area_coords_3D );
      this.areaNotification.setMessage( area + " " + area_unit.short_name );
      this.areaNotification.update();
      this.areaNotification.material.visible = true;

    } else {

      this.addAreaNotification( this.area_coords_3D, area );

    }

  },
  addAreaNotification: function( area_coord, area ){

    this.areaNotification = new noteSimple(
                                      null,
                                      area + " " + area_unit.short_name,
                                      {
                                        backgroundColor: { r:255, g:255, b:255, a:0 },
                                        borderColor:     { r:255, g:255, b:255, a:0 },
                                        fontsize: 36
                                      }
                                      );
    this.areaNotification.position.copy( area_coord );
    scene.add( this.areaNotification );

  },
  showAreaNotification: function(){

    if( this.areaNotification )
    this.areaNotification.material.visible = true;

  },
  hideAreaNotification: function(){

       if( this.areaNotification )
         this.areaNotification.material.visible = false;

  },

  getFloorPerimeter: function(){

    var perimeter = 0;

    for (var i = 1; i < this.countur.length-1; i++) {

      perimeter += this.countur[i-1].distanceTo( this.countur[i] );

    }

    return perimeter;
  },


  addSelectAllWallsTool: function(area_coord){

    var self = this;

    this.selectAllWallsTool = new noteSimple(
                                      null,
                                      'Стены',
                                      {
                                        backgroundColor: { r:255, g:255, b:255, a:0 },
                                        borderColor:     { r:0, g:0, b:0, a:0 },
                                        fontsize: 36
                                      }
                                      );
    this.selectAllWallsTool.position.copy( this.area_coords_3D.clone().add( new THREE.Vector3(0,0,200)) );
    scene.add( this.selectAllWallsTool );

    this.selectAllWallsTool.select = function(){
      self.selectAllWalls();
    };
    this.selectAllWallsTool.unselect = function(){
      self.unSelectAllWalls();
    };

  },
  showSelectAllWallsTool: function(){

    if( this.selectAllWallsTool )
    this.selectAllWallsTool.material.visible = true;

  },
  hideSelectAllWallsTool: function(){

       if( this.selectAllWallsTool )
         this.selectAllWallsTool.material.visible = false;

  },



  getSurfaces: function( chain ){
    var self = this;
    var surfaces = [];
    var vertieces = [];
    chain.forEach(function( item, index ){

      var next_index = ( index == chain.length-1 ) ? 0 : index + 1;
      var prev_index = ( index == 0 ) ? chain.length-1 : index - 1;
      // случай путей на  одной стене
      var moveBasicPoint = chain[ next_index ].wall_uuid == item.wall_uuid || chain[ prev_index ].wall_uuid == item.wall_uuid;

      var wall = scene.getObjectByProperty( 'uuid', item.wall_uuid );
      vertieces[0] = self.nodes[item.source.id].position;
      vertieces[1] = self.nodes[item.target.id].position;
      var exception = item.id.split('_').indexOf('e') != -1; // для торцевых поверхностей
      var surface = new RoomSurface( self, [ wall ], vertieces, moveBasicPoint, exception );
      surfaces.push( surface );
      scene.add( surface );

    });

    return surfaces;

  },
  combineColinearSurfaces: function( surfaces ){

    var surfaces = surfaces || [];

    for (var i = 0; i < surfaces.length - 1; i++ ) {
      var s1 = surfaces[i];
      var s2 = surfaces[i+1];
      var w1 = surfaces[i].walls[0];
      var w2 = surfaces[i+1].walls[0];

      if ( w1.isCollinear( w2 ) && w1.width == w2.width && w1.height == w2.height   ){
        var surface = new RoomSurface( this, [ w1, w2 ], [ s1.source, s2.target, s1.sourceBase, s2.targetBase ], s2.movePoint );
        surfaces.splice(i, 2, surface );
        scene.remove( s1, s2 );
        scene.add(surface);
        this.combineColinearSurfaces(surfaces);
        break;
      }
    }



  },
  showSurfaces: function(){

    if( this.surfaces )
    this.surfaces.forEach(function( item ){

      item.visible = true;

    });

  },
  hideSurfaces: function(){

    if( this.surfaces )
    this.surfaces.forEach(function(item){
      item.visible = false;
    });

  },

  getDoorways: function( chain ){

    var self = this;
    var doorways = [];

    chain.forEach(function( item, index ){

      var wall = scene.getObjectByProperty( 'uuid', item.wall_uuid );

      wall.doors.forEach(function( door ){
        doorways.push( door );
      });

    });

    return doorways;
  },

  addCounturLine: function( chain, nodes ){

    var self = this;

    chain.forEach(function(item){

      var geometry = new THREE.Geometry();
      if(nodes[item.source.id] && nodes[item.target.id]){
        geometry.vertices.push( nodes[item.source.id].position.clone(), nodes[item.target.id].position.clone() );
        self.counturLine = new THREE.Line(geometry, LineBasicMaterialRed);
        self.counturLine.name = 'room_line';
        self.counturLine.visible = false;

        scene.add( self.counturLine );
      }

    });
  },
  removeCounturLine: function(){

    scene.remove( this.counturLine );

  },
  showCounturLine: function(){

    if( this.counturLine ){

      this.counturLine.visble = true;

    }

  },
  showFloor: function(){

    if( this.floor && !this.external && this._type != 'freeRoom')
    this.floor.visible = true;

  },
  hideFloor: function(){

    if( this.floor )
    this.floor.visible = false;

  },

  clear: function(){

    //удаляем пол
    scene.remove( this.floor );

    //удаляем контур
    scene.remove( this.counturLine );

    //удаляем примечание площади
    scene.remove( this.areaNotification );

    //удаляем стены комнаты
    this.surfaces.forEach(function( surface ){
      scene.remove( surface );
    });


  },


  externalWallsAdd: function(uuid, value){
    this.external_walls.push(uuid);
  },
  defineWallsParams: function(){

    var j = this.walls.length;
    while (j--) {

      var item = scene.getObjectByProperty( 'uuid', this.walls[j] );

      if( j == 0 ){
        var next_item = scene.getObjectByProperty( 'uuid', this.walls[ this.walls.length - 1 ] );
      } else {
        var next_item = scene.getObjectByProperty( 'uuid', this.walls[ j-1 ] );
      }

      if( j == this.walls.length - 1 ){
        var prev_item = scene.getObjectByProperty( 'uuid', this.walls[ 0 ] );
      } else {
        var prev_item = scene.getObjectByProperty( 'uuid', this.walls[j+1] );
      }

      var inner = null;
      var outer = null;
      var inner_wall_area_without_openings = 0;
      var outer_wall_area_without_openings = 0;
      var volume = 0;

      if ( item.isNeighbor( next_item ) == 'v1' ) {

          var center = {start: {x: +item.v2.x.toFixed(2), y: +item.v2.z.toFixed(2) }, end: {x: +item.v1.x.toFixed(2), y: +item.v1.z.toFixed(2) } };

//                        if ( obj.isPointInCountur( room.walls, item.v11 ) ){
          if ( $wallEditor.isPointInCountur2( this.chain, item.v11, this.nodes ) ){

            var inner = {start: {x: +item.v21.x.toFixed(2), y: +item.v21.z.toFixed(2) }, end: {x: +item.v11.x.toFixed(2), y: +item.v11.z.toFixed(2) } };
//                          var outer = {start: {x: +item.v22.x.toFixed(2), y: +item.v22.z.toFixed(2) }, end: {x: +item.v12.x.toFixed(2), y: +item.v12.z.toFixed(2) } };
            var v12 = item.getV12([next_item]); v12 ? '' : v12 =  item.v12;
            var v22 = item.getV22([prev_item]); v22 ? '' : v22 =  item.v22;
            var outer = {start: {x: +v22.x.toFixed(2), y: +v22.z.toFixed(2) }, end: {x: +v12.x.toFixed(2), y: +v12.z.toFixed(2) } };

            inner_wall_area_without_openings = item.getFirstSideArea();
            outer_wall_area_without_openings = item.getSecondSideArea();

//                        } else if( obj.isPointInCountur( room.walls, item.v12 ) ) {
          } else {
            var v11 = item.getV11([next_item]); v11 ? '' : v11 =  item.v11;
            var v21 = item.getV21([prev_item]); v21 ? '' : v21 =  item.v21;
            var outer = {start: {x: +v21.x.toFixed(2), y: +v21.z.toFixed(2) }, end: {x: + v11.x.toFixed(2), y: + v11.z.toFixed(2) } };
//                          var outer = {start: {x: +item.v21.x.toFixed(2), y: +item.v21.z.toFixed(2) }, end: {x: +item.v11.x.toFixed(2), y: +item.v11.z.toFixed(2) } };
            var inner = {start: {x: +item.v22.x.toFixed(2), y: +item.v22.z.toFixed(2) }, end: {x: +item.v12.x.toFixed(2), y: +item.v12.z.toFixed(2) } };


            inner_wall_area_without_openings = item.getSecondSideArea();
            outer_wall_area_without_openings = item.getFirstSideArea();

          }

      } else if ( item.isNeighbor( next_item ) == 'v2' ) {

          var center = {start: {x: +item.v1.x.toFixed(2), y: +item.v1.z.toFixed(2) }, end: {x: +item.v2.x.toFixed(2), y: +item.v2.z.toFixed(2) } };

//                        if ( obj.isPointInCountur( room.walls, item.v21 ) ){
          if ( $wallEditor.isPointInCountur2( this.chain, item.v11, this.nodes ) ){


            var inner = {start: {x: +item.v11.x.toFixed(2), y: +item.v11.z.toFixed(2) }, end: {x: + item.v21.x.toFixed(2), y: + item.v21.z.toFixed(2) } };
//                          var outer = {start: {x: +item.v12.x.toFixed(2), y: +item.v12.z.toFixed(2) }, end: {x: +item.v22.x.toFixed(2), y: +item.v22.z.toFixed(2) } };
            var v22 = item.getV22([next_item]); v22 ? '' : v22 =  item.v22;
            var v12 = item.getV12([prev_item]); v12 ? '' : v12 =  item.v12;
            var outer = {start: {x: +v12.x.toFixed(2), y: +v12.z.toFixed(2) }, end: {x: +v22.x.toFixed(2), y: +v22.z.toFixed(2) } };

            inner_wall_area_without_openings = item.getFirstSideArea();
            outer_wall_area_without_openings = item.getSecondSideArea();

//                        } else if( obj.isPointInCountur( room.walls, item.v22 ) ) {
          } else {

            var v21 = item.getV21([next_item]);  v21 ? '' : v21 =  item.v21;
            var v11 = item.getV11([prev_item]);  v11 ? '' : v11 =  item.v11;
            var outer = {start: {x: +v11.x.toFixed(2), y: +v11.z.toFixed(2) }, end: {x: + v21.x.toFixed(2), y: + v21.z.toFixed(2) } };
//                          var outer = {start: {x: +item.v11.x.toFixed(2), y: +item.v11.z.toFixed(2) }, end: {x: +item.v21.x.toFixed(2), y: +item.v21.z.toFixed(2) } };
            var inner = {start: {x: +item.v12.x.toFixed(2), y: +item.v12.z.toFixed(2) }, end: {x: +item.v22.x.toFixed(2), y: +item.v22.z.toFixed(2) } };

            inner_wall_area_without_openings = item.getSecondSideArea();
            outer_wall_area_without_openings = item.getFirstSideArea();

          }

      } else if ( item.isNeighbor( prev_item ) == 'v1' ) {

          var center = {start: {x: +item.v1.x.toFixed(2), y: +item.v1.z.toFixed(2) }, end: {x: +item.v2.x.toFixed(2), y: +item.v2.z.toFixed(2) } };

//                        if ( obj.isPointInCountur( room.walls, item.v11 ) ){
          if ( $wallEditor.isPointInCountur2( this.chain, item.v11, this.nodes ) ){

            var inner = {start: {x: +item.v11.x.toFixed(2), y: +item.v11.z.toFixed(2) }, end: {x: +item.v21.x.toFixed(2), y: +item.v21.z.toFixed(2) } };
//                          var outer = {start: {x: +item.v12.x.toFixed(2), y: +item.v12.z.toFixed(2) }, end: {x: +item.v22.x.toFixed(2), y: +item.v22.z.toFixed(2) } };
            var v22 = item.getV22([next_item]); v22 ? '' : v22 =  item.v22;
            var v12 = item.getV12([prev_item]); v12 ? '' : v12 =  item.v12;
            var outer = {start: {x: +v12.x.toFixed(2), y: +v12.z.toFixed(2) }, end: {x: +v22.x.toFixed(2), y: +v22.z.toFixed(2) } };

            inner_wall_area_without_openings = item.getFirstSideArea();
            outer_wall_area_without_openings = item.getSecondSideArea();

//                        } else if( obj.isPointInCountur( room.walls, item.v22 ) ) {
          } else {

            var v21 = item.getV21([next_item]); v21 ? '' : v21 =  item.v21;
            var v11 = item.getV11([prev_item]); v11 ? '' : v11 =  item.v11;
            var outer = {start: {x: +v11.x.toFixed(2), y: +v11.z.toFixed(2) }, end: {x: +v21.x.toFixed(2), y: +v21.z.toFixed(2) } };
//                          var outer = {start: {x: +item.v11.x.toFixed(2), y: +item.v11.z.toFixed(2) }, end: {x: +item.v21.x.toFixed(2), y: +item.v21.z.toFixed(2) } };
            var inner = {start: {x: +item.v12.x.toFixed(2), y: +item.v12.z.toFixed(2) }, end: {x: +item.v22.x.toFixed(2), y: +item.v22.z.toFixed(2) } };

            inner_wall_area_without_openings = item.getSecondSideArea();
            outer_wall_area_without_openings = item.getFirstSideArea();

          }

      } else if ( item.isNeighbor( prev_item ) == 'v2' ) {

          var center = {start: {x: +item.v2.x.toFixed(2), y: +item.v2.z.toFixed(2) }, end: {x: +item.v1.x.toFixed(2), y: +item.v1.z.toFixed(2) } };

//                        if ( obj.isPointInCountur( room.walls, item.v21 ) ){
          if ( $wallEditor.isPointInCountur2( this.chain, item.v11, this.nodes ) ){

            var inner = {start: {x: +item.v21.x.toFixed(2), y: +item.v21.z.toFixed(2) }, end: {x: +item.v11.x.toFixed(2), y: +item.v11.z.toFixed(2) } };
//                          var outer = {start: {x: +item.v22.x.toFixed(2), y: +item.v22.z.toFixed(2) }, end: {x: +item.v12.x.toFixed(2), y: +item.v12.z.toFixed(2) } };
            var v12 = item.getV12([next_item]); v12 ? '' : v12 =  item.v12;
            var v22 = item.getV22([prev_item]); v22 ? '' : v22 =  item.v22;
            var outer = {start: {x: +v22.x.toFixed(2), y: +v22.z.toFixed(2) }, end: {x: +v12.x.toFixed(2), y: +v12.z.toFixed(2) } };

            inner_wall_area_without_openings = item.getFirstSideArea();
            outer_wall_area_without_openings = item.getSecondSideArea();

//                        } else if( obj.isPointInCountur( room.walls, item.v12 ) ) {
          } else {
            var v11 = item.getV11([next_item]); v11 ? '' : v11 =  item.v11;
            var v21 = item.getV21([prev_item]); v21 ? '' : v21 =  item.v21;
            var outer = {start: {x: +v21.x.toFixed(2), y: +v21.z.toFixed(2) }, end: {x: +v11.x.toFixed(2), y: +v11.z.toFixed(2) } };
//                          var outer = {start: {x: +item.v21.x.toFixed(2), y: +item.v21.z.toFixed(2) }, end: {x: +item.v11.x.toFixed(2), y: +item.v11.z.toFixed(2) } };
            var inner = {start: {x: +item.v22.x.toFixed(2), y: +item.v22.z.toFixed(2) }, end: {x: +item.v12.x.toFixed(2), y: +item.v12.z.toFixed(2) } };

            inner_wall_area_without_openings = item.getSecondSideArea();
            outer_wall_area_without_openings = item.getFirstSideArea();

          }

      } else  {

        var center = {start: {x: +item.v2.x.toFixed(2), y: +item.v2.z.toFixed(2) }, end: {x: +item.v1.x.toFixed(2), y: +item.v1.z.toFixed(2) } };
        var inner = {start: {x: +item.v21.x.toFixed(2), y: +item.v21.z.toFixed(2) }, end: {x: +item.v11.x.toFixed(2), y: +item.v11.z.toFixed(2) } };
        var outer = {start: {x: +item.v22.x.toFixed(2), y: +item.v22.z.toFixed(2) }, end: {x: +item.v12.x.toFixed(2), y: +item.v12.z.toFixed(2) } };

        inner_wall_area_without_openings = item.getFirstSideArea();
        outer_wall_area_without_openings = item.getSecondSideArea();

      }



      //проемы
      var openings = [];
      item.doors.forEach(function(doorway){

        var doorway_inner = {start: {x: +doorway.p_11.x.toFixed(2), y: +doorway.p_11.z.toFixed(2) }, end: {x: +doorway.p_21.x.toFixed(2), y: +doorway.p_21.z.toFixed(2) } };
        var doorway_outer = {start: {x: +doorway.p_12.x.toFixed(2), y: +doorway.p_12.z.toFixed(2) }, end: {x: +doorway.p_22.x.toFixed(2), y: +doorway.p_22.z.toFixed(2) } };
        var cellAngle = 0;
        if(doorway.location){
          switch (doorway.location) {
            case 1:
              cellAngle = 0;
              break;
            case 2:
              cellAngle = 90;
              break;
            case 3:
              cellAngle = 180;
              break;
            case 4:
              cellAngle = 270;
              break;

          }
        }

        openings.push(
                      {
                        id: doorway.id,
                        inner: doorway_inner,
                        outer: doorway_outer,
                        cellPosition: {
                          x: 0,
                          y: 0
                        },
                        cellAngle: cellAngle,
                        flipped: false,
                        type: doorway.json_type,
                        systype: doorway.json_systype,
                        height: doorway.height,
                        heightAboveFloor: doorway.elevation,
                        width: doorway.width,
                        slope: doorway.slope,
                        obj_thickness: doorway.depObject_thickness
                      }
                    );
      })

      volume = item.getVolume();


      this.wallsParams [ this.walls[j] ] =  {

        center: center,
        inner: inner,
        outer: outer,
        openings: openings,
        length: item.axisLength,
        inner_wall_area_without_openings: inner_wall_area_without_openings,
        outer_wall_area_without_openings: outer_wall_area_without_openings,
        volume: volume
      };

    }

  },

  getInnerWallsArea: function(){

    var result = 0;
    var self = this;

    this.defineWallsParams();
    this.walls.forEach(function( item ){

      result += self.wallsParams[item].inner_wall_area_without_openings;

    });

    return result;
  },
  getOuterWallsArea: function(){

    var result = 0;
    var self = this;

    this.defineWallsParams();
    this.walls.forEach(function( item ){

    var wall = scene.getObjectByProperty( 'uuid', item );
    if( wall.external_wall ){
      result += self.wallsParams[item].outer_wall_area_without_openings;
    }

  });

    return result;
  },
  getWallsVolume: function(){

    var result = 0;
    var self = this;

    this.defineWallsParams();
    this.walls.forEach(function( item ){

      result += self.wallsParams[item].volume;

    });

    return result;
  },
  getWallslength: function(){
    var result = 0;
    var self = this;

    this.defineWallsParams();
    this.walls.forEach(function( item ){

      result += self.wallsParams[item].length;

    });

    return result;
  },

  selectAllWalls: function(){

    this.surfaces.forEach(function(item, index, arr){
      var event = {
        object: item
      };
      $selectMode.select( event );

    });

  },
  unSelectAllWalls: function(){


  }


});



