
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

        //камера
        var camera = new THREE.Group();
        camera.userData.is_camera = true;
        //расположение камеры
//        camera.position.y = 100;
        camera.add( object );

       //масштабируем полученный объект
        object.name = 'load';
        object.fscale = 100;
        object.scale.set(object.fscale,object.fscale,object.fscale)
        object.position.y -= 25;
        object.position.z += 10;
        object.rotation.x -= Math.PI/8


        scene.add( camera );


        camera.position.y = 100;
        camera.position.z = -110;
        camera.position.x = -110;
        camera.userData.camera_props = {
          angle: 30,
          far: 100,
          roomHeight: 150 ,
          camera_off_y : 9.8,
          camera_off_z : -2,
          camera_off_x : 0 ,
		      camera_start_angle : 25 ,
          angle_xy : 45,
          angle_z : 0};



			}

		);

}