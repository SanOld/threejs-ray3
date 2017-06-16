function RoomObject( room ){

  THREE.Mesh.call( this, new THREE.Geometry());

  this.type = 'RoomObject';
  this.name = 'room_object';

  var self = this;

  this.room = room;
  this.height = 1;

  self.actived = false;

  this.mainColor =  $Editor.default_params.Room.main_color;
  this.hoverColor =  $Editor.default_params.Room.hover_color;
  this.activeColor =  $Editor.default_params.Room.active_color;



  //события
  this.hoveron =    function ( event ) {

    if( ! self.actived )
    self.material.color = new THREE.Color( self.hoverColor );

  };
  this.hoveroff =   function ( event ) {

    if( ! self.actived )
    self.material.color = new THREE.Color( self.mainColor );

  };

  this.init();
}

RoomObject.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{

  constructor: RoomObject,

  init: function(){
    this.geometry = this.buildGeometry();
    this.material = new THREE.MeshBasicMaterial({
        wireframe: false,
        opacity: 1,
        transparent: true,
        depthWrite: false,
        color: this.mainColor
      });


    this.setStartPosition();
  },

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
    this.material.color = new THREE.Color( this.activeColor );
    this.actived = true;
  },
  unselect: function(){
    this.actived = false;
    this.material.color = new THREE.Color( this.mainColor );
  },

  update: function(){


  }
});



