
/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: July 2013 (three.js v58)
*/

// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
//var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables


var roomBSP;
var rayBSP;

var rayMesh;
var ray_axis_y;
var ray_axis_x;
var copy_rayMesh;

//
var delta = 0.01;

var newRay;
var newRay2;





var target = new THREE.Vector3( 0, 0, 1 );
var lon = 90, lat = 0;
var phi = 0, theta = 0;
var controls = false;

var group1;
var materialNormal;
var materialWireframe;

var ExtrudeMesh;

var raycaster;


initMain();
init();
animate();

function initMain(){
 	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera) ;
	camera.position.set(400,400,400);
	camera.lookAt(scene.position);	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.createElement( 'div' );
				document.body.appendChild( container );
        
//	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	// EVENTS
//	THREEx.WindowResize(renderer, camera);
//	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	// CONTROLS
//	controls = new THREE.OrbitControls( camera, renderer.domElement );
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	// FLOOR
	var floorTexture = new THREE.ImageUtils.loadTexture( '../textures/brick_bump.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
//var floorMaterial = new THREE.MeshBasicMaterial( { color: 'green', wireframe: true } );

	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = 0;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox); 
}

// FUNCTIONS 		
function init() 
{

	
	////////////
	// CUSTOM //
	////////////
	
  materialNormal = new THREE.MeshNormalMaterial({wireframe: false});
  materialNormal.opacity = 0.5;
  materialNormal.transparent = true;
  materialWireframe = new THREE.MeshNormalMaterial({wireframe: true});

  //
  var wall1 = new THREE.Mesh(
    new THREE.BoxBufferGeometry( 500, 150, 10 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } )
  );
  wall1.position.y = 75;


  var wall2 = new THREE.Mesh(
    new THREE.BoxBufferGeometry( 500, 150, 10 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } )
  );
  wall2.position.x = -255;
  wall2.position.y = 75;
  wall2.rotateY ( Math.PI/2 );
  wall2.position.z = 250+5;
  
  var wall3 = new THREE.Mesh(
    new THREE.BoxBufferGeometry( 30, 150, 30 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } )
  );
  wall3.position.y = 75;
  wall3.position.z = -125;

  var roomMesh = new THREE.Mesh(
    new THREE.BoxGeometry( 500, 150, 500 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } )
  );
  roomMesh.position.y = 75;
  roomMesh.position.z = -245;


  //====================
  var length = 50, width = 100;

  var shape = new THREE.Shape();
  shape.moveTo( 0,0 );
  shape.lineTo( 0, length );
  shape.lineTo( width, length );
  shape.lineTo( width, 0 );
  shape.lineTo( 0, 0 );

  var extrudeSettings = {
    steps: 2,
    amount: 25
  };

  var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
  material.opacity = 0.5;
  material.transparent = true;
  ExtrudeMesh = new THREE.Mesh( geometry, material ) ;
  ExtrudeMesh.translateOnAxis ( new THREE.Vector3( 0, 0, -1 ), 250 )
  scene.add( ExtrudeMesh );
  //====================
  wall2.position.z += -500;
  wall1.position.z += -500;
  
  wall1.name = 'wall';
  wall2.name = 'wall';
  wall3.name = 'wall';
  
  scene.add( wall1 );
  scene.add( wall2 );
  scene.add( wall3 );

  var len = 700;
  var angle = degToRad(60);
  var radiusB = Math.tan(angle/2) * len;

  var geometry = new THREE.CylinderGeometry( 1, radiusB, len, 4 );
  
  rayMesh = new THREE.Mesh( geometry );
  rayMesh.rotation.x = Math.PI/2;
  rayMesh.rotation.y = Math.PI/4;
  rayMesh.translateY(-350);
  ray_axis_y = new THREE.Object3D();
  ray_axis_x = new THREE.Object3D();

  ray_axis_y.add(rayMesh);
  ray_axis_x.add(ray_axis_y);

  ray_axis_x.position.y = 150;
  ray_axis_x.position.x = 250;
  ray_axis_x.rotation.y = Math.PI/4;

  scene.add( ray_axis_x );
  rayMesh.visible = false;

  copy_rayMesh = new THREE.Mesh( geometry );

  roomBSP = new ThreeBSP( roomMesh );


