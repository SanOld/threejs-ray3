function RoomSurface( room, walls, vertieces, movePoint, exception ){

  this.walls = walls || [];
  this.source = vertieces[0];
  this.target = vertieces[1];
  this.sourceBase = vertieces[2] || null;
  this.targetBase = vertieces[3] || null;
  this.movePoint = movePoint || false;
  this.exception = exception || false;


  RoomObject.call( this, room);

  this.type = 'RoomSurface';
  this.name = 'room_surface';
  var self = this;

  this.doors = [];
  this.windows = [];
  this.niches = [];
  this.doorsParams = [];
  this.windowsParams = [];
  this.nichesParams = [];

  this.mainColor =  $Editor.default_params.RoomSurface.main_color;
  this.hoverColor =  $Editor.default_params.Room.hover_color;
  this.activeColor =  $Editor.default_params.Room.active_color;

  this.material = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 1,
      transparent: true,
      depthWrite: false,
      color: this.mainColor
    });


  this.defineDoorways();

}

RoomSurface.prototype = Object.assign( Object.create( RoomObject.prototype ),{

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

  getLength: function(){

    return this.source.distanceTo( this.target );

  },
  geHeight: function(){

    return this.walls[0].height;

  },
  getPerimeter: function(){

    return 2 * this.getLength()  + 2 * this.geHeight();

  },
  getArea: function(){

    return this.getLength() * this.geHeight();

  },

  defineDoorways: function( chain ){

    var doorways = [];

    this.walls.forEach(function( wall, index ){

      wall.doors.forEach(function( door ){

        switch (door.type) {
          case 'Doorway':
          case 'Doorblock':
          case 'DoorblockFloor':
          case 'DoubleDoorBlock':
          case 'DoubleDoorBlockFloor':

            this.doors.push( door );
            this.doorsParams.push({

              P_otkos_door: door.getPerimeter3(), //Периметр откосов дверей
              S_otkos_door: door.getSlope3Area(), //Площадь откосов (периметр двери * глубину)
              door_lintel_length: door.width //Длина перемычек

            });

            break;
          case 'WindowBlock':

            this.windows.push( door );
            this.windowsParams.push({

              P_otkos_window : door.getPerimeter3(), //Периметр откосов дверей
              S_otkos_window: door.getSlope3Area(), //Площадь откосов (периметр двери * глубину)
              window_lintel_length: door.width //Длина перемычек

            });

            break;
          case 'Niche':
            //TODO Belonging
            this.niches.push( door );
            this.nichesParams.push({

              P_niche: door.getPerimeter4(), //Периметр
              S_niche_wall: door.getArea(), //Периметр
              depth_niche: door.thickness, //Площадь откосов (периметр двери * глубину)
              S_side_niche: door.getPerimeter4() * door.thickness //Длина перемычек

            });

            break;

        }

      });

    });
  },

  getAreaWithoutOpenings: function(){

    var result = 0;
    var openingArea = 0;

    this.walls.forEach(function ( item, index, arr ) {

      if( ! exception)
      openingArea += item.getOpeningsArea();

    });

    result = this.getArea - openingArea;

    return result;
  }

});


