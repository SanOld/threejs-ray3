
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


         var obj3 = new THREE.Object3D();
        obj3.copy(object);
        obj3.fscale = 200;
        obj3.scale.set(obj3.fscale,obj3.fscale,obj3.fscale);
        obj3.userData = JSON.parse(JSON.stringify(object.userData));
        obj3.position.y = 0;
        obj3.position.z = 100;
        obj3.position.x = 0;
        obj3.rotation.x = 0; //Math.PI/8;
        obj3.rotation.z = 0; //Math.PI/8;
        obj3.rotation.y = 0;
        obj3.userData.camera_props = {
          angle: 0,
          far: 100,
          roomHeight: 150 ,
          camera_off_y : 9.8/40,
          camera_off_z : -2/40,
          camera_off_x : 0 ,
		      camera_start_angle : 25 ,
          angle_xy : 0,
          angle_z : 0};

        scene.add( obj3 );

		}

		);

}