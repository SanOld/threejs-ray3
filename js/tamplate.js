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