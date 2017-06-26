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

        var r = Math.abs( this.v1.distanceTo( this.v2 ) ) / 2;
        var delta = this.width/2;
        var r1 = r + delta;

        var coord = new THREE.Line3(this.v1, this.v2).getCenter();

        var curve = new THREE.EllipseCurve(
                                            coord.x,  coord.z, // ax, aY
                                            r1, r1,            // xRadius, yRadius
                                            Math.PI,  0,       // aStartAngle, aEndAngle
                                            false,             // aClockwise
                                            -this.angle        // aRotation
                                          );

        wallShape.curves.push(curve);

        wallShape.currentPoint.x = this.v21.x;
        wallShape.currentPoint.y = this.v21.z;

        wallShape.lineTo( this.v2.x,  this.v2.z );
				wallShape.lineTo( this.v22.x, this.v22.z );

        var r2 = r - delta;;

        var curve2 = new THREE.EllipseCurve(
                                            coord.x,  coord.z,  // ax, aY
                                            r2, r2,             // xRadius, yRadius
                                            0, Math.PI,       // aStartAngle, aEndAngle
                                            true,              // aClockwise
                                            -this.angle                  // aRotation
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
  getV22: function ( walls ){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = - Math.PI;

    var segment_start = new THREE.Vector3();

    var target = null;
    var target_point = new THREE.Vector3();
    var target_direction = new THREE.Vector3();
    var target_foundation = null;
    var self = this;

    var sphere_1;
    var sphere_2;

    walls.forEach(function(item, i){

      if(self.uuid != item.uuid){
        if( $wallEditor.isPointsNeighboors( self.v2, item.v1 ) ){

          var angle = self.direction.angleTo(item.direction) ;
          var cross = self.direction.clone().cross(item.direction).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {

            angle_max = angle;
            segment_start = item.v22;
            target = item;
            target_foundation = {p1: item.v1, p2: item.v12, node_id: item.node12.id};
            target_point = item.v1;
            target_direction = item.direction.clone().negate();

          }
        }

        if($wallEditor.isPointsNeighboors( self.v2, item.v2 ) ){

          var angle = self.direction.angleTo( item.direction.clone().negate() ) ;
          var cross = self.direction.clone().cross( item.direction.clone().negate() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {

            angle_max = angle;
            segment_start = item.v11;
            target = item;
            target_foundation = {p1: item.v2, p2: item.v21, node_id: item.node21.id};
            target_point = item.v2;
            target_direction = item.direction.clone();

          }
        }

        var geometry = new THREE.SphereBufferGeometry( Math.ceil(self.radius - self.width/2), 32, 32 );
        sphere_1 = new THREE.Mesh( geometry, wallControlPointMaterial );
        sphere_1.geometry.translate (self.center.x, 0, self.center.z);

        var geometry = new THREE.SphereBufferGeometry( Math.ceil(self.radius + self.width/2), 32, 32 );
        sphere_2 = new THREE.Mesh( geometry, wallControlPointMaterial );
        sphere_2.geometry.translate (self.center.x, 0, self.center.z);

      }

    });

    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path22 = null;
    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
//      segment_end = target_foundation.p2;

    }
    if( target && Math.abs(angle_max ) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;
      exception = true;

    }
    //пересечение
    if( angle_max > -Math.PI && angle_max != 0 ){

      var raycaster = new THREE.Raycaster( segment_start, target_direction );
      var intersects = [];
      var intersects_1 = [];
      var intersects_2 = [];


      sphere_1.raycast( raycaster, intersects_1 );
      intersects = intersects.concat( intersects_1 );
      sphere_2.raycast( raycaster, intersects_2 );
      intersects = intersects.concat( intersects_2 );

      if( intersects.length == 1 ){

        result_point = intersects[0].point;

      } else if( intersects.length > 1 ){

        var i = intersects.length;
        var dist_min = Infinity;
        while(i--){
            var dist = intersects[i].point.distanceToSquared( target_point );
            if(dist < dist_min){
              dist_min = dist;
              result_point = intersects[i].point;
            }
        }

      }

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

  var target = null;
  var target_point = new THREE.Vector3();
  var target_direction = new THREE.Vector3();
  var target_foundation = null;
  var self = this;

  var sphere_1;
  var sphere_2;

  walls.forEach(function(item, i){
    if(self.uuid != item.uuid){
      if( $wallEditor.isPointsNeighboors( self.v2, item.v1 ) ){

        var angle = self.direction.angleTo(item.direction) ;
        var cross = self.direction.clone().cross(item.direction).getComponent ( 1 );
        angle = cross < 0 ? angle : - angle;

        if(angle < angle_max) {
          angle_max = angle;
          segment_start = item.v21;
          target = item;
          target_foundation = {p1: item.v1, p2: item.v11, node_id: item.node11.id};
          target_point = item.v1;
          target_direction = item.direction.clone().negate();

        }
      }

      if( $wallEditor.isPointsNeighboors( self.v2, item.v2 ) ){

        var angle = self.direction.angleTo( item.direction.clone().negate() ) ;
        var cross = self.direction.clone().cross( item.direction.clone().negate() ).getComponent ( 1 );
        angle = cross < 0 ? angle : - angle;

        if(angle < angle_max) {
          angle_max = angle;
          segment_start = item.v12;
          target = item;
          target_foundation = {p1: item.v2, p2: item.v22, node_id: item.node22.id};
          target_point = item.v2;
          target_direction = item.direction.clone();

        }
      }

      var geometry = new THREE.SphereBufferGeometry( Math.ceil(self.radius - self.width/2), 32, 32 );
      sphere_1 = new THREE.Mesh( geometry, wallControlPointMaterial );
      sphere_1.geometry.translate (self.center.x, 0, self.center.z);

      var geometry = new THREE.SphereBufferGeometry( Math.ceil(self.radius + self.width/2), 32, 32 );
      sphere_2 = new THREE.Mesh( geometry, wallControlPointMaterial );
      sphere_2.geometry.translate (self.center.x, 0, self.center.z);

    }

  });


  //при разнице оснований и угол меньше 45 примыкание к основанию
  var exception = false;
  self._e_path21 = null;

  if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

    segment_start = target_foundation.p1;
//      segment_end = target_foundation.p2;

  }
  if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

    angle_max = 0;
    exception = true;

  }
  //пересечение
  if(angle_max < Math.PI && angle_max != 0){

    var raycaster = new THREE.Raycaster( segment_start, target_direction );
    var intersects = [];
    var intersects_1 = [];
    var intersects_2 = [];


    sphere_1.raycast( raycaster, intersects_1 );
    intersects = intersects.concat( intersects_1 );
    sphere_2.raycast( raycaster, intersects_2 );
    intersects = intersects.concat( intersects_2 );

    if( intersects.length == 1 ){

      result_point = intersects[0].point;

    } else if( intersects.length > 1 ){

      var i = intersects.length;
      var dist_min = Infinity;
      while(i--){
          var dist = intersects[i].point.distanceToSquared( target_point );
          if(dist < dist_min){
            dist_min = dist;
            result_point = intersects[i].point;
          }
      }

    }

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

    var target = null;
    var target_point = new THREE.Vector3();
    var target_direction = new THREE.Vector3();
    var target_foundation = null;
    var self = this;

    var sphere_1;
    var sphere_2;

    walls.forEach(function(item, i){
      if(self.uuid != item.uuid){
        if( $wallEditor.isPointsNeighboors( self.v1, item.v2 ) ){

          var angle = self.direction.clone().negate().angleTo(item.direction.clone().negate()) ;
          var cross = self.direction.clone().negate().cross(item.direction.clone().negate()).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {

            angle_max = angle;
            segment_start = item.v12;
            target = item;
            target_foundation = {p1: item.v2, p2: item.v22, node_id: item.node22.id};
            target_point = item.v2;
            target_direction = item.direction.clone();

          }
        }

        if( $wallEditor.isPointsNeighboors( self.v1, item.v1 ) ){

          var angle = self.direction.clone().negate().angleTo( item.direction.clone() ) ;
          var cross = self.direction.clone().negate().cross( item.direction.clone() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {

            angle_max = angle;
            segment_start = item.v21;
            target = item;
            target_foundation = {p1: item.v1, p2: item.v11, node_id: item.node11.id};
            target_point = item.v1;
            target_direction = item.direction.clone().negate();

          }
        }

        var geometry = new THREE.SphereBufferGeometry( Math.ceil(self.radius - self.width/2), 32, 32 );
        sphere_1 = new THREE.Mesh( geometry, wallControlPointMaterial );
        sphere_1.geometry.translate (self.center.x, 0, self.center.z);

        var geometry = new THREE.SphereBufferGeometry( Math.ceil(self.radius + self.width/2), 32, 32 );
        sphere_2 = new THREE.Mesh( geometry, wallControlPointMaterial );
        sphere_2.geometry.translate (self.center.x, 0, self.center.z);

      }

    });

    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path12 = null;

    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
//      segment_end = target_foundation.p2;

    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;
      exception = true;

    }
    //пересечение
    if(angle_max < Math.PI && angle_max != 0){

      var raycaster = new THREE.Raycaster( segment_start, target_direction );
      var intersects = [];
      var intersects_1 = [];
      var intersects_2 = [];


      sphere_1.raycast( raycaster, intersects_1 );
      intersects = intersects.concat( intersects_1 );
      sphere_2.raycast( raycaster, intersects_2 );
      intersects = intersects.concat( intersects_2 );

      if( intersects.length == 1 ){

        result_point = intersects[0].point;

      } else if( intersects.length > 1 ){

        var i = intersects.length;
        var dist_min = Infinity;
        while(i--){
            var dist = intersects[i].point.distanceToSquared( target_point );
            if(dist < dist_min){
              dist_min = dist;
              result_point = intersects[i].point;
            }
        }

      }

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

      var target = null;
      var target_point = new THREE.Vector3();
      var target_direction = new THREE.Vector3();
      var target_foundation = null;
      var self = this;

      var sphere_1;
      var sphere_2;

      walls.forEach(function(item, i){

        if(self.uuid != item.uuid){
          if($wallEditor.isPointsNeighboors( self.v1, item.v2 ) ){

            var angle = self.direction.clone().negate().angleTo(item.direction.clone().negate()) ;
            var cross = self.direction.clone().negate().cross(item.direction.clone().negate()).getComponent ( 1 );
            angle = cross < 0 ? angle : - angle;

            if(angle > angle_max) {

              angle_max = angle;
              segment_start = item.v11;
              target = item;
              target_foundation = {p1: item.v2, p2: item.v21, node_id: item.node21.id};
              target_point = item.v2;
              target_direction = item.direction.clone();

            }
          }

          if($wallEditor.isPointsNeighboors( self.v1, item.v1 ) ){

            var angle = self.direction.clone().negate().angleTo( item.direction.clone() ) ;
            var cross = self.direction.clone().negate().cross( item.direction.clone() ).getComponent ( 1 );
            angle = cross < 0 ? angle : - angle;

            if(angle > angle_max) {

              angle_max = angle;
              segment_start = item.v22;
              target = item;
              target_foundation = {p1: item.v1, p2: item.v12, node_id: item.node12.id};
              target_point = item.v1;
              target_direction = item.direction.clone().negate();

            }
          }

          var geometry = new THREE.SphereBufferGeometry( Math.ceil(self.radius - self.width/2), 32, 32 );
          sphere_1 = new THREE.Mesh( geometry, wallControlPointMaterial );
          sphere_1.geometry.translate (self.center.x, 0, self.center.z);

          var geometry = new THREE.SphereBufferGeometry( Math.ceil(self.radius + self.width/2), 32, 32 );
          sphere_2 = new THREE.Mesh( geometry, wallControlPointMaterial );
          sphere_2.geometry.translate (self.center.x, 0, self.center.z);

        }

      });

      //при разнице оснований и угол меньше 45 примыкание к основанию
      var exception = false;
      self._e_path11 = null;
      if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

        segment_start = target_foundation.p1;
  //      segment_end = target_foundation.p2;

      }
      if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

        angle_max = 0;
        exception = true;

      }
      //пересечение
      if(angle_max > -Math.PI && angle_max != 0){

        var raycaster = new THREE.Raycaster( segment_start, target_direction );
        var intersects = [];
        var intersects_1 = [];
        var intersects_2 = [];


        sphere_1.raycast( raycaster, intersects_1 );
        intersects = intersects.concat( intersects_1 );
        sphere_2.raycast( raycaster, intersects_2 );
        intersects = intersects.concat( intersects_2 );

        if( intersects.length == 1 ){

          result_point = intersects[0].point;

        } else if( intersects.length > 1 ){

          var i = intersects.length;
          var dist_min = Infinity;
          while(i--){
              var dist = intersects[i].point.distanceToSquared( target_point );
              if(dist < dist_min){
                dist_min = dist;
                result_point = intersects[i].point;
              }
          }

        }

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