//Комната
function Room( parameters ){

  var parameters = parameters || {};
  var self = this;

  this.id = THREE.Math.generateUUID(),

  this.type = 'Room';
  this.name = 'room';

  this.closedRoom = true;

  this._type = parameters.hasOwnProperty("_type") ? parameters["_type"] : 'closedRoom';

  this.nodes = parameters.hasOwnProperty("nodes") ? parameters["nodes"] : [];
  this.chain = parameters.hasOwnProperty("chain") ? parameters["chain"] : [];
  this.walls =  [];
  this.wallsParams =  [];
  this.external_walls = [];
  this.elements = [];
  this.isClockWise = parameters.hasOwnProperty("isClockWise") ? parameters["isClockWise"] : false;


  this.init();
}

Room.prototype = Object.assign( {}, {
  constructor: Room,

  init: function(){

    if( this._type != 'freeRoom'){

      this.countur = this.getCountur( this.chain );
      this.walls = this.getWalls( this.chain );
      var objArea = this.getArea(this.countur);
      this.area = objArea.area;
      this.area_coords = { x: objArea.coord.x, y: objArea.coord.z },
      this.area_coords_3D = objArea.area.coord;


      //отрисовка контура комнаты
      this.drawCounturLine( this.chain, this.nodes );

    } else {

      this.closedRoom = false;
      this.walls = this.getWalls( this.chain );
      this.area = 0;
      this.area_coords = {x: 0, y: 0};
      this.area_coords_3D = 0;
      this.isClockWise = 0;

    }

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
  externalWallsAdd: function(uuid, value){
    this.external_walls.push(uuid);
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


    })


    this.elements = elements;
    return elements;
  },
  getArea: function( countur ){

    return $wallEditor.getArea( countur );

  },
  getAreaWithoutOpenings: function(){

    var self = this;
    var area = this.getArea( this.countur ).area;
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
  drawCounturLine: function( chain, nodes ){
    chain.forEach(function(item){

      var geometry = new THREE.Geometry();
      if(nodes[item.source.id] && nodes[item.target.id]){
        geometry.vertices.push( nodes[item.source.id].position, nodes[item.target.id].position );
        var line = new THREE.Line(geometry, LineBasicMaterialRed);
        line.name = 'room_line';

        AreaCounturs.add( line );
      }

    })
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
  }
});



