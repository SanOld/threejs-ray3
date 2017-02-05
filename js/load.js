
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
              
//              child.userData.is_camera = true;
              child.fscale = 100;
              child.scale.set(child.fscale,child.fscale,child.fscale)
              child.position.y -= 25;
              
						}
            
				});

        object.userData.is_camera = true;
        //расположение камеры
        object.position.y = 100;
        
        scene.add( object );   
        
          
			}

		);
  
}  