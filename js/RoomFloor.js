function RoomFloor( room ){

  RoomObject.call( this, room );

  this.type = 'RoomFloor';
  this.name = 'room_floor';

}

RoomFloor.prototype = Object.assign( Object.create( RoomObject.prototype ),{

  constructor: RoomFloor,

  buildGeometry: function(){
    var geometry = new THREE.Geometry();

    var wallShape = new THREE.Shape();
    wallShape.moveTo( this.room.countur[0].x, this.room.countur[0].y );

    this.room.countur.forEach(function( item, index ){
      if( index > 0 ){
        wallShape.lineTo( item.x, item.y );
      }
    });


    var extrudeSettings = {
      amount: this.height,
      bevelEnabled: false
    };
    try{

      var geometry = new THREE.ExtrudeGeometry( wallShape, extrudeSettings );

    } catch (e){

      return null;

    }
    return geometry;
  }

});

