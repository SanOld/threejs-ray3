//=== to addCameraRay
var videocameraArr = [];
var videocameraName = 'videocamera';
var active_camera = null;
var ctrl = 0; //флаг клавиши ctrl
var delta = 0.02; //шаг перемещения луча активной камеры
var delta2 = 5;   //шаг линейного перемещения активной камеры
var rayMaterial = new THREE.MeshNormalMaterial({wireframe: false, opacity: 0.5, transparent: true});
var isMoveRay = false; // перестраивание луча в функции рендеринга при движении луча
var isMoveCamera = false; // перестраивание луча и "комнаты" в функции рендеринга при движении камеры
//=== to addCameraRay

// FUNCTIONS 		
function test_cams() {
	  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
	  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	  var videocamera = new THREE.Mesh( geometry, material );
	  videocamera.name = videocameraName;
	  videocamera.userData.is_camera = true;
	  videocamera.position.y = 140;
	  videocamera.position.x = 250;
	//  videocamera.rotation.y = Math.PI/4;
	 // scene.add( videocamera );
	for(var p = 1; p <= 10; p++){

	var v2 = videocamera.clone();
	var v3 = videocamera.clone();
	v3.name = v2.name = videocamera.name;
	v2.material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	v3.material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	v2.position.z += p*50;
	v3.position.z += -p*50;
	scene.add( v2, v3 );
  
  }
}

function getFocusCoord(videocamera){
  return  videocamera.getObjectByName('ray_axis_x').getObjectByName('focus').position;
}

function getRay2d(videocamera)
{
  var videocamera = videocamera;
  var direction = videocamera.getWorldDirection ()
  direction.normalize ();

  var half_angle = new THREE.Euler( 0, - videocamera.angle/2, 0, 'YXZ' );
  direction.applyEuler(half_angle);

  var angle = videocamera.angle;
  var angleStep = 2 * Math.PI/360
  var a = new THREE.Euler( 0, angleStep, 0, 'YXZ' );
  var contour = {}
  contour.vertices = [];
  contour.vertices.push(videocamera.getWorldPosition());
//
  var raycaster = new THREE.Raycaster(videocamera.getWorldPosition(), direction, videocamera.near, videocamera.far );
  
//прорисовываем линию луча(вспомогательная) - для наглядности
  var drawRayLine = function(scene, videocamera, ray_point){
    
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push( videocamera.getWorldPosition(), ray_point );
    var line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color: 'green' }) );
    scene.add(line); 
    
  }
  //прорисовываем точки пересечения луча и стен - для наглядности
  var drawPoint = function (arr){
    var t = arr.length;
    while(t--){

      var geometry = new THREE.SphereGeometry( 3, 32, 32 );
      var material = new THREE.MeshBasicMaterial( {color: 'green'} );
      var sphere = new THREE.Mesh( geometry, material );
      sphere.position.x = arr[t].x;
      sphere.position.y = arr[t].y;
      sphere.position.z = arr[t].z;
      scene.add( sphere );
    }  
  }

  while(angle + angleStep > 0){
    var ray_distance = Infinity ;
    var ray_point = videocamera.getWorldPosition();
    var clone_ray_point = new THREE.Vector3( );
      clone_ray_point.copy(ray_point);    


    //проход по элементам сцены
    scene.traverse(function(el){
      if(el.name == 'wall'){
        
        point = null;
        var  objBoundingBox = new THREE.Box3().setFromObject(el);

        var intersects = raycaster.intersectObject(el);

        if (intersects.length > 0) {
          var point  = intersects[0].point;
          var distance  = intersects[0].distance;
        } else {
          var clone_direction = new THREE.Vector3( );
          clone_direction.copy(direction); 
          var point = videocamera.getWorldPosition().add(clone_direction.multiplyScalar(videocamera.far));
          var distance  = videocamera.far;
        }

        if(point){
          if (distance < ray_distance){
            ray_distance = distance;
            ray_point = point;
          }
        }        
      }
    });  


    ray_point.ceil();

    if(ray_point.x != clone_ray_point.x || ray_point.z != clone_ray_point.z){

      if(contour.vertices.indexOf(ray_point.clone()) === -1){
        contour.vertices.push(ray_point.clone());
      }
      
      //прорисовываем линию луча(вспомогательная) - для наглядности
//      drawRayLine(scene, videocamera, ray_point);
    }      

  //поворот вектора
    direction.applyEuler(a);
    angle = angle - angleStep;
  }
  
  //прорисовываем точки пересечения луча и стен - для наглядности
  drawPoint(contour.vertices);
      window.console.log(contour.vertices);
  return contour.vertices;
}

