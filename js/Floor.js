//Пол(подложка)
function Floor( parameters ){

  THREE.Mesh.call( this, new THREE.Geometry() );

  if ( parameters === undefined ) parameters = {};

  this.type = 'Floor';
  this.name = 'floor';



  var self = this;

  this.length = parameters.hasOwnProperty("length") ? parameters["length"] : 30000;
  this.width = parameters.hasOwnProperty("width") ? parameters["width"] : 30000;
  this.textureFile = parameters.hasOwnProperty("textureFile") ? parameters["textureFile"] : '';

  this.geometry = parameters.hasOwnProperty("geometry") ? parameters["geometry"] : this.buildGeometry();
  this.material = parameters.hasOwnProperty("material") ? parameters["material"] : floorMaterial;
  this.material.visible = false;
  this.gridHelper = null;

  var parent_toJson = this.toJSON;

  this.toJSON = function ( meta ) {

    this.remove( this.gridHelper ); //убрал грид

    this.userData.width = this.width;
    this.userData.length = this.length;
    this.userData.textureFile = this.textureFile;
    this.userData.scale = this.scale;

    var result = parent_toJson.call(this);

    if( $Editor.gridEnabled ) this.addHelper(); //восстанавливаем grid


    return result;

  };

  if( $Editor.gridEnabled ) this.addHelper();

}
Floor.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{

  constructor: Floor,

  buildGeometry: function(){
    var floorGeometry = new THREE.PlaneBufferGeometry(this.length * this.scale.x, this.width * this.scale.y, 10, 10);
    return floorGeometry;
  },

  setLocation: function(){

//    this.position.x = this.length * this.scale.x/2;
//    this.position.z = this.width * this.scale.y/2;
    this.position.z = -1;
    this.rotation.x = -Math.PI / 2;

  },

  setScale: function( floorScaleX, floorScaleY, floorScaleZ ){

    var floorScaleX = floorScaleX || 1;
    var floorScaleY = floorScaleY || 1;
    var floorScaleZ = floorScaleZ || 1;

    this.scale.set (
                    this.scale.x * floorScaleX,
                    this.scale.y * floorScaleY,
                    this.scale.z * floorScaleZ
                    );

  },
  addHelper: function(){
    this.gridHelper = new THREE.GridHelper( 1000000, 2000, 0x0000ff, 0x808080 );
    this.gridHelper.position.z = -10;
    this.gridHelper.rotation.x = -Math.PI / 2;
    this.add( this.gridHelper );
  },
  gridOn: function(){
    if( this.gridHelper ){
      this.gridHelper.material.visible  = true;
    } else {
      this.addHelper();
    }

  },
  gridOff: function(){
    this.gridHelper.material.visible  = false;
  }

});



