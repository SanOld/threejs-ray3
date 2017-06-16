function RoomFloor( room ){

  RoomObject.call( this, room );

  this.type = 'RoomFloor';
  this.name = 'room_floor';

}

RoomFloor.prototype = Object.assign( Object.create( RoomObject.prototype ),{

  constructor: RoomFloor

});