function arrowHelperAdd(obj, dir, hex)
{
  
  var dir = dir || new THREE.Vector3( 0, 0, 1 );
  var hex = hex || 0xffff00;
  dir.normalize();
  var origin = new THREE.Vector3( 0, 0, 0 );
  var length = 35;
  //if (obj.parent && obj.parent.fscale != undefined )
  //	length = length / obj.parent.fscale;
  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  obj.add( arrowHelper );
}

function addCameraRay(scene)
{
  var roomHeight = 150; //высота комнаты ???????? 
  var near = 2; //начало видимой области
  var far = 800;//окончание видимой области
  var angle = THREE.Math.degToRad(60);//угол обзора камеры
  var ray_axis_x; // доп ось камеры
  //debugger;
  scene.traverse(function(videocamera){
	if(/*videocamera.name == videocameraName ||*/ videocamera.userData.is_camera == true){
	  
	  videocamera.name = videocameraName;
	  videocameraArr.push(videocamera);
	  
	  videocamera.roomHeight = roomHeight;
	  if (videocamera.userData.camera_props)
		videocamera.roomHeight = videocamera.userData.camera_props.roomHeight;
	  videocamera.near = near;
	  if (videocamera.userData.camera_props)
		videocamera.far = videocamera.userData.camera_props.far;
	  else
		videocamera.far = far;
	  if (videocamera.userData.camera_props)
		videocamera.angle = THREE.Math.degToRad(videocamera.userData.camera_props.angle);
	  else
		videocamera.angle = angle;
	 
	 //луч
	  var radiusB = Math.tan(videocamera.angle/2) * videocamera.far / Math.sin(THREE.Math.degToRad(45)); //большее основание пирамиды
	  var geometry = new THREE.CylinderGeometry( 1, radiusB+1, videocamera.far, 4 ); //геометрия луча
	  var rayMesh = new THREE.Mesh( geometry );
	  //if (videocamera.userData.camera_props) {
	  //    rayMesh.rotation.x = THREE.Math.degToRad(videocamera.userData.camera_props.angle_xy);
	  //    rayMesh.rotation.y = THREE.Math.degToRad(videocamera.userData.camera_props.angle_z);
	  //}
	  //else 
	  {
		  rayMesh.rotation.x = -Math.PI/2;
		  rayMesh.rotation.y = Math.PI/4;
	  }    
	  rayMesh.translateY(-videocamera.far/2);
	  rayMesh.visible = false;
	  rayMesh.name = 'rayMesh';
	  
	  //хелпер фокуса
	  var geometry = new THREE.SphereGeometry( 3, 32, 32 );
	  var material = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
	  var focus = new THREE.Mesh( geometry, material );
	  focus.name = 'focus';
	  focus.position.z = videocamera.far + 5;
	  focus.visible = false;

	  //ось вращения
	  ray_axis_x = new THREE.Object3D();
	  ray_axis_x.name = 'ray_axis_x';
	  ray_axis_x.add(rayMesh);
	  
	  ray_axis_x.add( focus );

	  videocamera.add(ray_axis_x);

	  if (videocamera.userData.camera_props && videocamera.fscale) {
		  //ray_axis_x.rotateX(THREE.Math.degToRad(videocamera.userData.camera_props.camera_start_angle + 
		  //	      videocamera.userData.camera_props.angle_z) );
		  ray_axis_x.rotateX(THREE.Math.degToRad(videocamera.userData.camera_props.camera_start_angle) );
		  ray_axis_x.position.y = videocamera.userData.camera_props.camera_off_y/videocamera.fscale;
		  ray_axis_x.position.z = videocamera.userData.camera_props.camera_off_z/videocamera.fscale;
		  ray_axis_x.position.x = videocamera.userData.camera_props.camera_off_x/videocamera.fscale;
	  }


	  if (videocamera.fscale) {
		  ray_axis_x.scale.x = 1/videocamera.fscale;
		  ray_axis_x.scale.y = 1/videocamera.fscale;
		  ray_axis_x.scale.z = 1/videocamera.fscale;
	  }    
	  
	  //ось z - хелпер
		arrowHelperAdd( ray_axis_x, null, 'red' );
	  //ось z - хелпер
	  
    
	}
  });
  
  setTimeout(raysShowAll, 500);
  
  document.addEventListener( 'keydown', onKeyDownCam, false );
  document.addEventListener( 'keyup', onKeyUpCam, false );

  document.addEventListener( 'mousedown', onDocumentMouseDownCam, false );
//  document.addEventListener( 'mousemove', onDocumentMouseMoveCam, false );
//  document.addEventListener( 'wheel', onDocumentMouseWheelCam, false );
}


