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
//	'/js/lib/three-master/examples/textures/brick_bump.jpg',
  '/img/pimgpsh_fullsize_distr.jpg',
	// Function when resource is loaded
	function ( floorTexture ) {
		// do something with the texture
//      var floorTexture = new THREE.ImageUtils.loadTexture( '../textures/brick_bump.jpg' );
//      floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
 
      floorTexture.repeat.set( 1, 1 );
      var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.FrontSide } );
      var floorGeometry = new THREE.PlaneBufferGeometry(1000, 700, 10, 10);
      var floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.name = 'floor'
      floor.position.y = 0;
      floor.rotation.x = -Math.PI / 2;
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




//
//var axisHelper = new THREE.AxisHelper( 100 );
//scene.add( axisHelper );
//
//


//$wallCreator.addWall([new THREE.Vector3(-500,0,-500), new THREE.Vector3(0,0,-500)]);
//$wallCreator.addWall([new THREE.Vector3(-500,0,-500), new THREE.Vector3(-500,0,0)]);
//
//$wallCreator.addWall([new THREE.Vector3(-350,0,-150), new THREE.Vector3(-150,0,-350)]);
//
//$wallCreator.addWall([new THREE.Vector3(0,0,-100), new THREE.Vector3(0,0,-50)],{width: 50});//колонна

$wallCreator.addWall([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,200)]);

$wallCreator.addWall([new THREE.Vector3(200,0,0), new THREE.Vector3(200,0,200)]);

//loadScene();
//loadCamera();

//инициализация возможности отрисовки луча
setTimeout(addCameraRay,1000,scene);


//$arcWall.add( scene, wall );

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
