"use strict";
// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats, selection;
//var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3()

init();
animate();

function initMain()
{
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
  
  // instantiate a loader
var loader = new THREE.TextureLoader();

// load a resource
loader.load(
	// resource URL
	'/js/lib/three-master/examples/textures/brick_bump.jpg',
	// Function when resource is loaded
	function ( floorTexture ) {
		// do something with the texture
//      var floorTexture = new THREE.ImageUtils.loadTexture( '../textures/brick_bump.jpg' );
      floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
      floorTexture.repeat.set( 10, 10 );
      var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
      var floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 10, 10);
      var floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.name = 'floor'
      floor.position.y = 0;
      floor.rotation.x = Math.PI / 2;
      scene.add(floor);
	},
	// Function called when download progresses
	function ( xhr ) {
//		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
	// Function called when download errors
	function ( xhr ) {
//		console.log( 'An error happened' );
	}
);

	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox); 

    controls = new THREE.OrbitControls( camera, renderer.domElement );
	//  controls.enabled = false;  

	window.addEventListener( 'resize', onWindowResize, false );  
	
}

// FUNCTIONS 		
function init() 
{

	initMain();
//  
//	////////////
//	// CUSTOM //
//	////////////
//
//  //
//
  var ceiling = new THREE.Mesh(
//    new THREE.BoxBufferGeometry( 500, 150, 10 ),
    new THREE.BoxGeometry( 500, 500, 10 ),
     new THREE.MeshNormalMaterial({wireframe: false, opacity: 0.3, transparent: true, depthWrite: false})
  );
  ceiling.position.y = 130;
  ceiling.rotation.x = Math.PI/2;
  
  
  var w1 = new THREE.Mesh(
//    new THREE.BoxBufferGeometry( 500, 150, 10 ),
    new THREE.BoxGeometry( 500, 150, 10 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } )
  );
  w1.position.y = 75;

  var w2 = w1.clone();
  w2.position.x = -255;
  w2.position.y = 75;
  w2.rotateY ( Math.PI/2 );
  w2.position.z = 250+5;
  
  var w3 = new THREE.Mesh(
//    new THREE.BoxBufferGeometry( 30, 150, 30 ),
    new THREE.BoxGeometry( 30, 150, 30 ),

    new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } )
  );
  w3.position.y = 75;
  w3.position.z = -125;
  

  w2.position.z += -500;
  w1.position.z += -500;
  
  var w4 = w2.clone();
  w4.geometry = new THREE.BoxGeometry( 200, 150, 10 );
  
  w4.position.x += 200; 
  w4.position.z -= 150; 
 
  w4.rotation.y = Math.PI/4;
  
  w1.name = w2.name = w3.name = w4.name ='wall';

  var w11 = w1.clone();
  var w12 = w2.clone();
  var w13 = w3.clone();
  var w14 = w4.clone();
  var wire_material =  new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
  w11.material = w12.material = w13.material = w14.material = wire_material;
  
  scene.add(w11, w12, w13, w14);
  scene.add( w1, w2, w3, w4 );
  scene.add(ceiling);

//test_cams();

//
//var axisHelper = new THREE.AxisHelper( 100 );
//scene.add( axisHelper );
//
//


//loadScene();
loadCamera();

//инициализация возможности отрисовки луча
setTimeout(addCameraRay,1000,scene);

}

function animate() 
{
  requestAnimationFrame( animate );
  update();
	render();		
}

function update() 
{
  updateCameraRay();
}

function render() 
{
	renderer.render( scene, camera );
}

function onDocumentMouseWheel( event ) 
{
  camera.fov += event.deltaY * 0.05;
  camera.updateProjectionMatrix();
}
function onWindowResize( event )
{
  camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
