"use strict";
// MAIN

	var parentURL = '*';
  var serverData = null; //данные для инициализации

	window.onbeforeunload = function() {  
		//console.log('unload widget');
		post_cancel();	
	};	

	window.onpopstate = function(event) {
		//alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
		post_cancel();
	};

    $(function () {

        $(document).keypress(function(e) {
            if (e.keyCode == 119) {
                post_ok();
            }
            if (e.keyCode == 27) {
                post_cancel();
            }
        });

        $(window).on("message onmessage", listener);
		
        parent.window.postMessage({message: {cmd: 'ready', data: {} }}, parentURL);

        function listener(event) {
          var mess = event.originalEvent.data.message;

          if (mess && mess.cmd == 'put_data') {
            parentURL = event.originalEvent.origin;
            serverData = mess.data;
            
            init();
            animate();
          }
        }

    });

	// на "OK" выходной джсон передается в заданное место (в тестовом варианте - на страницу документа)
    function post_ok(data) {
		if (data == undefined)
		{
			$wallEditor.on();
			$wallEditor.getJSON(post_ok) ;
			$wallEditor.off();
		}
		else
		{
			console.log(parentURL);
			if (parentURL != '*')
				parent.window.postMessage({message: {cmd: 'put_data', data: JSON.parse(data) }}, parentURL);
			else {	
				console.log('JSON:');
				console.log(data);
			}	
		}
    }

    function post_cancel() {
		console.log(parentURL);
        parent.window.postMessage({message: {cmd: 'cancel'}}, parentURL);
    }




// standard global variables
var container, scene, camera, renderer, controls, stats, selection;
//var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var rendererStats;

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3()


function initMain()
{
 	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera) ;
	camera.position.set(25000,10000,25000);
	camera.lookAt(scene.position);
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer();
  
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.createElement( 'div' );
	document.body.appendChild( container );
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
    


	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.BoxGeometry( 1000000, 1000000, 1000000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
  skyBox.name = "skyBox";
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

//setTimeout(addCameraRay,1000,scene);
//$arcWall.add( scene, wall );
$Editor.on();


}

function animate()
{
  requestAnimationFrame( animate );
  update();
	render();
}

function update()
{
//  updateCameraRay();
//  rendererStats.update(renderer);
}

function render()
{
	renderer.render( scene, camera );
}

function onDocumentMouseWheel( event )
{
//  camera.fov += event.deltaY * 0.05;
//  camera.updateProjectionMatrix();
}
function onWindowResize( event )
{
  camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
