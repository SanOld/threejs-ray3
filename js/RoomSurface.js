function RoomSurface( room, walls, vertieces, movePoint ){

  THREE.Mesh.call( this, new THREE.Geometry());

  this.type = 'RoomSurface';
  this.name = 'room_surface';

  var self = this;

  this.room = room;
  this.walls = walls || [];
  this.source = vertieces[0];
  this.target = vertieces[1];
  this.sourceBase = vertieces[2] || null;
  this.targetBase = vertieces[3] || null;
  this.movePoint = movePoint || false;
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
    wallShape.moveTo( this.source.x, this.source.z );
    wallShape.lineTo( this.target.x, this.target.z );
    this.targetBase = !this.targetBase ? this.getBasePoint( this.target, this.source ) : this.targetBase;
    wallShape.lineTo( this.targetBase.x, this.targetBase.z );
    this.sourceBase =  !this.sourceBase ? this.getBasePoint( this.source, this.target ) : this.sourceBase;
    wallShape.lineTo( this.sourceBase.x, this.sourceBase.z );
    wallShape.lineTo( this.source.x, this.source.z );

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

  getBasePoint: function( firstPoint, secondPoint ){

    if( this.movePoint ){
      var v1 = this.walls[0].v1.clone().add( this.walls[0].direction.clone().multiplyScalar( this.walls[0].width/2 ) );
      var v2 = this.walls[0].v2.clone().add( this.walls[0].direction.clone().negate().multiplyScalar( this.walls[0].width/2  ) );
    } else {
      var v1 = this.walls[0].v1.clone();
      var v2 = this.walls[0].v2.clone();
    }

    if( v1.distanceToSquared( firstPoint ) < v2.distanceToSquared( firstPoint ) ){
      var dir = v1.clone().sub( firstPoint ).normalize();
    } else {
      var dir = v2.clone().sub( firstPoint ).normalize();
    }

    var angle = secondPoint.clone().sub( firstPoint ).angleTo ( dir );
    var length = Math.abs( $Editor.default_params.RoomSurface.width / Math.sin(angle) );


    var result = firstPoint.clone().add( dir.multiplyScalar( length ) );

    return result;

  },

  setStartPosition: function(){

    this.rotation.x = Math.PI/2;
    this.position.set( 0, this.walls[0].height + this.height, 0);

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