function raysShowAll(){
   
  for(var key in videocameraArr){
    
    roomCalculate(scene, videocameraArr[key]);
        
    if(videocameraArr[key].room){
      drawRay(videocameraArr[key])   
    }

  }
    
}

function drawRay(videocamera){
  var rayBSP;
  var roomBSP;
  var newBSP;
  var newRay;
  var rayMesh;
  var active_rayMesh;


  rayMesh = videocamera.getObjectByName('rayMesh');

  active_rayMesh = new THREE.Mesh( rayMesh.geometry.clone() );
  active_rayMesh.position.copy(rayMesh.getWorldPosition());
  active_rayMesh.rotation.copy(rayMesh.getWorldRotation());

  rayBSP = new ThreeBSP( active_rayMesh );
  roomBSP = new ThreeBSP( videocamera.room );
  newBSP = roomBSP.intersect( rayBSP );

  newRay = newBSP.toMesh( rayMaterial );
  newRay.name = videocamera.id + "_ray";

  scene.add( newRay ); 
  newRay = newBSP = roomBSP = rayBSP = active_rayMesh = rayMesh = null;

}
function roomCalculate(scene, videocamera)
{
  if (!videocamera)	
	return;
  var direction = new THREE.Vector3( -1, 0, 0 );
  var angle = 2 * Math.PI;
  var angleStep = 2 * Math.PI/360
  var a = new THREE.Euler( 0, angleStep, 0, 'YXZ' );
//  var contour = new THREE.Geometry();
  var contour = {}
  contour.vertices = [];
//  contour.vertices.push(videocamera.getWorldPosition());
  var position = videocamera.getWorldPosition();
//  position.y -= 20; // ниже плоскости камеры, для проверки, удалить
  var raycaster = new THREE.Raycaster(position, direction, videocamera.near, videocamera.far );

  var drawRayLine = function(scene, videocamera, ray_point){
	
	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( videocamera.getWorldPosition(), ray_point );
	var line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color: 'green' }) );
	scene.add(line); 
	
  }

  while(angle > 0){
	var ray_distance = Infinity ;
	var ray_point = videocamera.getWorldPosition();
	var clone_ray_point = new THREE.Vector3( );
	  clone_ray_point.copy(ray_point);    


	//проход по элементам сцены
	scene.traverse(function(el){
	  
	  if(el.name == 'wall'){
		
		point = null;
		var  objBoundingBox = new THREE.Box3().setFromObject(el);


		var intersects = raycaster.intersectObject(el);

		if (intersects.length > 0) {
		  var point  = intersects[0].point;
		  var distance  = intersects[0].distance;
		} else {
		  var clone_direction = new THREE.Vector3( );
		  clone_direction.copy(direction); 
		  var point = videocamera.getWorldPosition().add(clone_direction.multiplyScalar(videocamera.far));
		  var distance  = videocamera.far;
		}

		if(point){
		  if (distance < ray_distance){
			ray_distance = distance;
			ray_point = point;
		  }
		}        
	  }
	  
	});  

	ray_point.ceil();

	if(ray_point.x != clone_ray_point.x || ray_point.z != clone_ray_point.z){

	  if(contour.vertices.indexOf(ray_point.clone()) === -1){
		contour.vertices.push(ray_point.clone());
	  }
	  
	  //прорисовываем линию луча(вспомогательная)
//      drawRayLine(scene, videocamera, ray_point);
	}      

  //поворот вектора
	direction.applyEuler(a);
	angle = angle - angleStep;
  }

  //построение контура
  var shape = new THREE.Shape();  
  if (contour.vertices.length > 0){
    shape.moveTo( contour.vertices[0].x,contour.vertices[0].z ); 
    var i = contour.vertices.length-1;
    while(--i){
      shape.lineTo( contour.vertices[i].x, contour.vertices[i].z );
    }
  }

  //вытянуть область
  var extrudeSettings = {
	amount: videocamera.roomHeight,
	bevelEnabled: false
  };

  if (shape.curves.length > 0){
	
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
	material.opacity = 0.5;
	material.transparent = true;
	var ExtrudeMesh = new THREE.Mesh( geometry, material ) ;
	ExtrudeMesh.rotateX( Math.PI/2 );
	ExtrudeMesh.translateZ ( - videocamera.roomHeight );
	videocamera.room = ExtrudeMesh;
  } else {
	videocamera.room = null;
  }
