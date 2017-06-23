//объект радиусной стены
function RadialWall( vertices, parameters ){
  Wall.apply( this, [vertices, parameters] );

//  this.type = 'Wall';
  this.name = 'radial_wall';
  this.subtype = 'RadialWall';

  var self = this;

  this.isRadial = true;
  this.radius = this.axisLength / 2;
  this.center = this.axisLine.getCenter();

  alert('new RadialWall create!');

}
RadialWall.prototype = Object.assign( Object.create( Wall.prototype ),{

  constructor: RadialWall,

  recalculatePoints: function (){
    Wall.prototype.recalculatePoints.apply(this, arguments);

  },
  buildGeometry: function(){
    var wallShape = new THREE.Shape();

				wallShape.moveTo( this.v1.x,  this.v1.z );

				wallShape.lineTo( this.v11.x, this.v11.z );


        var r = Math.abs( this.v11.distanceTo( this.v21 ) ) / 2;

        var coord = new THREE.Line3(this.v11, this.v21).getCenter();

        var curve = new THREE.EllipseCurve(
                                            coord.x,  coord.z,  // ax, aY
                                            r, r,             // xRadius, yRadius
                                            Math.PI,  0,       // aStartAngle, aEndAngle
                                            false,              // aClockwise
                                            this.angle                  // aRotation
                                          );

        wallShape.curves.push(curve);

        wallShape.currentPoint.x = this.v21.x;
        wallShape.currentPoint.y = this.v21.z;


        wallShape.lineTo( this.v2.x,  this.v2.z );
				wallShape.lineTo( this.v22.x, this.v22.z );

        var r2 = Math.abs( this.v22.distanceTo( this.v12 ) ) / 2;
        var coord2 = new THREE.Line3(this.v22, this.v12).getCenter();

        var curve2 = new THREE.EllipseCurve(
                                            coord2.x,  coord2.z,  // ax, aY
                                            this.radius - this.width/2, this.radius - this.width/2,             // xRadius, yRadius
                                            0, Math.PI,       // aStartAngle, aEndAngle
                                            true,              // aClockwise
                                            this.angle                  // aRotation
                                          );

        wallShape.curves.push(curve2);

        wallShape.currentPoint.x = this.v12.x;
        wallShape.currentPoint.y = this.v12.z;

        wallShape.lineTo( this.v12.x, this.v12.z );
//        wallShape.quadraticCurveTo ( coord.x, coord.z, this.v12.x, this.v12.z );
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
  getV22: function (walls){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = - Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();

    var target = null;
    var target_foundation = null;
    var self = this;
    var neighboor = null;
    var ellipse;
    var material = new THREE.LineBasicMaterial( { color : 'red' } );

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


            var curve = new THREE.EllipseCurve(
                self.center.x,  self.center.z,            // ax, aY
                self.radius - self.width/2, self.radius - self.width/2,           // xRadius, yRadius
                0,  2 * Math.PI,  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                 // aRotation
              );

              var path = new THREE.Path( curve.getPoints( 50 ) );
              var geometry = path.createPointsGeometry( 50 );


              // Create the final object to add to the scene
              ellipse = new THREE.Line( geometry, material );
              ellipse.rotation.copy(self.rotation);
              neighboor = item;

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

    })

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

//      var ray = new THREE.Ray(neighboor.v22, neighboor.direction.clone().negate());
//      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

var geometry = new THREE.Geometry();
geometry.vertices.push(neighboor.v22);
geometry.vertices.push( neighboor.v22.clone().add( neighboor.direction.clone().negate().multiplyScalar(neighboor.axisLength * 2)) );
var line = new THREE.Line(geometry, material);

      var raycaster = new THREE.Raycaster();
      raycaster.set ( neighboor.v22, neighboor.direction.clone().negate() );
      scene.add( ellipse );
      scene.add( line );
      var intersects = [];
      var result_point2 = ellipse.raycast( raycaster, intersects );


      window.console.log(intersects);
      window.console.log(result_point2);


      intersects = raycaster.intersectObject(ellipse)
      window.console.log(intersects);


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
  getV21: function (walls){

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

    })


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
  getV12: function (walls){
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

    })

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

    })

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
  }

});

