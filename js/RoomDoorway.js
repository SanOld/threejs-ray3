function RoomDoorway( doorway ){

  this.doorway = doorway;

  RoomObject.call( this, null);

  this.doorsParams = {};
  this.windowsParams = {};
  this.nichesParams = {};

  switch (doorway.type) {
    case 'Doorway':
    case 'DoorBlock':
    case 'DoorBlockFloor':
    case 'DoubleDoorBlock':
    case 'DoubleDoorBlockFloor':

      this.type = 'Room_Doorway';

      break;
    default:

      this.type = 'Room_' + doorway.type;

      break;
  }

  this.name = 'room_' + doorway.name;
  var self = this;

  if( this.doorway.CGI && this.doorway.CGI.selectedHelper ){
    var geometry = new THREE.PlaneBufferGeometry();
    geometry.copy( doorway.CGI.selectedHelper.geometry.clone() );
//    this.selectedHelper = new THREE.Mesh( new THREE.PlaneBufferGeometry( this.doorway.width, this.doorway.width ), wallControlPointMaterial_hover );
    this.selectedHelper = new THREE.Mesh( geometry, doorBlockHelperMaterial );
//    this.selectedHelper.rotateZ( Math.PI/2 );
    this.selectedHelper.position.copy( doorway.CGI.selectedHelper.getWorldPosition()  );
    this.selectedHelper.rotation.copy( doorway.CGI.selectedHelper.getWorldRotation()  );
//    this.selectedHelper.lookAt(new THREE.Vector3(0, 1, 0));
    this.selectedHelper.name = 'doorSelectedHelper';
    this.selectedHelper.door = this;
    this.add( this.selectedHelper );
  }

//  this.visible = false;

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

  this.calculateParameters();

}

RoomDoorway.prototype = Object.assign( Object.create( RoomObject.prototype ),{

  constructor: RoomDoorway,

  buildGeometry: function(){
    var geometry = new THREE.BufferGeometry();
    geometry.copy( this.doorway.geometry.clone() );
    return geometry;
  },


  setStartPosition: function(){

    this.geometry.applyMatrix ( this.doorway.matrixWorld.clone() );
//    this.rotation.x = Math.PI/2;
//    this.position.set( 0, this.doorway.wall.height + this.height+1, 0);

  },

  calculateParameters: function(){

    var self = this;

    var doorways = [];

      this.doorway.wall.doors.forEach(function( door ){

        switch (door.type) {
          case 'Doorway':
          case 'DoorBlock':
          case 'DoorBlockFloor':
          case 'DoubleDoorBlock':
          case 'DoubleDoorBlockFloor':

            self.doorsParams = {

              p_otkos_door: door.getPerimeter3(), //Периметр откосов дверей
              s_otkos_door: door.getSlope3Area() , //Площадь откосов (периметр двери * глубину)
              door_lintel_length: door.width ,//Длина перемычек
              p_door: door.getPerimeter4()

            };

            break;
          case 'WindowBlock':

            self.windowsParams = {

              p_otkos_window : door.getPerimeter3(), //Периметр откосов дверей
              s_otkos_window: door.getSlope3Area(), //Площадь откосов (периметр двери * глубину)
              window_lintel_length: door.width , //Длина перемычек
              p_window: door.getPerimeter4()

            };

            break;
          case 'Niche':
            //TODO Belonging
            self.nichesParams = {

              p_niche: door.getPerimeter4() , //Периметр
              s_niche_wall: door.getArea() , //Периметр
              depth_niche: door.thickness , //Площадь откосов (периметр двери * глубину)
              s_side_niche: door.getPerimeter4() * door.thickness  //Длина перемычек

            };

            break;

        }

      });


  }

});