//      ExtrudeMesh.visible = false;
//      scene.add( ExtrudeMesh );
  //====================   
  
}

function updateCameraRay()
{
   var rayBSP;
   var roomBSP;
   var newBSP;
   var newRay;
   var rayMesh;
   var active_rayMesh;

  if (isMoveCamera){
	  roomCalculate(scene, active_camera);
  } 
  if(isMoveRay){
	 if(active_camera && active_camera.room){
	
	  scene.remove( scene.getObjectByName(active_camera.id + "_ray") );

	  drawRay(active_camera);
	} 
  }
  
//	if(controls){
	//controls.update();
//  }

	//stats.update();
}

function showRay()
{
 //рендерим луч
	  isMoveCamera = true;
	  isMoveRay = true;
	  //луч прорисован - отключаем рендеринг
	  setTimeout(function(){
		isMoveCamera = false;
		isMoveRay = false;
	  },500); 
}

function showFocus(){
	if(active_camera){
	  scene.remove( scene.getObjectByName(active_camera.id + "_focus") );
	  var focus =  active_camera.getObjectByName('ray_axis_x').getObjectByName('focus');
	focus.visible = true;
  }
}

function onKeyUpCam ( event )  
{

  if (window.FirstPersonView) {
	  if (!event.altKey) 
	  {
	  	event.preventDefault();
	  	return;
	  }	
  }		  

  switch( event.keyCode ) {
    case 17: /*ctrl*/
      ctrl = false;
      break;
    case 18: /*alt*/
//      controls.enabled = false;
      break;  
    case 37:/*left*/ 
      controls.enabled = true;
      isMoveCamera = false;
      isMoveRay = false;
      break;
    case 38:/*up*/  
      controls.enabled = true;
      isMoveCamera = false;
      isMoveRay = false;
      break;
    case 39:/*right*/
      controls.enabled = true;
      isMoveCamera = false;
      isMoveRay = false;
      break;
    case 40:/*down*/  
      controls.enabled = true;
      isMoveCamera = false;
      isMoveRay = false;
      break; 
    case 87:/*w*/  
      isMoveRay = false;
      break;
    case 83:/*s*/ 
      isMoveRay = false;
      break;
    case 65:/*a*/ 
      isMoveRay = false;
      break;
    case 68:/*d*/ 
      isMoveRay = false;
      break; 
  }
}

