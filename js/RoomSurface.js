function RoomSurface( room, wall, vertieces ){

  THREE.Mesh.call( this, new THREE.Geometry());

  this.type = 'RoomSurface';
  this.name = 'room_surface';

  var self = this;

  this.room = room;
  this.wall = wall;
  this.vertieces = vertieces;
  this.height = 1;

  self.actived = false;

  this.geometry = this.buildGeometry();
  this.material = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 1,
      transparent: true,
      depthWrite: false,
      color: $Editor.default_params.RoomSurface.main_color
    });

  this.setStartPosition();

  //события

  this.hoveron =    function ( event ) {

    if( ! self.actived )
    self.material.color = new THREE.Color( $Editor.default_params.Room.hover_color );

  };
  this.hoveroff =   function ( event ) {

    if( ! self.actived )
    self.material.color = new THREE.Color( $Editor.default_params.RoomSurface.main_color );

  };
}

RoomSurface.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{

  constructor: RoomSurface,

  buildGeometry: function(){

    var wallShape = new THREE.Shape();
    wallShape.moveTo( this.vertieces[0].x, this.vertieces[0].z );
    wallShape.lineTo( this.vertieces[1].x, this.vertieces[1].z );
    var nextPoint = this.getNearestPoint( this.vertieces[1] );
    wallShape.lineTo( nextPoint.x, nextPoint.z );
    var nextPoint = this.getNearestPoint( this.vertieces[0] );
    wallShape.lineTo( nextPoint.x, nextPoint.z );
    wallShape.lineTo( this.vertieces[0].x, this.vertieces[0].z );

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

  getNearestPoint: function( point ){

    var result = this.wall.v1.distanceToSquared( point ) < this.wall.v2.distanceToSquared( point ) ? this.wall.v1 : this.wall.v2;
    return result;

  },

  setStartPosition: function(){

    this.rotation.x = Math.PI/2;
    this.position.set( 0, this.wall.height + this.height, 0);

  },

  select: function(){
    this.material.color = new THREE.Color( $Editor.default_params.Room.active_color );
    this.actived = true;
  },
  unselect: function(){
    this.actived = false;
    this.material.color = new THREE.Color( $Editor.default_params.RoomSurface.main_color );
  },

  update: function(){


  }
});