//  var wall = new THREE.Mesh(wall2.geometry);
//
//  wall.position.copy(wall2.getWorldPosition());
//  wall.rotation.copy(wall2.getWorldRotation());
//
//  scene.add( wall );
//
//  wall1BoundingBox = new THREE.Box3().setFromObject(wall1);
//  wall2BoundingBox = new THREE.Box3().setFromObject(wall2);



  
  var direction = new THREE.Vector3( 1, 0, 0 );
  var angle = 2 * Math.PI;
  var a = new THREE.Euler( 0, 0.01, 0, 'YXZ' );
  var contour = new THREE.Geometry();
  contour.vertices.push(ray_axis_x.getWorldPosition());
  
  while(angle > 0){
    var ray_distance = Infinity ;
    var ray_point = ray_axis_x.getWorldPosition();
    scene.traverse(function(el){
      if(el.name == 'wall'){
        
        objBoundingBox = new THREE.Box3().setFromObject(el);

        ray = new THREE.Ray(ray_axis_x.getWorldPosition(), direction)
        var point = ray.intersectBox ( objBoundingBox );

        if(point){
          var distance = ray.distanceToPoint(point);
         if (distance < ray_distance){
           ray_distance = distance;
           ray_point = point;
         } else {
           
         }

          scene.add(line);
        }
        //поворот вектора
        direction.applyEuler(a);
        angle = angle - 0.001;            
      }
    });
    
    //отрисовка луча
          var lineGeometry = new THREE.Geometry();
          lineGeometry.vertices.push( ray_axis_x.getWorldPosition(), ray_point );
          lineGeometry.computeLineDistances();
          var line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color: 0xcc0000 }) );
          
          
          var ray_point2 = new THREE.Vector3( 1, 0, 0 );
          contour.vertices.push(ray_point2.copy(ray_point));
          
          
          
  }
  
  
  
//  contour.computeLineDistances();
  var line = new THREE.Line( contour, new THREE.LineBasicMaterial( { color: 'green' }) );

  
  
  
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'keydown', onKeyDown, false );

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'wheel', onDocumentMouseWheel, false );

    window.addEventListener( 'resize', onWindowResize, false );
}



function animate() 
{
  requestAnimationFrame( animate );
	render();		
	update();
}

function update()
{
  
      copy_rayMesh.position.copy(rayMesh.getWorldPosition());
      copy_rayMesh.rotation.copy(rayMesh.getWorldRotation());
      
      rayBSP = new ThreeBSP( copy_rayMesh );

      scene.remove( newRay )
//      scene.remove( newRay2 )

      var newBSP = rayBSP.intersect( roomBSP );
      newRay = newBSP.toMesh( materialNormal );
//      newRay2 = newBSP.toMesh( materialWireframe );

    	scene.add( newRay );
//      scene.add( newRay2 );
	
	if(controls){
    controls.update();
  }

	stats.update();
}


function render() 
{
  
//				lat = Math.max( - 85, Math.min( 85, lat ) );
//				phi = THREE.Math.degToRad( 90 - lat );
//				theta = THREE.Math.degToRad( lon );
//
//				target.x = Math.sin( phi ) * Math.cos( theta ) + rayMesh.position.x;
//				target.y = Math.cos( phi ) + rayMesh.position.y;
//				target.z = Math.sin( phi ) * Math.sin( theta ) + rayMesh.position.z;
//        
//  
//				rayMesh.lookAt( target );


/*raycaster*/

//raycaster.setFromCamera( mouse, camera );
//				var intersects = raycaster.intersectObjects( scene.children );
//				if ( intersects.length > 0 ) {
//					if ( INTERSECTED != intersects[ 0 ].object ) {
//						if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
//						INTERSECTED = intersects[ 0 ].object;
//						INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
//						INTERSECTED.material.emissive.setHex( 0xff0000 );
//					}
//				} else {
//					if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
//					INTERSECTED = null;
//				}
        
/*raycaster*/        
	
	renderer.render( scene, camera );
}


function onKeyDown ( event )  {

				switch( event.keyCode ) {
          case 79: /*O*/

						controls = null;

						break;

					case 80: /*P*/

						controls = new THREE.OrbitControls( camera, renderer.domElement );

						break;
          case 87:/*w*/  
           ray_axis_y.rotateX ( delta );
            break;
          case 83:/*s*/  
           ray_axis_y.rotateX ( -delta );
            break;
          case 65:/*a*/ 
            ray_axis_x.rotateOnAxis ( new THREE.Vector3( 0, 1, 0 ), delta ) ;
            break;
          case 68:/*d*/ 
            ray_axis_x.rotateOnAxis ( new THREE.Vector3( 0, 1, 0 ), -delta ) ;
            break;
          case 82:/*r*/  
       
            break;
          case 70:/*f*/  
           
            break;  

				}

			}

function onWindowResize( event ) {



}
//
function onDocumentMouseDown( event ) {

  event.preventDefault();

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );

}

function onDocumentMouseMove( event ) {

  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

  lon -= movementX * 0.1;
  lat += movementY * 0.1;

}

function onDocumentMouseUp( event ) {

  document.removeEventListener( 'mousemove', onDocumentMouseMove );
  document.removeEventListener( 'mouseup', onDocumentMouseUp );

}

function onDocumentMouseWheel( event ) {

  camera.fov += event.deltaY * 0.05;
  camera.updateProjectionMatrix();

}

function degToRad (deg) { return deg / 180 * Math.PI; }
      