function RoomDoorway( doorway ){

  this.doorway = doorway;

  RoomObject.call( this, null);

  switch (doorway.type) {
    case 'Doorway':
    case 'Doorblock':
    case 'DoorblockFloor':
    case 'DoubleDoorBlock':
    case 'DoubleDoorBlockFloor':

      this.type = 'Room_doorway';

      break;
    default:

      this.type = 'Room_' + doorway.type;

      break;
  }

  this.name = 'room_' + doorway.name;
  var self = this;

  this.visible = false;

  this.mainColor =  $Editor.default_params.RoomDoorway.main_color;
  this.hoverColor =  $Editor.default_params.Room.hover_color;
  this.activeColor =  $Editor.default_params.Room.active_color;

  this.material = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 1,
      transparent: true,
      depthWrite: false,
      color: this.mainColor
    });

}

RoomDoorway.prototype = Object.assign( Object.create( RoomObject.prototype ),{

  constructor: RoomDoorway,

  buildGeometry: function(){
    var geometry = new THREE.BufferGeometry();
    geometry.copy(this.doorway.geometry.clone() );
    return geometry;
  },


  setStartPosition: function(){

    this.geometry.applyMatrix ( this.doorway.matrixWorld.clone() );
//    this.rotation.x = Math.PI/2;
//    this.position.set( 0, this.doorway.wall.height + this.height+1, 0);

  }

});




