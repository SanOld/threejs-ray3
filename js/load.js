
function loadScene (){

  var loaderO = new THREE.ObjectLoader();

  loaderO.crossOrigin = '';
  loaderO.load( 'sc/0.json', function (resobject) {
    console.log(resobject);
    if ( resobject instanceof THREE.Scene ) {

      resobject.children.forEach(function(item, i) {

        if (item.type.toLowerCase() == 'mesh' || item.type.toLowerCase() == 'object3d') {

          var cl = item.clone();
          cl.position.x -= 700;
          cl.position.z -= 750;

          scene.add(cl);

        }

      });

    }
  });
}

function loadCamera(){



// instantiate a loader
		var loader = new THREE.OBJLoader();

		// load a resource
		loader.load(
			// resource URL
			'sc/camera.obj',

			function ( object ) {

        object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
              child.material = new THREE.MeshLambertMaterial( {color: 0xffff00} );
						}

				});


        object.userData.is_camera = true;
        object.userData.camera_props = {
          angle: 30,
          far: 100,
          roomHeight: 150 ,
          camera_off_y : 9.8/40,
          camera_off_z : -2/40,
          camera_off_x : 0 ,
		      camera_start_angle : 25 ,
          angle_xy : 45,
          angle_z : 0};

        //масштабируем полученный объект
        object.name = 'load';
        object.fscale = 40;
        object.scale.set(object.fscale,object.fscale,object.fscale)
        object.position.y = 100;
        object.position.z = -110;
        object.position.x = -110;
        object.rotation.y = Math.PI/4;
        object.rotation.x = 0;
        object.rotation.z = 0;

        var obj2 = new THREE.Object3D();
        obj2.copy(object);
        obj2.fscale = 200;
        obj2.scale.set(obj2.fscale,obj2.fscale,obj2.fscale);
        obj2.userData = JSON.parse(JSON.stringify(object.userData));
        obj2.position.y = 90;
        obj2.position.z = 100;
        obj2.position.x = 100;
        obj2.rotation.x = 0; //Math.PI/8;
        obj2.rotation.z = 0; //Math.PI/8;
        obj2.rotation.y = Math.PI/2;
        obj2.userData.camera_props = {
          angle: 60,
          far: 100,
          roomHeight: 150 ,
          camera_off_y : 9.8/40,
          camera_off_z : -2/40,
          camera_off_x : 0 ,
		      camera_start_angle : 25 ,
          angle_xy : 90,
          angle_z : 0};

        scene.add( object );
        scene.add( obj2 );
		}

		);

}


function loadJSON(file_path, name, callback){

  var name = name || '';
  var callback = callback || function(){};

  var loader = new THREE.JSONLoader();
  loader.load(
        // resource URL
        file_path,
        // Function when resource is loaded
        function ( geometry, materials ) {
          var material = new THREE.MultiMaterial( materials );

          var object = new THREE.Mesh( geometry, material );

          object.userData.loaded = true;

          var wrapper = new THREE.Object3D();
          wrapper.name = name;
          wrapper.add( object );
          scene.add(wrapper);

          //===========
//          var axisHelper = new THREE.AxisHelper( 300 );
//          wrapper.add( axisHelper );
          
          object.userData.scale = 100;
          object.userData.translateX = 0;
          object.userData.translateY = 0;
          object.userData.translateZ = 0;
          object.userData.rotateX = 0;
          object.userData.rotateY = 0;
          object.userData.rotateZ = 0;
          //===========


          transformationLoaded( object );

          callback( wrapper );

        }
      );
  
};

function loadOBJ(file_path, name, callback){

  var name = name || '';

  var callback = callback || function(){};

  var loader = new THREE.OBJLoader();
  loader.load(
        // resource URL
        file_path,
        // Function when resource is loaded
        function ( object ) {

          object.children[0].userData.loaded = true;

          var wrapper = object;
          wrapper.name = name;

          scene.add(wrapper);

          //===========
//          var axisHelper = new THREE.AxisHelper( 300 );
//          wrapper.add( axisHelper );

          wrapper.children[0] .userData.scale = 1;
          wrapper.children[0] .userData.translateX = 0;
          wrapper.children[0] .userData.translateY = 0;
          wrapper.children[0] .userData.translateZ = 0;
          wrapper.children[0] .userData.rotateX = 0;
          wrapper.children[0] .userData.rotateY = 0;
          wrapper.children[0] .userData.rotateZ = 0;
          //===========


          transformationLoaded( wrapper.children[0] );

          callback( wrapper );

        }
      );

};
function loadOBJ_door2(file_path, name, callback){

  var name = name || '';

  var callback = callback || function(){};

  var loader = new THREE.OBJLoader();
  loader.load(
        // resource URL
        file_path,
        // Function when resource is loaded
        function ( object ) {

          object.children[0].userData.loaded = true;

          var wrapper = object;
          wrapper.name = name;

          scene.add(wrapper);

          //===========
//          var axisHelper = new THREE.AxisHelper( 300 );
//          wrapper.add( axisHelper );

          wrapper.children[0] .userData.scale = 1;
          wrapper.children[0] .userData.translateX = 50;
          wrapper.children[0] .userData.translateY = 0;
          wrapper.children[0] .userData.translateZ = 0;
          wrapper.children[0] .userData.rotateX = 0;
          wrapper.children[0] .userData.rotateY = 0;
          wrapper.children[0] .userData.rotateZ = 0;
          //===========


          transformationLoaded( wrapper.children[0] );

          callback( wrapper );

        }
      );

};

function transformationLoaded( item ){

  if( item.userData && item.userData.loaded ){

    item.scale.set( item.userData.scale, item.userData.scale, item.userData.scale );
    item.translateX(item.userData.translateX);
    item.translateY(item.userData.translateY);
    item.translateZ(item.userData.translateZ);
    item.rotateX( THREE.Math.degToRad( item.userData.rotateX ) );
    item.rotateY( THREE.Math.degToRad( item.userData.rotateY ) );
    item.rotateZ( THREE.Math.degToRad( item.userData.rotateZ ) );

    }
    
}