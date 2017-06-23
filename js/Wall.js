//Объект стены
function Wall( vertices, parameters ){

  THREE.Mesh.call( this, new THREE.Geometry() );

  if ( parameters === undefined ) parameters = {};

  this.type = 'Wall';
  this.name = 'wall';

  var self = this;

  this.uuid = parameters.hasOwnProperty("uuid") ? parameters["uuid"]:this.uuid;
  this.width = parameters.hasOwnProperty("width") ? parameters["width"] : $Editor.default_params.wallWidth;
  this.height = parameters.hasOwnProperty("height") ? parameters["height"] : floorHeight;
  this.v1 = parameters.hasOwnProperty("v1") ? parameters["v1"] : vertices[0].clone();
  this.v2 = parameters.hasOwnProperty("v2") ? parameters["v2"] : vertices[1].clone();
  this.doors = parameters.hasOwnProperty("doors") ? parameters["doors"] : [];
  this.bearingType = parameters.hasOwnProperty("bearingType") ? parameters["bearingType"] : 'bear_wall';
  this.action = parameters.hasOwnProperty("action") ? parameters["action"] : $Editor.wallActions[0];
  this.isRadial = false;

  this.doors = [];
  this.dimensions = []; //массив хранения объектов размеров стены
  this.walls = []//заполнение при обновлении

  this._wall = null; // объект стены с проемами
  this.number = {};
  this.index = '';//присваивается в редакторе
  this.external_wall = true; //исп в json
  this.editableFieldWrapper =  $( '.EditableField' );
  this.editableField = self.editableFieldWrapper.find('input');

  this.axisLine = new THREE.Line3(this.v1,this.v2);
  this.direction = this.axisLine.delta().normalize();
  this.direction90 = new THREE.Vector3( this.direction.z, 0 , -this.direction.x );
  this.axisLength = this.axisLine.distance();
  this.angle = this.direction.angleTo( new THREE.Vector3(1,0,0));

  var response = $Editor.getAdditionalPoints({v1: this.v1, v2: this.v2, width: this.width, direction90: this.direction90 });

  self.v11 = parameters.hasOwnProperty("v11") ? parameters["v11"] : new THREE.Vector3(response.v11.x, response.v11.y, response.v11.z);
  self.v12 = parameters.hasOwnProperty("v12") ? parameters["v12"] : new THREE.Vector3(response.v12.x, response.v12.y, response.v12.z);
  self.v21 = parameters.hasOwnProperty("v21") ? parameters["v21"] : new THREE.Vector3(response.v21.x, response.v21.y, response.v21.z);
  self.v22 = parameters.hasOwnProperty("v22") ? parameters["v22"] : new THREE.Vector3(response.v22.x, response.v22.y, response.v22.z);


  self.p1 =  new THREE.Vector3();
  self.p2 =  new THREE.Vector3();
  self.p11 = new THREE.Vector3();
  self.p21 = new THREE.Vector3();
  self.p12 = new THREE.Vector3();
  self.p22 = new THREE.Vector3();
  self.dimension_lines = [
    new THREE.Line3(self.p11, self.p21),
    new THREE.Line3(self.p12, self.p22),
    new THREE.Line3(self.p1, self.p2)
  ];

  self.geometry = self.buildGeometry();

  self.material = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      color: $Editor.default_params.Wall.main_color
    });;
//  this.material.transparent = true;
//  this.material.opacity = 0.8;

  self.setDefaultPosition();

  if(self.geometry)
  self.geometry.verticesNeedUpdate = true;

  self.mover = new WallMover( self );
  scene.add( self.mover );
  self.mover.activate();

  self.controlPoint1 = new WallControlPoint( self, 'v1' );
  self.controlPoint2 = new WallControlPoint( self, 'v2' );
  scene.add( self.controlPoint1, self.controlPoint2 );

  //хелпер примечание id