function onKeyDownCam ( event )  
{
//  alert(event.keyCode)
  if (window.FirstPersonView) {
	  if (!event.altKey) 
	  {
	  	event.preventDefault();
	  	return;
	  }	
  }		  
  switch( event.keyCode ) {
    case 81: /*q*/
      getRay2d(active_camera);
      break; 
    case 17: /*ctrl*/
      ctrl = true;
      break;
    case 18: /*alt*/
//      controls.enabled = true;
      break;   
    case 82: /*r*/
      if(active_camera){
        scene.remove( scene.getObjectByName(active_camera.id + "_ray") );
        if ( active_camera['currentMaterial']){
          if (active_camera.material)
          	active_camera.material.color = ( active_camera.currentMaterial.color );
          showFocus();
          active_camera.getObjectByName('focus').visible = false;
          active_camera = null;
        }
      }
      break;  
    case 87:/*w*/  
      showFocus();
      isMoveRay = true;
      if(active_camera)
        active_camera.getObjectByName('ray_axis_x').parent.rotateX( -delta );
      break;
    case 83:/*s*/ 
      showFocus();
      isMoveRay = true;
      if(active_camera)
        active_camera.getObjectByName('ray_axis_x').parent.rotateX( delta );
      break;
    case 65:/*a*/ 
      showFocus();
      isMoveRay = true;
      if(active_camera)
        active_camera.rotateY( delta );
      break;
    case 68:/*d*/ 
      showFocus();
      isMoveRay = true;
      if(active_camera)
        active_camera.rotateY( -delta );
      break;
    case 37:/*left*/ 
      controls.enabled = false;
      showFocus();
      isMoveCamera = true;
      isMoveRay = true;
      if(active_camera){
        active_camera.position.x += ( delta2 );
      }
      break;
    case 38:/*up*/
      controls.enabled = false;
      showFocus();
    isMoveCamera = true;
    isMoveRay = true;
      if(ctrl){
        if(active_camera){
          active_camera.position.y += ( delta2 );
        }
      } else {
        if(active_camera){
          active_camera.position.z += ( delta2 );
        }
      }
      break;
    case 39:/*right*/
      controls.enabled = false;
      showFocus();
      isMoveCamera = true;
      isMoveRay = true;
      if(active_camera) { 
        active_camera.position.x += ( -delta2 );
      }
      break;
    case 40:/*down*/ 
      controls.enabled = false;
      showFocus();
      isMoveCamera = true;
      isMoveRay = true;
      if(ctrl){
        
        if(active_camera){
          active_camera.position.y += ( -delta2 );
        }
      } else {
        if(active_camera){
          active_camera.position.z += ( -delta2 );
        }
      }
      break;  
  }
}


