"use strict";
// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats, selection;
//var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var rendererStats;

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3()

var measure_unit = {
  'm':  {full_name: 'метр',       short_name: 'м',  c: 0.001 },
  'cm': {full_name: 'сантиметр',  short_name: 'см', c: 0.1 },
  'mm': {full_name: 'миллиметр',  short_name: 'мм', c: 1 },
  'ft': {full_name: 'фут',        short_name: 'ft', c: 0.003281 },
  'in': {full_name: 'дюйм',       short_name: 'in', c: 0.03937 },
}
var current_unit = measure_unit.mm;
var accuracy_measurements = 0;

var floorScale = 1;
var floorWidth = 20000;
var floorHeight = 12000;


init();
animate();

function initMain()
{
 	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera) ;
	camera.position.set(10000,10000,10000);
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

  //статистика
//  rendererStats	= new THREEx.RendererStats();
//  rendererStats.domElement.style.position	= 'absolute'
//  rendererStats.domElement.style.left	= '0px'
//  rendererStats.domElement.style.bottom	= '0px'
//  document.body.appendChild( rendererStats.domElement )

	// EVENTS
//	THREEx.WindowResize(renderer, camera);
//	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	// CONTROLS
//	controls = new THREE.OrbitControls( camera, renderer.domElement );
	// STATS
//	stats = new Stats();
//	stats.domElement.style.position = 'absolute';
//	stats.domElement.style.bottom = '0px';
//	stats.domElement.style.zIndex = 100;
//	container.appendChild( stats.domElement );
	// LIGHT
    var light1 = new THREE.PointLight(0xffffff);
    light1.position.set(-10000, 5000, -10000);
    var light2 = new THREE.PointLight(0xffffff);
    light2.position.set(-10000, 5000, 10000);
    var light3 = new THREE.PointLight(0xffffff);
    light3.position.set(10000, 5000, 10000);
    var light4 = new THREE.PointLight(0xffffff);
    light4.position.set(10000, 5000, -10000);
    var light5 = new THREE.PointLight(0xffffff);
    light5.position.set(0, 5000, 0);

    scene.add(light1, light2, light3, light4, light5);

	// FLOOR

  // instantiate a loader
var loader = new THREE.TextureLoader();

// load a resource
loader.load(
	// resource URL
  '/img/plan3.jpg',
	// Function when resource is loaded
	function ( floorTexture ) {
		// do something with the texture 
      floorTexture.repeat.set( 1, 1 );
      var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.FrontSide } );
      var floorGeometry = new THREE.PlaneBufferGeometry(floorWidth * floorScale, floorHeight * floorScale, 10, 10);
      var floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.name = 'floor'
      floor.position.y = -1;
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
	var skyBoxGeometry = new THREE.BoxGeometry( 1000000, 1000000, 1000000 );
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

//	////////////
//	// CUSTOM //
//	////////////


//
//var axisHelper = new THREE.AxisHelper( 300 );
//scene.add( axisHelper );
//


//$wallCreator.addWall([new THREE.Vector3(-500,0,-500), new THREE.Vector3(0,0,-500)]);
//$wallCreator.addWall([new THREE.Vector3(-500,0,-500), new THREE.Vector3(-500,0,0)]);
//
//$wallCreator.addWall([new THREE.Vector3(-350,0,-150), new THREE.Vector3(-150,0,-350)]);
//
//$wallCreator.addWall([new THREE.Vector3(0,0,-100), new THREE.Vector3(0,0,-50)],{width: 50});//колонна

//$wallCreator.addWall([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,200)]);
//
//$wallCreator.addWall([new THREE.Vector3(200,0,0), new THREE.Vector3(200,0,200)]);


//$wallCreator.addWall([ new THREE.Vector3(-2000,0,-2000), new THREE.Vector3(2000,0,-2000) ]);
//$wallCreator.addWall([ new THREE.Vector3(2000,0,-2000), new THREE.Vector3(2000,0,2000) ]);
//$wallCreator.addWall([ new THREE.Vector3(2000,0,2000), new THREE.Vector3(-2000,0,2000) ]);
//$wallCreator.addWall([ new THREE.Vector3(-2000,0,2000), new THREE.Vector3(-2000,0,-2000) ]);



//loadScene();
//loadCamera();

//loadJSON('sc/door.json', 'door');

//loadJSON('sc/window.json');
 
//setTimeout( transformationLoaded, 1000 );


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
//  rendererStats.update(renderer);
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