//  noteAdd( this, 'id: ' + this.id.toString(), null, {x: this.axisLine.getCenter().x, y: this.axisLine.getCenter().z} );
//  noteAdd( this, '(' + this.v1.x.toFixed(2) + ', \n' + this.v1.z.toFixed(2) + ')', null, {x: this.v1.x+300, y: this.v1.z} );
//noteAdd( this,  this.getFirstSideArea().toFixed(2) , null, {x: this.v1.x+300, y: this.v1.z} );

  //Ноды
  self.setDefaultNode();

  setTimeout(function(){
    self.calcDimensionsPoints();
    self.createDimensions();
    self.updateDimensions();
//    self.showDimensions();
  });


  this.changeDim =       function ( event ) {

      var isScale = event.hasOwnProperty("isScale") ? event["isScale"] : false;
      var offset = 0;
      var left_point;
      var right_point;
      var dimension = null;
      var index = self.dimensions.indexOf( event.target );

      //расчитываем смещение
      dimension = self.dimensions[index];


      offset = event.value - self.dimension_lines[index].distance();
  //    offset = offset / Math.abs(offset);


      //точка сдвига
      if( (self.v2.x - self.v1.x) > 0.01 ){
        left_point = "v1";
        right_point = "v2";
      } else if( (self.v1.x - self.v2.x) > 0.01 ){
        left_point = "v2";
        right_point = "v1";
      } else if( Math.abs(self.v2.x - self.v1.x) < 0.01 && self.v1.z < self.v2.z ){

        left_point = "v1";
        right_point = "v2";
      } else if( Math.abs(self.v2.x - self.v1.x) < 0.01 && self.v2.z < self.v1.z ){
        left_point = "v2";
        right_point = "v1";
      }

      if( dimension.leftArrowActivated ){

        self.movePoint( left_point, offset, dimension.dim_type == 'center' );

        if( $( event.element ).tooltip( "instance" ) )
        $( event.element ).tooltip('destroy');

      } else if( dimension.rightArrowActivated ){

        self.movePoint( right_point, offset, dimension.dim_type == 'center' );

        if( $( event.element ).tooltip( "instance" ) )
        $( event.element ).tooltip('destroy');

      } else if( !dimension.leftArrowActivated && !dimension.rightArrowActivated && isScale ){

        self.movePoint( right_point, offset/2, dimension.dim_type == 'center' );
        self.movePoint( left_point, offset/2, dimension.dim_type == 'center' );

      } else if( !dimension.leftArrowActivated && !dimension.rightArrowActivated ){

         $(event.element).attr('title','Выберите стрелкой направление изменения длины стены');
         $( event.element ).tooltip({
          position: {
            my: "center bottom-20",
            at: "center top",
            using: function( position, feedback ) {
              $( this ).css( position );
              $( "<div>" )
                .addClass( "arrow" )
                .addClass( feedback.vertical )
                .addClass( feedback.horizontal )
                .appendTo( this );
            }
          },
          show: { effect: "blind", duration: 800 }

        });

        $( event.element ).tooltip('open');

      }

      $wallCreator.updateWalls();

    };

  var parent_toJson = this.toJSON;

  this.toJSON = function ( meta ) {

    this.userData.width = this.width;
    this.userData.height = this.height;
    this.userData.v1 = this.v1;
    this.userData.v2 = this.v2;
    this.userData.doors = [];
    this.userData.bearingType = this.bearingType;
    this.userData.action = this.action;
    this.doors.forEach(function(item){
      self.userData.doors[item.uuid] = item.type;
    });

    return parent_toJson.call(this);

  };


}
Wall.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

  constructor: Wall,

  buildGeometry: function(){
    var wallShape = new THREE.Shape();

				wallShape.moveTo( this.v1.x,  this.v1.z );
				wallShape.lineTo( this.v11.x, this.v11.z );
				wallShape.lineTo( this.v21.x, this.v21.z );
        wallShape.lineTo( this.v2.x,  this.v2.z );
				wallShape.lineTo( this.v22.x, this.v22.z );
        wallShape.lineTo( this.v12.x, this.v12.z );
        wallShape.lineTo( this.v1.x,  this.v1.z );

    var extrudeSettings = {
      amount: this.height,
      bevelEnabled: false
    };
    try{

//      var shapePoints = wallShape.extractPoints();
//      var vertices = shapePoints.shape;
//      THREE.ShapeUtils.isClockWise(vertices)

//      var arr = THREE.ShapeUtils.triangulate( vertices, false );

//
//      if( arr.lenth > 0 ){
//        var geometry = new THREE.ExtrudeGeometry( wallShape, extrudeSettings );
//      } else {
//        return null;
//      }

      var geometry = new THREE.ExtrudeGeometry( wallShape, extrudeSettings );
    } catch (e){
      return null;
    }
    return geometry;
  },
  setDefaultPosition: function(){
    this.rotation.x = Math.PI/2;
    this.position.set( 0, this.height, 0 );
  },
  setDefaultNode: function(){

    this.node1 = { id: this.uuid + '_1', position: {x:this.v1.x, y: this.v1.z } };
    this.node2 = { id: this.uuid + '_2', position: {x:this.v2.x, y: this.v2.z } };

    this.node11 = { id: this.uuid + '_11', position: this.v11.clone() };
    this.node12 = { id: this.uuid + '_12', position: this.v12.clone() };
    this.node21 = { id: this.uuid + '_21', position: this.v21.clone() };
    this.node22 = { id: this.uuid + '_22', position: this.v22.clone() };

  },
  getV22: function ( walls ){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = - Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();

    var target = null;
    var target_foundation = null;
    var self = this;

    walls.forEach(function(item, i){
      if(self.uuid != item.uuid){
        if( $wallEditor.isPointsNeighboors( self.v2, item.v1 ) ){

          var angle = self.direction.angleTo(item.direction) ;
          var cross = self.direction.clone().cross(item.direction).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;


          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v22;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v12, node_id: item.node12.id};
          }
        }

        if($wallEditor.isPointsNeighboors( self.v2, item.v2 ) ){

          var angle = self.direction.angleTo( item.direction.clone().negate() ) ;
          var cross = self.direction.clone().cross( item.direction.clone().negate() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v11;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v21, node_id: item.node21.id};
          }
        }
      }

    });

    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path22 = null;
    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;

    }
    if( target && Math.abs(angle_max ) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;
      exception = true;

    }
    //пересечение
    if( angle_max > -Math.PI && angle_max != 0 ){

      var ray = new THREE.Ray(self.v12, self.direction);
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    if(exception){

      self._e_path22 = {
                  id: self.uuid + '_e22',
                  wall_uuid: self.uuid,
                  source: { id: self.node22.id },
                  target: { id: target_foundation.node_id },
                  wall_id: this.id
                };

    }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  getV21: function ( walls ){

    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();

    var target = null;
    var target_foundation = null;
    var self = this;

    walls.forEach(function(item, i){
      if(self.uuid != item.uuid){
        if( $wallEditor.isPointsNeighboors( self.v2, item.v1 ) ){

          var angle = self.direction.angleTo(item.direction) ;
          var cross = self.direction.clone().cross(item.direction).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v21;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v11, node_id: item.node11.id};
          }
        }

        if( $wallEditor.isPointsNeighboors( self.v2, item.v2 ) ){

          var angle = self.direction.angleTo( item.direction.clone().negate() ) ;
          var cross = self.direction.clone().cross( item.direction.clone().negate() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v12;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v22, node_id: item.node22.id};
          }
        }
      }

    });


    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path21 = null;

    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;


    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;
      exception = true;

    }
    //пересечение
    if(angle_max < Math.PI && angle_max != 0){

      var ray = new THREE.Ray(self.v11, self.direction);
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    if(exception){
      self._e_path21 = {
                  id: self.uuid + '_e21',
                  wall_uuid: self.uuid,
                  source: { id: self.node21.id },
                  target: { id: target_foundation.node_id },
                  wall_id: this.id
                };
    }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  getV12: function ( walls ){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();

    var target = null;
    var target_foundation = null;
    var self = this;

    walls.forEach(function(item, i){
      if(self.uuid != item.uuid){
        if( $wallEditor.isPointsNeighboors( self.v1, item.v2 ) ){

          var angle = self.direction.clone().negate().angleTo(item.direction.clone().negate()) ;
          var cross = self.direction.clone().negate().cross(item.direction.clone().negate()).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v12;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v22, node_id: item.node22.id};
          }
        }

        if( $wallEditor.isPointsNeighboors( self.v1, item.v1 ) ){

          var angle = self.direction.clone().negate().angleTo( item.direction.clone() ) ;
          var cross = self.direction.clone().negate().cross( item.direction.clone() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v21;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v11, node_id: item.node11.id};
          }
        }
      }

    });

    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path12 = null;

    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;


    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;
      exception = true;

    }
    //пересечение
    if(angle_max < Math.PI && angle_max != 0){

      var ray = new THREE.Ray(self.v22, self.direction.clone().negate());
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    if(exception){
        self._e_path12 = {
                    id: self.uuid + '_e12',
                    wall_uuid: self.uuid,
                    source: { id: self.node12.id },
                    target: { id: target_foundation.node_id },
                    wall_id: this.id
                  };
      }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  getV11: function ( walls ){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = - Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();

    var target = null;
    var target_foundation = null;
    var self = this;

    walls.forEach(function(item, i){

      if(self.uuid != item.uuid){
        if($wallEditor.isPointsNeighboors( self.v1, item.v2 ) ){

          var angle = self.direction.clone().negate().angleTo(item.direction.clone().negate()) ;
          var cross = self.direction.clone().negate().cross(item.direction.clone().negate()).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v11;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v21, node_id: item.node21.id};
          }
        }

        if($wallEditor.isPointsNeighboors( self.v1, item.v1 ) ){

          var angle = self.direction.clone().negate().angleTo( item.direction.clone() ) ;
          var cross = self.direction.clone().negate().cross( item.direction.clone() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v22;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v12, node_id: item.node12.id};
          }
        }
      }

    });

    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path11 = null;

    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;


    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;
      exception = true;



    }
    //пересечение
    if(angle_max > -Math.PI && angle_max != 0){

      var ray = new THREE.Ray(self.v21, self.direction.clone().negate());
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }


    if(exception){
        self._e_path11 = {
                    id: self.uuid + '_e11',
                    wall_uuid: self.uuid,
                    source: { id: self.node11.id },
                    target: { id: target_foundation.node_id },
                    wall_id: this.id
                  };
      }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  //перерасчет при изменении толщины стены
  recalculatePoints: function (){

    this.axisLine = new THREE.Line3(this.v1,this.v2);
    this.direction = this.axisLine.delta().normalize();
    this.direction90 = new THREE.Vector3( this.direction.z, 0 , -this.direction.x );
    this.axisLength = this.axisLine.distance();


    if(! this.v11.equals( this.v12 ) )
    this.v11.copy( this.v1.clone().add( this.direction90.clone().multiplyScalar(this.width/2) ) );
    if(! this.v12.equals( this.v21 ) )
    this.v12.copy( this.v1.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) ) );
    if(! this.v21.equals( this.v22 ) )
    this.v21.copy( this.v2.clone().add( this.direction90.clone().multiplyScalar(this.width/2) ) );
    if(! this.v22.equals( this.v11 ) )
    this.v22.copy( this.v2.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) ) );

    this.node11.position.copy(this.v11);
    this.node12.position.copy(this.v12);
    this.node21.position.copy(this.v21);
    this.node22.position.copy(this.v22);

  },

  update: function( walls ){
      var self = this;
      this.walls = walls || this.walls;

      //если изменилась ширина
      this.recalculatePoints();

      var v11 = this.getV11(this.walls);
      var v12 = this.getV12(this.walls);
      var v21 = this.getV21(this.walls);
      var v22 = this.getV22(this.walls);
      this.v11 = v11 ? v11 : this.v11 ;
      this.v12 = v12 ? v12 : this.v12 ;
      this.v21 = v21 ? v21 : this.v21 ;
      this.v22 = v22 ? v22 : this.v22 ;

      var new_geometry = this.buildGeometry();
      this.setDefaultPosition();
      if(new_geometry){
        this.geometry = new_geometry;
        this.geometry.verticesNeedUpdate = true;
        this.visible = true;
      } else {
        this.geometry = new THREE.Geometry();
        this.visible = false;
        this.remove();
      }

      this.setDefaultNode();

      if( this.mover ){
        this.mover.wall = this;
        this.mover.update();
      }

      this.controlPoint1.update();
      this.controlPoint2.update();

      this.doors.forEach(function(item){
        item.update();
      });


      self.updateDimensions();



  },
  remove: function( object ){

    if(object){

      THREE.Mesh.prototype.remove.call(this, object);

    } else {

      if(this.mover){
        controls.enabled = true;
        this.mover.deactivate();
        this.mover.parent.remove( this.mover );
        this.mover = null;
      }

      this.children.forEach(function( item ){
        scene.remove(item);
      });

      //удаление проемов
      this.doors.forEach(function( item ){

        //удаление размеров проемов
        item.dimensions.forEach(function( dim ){
          scene.remove( dim );
        });
        //удаление тел проемов
        scene.remove(item.doorwayBody);

      });

      //удаление размеров стены
      this.dimensions.forEach(function( dim ){
        dim.deactivate();
        scene.remove( dim );
        dim = null;
      });
      this.dimensions.length = 0;

      //удаление опорных точек
      scene.remove( this.controlPoint1, this.controlPoint2 );

      $wallEditor.removeWall( this );

    }

    $wallEditor.deactivateSelectControls();
    $wallEditor.activateSelectControls();

  },

  setActiveMode: function( state ){

    if( state ){

      this.material.color = new THREE.Color( $Editor.default_params.Wall.active_color );

    } else {

//      if( this.action && this.action.length > 0){
//        this.material.color = $Editor.wallColors[this.action].color;
//      } else {
//        this.material.color = $Editor.default_params.Wall.main_color;
//      }

      this.material.color = new THREE.Color( $Editor.wallColors[this.action] );

    }

  },

  select: function( event ) {
    this.setActiveMode( true );
  },
  unselect: function( event ) {
    this.setActiveMode( false );
  },
  hoveron: function( event ) {
  },
  hoveroff: function( event ) {
  },

  select_contextmenu: function(event){
    this.showMenu(event.screenCoord);
  },
  hideMenu: function() {
    $('.ActiveElementMenu').css('display','none');
  },
  showMenu: function(center){

    var elements =  $('.ActiveElementMenu').find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    });

    //отображаем меню
    $('.ActiveElementMenu').css('display','block');
    $('.ActiveElementMenu').css('left',center.x);
    $('.ActiveElementMenu').css('top',center.y);

    //отображаем пункты меню
    setTimeout(function(){
      elements.each( function( i, item ){
        item.style.left = $wallEditor.wallMenuCoord[i].left;
        item.style.top = $wallEditor.wallMenuCoord[i].top;
      });
    }, 50);

  },

  hide: function(){
    this.visible = false;
    this.hideControlPoints();
    this.hideDimensions();
  },
  show: function(){
    this.visible = true;
    this.showControlPoints();
    this.showDimensions();

  },

  addDoorway: function( type, parameters ){

    if(this.bearingType != 'divider'){

      var parameters = parameters || {};
      var type = type || 'doorway';
      var obj = null;

      if( type == 'Doorway' ){
        obj = new Doorway(this, parameters);
      } else if( type == 'DoorBlock' ){
        obj = new DoorBlock(this, parameters);
      } else if( type == 'DoubleDoorBlock' ){
        parameters["width"] = parameters.hasOwnProperty("width") ? parameters["width"] : 1800;
        parameters["height"] = parameters.hasOwnProperty("height") ? parameters["height"] : 2100;
        obj = new DoubleDoorBlock(this, parameters);
      } else if( type == 'DoorBlockFloor' ){
        var obj = new DoorBlockFloor(this, parameters);
      } else if( type == 'DoubleDoorBlockFloor' ){
        parameters["width"] = parameters.hasOwnProperty("width") ? parameters["width"] : 1800;
        parameters["height"] = parameters.hasOwnProperty("height") ? parameters["height"] : 2100;
        obj = new DoubleDoorBlockFloor(this, parameters);
      } else if( type == 'WindowBlock' ){
        parameters["width"] = parameters.hasOwnProperty("width") ? parameters["width"] : 1450;
        parameters["height"] = parameters.hasOwnProperty("height") ? parameters["height"] : 1450;
        parameters["elevation"] = parameters.hasOwnProperty("elevation") ? parameters["elevation"] : 800;
        obj = new WindowBlock(this, parameters );
      } else if( type == 'Niche' ){
        obj = new Niche(this, parameters);
      } else if( type == 'Arch' ){
  //      var obj = new DoorBlock(this);
      }

      this._checkDoorwayOffset( obj );
      this.doors.push( obj );
      this.add( obj );
      obj.activate();

      $wallEditor.deactivateSelectControls();
      $wallEditor.activateSelectControls();

      return obj ? obj.uuid : false;


    }

  },
  removeDoorway: function( doorway ){

    this.doors.splice( this.doors.indexOf(doorway), 1 );
    this.remove(doorway);
    delete doorway;



    this.update();

  },

  doorway3DMode: function(){

    var self = this;

    //очищаем
    if(this._wall){

      scene.remove(this._wall);
      this._wall = null;

    }

    //расчитываем
    self.doors.forEach(function( item ){

      //вырезаем проемы
      var wallBSP = new ThreeBSP( self._wall || item.wall );
      var doorwayBodyBSP = new ThreeBSP( item.doorwayBody );
      var newBSP = wallBSP.subtract( doorwayBodyBSP );
      self._wall = newBSP.toMesh( self.material );

      //отображаем объекты
      if( 'showDepObject' in item ){ item.showDepObject(); }
      if( 'hideDimensions' in item ){ item.hideDimensions(); }

    });

    if(self._wall){
      scene.add( self._wall );
      self.visible = false;
    }

    //скрываем дивайдер
    if(self.bearingType == 'divider'){
      self.visible = false;
    }

    //скрываем размеры
    this.hideDimensions();
    //
    //скрываем опорные точки
    this.hideControlPoints();

  },
  doorwayProjectionMode: function(){

    var self = this;

    self.visible = true;

    if(self._wall){
//        self._wall.visible = false;
        scene.remove(this._wall);
        this._wall = null;
    }

    self.doors.forEach(function( item ){

      if( 'hideDepObject' in item ){ item.hideDepObject(); }

    });

    //отображаем размеры
    this.showDimensions();
    //
    //отображаем опорные точки
     this.showControlPoints();

 },

  createDimensions: function(){

    var self = this;

    var params = {
      direction: this.direction90,
      offset_direction: self.width/2 + 400,
      editable: true,
      arrow: true,
      dragable: false,
      dim_type: this.p11.distanceTo(this.p21) < this.p12.distanceTo(this.p22) ? 'inner' : 'outer'
    };
    this.dimensions.push( new Dimension( this.p11,   this.p21, $projection.plane, params ) );

    params.direction = this.direction90.clone().negate();
    params.dim_type  = this.p11.distanceTo(this.p21) > this.p12.distanceTo(this.p22) ? 'inner' : 'outer';
    this.dimensions.push( new Dimension( this.p12,   this.p22, $projection.plane, params ) );

    //по осевой
    var params = {
      direction: this.direction90,
      offset_direction: self.width/2 + 400,
      editable: true,
      arrow: true,
      dragable: false,
      dim_type: 'center'
    };
    this.dimensions.push( new Dimension( this.p1,   this.p2, $projection.plane, params ) );


    this.dimensions.forEach(function(item){
      item.activate();
      scene.add( item );
    });

  },
  calcDimensionsPoints: function(){

    var Y = this.height;

    this.p1.copy( this.v1.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p2.copy( this.v2.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p11.copy( this.v11.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p21.copy( this.v21.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p12.copy( this.v12.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p22.copy( this.v22.clone().add(new THREE.Vector3( 0, Y, 0)) );


    this.dimension_lines = [
    new THREE.Line3(this.p11, this.p21),
    new THREE.Line3(this.p12, this.p22),
    new THREE.Line3(this.p1, this.p2)
  ];

  },
  updateDimensions: function(){
    //перерасчет размеров
    this.calcDimensionsPoints();

    if(this.dimensions.length > 0){

      this.dimensions[0].dim_type = this.p11.distanceTo(this.p21) <= this.p12.distanceTo(this.p22) ? 'inner' : 'outer';
      this.dimensions[1].dim_type  = this.p11.distanceTo(this.p21) > this.p12.distanceTo(this.p22) ? 'inner' : 'outer';

      this.dimensions[0].const_direction = this.direction90;
      this.dimensions[1].const_direction = this.direction90.clone().negate();
      this.dimensions[2].const_direction = this.direction90;

      this.dimensions[0].offset_direction = this.width/2 + 400;
      this.dimensions[1].offset_direction = this.width/2 + 400;
      this.dimensions[2].offset_direction = this.width/2 + 400;
    }

    this.dimensions.forEach(function(item){
      item.update();
    });

    this.showDimensions();

  },
  showDimensions: function(){

    if( ! $projection.enabled){
      return;
    }
    var self = this;

    this.dimensions.forEach(function(item, i, arr){

      if ( $projection.wallDimensionType ==  item.dim_type) {

        item.show();
        if ( ! item.hasEventListener ( 'edit', self.changeDim ) )
        item.addEventListener( 'edit', self.changeDim );
        item.activate();

      } else {

        item.hide();
        if ( item.hasEventListener ( 'edit', self.changeDim ) )
        item.removeEventListener( 'edit', self.changeDim );
        item.deactivate();

      }

    });

    //    this.dimensions.forEach(function(item, i, arr){
//
//      if( ! arr[i].hasEventListener ( 'edit', self.changeDim ))
//      arr[i].addEventListener( 'edit', self.changeDim );
//
//    })



  },
  hideDimensions: function(){
    this.dimensions.forEach(function(item, i){
      item.visible = false;

      item.removeEventListener( 'edit', this.changeDim );

      item.deactivate();
    });
//
//    this.dimensions[0].removeEventListener( 'edit', this.changeDim );
//    this.dimensions[1].removeEventListener( 'edit', this.changeDim );

  },
  removeDimensions: function(){
    this.dimensions.forEach(function( item, index ){
      scene.remove( item );
    });
  },
  activateDimensions: function(){
    this.dimensions.forEach(function( item, index ){
      item.activate();
    });
  },
  getCurrentDimValue: function(){

    var result = this.axisLength;
    this.dimensions.forEach(function( item, index ){
      if( item.visible == true ){
        result = item.val();
      }
    });

    return result;
  },
  getDimensionByType: function( type ){
    var type = type || 'center';
    var i = this.dimensions.length;
    while(i--){
      if( this.dimensions[i].dim_type == type ){
        return this.dimensions[i];
      }
    }
    return false;
  },

  hideControlPoints: function(){
    this.controlPoint1.hide();
    this.controlPoint2.hide();
  },
  showControlPoints: function(){
    this.controlPoint1.show();
    this.controlPoint2.show();
  },

  movePoint: function( point, offset, center_line ){

    var self = this;

    if( point == 'v1' ){

//
      if(this.mover.v1_neighbors.length == 1){

        this.mover.v1_neighbors[0].wall.mover.position.copy(self.mover.position.clone().add(self.direction.clone().negate().multiplyScalar( offset )));
        this.mover.v1_neighbors[0].wall.mover.dragstart({object: this.mover.v1_neighbors[0].wall.mover});
        this.mover.v1_neighbors[0].wall.mover.drag({object: this.mover.v1_neighbors[0].wall.mover});
        this.mover.v1_neighbors[0].wall.mover.dragend({object: this.mover.v1_neighbors[0].wall.mover});

      }
      else if ( this.mover.v1_neighbors.length == 0 || ( this.mover.v1_neighbors.length > 1 && center_line ) ){

        this.v1.copy( this.v2.clone().add(this.direction.clone().negate().multiplyScalar(this.v1.distanceTo( this.v2 ) + offset)) );

        this.mover.v1_neighbors.forEach( function( item ){
          item.point.copy( self.v1.clone() ) ;
        });

      }
      else if( this.mover.v1_neighbors.length > 1 ){

        var walls = [];
        var position = new THREE.Vector3(self.mover.position.x, self.mover.position.y, self.mover.position.z);
        var direction = new THREE.Vector3(self.direction.x, self.direction.y, self.direction.z);

        this.mover.v1_neighbors.forEach(function( item, i, arr ){

          if ( Math.abs( arr[i].wall.mover && item.wall.direction.clone().dot ( self.direction.clone() ) ) < 0.001 ){

            walls.push( arr[i].wall.uuid);

          }

        });

        var enabled = true; //false при достижении одной из перемещаемых стен значения mover.enabled == false
        var i = walls.length;
        while(i--){
          var current_offset = offset;
          var item = scene.getObjectByProperty('uuid', walls[i]);

          if( ! item ||  ! enabled){continue;}

            item.mover.dragstart({object: item.mover});
            while( Math.abs( current_offset ) > item.width/2 && item.mover.enabled == true){

              item.mover.position.copy(position.clone().add(direction.clone().negate().multiplyScalar( item.width/2 )));
              item.mover.drag({object: item.mover, intersect_disable: true});

              current_offset > 0 ? current_offset -= item.width/2 : current_offset += item.width/2;
            }

              enabled = item.mover.enabled;

              if( enabled ){
                item.mover.position.copy(position.clone().add(direction.clone().negate().multiplyScalar( current_offset)));
                item.mover.drag({object: item.mover, intersect_disable: true});
              }

              item.mover.dragend({object: item.mover});
//              return;

        }

      }


    }
    if( point == 'v2'){

      if(this.mover.v2_neighbors.length == 1){

        this.mover.v2_neighbors[0].wall.mover.position.copy(self.mover.position.clone().add(self.direction.clone().multiplyScalar( offset )));
        this.mover.v2_neighbors[0].wall.mover.dragstart({object: this.mover.v2_neighbors[0].wall.mover});
        this.mover.v2_neighbors[0].wall.mover.drag({object: this.mover.v2_neighbors[0].wall.mover});
        this.mover.v2_neighbors[0].wall.mover.dragend({object: this.mover.v2_neighbors[0].wall.mover});

      }
      else if ( this.mover.v2_neighbors.length == 0 || ( this.mover.v2_neighbors.length > 1 && center_line ) ){

        this.v2.copy( this.v1.clone().add(this.direction.clone().multiplyScalar(this.v1.distanceTo( this.v2 ) + offset)) );

        this.mover.v2_neighbors.forEach(function(item){
          item.point.copy( self.v2.clone() ) ;
        });

      }
      else if( this.mover.v2_neighbors.length > 1 ){

        var walls = [];
        var position = new THREE.Vector3(self.mover.position.x, self.mover.position.y, self.mover.position.z);
        var direction = new THREE.Vector3(self.direction.x, self.direction.y, self.direction.z);


        this.mover.v2_neighbors.forEach(function( item, i, arr ){

          if ( Math.abs( arr[i].wall.mover && item.wall.direction.clone().dot ( self.direction.clone() ) ) < 0.001 ){

            walls.push( arr[i].wall.uuid );

          }

        });


        var enabled2 = true;//false при достижении одной из перемещаемых стен значения mover.enabled == false
        var i = walls.length;
        while(i--){

          var current_offset = offset;
          var item = scene.getObjectByProperty('uuid', walls[i]);
          if( ! item || ! enabled2){continue;}

            item.mover.dragstart({object: item.mover});
            while( Math.abs( current_offset ) > item.width/2 && item.mover.enabled == true){

                item.mover.position.copy(position.clone().add(direction.clone().multiplyScalar( item.width/2 )));
                item.mover.drag({object: item.mover, intersect_disable: true});

                current_offset > 0 ? current_offset -= item.width/2 : current_offset += item.width/2;
              }

            enabled2 = item.mover.enabled;

            if( enabled2 ){
              item.mover.position.copy(position.clone().add(direction.clone().multiplyScalar( current_offset )));
              item.mover.drag({object: item.mover , intersect_disable: true});
            }

            item.mover.dragend({object: item.mover});
//            return;


        }

      }

    }

  },
  setPointPosition: function( point, position){
    var self = this;

    if( ! this.mover ){ return; }

    if( point == 'v1' ){

      this.v1.copy( position.clone() );

      this.mover.v1_neighbors.forEach(function(item){
        item.point.copy( self.v1.clone() ) ;
      });
    } else if( point == 'v2' ){

      this.v2.copy( position.clone() );

      this.mover.v2_neighbors.forEach(function(item){
        item.point.copy( self.v2.clone() ) ;
      });
    }
  },

  isNeighbor: function( wall ){

    var i = this.mover.v1_neighbors.length;
    while (i--) {
      if(this.mover.v1_neighbors[i].wall.uuid == wall.uuid){
        return 'v1';
      }
    }

    var i = this.mover.v2_neighbors.length;
    while (i--) {
      if(this.mover.v2_neighbors[i].wall.uuid == wall.uuid){
        return 'v2';
      }
    }

    return false;
  },
  isCollinear: function( w2 ){

    if(  w2 && (this.uuid != w2.uuid) )
    if( Math.abs(this.direction.clone().dot( w2.direction.clone() )) > 0.999 ){

      return true;

    }

    return false;
  },

  setFloorScale: function( event ){

    var self = this;

    var element = this.editableFieldWrapper;
    element.find('button').hide();
    element.css('left', 0);
    element.css('top', 0);
    var menuEl = $('.ActiveElementMenu');
    var coord = menuEl.position();
    element.offset({left: coord.left - element.width()/2 , top: coord.top  });
    element.css('display', 'block');

    this.editableField.val( ( current_unit.c * this.axisLength ).toFixed( accuracy_measurements ) );
    this.editableField.focus();
    this.editableField.select();

    this.editableField.off('change');
    this.editableField.on('change', function(){

      var val = +self.editableField.val() / current_unit.c ;

      var floorScaleX = 1;
      var floorScaleY = 1;
      var floorScaleZ = 1;

//      if (self.v1.x == self.v2.x ){
//
//        floorScaleY = val / self.axisLength;
//
//      } else if ( self.v1.z == self.v2.z ){
//
//        floorScaleX = val / self.axisLength;
//
//      } else if ( self.v1.x != self.v2.x  && self.v1.z != self.v2.z ){
//
//        floorScaleX = floorScaleY = val / self.axisLength;
//
//      }

      floorScaleX = floorScaleY = val / self.axisLength;

      $Editor.floor.setScale( floorScaleX, floorScaleY, floorScaleZ );


      self.dimensions.forEach(function( item ){

        if(item.dim_type == 'center'){
          self.changeDim({target: item, value: val, isScale: true});
          return;
        }

      });

      self.hideMenu();
      self.remove();

    });

    this.editableField.off('keydown');
    this.editableField.on('keydown', function( event ){

      if(event.ctrlKey || event.altKey) {
        event.preventDefault();
        return;
      }

      if( event.keyCode == 13 ){

        element.css('display', 'none');
        $('.doors_all_block_1').css({'display':'none'});

      } else if( event.keyCode == 27 ){

        element.css('display', 'none');
        $('.doors_all_block_1').css({'display':'none'});
      }

    });
  },
  changeWidth: function( event ){

    var self = this;

    var element = this.editableFieldWrapper;
    element.find('button').hide();
    element.css('left', 0);
    element.css('top', 0);
    var menuEl = $('.ActiveElementMenu');
    var coord = menuEl.position();
    element.offset({left: coord.left - element.width()/2 , top: coord.top  });
    element.css('display', 'block');

    this.editableField.val( ( current_unit.c * this.width ).toFixed( accuracy_measurements ) );
    this.editableField.focus();
    this.editableField.select();

    this.editableField.off('change');
    this.editableField.on('change', function(){

      var val = +self.editableField.val() / current_unit.c ;

      //TODO value validate

      self.setWidth( val );
      self.update();
      $wallCreator.updateWalls();
      element.css('display', 'none');
      $('.doors_all_block_1').css({'display':'none'});

    });
  },
  setWidth: function( width ){
    var width = +width || $Editor.default_params.wallWidth;

    this.width = width;
    $Editor.default_params.wallWidth = this.width;

  },

  changeAction: function( action ){

    this.material.color = new THREE.Color( $Editor.wallColors[ action ] );
    this.action = action;

  },
  changeBearingType: function( type ){

    this.bearingType = type;

    if ( type == 'divider' ) {
      this.width = 10;
      $wallCreator.updateWalls();
    }

  },

  getPlanArea: function(){

    var result  = { area: 0 };
    var countur = [];

    countur.push( new THREE.Vector2( this.v1.x,  this.v1.z ) );
    countur.push( new THREE.Vector2( this.v11.x, this.v11.z ) );
    countur.push( new THREE.Vector2( this.v21.x, this.v21.z ) );
    countur.push( new THREE.Vector2( this.v2.x,  this.v2.z ) );
    countur.push( new THREE.Vector2( this.v22.x, this.v22.z ) );
    countur.push( new THREE.Vector2( this.v12.x, this.v12.z ) );

    result = $wallEditor.getArea( countur );

    return result.area;
  },
  getFirstSideArea: function(){

    var area  = 0;
    var openingsArea = 0;

    var line = new THREE.Line3(this.v11, this.v21);

    area = line.distance() * this.height;

    //
    this.doors.forEach(function(item){

      openingsArea += item.getArea();

      if( item.name == 'niche' && item.location == 3 ){
        openingsArea -= item.getArea();
      }

    });

    return area - openingsArea ;
  },
  getSecondSideArea: function(){

    var area  = 0;
    var openingsArea = 0;

    var line = new THREE.Line3(this.v12, this.v22);

    area = line.distance() * this.height;



    this.doors.forEach(function(item){

      openingsArea += item.getArea();

      if( item.name == 'niche' && item.location == 1){
        openingsArea -= item.getArea();
      }

    });

    return area - openingsArea ;
  },
  getVolume: function(){

    var planArea = this.getPlanArea();
    var volume =  planArea * this.height ;
    var openingsVolume = 0;

    this.doors.forEach(function(item){

      openingsVolume += item.getVolume();

    });

    return ( volume - openingsVolume );
  },
  getOpeningsArea: function(){

    var area = 0;

    this.doors.forEach(function ( item, index, arr ) {

      area += item.getArea();

    });

    return area;

  },


  _checkDoorwayOffset: function( doorway ){

    var i = this.doors.length;

    while( i-- ){
      if( this.doors[i].offset == doorway.offset ){

        var offset = doorway.offset + this.doors[i].width/2 - doorway.width/2 + 300;

        if( offset <= this.axisLength - doorway.width/2 ){
          doorway.offset = offset;
          doorway.update();
          this._checkDoorwayOffset( doorway );
        }

      }
    }
  },

  changeRadial: function(){

    var v1 = this.v1.clone();
    var v2 = this.v2.clone();
    var isRadial = this.isRadial;

    this.remove();
    $wallEditor.removeWall( this );

    $wallCreator.addWall( [ v1, v2 ], { isRadial: !isRadial});
    window.console.log($wallEditor.walls);

  }

});