function onDocumentMouseDownCam( event )
{
  //event.preventDefault();

  document.addEventListener( 'mousemove', onDocumentMouseMoveCam, false );
  document.addEventListener( 'mouseup', onDocumentMouseUpCam, false );
  
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
  
  var mouse_raycaster = new THREE.Raycaster();
  mouse_raycaster.setFromCamera( mouse, camera );

  //var intersects = mouse_raycaster.intersectObjects( scene.children, false );
  var intersects = mouse_raycaster.intersectObjects(videocameraArr, true );
  
  //if(intersects.length > 0)
  //  console.log(intersects);

  var click_cam = undefined;
  // найдем камеру среди кликнутых объктов:
  if(intersects.length > 0 && active_camera !== intersects[ 0 ].object){
	if ('name' in intersects[ 0 ].object && intersects[ 0 ].object['userData'].is_camera == true /*intersects[ 0 ].object['name'] == videocameraName*/) {
		click_cam = intersects[ 0 ].object;
	}
  }  

  if (!click_cam) {
	  for(var i = 0; i < intersects.length; i++) 
	  {
		if (intersects[i].object && intersects[i].object.userData && intersects[i].object['userData'].is_camera == true)	
		{
			click_cam = intersects[i].object;
			break;
		}	

		if (intersects[i].object.parent && intersects[i].object.parent.userData && intersects[i].object.parent.userData.is_camera)	
		{
			click_cam = intersects[i].object.parent;
			break;
		}	
	  }	
  }	  

  //выбор активной камеры
  if(click_cam && active_camera !== click_cam){
	//console.log(click_cam);
	if ('name' in click_cam && click_cam['userData'].is_camera == true) {
	  if ( active_camera && active_camera['currentMaterial']){
		if (active_camera.material)
			active_camera.material.color = ( active_camera.currentMaterial.color );
		showFocus();
		active_camera.getObjectByName('focus').visible = false;
		active_camera = null;
	  }
	  active_camera = click_cam;
	  active_camera.currentMaterial = {};
	  if (active_camera.material) {
		active_camera.currentMaterial.color = active_camera.material.color;
		active_camera.material.color =  new THREE.Color( 'red' );
	  }	
	  else 
		active_camera.currentMaterial.color = 'green';
	  showFocus();
	  showRay();
	  
	}
	
	if(click_cam['userData'].is_camera == true){
	  click_cam.color =  new THREE.Color( 'red' );
	}
	
  } 
  //выбор активной камеры
  
	if (active_camera){
	  
	  var intersects = mouse_raycaster.intersectObjects( active_camera.getObjectByName('ray_axis_x').children );
  
	  if (intersects.length > 0 && intersects[ 0 ].object == active_camera.getObjectByName('ray_axis_x').getObjectByName('focus')) {

		//=объект фокуса для перемещения
		var focus =  active_camera.getObjectByName('ray_axis_x').getObjectByName('focus');
		//новый объект фокуса для перемещения
		var geometry = new THREE.SphereGeometry(5, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 'green', opacity: 0.8, transparent: true} );
		var newFocus = new THREE.Mesh( geometry, material );
		newFocus.position.copy(focus.getWorldPosition());
		newFocus.rotation.copy(focus.getWorldRotation());
		newFocus.name = active_camera.id + "_focus";
		if( ! scene.getObjectByName(newFocus.name)){
		  scene.add(newFocus);
		}
		
		
		focus.visible = false;
		//=объект фокуса для перемещения 

		  var dragControls = new THREE.DragControls( [newFocus], camera, renderer.domElement );        
		  dragControls.addEventListener( 'dragstart', function ( event ) { 
			controls.enabled = false; 
			isMoveRay = true;
			isMoveCamera = true;
		  } );
		  dragControls.addEventListener( 'dragend', function ( event ) {
			controls.enabled = true; 
			isMoveRay = false;
			isMoveCamera = false;

			//вычисление дистанции
			var ray = new THREE.Raycaster( active_camera.getWorldPosition(), newFocus.getWorldPosition().sub(active_camera.getWorldPosition()).normalize() );
			var intersects2 = ray.intersectObjects( [newFocus] );
			if ( intersects2.length > 0 ) 
			{
			  active_camera.far = intersects2[0].distance;
			  active_camera.getObjectByName('ray_axis_x').getObjectByName('focus').position.z = active_camera.far;
			  
			  var radiusB = Math.tan(active_camera.angle/2) * active_camera.far / Math.sin(THREE.Math.degToRad(45)); //большее основание пирамиды
			  var geometry = new THREE.CylinderGeometry( 1, radiusB+1, active_camera.far, 4 ); //геометрия луча
//              window.console.log(active_camera.getObjectByName('rayMesh').geometry);
//              active_camera.getObjectByName('rayMesh').geometry.parameters.radiusBottom  = radiusB;
//              active_camera.getObjectByName('rayMesh').geometry.parameters.height = active_camera.far;
//              window.console.log(active_camera.getObjectByName('rayMesh').geometry);
			}

			//локальные/мировые координаты фокуса
			var wPos = newFocus.getWorldPosition();
			var lPos = new THREE.Vector3();
			active_camera.worldToLocal(lPos.copy(wPos));

			//сдвиг осей камеры
			active_camera.getObjectByName('ray_axis_x').lookAt(new THREE.Vector3(active_camera.getObjectByName('ray_axis_x').position.x, lPos.y ,lPos.z));
			active_camera.lookAt(new THREE.Vector3(wPos.x, active_camera.position.y, wPos.z));

			showRay();

		  } );

	  }


    }
}

function onDocumentMouseMoveCam( event )
{
//  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
//  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
//
//  lon -= movementX * 0.1;
//  lat += movementY * 0.1;
}

function onDocumentMouseUpCam( event )
{
  document.removeEventListener( 'mousemove', onDocumentMouseMoveCam );
  document.removeEventListener( 'mouseup', onDocumentMouseUpCam );
//  showFocus();
}
