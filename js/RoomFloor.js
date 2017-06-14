function RoomFloor( room ){

  THREE.Mesh.call( this, new THREE.Geometry());

  this.type = 'RoomFloor';
  this.name = 'room_floor';

  var self = this;

  this.room = room;
  this.heigth = 1;

  self.actived = false;

  this.geometry = this.buildGeometry();
  this.material = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 1,
      transparent: true,
      depthWrite: false,
      color: $Editor.default_params.Room.main_color
    });

  this.setStartPosition();

  //события
  this.hoveron =    function ( event ) {

    if( ! self.actived )
    self.material.color = new THREE.Color( $Editor.default_params.Room.hover_color );

  };
  this.hoveroff =   function ( event ) {

    window.console.log(event.object);

    if( ! self.actived )
    self.material.color = new THREE.Color( $Editor.default_params.Room.main_color );

  };
}

RoomFloor.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{

  constructor: RoomFloor,

  buildGeometry: function(){

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
  },

  setStartPosition: function(){

    this.rotation.x = Math.PI/2;

  },

  select: function(){
    this.material.color = new THREE.Color( $Editor.default_params.Room.active_color );
    this.actived = true;
  },
  unselect: function(){
    this.actived = false;
    this.material.color = new THREE.Color( $Editor.default_params.Room.main_color );
  },

  update: function(){


  }
});

