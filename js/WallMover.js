//Хелпер перемещения
function WallMover( wall ){

  THREE.Mesh.call( this, new THREE.Geometry());

  this.type = 'WallMover';
  this.name = 'wall_mover';

  var self = this;

  var _ray = new THREE.Ray();

  this.enabled = true;
  this.raycaster = new THREE.Raycaster();
  this.wall = wall;
  this.height = 1;
  //массивы соседних стен
  this.v1_neighbors = [];
  this.v2_neighbors = [];
  this.neighborsNeedUpdate = true;
  this.needRemove = false;

  //переменные для контроля направдения перемещения
  var drag_start_pos = null;
  var drag_pos = null;

  var material_1 = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.5,
      transparent: true,
      depthWrite: false,
      color: $Editor.default_params.wallMover.hover_color
    });

  this.geometry = this.buildGeometry();
  this.material = material_1;
  this.material.visible = false;

  //позиционирование
  this.setStartPosition();

  this.dragControls = null;

   /**
   * проверка длин соседей (удаление нулевой стены)
   */
  this.checkNeighborsLength = function(){
    var result = false;
    var v1_offset, v2_offset = Infinity;
    var v1_dir, v2_dir = null;
    var v1_item, v2_item = null;
    var v1_index, v2_index;
    var mover_dir = null;

    //вычисляем направление
    if(drag_pos && drag_start_pos)
    var mover_dir = drag_pos.clone().sub(drag_start_pos);

    //вычисляем направление и необходимое смещение
    self.v1_neighbors.forEach(function( item, i, arr ){

//      var dot = self.wall.direction.clone().dot(item.wall.direction);

      if( item.wall.axisLength < item.wall.width * 0.9 && !v1_item ){


          var _v1_dir = item.opposite_point.clone().sub( item.point ).normalize();

          if(mover_dir && mover_dir.dot(_v1_dir) > 0){

            v1_dir = _v1_dir.clone();
            v1_offset = v1_dir.clone().multiplyScalar ( item.wall.axisLength );
            v1_item = item;
            v1_index = i;

          }

//        return;
      }

    });
    self.v2_neighbors.forEach(function( item, i, arr ){

//      var dot = self.wall.direction.clone().dot( item.wall.direction );

      if( item.wall.axisLength < item.wall.width * 0.9 && !v2_item ){


          var _v2_dir = item.opposite_point.clone().sub( item.point ).normalize();

          if(mover_dir && mover_dir.dot(_v2_dir) > 0){

            v2_dir = _v2_dir.clone();
            v2_offset = v2_dir.clone().multiplyScalar ( item.wall.axisLength );
            v2_item = item;
            v2_index = i;
          }

//        return;
      }

    });

    //проверяем условия угол в радианах
    if(v1_dir && v2_dir && ( v1_dir.equals(v2_dir) || THREE.Math.radToDeg(v1_dir.angleTo(v2_dir)) < 5 ) ){

      switch (true) {
        case v1_offset.length == v2_offset.length :

          self.wall.v1.add( v1_offset );
          self.wall.v2.add( v1_offset );

          v1_item.wall.remove();
          v2_item.wall.remove();
          v1_item.wall = null;
          v2_item.wall = null;

          self.v1_neighbors.splice(v1_index, 1);
          self.v2_neighbors.splice(v2_index, 1);

          result = true;

          break;

        case v1_offset.length < v2_offset.length:

          self.wall.v1.add( v1_offset );
          self.wall.v2.add( v1_offset );

          v1_item.wall.remove();
          v1_item.wall = null;
          self.v1_neighbors.splice(v1_index, 1);
          result = true;

          break;
        case v1_offset.length > v2_offset.length:

          self.wall.v1.add( v2_offset );
          self.wall.v2.add( v2_offset );

          v2_item.wall.remove();
          v2_item.wall = null;
          self.v2_neighbors.splice(v2_index, 1);
          result = true;

          break;
      }

      return result;

    }

    if(v1_dir){

      self.wall.v1.add( v1_offset );
      self.wall.v2.add( v1_offset );

      self.v1_neighbors.splice(v1_index, 1);
      v1_item.wall.remove();
      v1_item.wall = null;

      result = true;

    }

    if(v2_dir){

      self.wall.v1.add( v2_offset );
      self.wall.v2.add( v2_offset );

      self.v2_neighbors.splice(v2_index, 1);
      v2_item.wall.remove();
      v2_item.wall = null;

      result = true;

    }


    return result;
  };

  function checkSelfLength(){

    var v1_offset = Infinity;
    var v2_offset = Infinity;
    var v1_dir = null;
    var v2_dir = null;
    var v1_end_segment, v2_end_segment;
    var point_intersect = new THREE.Vector3();

    if(self.wall.axisLength < 50 ){

      switch (true) {
        case (self.v1_neighbors.length == 1 && self.v2_neighbors.length == 1):
          v1_dir = self.v1_neighbors[0].point.clone().sub( self.v1_neighbors[0].opposite_point ).normalize();
          v2_dir = self.v2_neighbors[0].point.clone().sub( self.v2_neighbors[0].opposite_point ).normalize();

          v1_end_segment = self.v1_neighbors[0].opposite_point.clone().add( v1_dir.clone().multiplyScalar ( 100000 ) );
          v2_end_segment = self.v2_neighbors[0].opposite_point.clone().add( v2_dir.clone().multiplyScalar ( 100000 ) );

          _ray.origin = self.v1_neighbors[0].opposite_point;
          _ray.direction = v1_dir;
          _ray.distanceSqToSegment(self.v2_neighbors[0].opposite_point, v2_end_segment, point_intersect);

          self.v1_neighbors[0].wall.v1 = self.v1_neighbors[0].point.equals(self.v1_neighbors[0].wall.v1) ? point_intersect.clone(): self.v1_neighbors[0].wall.v1 ;
          self.v1_neighbors[0].wall.v2 = self.v1_neighbors[0].point.equals(self.v1_neighbors[0].wall.v2) ? point_intersect.clone(): self.v1_neighbors[0].wall.v2 ;
          self.v2_neighbors[0].wall.v1 = self.v2_neighbors[0].point.equals(self.v2_neighbors[0].wall.v1) ? point_intersect.clone(): self.v2_neighbors[0].wall.v1 ;
          self.v2_neighbors[0].wall.v2 = self.v2_neighbors[0].point.equals(self.v2_neighbors[0].wall.v2) ? point_intersect.clone(): self.v2_neighbors[0].wall.v2 ;

          break;

        default:

          break;
      }

      return true;
    }

    return false;

  }

  function isIntersect( neighbors, point ){

    var result = false;
    var result1 = 1;
    var result2 = 1;
    neighbors.forEach(function(item){
      var dot = self.wall.direction.clone().dot( item.wall.direction );
      if(  Math.abs( dot ) < 0.001 ){

        _ray.origin = point.clone();
        _ray.direction = self.wall.direction.clone();
        var distance = _ray.distanceSqToSegment( item.wall.v1.clone(), item.wall.v2.clone() );
        if( ! distance ) {
          result = item.wall;
          return;
        };

        _ray.origin = point.clone();
        _ray.direction = self.wall.direction.negate().clone();
        var distance = _ray.distanceSqToSegment( item.wall.v1.clone(), item.wall.v2.clone() );
        if( ! distance ) {
          result = item.wall;
          return;
        };

//        _ray.origin = item.wall.v1.clone();
//        _ray.direction = self.wall.direction.clone();
//        var result1 = _ray.distanceSqToPoint ( point );
//
//        _ray.origin = item.wall.v1.clone();
//        _ray.direction = self.wall.direction.negate().clone();
//        var result2 = _ray.distanceSqToPoint ( point );

      }
    });

//    return (result1 == 0 && result2 == 0);
  return result;
  }

  //события
  this.dragstart =  function ( event ) {

    drag_start_pos = event.object.position.clone();

    controls.enabled = false;

    self.enabled = true;
    self.updateNeighbors();
    self.neighborsNeedUpdate = false;

	};
  this.drag =       function ( event, newCoord ) {

    drag_pos = event.object.position.clone() ;

    var neighborsNeedUpdate = false;
    var v1_exception1 = false;
    var v2_exception1 = false;
    var newCoord = newCoord || null;

    if(!self.enabled) return;

    //предупреждаем возникновение ошибки
    if(self.geometry.vertices.length == 0){
      self.hoveroff();
      self.dragend();
      self.enabled = false;
    };

    //удаляем стену с мин длиной
    if( self.checkNeighborsLength() ){

      newCoord = {v1: self.wall.v1, v2: self.wall.v2};
      self.enabled = false;

    }

    //удаляем активную стену при достижении min длины
    if( checkSelfLength() ){
      self.needRemove = true;
      self.hoveroff();
      self.dragend();
      self.deactivate();
      return;
    }


  if( self.enabled ){
    //проекция вектора движения
      var y = event.object.position.y;
      event.object.position.projectOnVector ( event.object.wall.direction90.clone() );
      event.object.position.setY(y);
      //новые координаты стены

    if( newCoord ){

      self.writeCoordToWall( event, newCoord );

    } else {

      newCoord = self.getNewCoord();
      self.writeCoordToWall( event, newCoord );

    }

  }



    if( self.v1_neighbors.length > 0 || self.v2_neighbors.length > 0 ){

      //particular case exception1
      if( self.v1_neighbors.length == 2 ){

        var dot1 = self.wall.direction.clone().dot( self.v1_neighbors[0].wall.direction.clone() );
        var dot2 = self.wall.direction.clone().dot( self.v1_neighbors[1].wall.direction.clone() );

        if( Math.abs(dot1) < 0.001 && Math.abs(dot2) < 0.001 ){

          self.v1_neighbors[0].point.copy( event.object.wall.v1.clone() ) ;
          self.v1_neighbors[1].point.copy( event.object.wall.v1.clone() ) ;

          v1_exception1 = true;

        }

      }

      if( self.v2_neighbors.length == 2 ){

        var dot1 = self.wall.direction.clone().dot( self.v2_neighbors[0].wall.direction.clone() );
        var dot2 = self.wall.direction.clone().dot( self.v2_neighbors[1].wall.direction.clone() );

        if( Math.abs(dot1) < 0.001 && Math.abs(dot2) < 0.001 ){

          self.v2_neighbors[0].point.copy( event.object.wall.v2.clone() ) ;
          self.v2_neighbors[1].point.copy( event.object.wall.v2.clone() ) ;

          v2_exception1 = true;

        }

      }

      //global condition1
      if( self.v1_neighbors.length > 1 && !v1_exception1 ){

        if( newCoord.v1.distanceTo(self.v1_neighbors[0].point) > 10 ){

          var intersected = isIntersect(self.v1_neighbors, newCoord.v1);

          if(intersected){

            var v1 = intersected.v1.clone();
            var v2 = intersected.v2.clone();
            var width = intersected.width;
            intersected.remove();

            var w1 = self.addWall( [v1, newCoord.v1], width );
            var w2 = self.addWall( [v2, newCoord.v1], width );

            neighborsNeedUpdate = true;

          } else {

            self.addWall( [self.v1_neighbors[0].point.clone(), event.object.wall.v1], event.object.wall.width );
            self.v1_neighbors.length = 0;

            neighborsNeedUpdate = true;

          }

        }

      }
      if( self.v2_neighbors.length > 1 && !v2_exception1 ){

        if( newCoord.v2.distanceTo(self.v2_neighbors[0].point) > 10 ){

          var intersected = isIntersect(self.v2_neighbors, newCoord.v2);

          if(intersected){

            var v1 = intersected.v1.clone();
            var v2 = intersected.v2.clone();
            var width = intersected.width;
            intersected.remove();

            var w1 = self.addWall( [v1, newCoord.v2], width );
            var w2 = self.addWall( [v2, newCoord.v2], width );

            neighborsNeedUpdate = true;
          } else {

            self.addWall( [ self.v2_neighbors[0].point, event.object.wall.v2 ], event.object.wall.width );
            self.v2_neighbors.length = 0;

            neighborsNeedUpdate = true;

          }

        }

      }

      //global condition2
      if( self.v2_neighbors.length == 1 ){

        var dot = self.wall.direction.clone().dot( self.v2_neighbors[0].wall.direction.clone() );

        switch ( Math.abs(dot) > 0.999 ) {
          case true:
            if( newCoord.v2.distanceTo( self.v2_neighbors[0].point ) > 10 ){

              self.addWall( [ self.v2_neighbors[0].point, event.object.wall.v2 ], event.object.wall.width );
              neighborsNeedUpdate = true;

            }
            break;
          case false:

            _ray.origin = event.object.wall.v1.clone().add( event.object.wall.direction.clone().negate().multiplyScalar( 100000 ));;
            _ray.direction = event.object.wall.direction.clone();

            var result_point = new THREE.Vector3();
            _ray.distanceSqToSegment ( self.v2_neighbors[0].line_segment.start, self.v2_neighbors[0].line_segment.end, result_point );

            if( ! result_point.equals(new THREE.Vector3()) ){

              event.object.wall.v2 = result_point.clone();
              self.v2_neighbors[0].point.copy( event.object.wall.v2.clone() ) ;

            }
            break;
        }

      }
      if( self.v1_neighbors.length == 1 ){

        var dot = self.wall.direction.clone().dot( self.v1_neighbors[0].wall.direction.clone() );

        switch ( Math.abs(dot) > 0.999 ) {
          case true:
            if( newCoord.v1.distanceTo( self.v1_neighbors[0].point) > 10 ){

              self.addWall( [ self.v1_neighbors[0].point.clone(), event.object.wall.v1 ], event.object.wall.width );
              neighborsNeedUpdate = true;

            }

            break;
          case false:

            _ray.origin = event.object.wall.v2.clone().add( event.object.wall.direction.clone().multiplyScalar( 100000 ));
            _ray.direction = event.object.wall.direction.clone().negate();

            var result_point = new THREE.Vector3();
            _ray.distanceSqToSegment ( self.v1_neighbors[0].line_segment.start, self.v1_neighbors[0].line_segment.end, result_point );

            if( ! result_point.equals(new THREE.Vector3()) ){

              event.object.wall.v1 = result_point.clone();
              self.v1_neighbors[0].point.copy( event.object.wall.v1.clone() ) ;

            }
            break;
        }
      }

    }

    if( ! self.enabled){
      self.hoveroff();
      self.dragend();
    } else {
      self.neighborsNeedUpdate = neighborsNeedUpdate ? true : false;
      self.updateNeighborsWalls();
      self.wall.update();
      self.neighborsNeedUpdate = neighborsNeedUpdate = false;
    }

	};
  this.dragend =    function ( event ) {

      if( self.checkNeighborsLength() ){

      var newCoord = {v1: self.wall.v1, v2: self.wall.v2};

      self.drag(event, newCoord);

    }


    self.neighborsNeedUpdate = true;

    controls.enabled = true;

    if( self.needRemove ) self.wall.remove();

    $wallCreator.updateWalls();

    //обнуляем значения
    var drag_start_pos = null;
    var drag_pos = null;

  };
  this.hoveron =    function ( event ) {

    self.material.visible = true;

  };
  this.hoveroff =   function ( event ) {

    self.material.visible = false;

  };

}
WallMover.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{

  constructor: WallMover,

  buildGeometry: function(){

    var wallShape = new THREE.Shape();
				wallShape.moveTo( this.wall.v1.x, this.wall.v1.z );
				wallShape.lineTo( this.wall.v11.x, this.wall.v11.z );
				wallShape.lineTo( this.wall.v21.x, this.wall.v21.z );
        wallShape.lineTo( this.wall.v2.x, this.wall.v2.z );
				wallShape.lineTo( this.wall.v22.x, this.wall.v22.z );
        wallShape.lineTo( this.wall.v12.x, this.wall.v12.z );
        wallShape.lineTo( this.wall.v1.x, this.wall.v1.z );

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

  setStartPosition: function(){
    this.rotation.x = this.wall.rotation.x;
    this.position.set( 0, this.wall.height + this.height, 0);
  },

  update: function(){

    var geometry = this.buildGeometry();
    //позиционирование
    this.setStartPosition();

    if(geometry){
      this.geometry = geometry;
      this.geometry.verticesNeedUpdate = true;
      this.position.set(0,0,0);
      this.setStartPosition();
      this.geometry.verticesNeedUpdate = true;
    } else {
        this.geometry = new THREE.Geometry();
        this.material.visible = false;
    }

//    this.checkNeighborsLength();
    this.updateNeighbors();

  },
  updateNeighbors: function(){

    if(! this.neighborsNeedUpdate ) return;

    var self = this;

    self.v1_neighbors = [];
    self.v2_neighbors = [];



    this.wall.walls.forEach(function( item, i ){


      if( item.type == 'Wall' && self.wall.index != i ){



        var arr = null;
        var arg1;
        var arg2;
        var opposite_point;

        switch ( true ) {
          case $wallEditor.isPointsNeighboors( self.wall.v1, item.v1, 1 ) :
            arr = 'v1_neighbors';
            arg1 = 'v1';
            arg2 = 'v1';
            opposite_point = 'v2';
            item.node1.id = self.wall.node1.id;
            item.node11.id = $wallEditor.isPointsNeighboors( self.wall.v12, item.v11, 1 ) ? self.wall.node12.id : item.node11.id;
            item.node12.id = $wallEditor.isPointsNeighboors( self.wall.v11, item.v12, 1 ) ? self.wall.node11.id : item.node12.id;
            break;
          case $wallEditor.isPointsNeighboors( self.wall.v1, item.v2, 1 ):
            arr = 'v1_neighbors';
            arg1 = 'v1';
            arg2 = 'v2';
            opposite_point = 'v1';
            item.node2.id = self.wall.node1.id;
            item.node21.id = $wallEditor.isPointsNeighboors( self.wall.v11, item.v21, 1 ) ? self.wall.node11.id : item.node21.id;
            item.node22.id = $wallEditor.isPointsNeighboors( self.wall.v12, item.v22, 1 ) ? self.wall.node12.id : item.node22.id;

            break;
          case $wallEditor.isPointsNeighboors( self.wall.v2, item.v1, 1 ):
            arr = 'v2_neighbors';
            arg1 = 'v2';
            arg2 = 'v1';
            opposite_point = 'v2';
            item.node1.id = self.wall.node2.id;
            item.node11.id = $wallEditor.isPointsNeighboors( self.wall.v21, item.v11, 1 ) ? self.wall.node21.id : item.node11.id;
            item.node12.id = $wallEditor.isPointsNeighboors( self.wall.v22, item.v12, 1 ) ? self.wall.node22.id : item.node12.id;
            break;
          case $wallEditor.isPointsNeighboors( self.wall.v2, item.v2, 1 ):
            arr = 'v2_neighbors';
            arg1 = 'v2';
            arg2 = 'v2';
            opposite_point = 'v1';
            item.node2.id = self.wall.node2.id;
            item.node21.id = $wallEditor.isPointsNeighboors( self.wall.v22, item.v21, 1 ) ? self.wall.node22.id : item.node21.id;
            item.node22.id = $wallEditor.isPointsNeighboors( self.wall.v21, item.v22, 1 ) ? self.wall.node21.id : item.node22.id;
            break;
        }


        if(arr){
          self[arr].push({
              wall: item,
              point: item[arg2],
              opposite_point: item[ opposite_point ],
              line_segment: {
                start: item[ arg1 ].clone().add( item.direction.clone().negate().multiplyScalar( 100000 ) ),
                end: item[ arg1 ].clone().add( item.direction.clone().multiplyScalar( 100000 ) )
              }
  //            angle: angle
            });
        }

      }

    });

  },
  updateNeighborsWalls: function (){
    $wallCreator.updateWalls();

    //maybe TODO что бы не перебирать все стены
//    this.v1_neighbors.forEach(function( item, i, arr ){
//
//      item.wall.update();
//
//    });
//    this.v2_neighbors.forEach(function( item, i, arr ){
//
//      item.wall.update();
//
//    });

  },

  //установка значений координат
  writeCoordToWall: function(event, newCoord){

    var wallsWithoutNeighbors = event.object.wall.walls.slice();

    //исключение данной стены
    wallsWithoutNeighbors.splice( this.wall.index, 1 );
    //исключение из проверки соседних стен
    this.v1_neighbors.forEach(function(item){
      var index = wallsWithoutNeighbors.indexOf(item.wall);
      if( index != -1){
        wallsWithoutNeighbors.splice( index, 1 );
      }
    });
    this.v2_neighbors.forEach(function(item){
      var index = wallsWithoutNeighbors.indexOf(item.wall);
      if( index != -1){
        wallsWithoutNeighbors.splice( index, 1 );
      }
    });


    //вычисление пересечения
    //исключили вычисление пересечения при перемещении
    //после изменения размера
    if( !event.intersect_disable ){
      var offset = newCoord.v1.multiply(new THREE.Vector3(1,0,1)).clone().sub(event.object.wall.v1);

      event.object.wall.geometry.computeBoundingBox();
      var originPoint = event.object.wall.geometry.boundingBox.getCenter().applyMatrix4( event.object.wall.matrix ).clone().add(offset);

      for (var i = 0; i < event.object.wall.geometry.vertices.length; i++)
      {
        var localVertex = event.object.wall.geometry.vertices[i].clone();
        var globalVertex = localVertex.applyMatrix4( event.object.wall.matrix ).clone().add(offset);;
        var directionVector = globalVertex.sub( originPoint.clone() );

        this.raycaster.set ( originPoint, directionVector.clone().normalize() );
        var collisionResults = this.raycaster.intersectObjects( wallsWithoutNeighbors );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
          return;
      }
    }

    //новые координаты
    event.object.wall.v1.copy( newCoord.v1.clone() );
    event.object.wall.v2.copy( newCoord.v2.clone() );

    event.object.wall.v1.multiply(new THREE.Vector3(1,0,1));
    event.object.wall.v2.multiply(new THREE.Vector3(1,0,1));

  },
  //координаты стены после передвижеия курсора
  getNewCoord: function(){

    this.updateMatrixWorld();

    var result = {};
    if(this.geometry.vertices.length > 0){
      result.v1 = this.geometry.vertices[0].clone().applyMatrix4(this.matrixWorld.clone());
      result.v2 = this.geometry.vertices[3].clone().applyMatrix4(this.matrixWorld.clone());
      result.v1.multiply(new THREE.Vector3(1,0,1));
      result.v2.multiply(new THREE.Vector3(1,0,1));
    }
    return result;

  },
  //дополнительная стена
  addWall: function(vertices, width){
    var wall = null;
    var width = width || $wallCreator.wall_width;
    wall = $wallCreator.addWall( vertices,
                          {
                            width: width,
                            auto_building: true
                          });
//    wall.mover.activate();

    return wall;
  },

  activate:   function() {

    if(this.dragControls){

      this.dragControls.activate();

    } else {

      this.dragControls = new DragControls2( [this], camera, renderer.domElement );

    }

      this.dragControls.addEventListener( 'dragstart', this.dragstart );
      this.dragControls.addEventListener( 'drag', this.drag );
      this.dragControls.addEventListener( 'dragend', this.dragend );
      this.dragControls.addEventListener( 'hoveron', this.hoveron );
      this.dragControls.addEventListener( 'hoveroff', this.hoveroff );

    this.update();

	},
  deactivate: function () {

    if(this.dragControls){
      this.dragControls.removeEventListener( 'dragstart', this.dragstart, false );
      this.dragControls.removeEventListener( 'drag', this.drag, false );
      this.dragControls.removeEventListener( 'dragend', this.dragend, false );
      this.dragControls.removeEventListener( 'hoveron', this.hoveron, false );
      this.dragControls.removeEventListener( 'hoveroff', this.hoveroff, false );

      this.dragControls.deactivate();
      this.dragControls = null;
    }

	}

});
