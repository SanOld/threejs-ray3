
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
        
//        scene.add(item);
          
        }

      });

      //добавляем все объекты
//      scene.add(resobject);

      
    }
  });
}

