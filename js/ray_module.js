//=== to addCameraRay
var videocameraArr = [];
var videocameraName = 'videocamera';
var active_camera = null;
var ctrl = 0; //флаг клавиши ctrl
var delta = 0.02; //шаг перемещения луча активной камеры
var delta2 = 5;   //шаг линейного перемещения активной камеры
var rayMaterial = new THREE.MeshBasicMaterial({
  wireframe: false,
  opacity: 0.2, 
  transparent: true, 
  depthWrite: false, 
  side: THREE.DoubleSide,
  color: 'green'

});
              
var rayMaterial2 = new THREE.MeshBasicMaterial({
  wireframe: false,
  opacity: 0.1, 
  transparent: true, 
  depthWrite: false, 
  side: THREE.DoubleSide,
  color: 'yellow'
});
var rayMaterial3 = new THREE.MeshBasicMaterial({
  wireframe: false,
  opacity: 0.1, 
  transparent: true, 
  depthWrite: false, 
  side: THREE.DoubleSide,
  color: 'red'
});
     
var isMoveRay = false; // перестраивание луча в функции рендеринга при движении луча
var isMoveCamera = false; // перестраивание луча и "комнаты" в функции рендеринга при движении камеры
//=== to addCameraRay

// FUNCTIONS 		
function test_cams() {
//	  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var geometry = new THREE.BoxGeometry( 10, 10, 10 );
	  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	  var videocamera = new THREE.Mesh( geometry, material );
    
    var group = new THREE.Group();
    group.add(videocamera);
	  group.name = videocameraName;
	  group.userData.is_camera = true;
	  group.position.y = 140;
	  group.position.x = 250;
    group.name = 'load';
    var externGroup = new THREE.Group();
    externGroup.add( group );
	  scene.add( externGroup );
   
//	for(var p = 1; p <= 10; p++){
//
//	var v2 = videocamera.clone();
//	var v3 = videocamera.clone();
//	v3.name = v2.name = videocamera.name;
//	v2.material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
//	v3.material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
//	v2.position.z += p*50;
//	v3.position.z += -p*50;
//	scene.add( v2, v3 );
//  
//  }
}

function getFocusCoord(videocamera){
  return  videocamera.getObjectByName('focus').position;
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
  var angle = THREE.Math.degToRad(30);//угол обзора камеры
//  var ray_axis_x; // доп ось камеры
//  var ray_axis_y; // доп ось камеры
  
  scene.traverse(function(videocamera){
    
    if(videocamera.userData.is_camera == true && videocamera.parent.name != 'ray_axis_x'){

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
      
      var radiusB2 = Math.tan(videocamera.angle/2) * videocamera.far/3*2 / Math.sin(THREE.Math.degToRad(45))*1.01; //большее основание пирамиды
      var geometry2 = new THREE.CylinderGeometry( 1, radiusB2+1, videocamera.far/3*2, 4 ); //геометрия луча
      var rayMesh2 = new THREE.Mesh( geometry2);
      
      var radiusB3 = Math.tan(videocamera.angle/2) * videocamera.far/3 / Math.sin(THREE.Math.degToRad(45))*1.02; //большее основание пирамиды
      var geometry3 = new THREE.CylinderGeometry( 1, radiusB3+1, videocamera.far/3, 4 ); //геометрия луча
      var rayMesh3 = new THREE.Mesh( geometry3);
        
      rayMesh.rotation.x = rayMesh2.rotation.x = rayMesh3.rotation.x = -Math.PI/2;
      rayMesh.rotation.y = rayMesh2.rotation.y = rayMesh3.rotation.y = Math.PI/4;
      
      rayMesh.translateY(-videocamera.far/2);
      rayMesh.visible = false;
      rayMesh.name = 'rayMesh1';
      
      rayMesh2.translateY(-videocamera.far/2/3*2);
      rayMesh2.visible = false;
      rayMesh2.name = 'rayMesh2';
      
      rayMesh3.translateY(-videocamera.far/2/3);
      rayMesh3.visible = false;
      rayMesh3.name = 'rayMesh3';

      //хелпер фокуса
      var geometry = new THREE.SphereGeometry( 3, 32, 32 );
      var material = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
      var focus = new THREE.Mesh( geometry, material );
      focus.name = 'focus';
      focus.position.z = videocamera.far + 5;
      focus.visible = false;

      //ось вращения1
      var ray_axis_x = new THREE.Object3D();
      ray_axis_x.name = 'ray_axis_x';

      //ось вращения2
      var ray_axis_y = new THREE.Object3D();
      ray_axis_y.name = 'ray_axis_y';

      videocamera.getWorldPosition(ray_axis_y.position);
      videocamera.getWorldRotation(ray_axis_y.rotation);
      videocamera.position.set(0,0,0);

      scene.add( ray_axis_y );
      ray_axis_y.add(ray_axis_x);
      ray_axis_x.add(videocamera);
      videocamera.add( focus );
      videocamera.add(rayMesh);
      videocamera.add(rayMesh2);
      videocamera.add(rayMesh3);


      if (videocamera.userData.camera_props) {
        rayMesh.rotateX(THREE.Math.degToRad(videocamera.userData.camera_props.camera_start_angle) );
        rayMesh.position.y = videocamera.userData.camera_props.camera_off_y;
        rayMesh.position.z = videocamera.userData.camera_props.camera_off_z;
        rayMesh.position.x = videocamera.userData.camera_props.camera_off_x;
      }
      
//      if (videocamera.userData.camera_props && videocamera.fscale) {
//        rayMesh.rotateX(THREE.Math.degToRad(videocamera.userData.camera_props.camera_start_angle) );
//        rayMesh.position.y = videocamera.userData.camera_props.camera_off_y/videocamera.fscale;
//        rayMesh.position.z = videocamera.userData.camera_props.camera_off_z/videocamera.fscale;
//        rayMesh.position.x = videocamera.userData.camera_props.camera_off_x/videocamera.fscale;
//      }

//      if (videocamera.fscale) {
//        rayMesh.scale.x *= 1/videocamera.fscale;
//        rayMesh.scale.y *= 1/videocamera.fscale;
//        rayMesh.scale.z *= 1/videocamera.fscale;
//      }    

      //ось z - хелпер
      arrowHelperAdd( videocamera, null, 'red' );
      //ось z - хелпер

    }
    
    //Дополнительный функционал для камеры
    cameraDecorator(videocamera);

  });
  
  
  //Отобразить все лучи
  setTimeout(raysShowAll, 500);
  
  document.addEventListener( 'keydown', onKeyDownCam, false );
  document.addEventListener( 'keyup', onKeyUpCam, false );
  document.addEventListener( 'mousedown', onDocumentMouseDownCam, false );
//  document.addEventListener( 'mousemove', onDocumentMouseMoveCam, false );
//  document.addEventListener( 'wheel', onDocumentMouseWheelCam, false );
}

function cameraDecorator(camera){
  
    camera.updateDimesions = function()
    {
      
      this.traverse(function(item){
        if(item['note_type'] && item['note_type'] == 'dimension')
          item.update();
      })
    }
    camera.updateInformation = function()
    {
        var note_type = this.getObjectByProperty('note_type', 'noteCameraInfo');
      if(note_type){
        note_type.update();
      }  
    }
    camera.noteRemoveAll = function()
    {
      //удаление примечаний
      if(this.traverse){
        var items = this.children;
        var i = items.length;
        while(--i){
          if(items[i]['note_type']){
            this.remove(items[i]);
          }
        }
      }
    }
    camera.getMainMesh = function()
    {
      var result = false;
      
      var group = this.getObjectByProperty('name', 'load');
      if(group){
        var children = group.children;
        var i = children.length;
        while(i--){
          if ( children[i] instanceof THREE.Mesh ) {
            return children[i];
          }
        }
      }

      return result; 
    };
      
}
function raysShowAll(){
   
  for(var key in videocameraArr){
    
    roomCalculate(scene, videocameraArr[key]);
        
    if(videocameraArr[key].room){
      drawRay(videocameraArr[key], '1');   
      drawRay(videocameraArr[key], '2');
      drawRay(videocameraArr[key], '3');
    }

  }
    
}

function drawRay(videocamera, index){
  var rayBSP;
  var roomBSP;
  var newBSP;
  var newRay;
  var rayMesh = null;
  var active_rayMesh;
  var material = null;

  scene.remove( scene.getObjectByName(videocamera.id + "_ray" + index) );
  scene.remove( scene.getObjectByName(videocamera.id + "_edge" + index) );

  rayMesh = videocamera.getObjectByName('rayMesh' + index);

  if(rayMesh){
    active_rayMesh = new THREE.Mesh( rayMesh.geometry.clone() );
    active_rayMesh.position.copy(rayMesh.getWorldPosition());
    active_rayMesh.rotation.copy(rayMesh.getWorldRotation());


    rayBSP = new ThreeBSP( active_rayMesh );
    roomBSP = new ThreeBSP( videocamera.room );
    newBSP = roomBSP.intersect( rayBSP );

    switch (index) {
      case '1':
        var material = rayMaterial;
        break;
      case '2':
        var material = rayMaterial2;
        break;
      case '3':
        var material = rayMaterial3;
        break;

    }

    newRay = newBSP.toMesh( material );
    newRay.name = videocamera.id + "_ray" + index;


    scene.add( newRay ); 
    
    if(index == '1'){
      var edges = new THREE.EdgesGeometry( newRay.geometry );

					var line = new THREE.LineSegments( edges );
					line.material.depthTest = false;
					line.material.opacity = 0.25;
					line.material.transparent = true;
          line.material.color = new THREE.Color('black');
      line.position.copy(newRay.getWorldPosition());
      line.rotation.copy(newRay.getWorldRotation()); 
      line.name = videocamera.id + "_edge" + index;
			scene.add( line );
    }
					
          
          

    newRay = newBSP = roomBSP = rayBSP = active_rayMesh = rayMesh = line = null;
  }

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
	ExtrudeMesh.translateZ ( - videocamera.roomHeight-2 );//-2 убрать артефакт пересечения с полом
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

  if (isMoveCamera && active_camera){
	  roomCalculate(scene, active_camera);
  
    //обновление примечания
    active_camera.updateDimesions();
    active_camera.updateInformation();

  } 
  if(isMoveRay){
	 if(active_camera && active_camera.room){
     
     //обновление примечания
     active_camera.updateDimesions();
     active_camera.updateInformation();
    
	  drawRay(active_camera, '1');
    drawRay(active_camera, '2');
    drawRay(active_camera, '3');
	} 
  }
  
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

function showFocus()
{
	if(active_camera){
	  scene.remove( scene.getObjectByName(active_camera.id + "_focus") );
	  var focus =  active_camera.getObjectByName('focus');
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
      setTimeout(function(){
        isMoveCamera = false;
        isMoveRay = false;
      },500);
      break;
    case 38:/*up*/  
      controls.enabled = true;
      setTimeout(function(){
        isMoveCamera = false;
        isMoveRay = false;
      },500);
      break;
    case 39:/*right*/
      controls.enabled = true;
      setTimeout(function(){
        isMoveCamera = false;
        isMoveRay = false;
      },500);
      break;
    case 40:/*down*/  
      controls.enabled = true;
      setTimeout(function(){
        isMoveCamera = false;
        isMoveRay = false;
      },500);
      break; 
    case 87:/*w*/  
      setTimeout(function(){
        isMoveRay = false;
      },500);
      break;
    case 83:/*s*/ 
      setTimeout(function(){
        isMoveRay = false;
      },500);
      break;
    case 65:/*a*/ 
      setTimeout(function(){
        isMoveRay = false;
      },500);
      break;
    case 68:/*d*/ 
      setTimeout(function(){
        isMoveRay = false;
      },500);
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
//      getRay2d(active_camera);
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
          if (active_camera.children[0].material)
          	active_camera.children[0].material.color = ( active_camera.currentMaterial.color );
          showFocus();
          active_camera.getObjectByName('focus').visible = false;
          active_camera.noteRemoveAll();
          active_camera = null;
        }
      }
      break;  
    case 87:/*w*/  
      showFocus();
      isMoveRay = true;
      if(active_camera)
        active_camera.parent.rotateX( -delta );
      break;
    case 83:/*s*/ 
      showFocus();
      isMoveRay = true;
      if(active_camera)
        active_camera.parent.rotateX( delta );
      break;
    case 65:/*a*/ 
      showFocus();
      isMoveRay = true;
      if(active_camera)
        active_camera.parent.parent.rotateY( delta );
      break;
    case 68:/*d*/ 
      showFocus();
      isMoveRay = true;
      if(active_camera)
        active_camera.parent.parent.rotateY( -delta );
      break;
    case 37:/*left*/ 
      controls.enabled = false;
      showFocus();
      isMoveCamera = true;
      isMoveRay = true;
      if(active_camera){
        active_camera.parent.parent.position.x += ( delta2 );
      }
      break;
    case 38:/*up*/
      controls.enabled = false;
      showFocus();
    isMoveCamera = true;
    isMoveRay = true;
      if(ctrl){
        if(active_camera){
          active_camera.parent.parent.position.y += ( delta2 );
        }
      } else {
        if(active_camera){
          active_camera.parent.parent.position.z += ( delta2 );
        }
      }
      break;
    case 39:/*right*/
      controls.enabled = false;
      showFocus();
      isMoveCamera = true;
      isMoveRay = true;
      if(active_camera) { 
        active_camera.parent.parent.position.x += ( -delta2 );
      }
      break;
    case 40:/*down*/ 
      controls.enabled = false;
      showFocus();
      isMoveCamera = true;
      isMoveRay = true;
      if(ctrl){
        
        if(active_camera){
          active_camera.parent.parent.position.y += ( -delta2 );
        }
        
      } else {
        if(active_camera){
          active_camera.parent.parent.position.z += ( -delta2 );
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
	if ('name' in intersects[ 0 ].object && intersects[ 0 ].object['userData'].is_camera == true ) {
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

		if (intersects[i].object.parent.parent && intersects[i].object.parent.parent.userData && intersects[i].object.parent.parent.userData.is_camera)	
		{
			click_cam = intersects[i].object.parent.parent;
			break;
		}	
	  }	
  }	  

  //выбор активной камеры
  if(click_cam && active_camera !== click_cam){
	//console.log(click_cam);
	if ('name' in click_cam && click_cam['userData'].is_camera == true) {
	  if ( active_camera && active_camera['currentMaterial']){
		if (active_camera.getMainMesh().material)
			active_camera.getMainMesh().material.color = ( active_camera.currentMaterial.color );
		showFocus();
		active_camera.getObjectByName('focus').visible = false;
    
    
    active_camera.noteRemoveAll();
		active_camera = null;
	  }
    
	  active_camera = click_cam;
	  active_camera.currentMaterial = {};
	  if (active_camera.getMainMesh().material) {
      active_camera.currentMaterial.color = active_camera.getMainMesh().material.color;
      active_camera.getMainMesh().material.color =  new THREE.Color( 'red' );
	  }	
	  else {
      active_camera.currentMaterial.color = 'green';
    }
	  showFocus();
	  showRay();

    noteAdd(active_camera, " Активная \n камера ", 'noteCameraInfo');
//
    dimensionCameraAdd(active_camera, {'type':'front'});
    dimensionCameraAdd(active_camera, {'type':'back'});
    dimensionCameraAdd(active_camera, {'type':'left'});
    dimensionCameraAdd(active_camera, {'type':'right'});
    
	  
	}
	
	if(click_cam['userData'].is_camera == true){
	  click_cam.getMainMesh().color =  new THREE.Color( 'red' );
	}
	
  } 
  //выбор активной камеры
  
  //фокус активной камеры
	if (active_camera){
	  
	  var intersects = mouse_raycaster.intersectObjects( active_camera.children );
  
	  if (intersects.length > 0 && intersects[ 0 ].object == active_camera.getObjectByName('focus')) {

		//=объект фокуса для перемещения
		var focus =  active_camera.getObjectByName('focus');
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
			  active_camera.getObjectByName('focus').position.z = active_camera.far;
			  
			  var radiusB = Math.tan(active_camera.angle/2) * active_camera.far / Math.sin(THREE.Math.degToRad(45)); //большее основание пирамиды
			  var geometry = new THREE.CylinderGeometry( 1, radiusB+1, active_camera.far, 4 ); //геометрия луча
//              active_camera.getObjectByName('rayMesh').geometry.parameters.radiusBottom  = radiusB;
//              active_camera.getObjectByName('rayMesh').geometry.parameters.height = active_camera.far;
			}

			//локальные/мировые координаты фокуса
			var wPos = newFocus.getWorldPosition();
			var lPos = new THREE.Vector3();
			active_camera.worldToLocal(lPos.copy(wPos));

			//сдвиг осей камеры
			active_camera.parent.lookAt(new THREE.Vector3(active_camera.position.x, lPos.y ,lPos.z));
			active_camera.parent.parent.lookAt(new THREE.Vector3(wPos.x, active_camera.position.y, wPos.z));

			showRay();

		  } );

	  }


  }
  //фокус активной камеры
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

//============================



//Примечания
function noteMaker( obj, message, parameters )
{
  THREE.Object3D.call( this );
  var self = this;
  
  this.obj = obj;
  this.note_type = '';
  
	if ( parameters === undefined ) parameters = {};
	
	this.fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	this.fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 24;
	
	this.borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 4;
	
	this.borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	this.backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
    
  this.x = parameters.hasOwnProperty("x") ?  parameters["x"] : 0;
  this.y = parameters.hasOwnProperty("y") ? parameters["y"] : 50;
    
  this.message = message || [];
  
  this.texture = {};
  this.sprite = {};
 
	this.canvas = document.createElement('canvas');
  this.canvas.width = 1000;
  this.canvas.height = 1000;
  this.context = self.canvas.getContext('2d');
  this.context.font = "Bold " + self.fontsize + "px " + self.fontface;
  this.context.lineWidth = self.borderThickness; 

  this.canvas2 = document.createElement('canvas');
  this.context2 = self.canvas2.getContext('2d');
    
    
  this.getMessage = function(){
    if(typeof self.message == 'object'){
      return self.message;
    }
   return self.message.split("\n");
  }
  
  this.setMessage = function(message){
    if(typeof message == 'object'){
      self.message = message;
    } else if(typeof message == 'string') {
      self.message = message.split("\n");
    }
  }
  
  this.getMaxWord = function(message){
    var maxTextWidth = 0;
    var maxWord = '';
    
    for(var key in message){
      if(message[key].length > maxTextWidth){
        maxTextWidth = message[key].length ;
        maxWord = message[key];
      }

    }
    
    return maxWord;
  }
    
  this.getTextWidth = function(message){
    
    var maxWord = self.getMaxWord(message);
    var metrics = self.context.measureText( maxWord );
 
    return metrics.width;
  }
  
  this.getFontHeight = function (font) {
    var parent = document.createElement("span");
    parent.appendChild(document.createTextNode("height"));
    document.body.appendChild(parent);
    parent.style.cssText = "font: " + font + "; white-space: nowrap; display: inline;";
    var height = parent.offsetHeight;
    document.body.removeChild(parent);
    return height;
  }
  
  this.toCanvas2 = function(){
    
    var x = self.canvas.width/2 - self.textWidth/2 - self.borderThickness;
    var y = self.canvas.height/2 - self.message.length * self.fontheight /2 - self.borderThickness;
    var width = self.textWidth + self.borderThickness*2;
    var height = self.message.length * self.fontheight  + self.borderThickness*2

    var imageData = self.context.getImageData(x,y,width,height);
    self.canvas2.width = width;
    self.canvas2.height = height;

    
    self.context2.putImageData(imageData,0, 0);
  }
  
  this.addRectangle = function(){
    
      // background color
     self.context.fillStyle   = "rgba(" + self.backgroundColor.r + "," + self.backgroundColor.g + ","
                     + self.backgroundColor.b + "," + self.backgroundColor.a + ")";
     // border color
     self.context.strokeStyle = "rgba(" + self.borderColor.r + "," + self.borderColor.g + ","
                     + self.borderColor.b + "," + self.borderColor.a + ")"; 


     var x = self.canvas.width/2 - self.textWidth/2 - self.borderThickness/2;
     var y = self.canvas.height/2 - self.message.length * self.fontheight /2 - self.borderThickness/2;
     var width = self.textWidth + self.borderThickness;
     var height = self.message.length * self.fontheight + self.borderThickness
     self.roundRect(self.context, x, y, width, height, 6);

  }
  
  this.addText = function(){
    // text color
    self.context.fillStyle = "rgba(0, 0, 0, 1.0)";
    //Для многострочности
    var x = self.canvas.width/2 - self.textWidth/2 ;
     
    for(var key in self.message){
      var y = self.canvas.height/2 - self.message.length * self.fontheight /2 +  (+key+1) * self.fontheight-5;
      self.context.fillText( self.message[key], x, y); 
    }   
  }
  
  this.getTexture = function(){
    var texture = new THREE.Texture(self.canvas2) 
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  }
  
  this.roundRect = function (ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x+r, y);
      ctx.lineTo(x+w-r, y);
      ctx.quadraticCurveTo(x+w, y, x+w, y+r);
      ctx.lineTo(x+w, y+h-r);
      ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
      ctx.lineTo(x+r, y+h);
      ctx.quadraticCurveTo(x, y+h, x, y+h-r);
      ctx.lineTo(x, y+r);
      ctx.quadraticCurveTo(x, y, x+r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();   
  }
  
  this.update = function(){

    if(self.sprite){
      self.message = this.getMessage();
      self.textWidth = self.getTextWidth(self.message);
      self.fontheight = self.getFontHeight(self.context.font);
      self.addRectangle();
      self.addText();
      self.toCanvas2();
      self.texture = self.getTexture();
      self.texture.needsUpdate = true;
      self.sprite.material.map = self.texture;
      self.sprite.material.needsUpdate = true;
    }
    
  }
  
  this.getSprite = function(){
      
      var spriteMaterial = new THREE.SpriteMaterial( 
      { map: self.texture/*, useScreenCoordinates: false */} );

      var sprite = new THREE.Sprite( spriteMaterial );
      
      sprite.note_type = self.note_type;

      sprite.scale.set(
          (self.textWidth + self.borderThickness)/5,
          (self.message.length * self.fontheight  + self.borderThickness)/5,
          1
      );
      sprite.position.set(self.x, self.y,0);
      sprite.update = function(){return self.update();};
      sprite.setMessage = function(message){return self.setMessage(message);};
      return sprite;   
  }

  this.sprite = null;
  
  this.view = function(){
    self.message = self.getMessage();
    self.textWidth = self.getTextWidth(self.message);
    self.fontheight = self.getFontHeight(self.context.font);
    self.addRectangle();
    self.addText();
    self.toCanvas2();
    self.texture = self.getTexture();
    self.sprite = self.getSprite();  
    return self.sprite ;
  }
    
};
function noteSimple()
{
  noteMaker.apply(this, arguments);
  this.note_type = 'noteSimple';
  return this.view();
}
function noteCameraInfo ()
{
  var self = this;
  noteMaker.apply(this, arguments);
  this.note_type = 'noteCameraInfo';
  
  this.getMessage = function(){
    var text = '';
    if(self.obj.userData.is_camera){
      text += "Объект: камера \n" ;
      text += "Угол обзора: " + Math.ceil(THREE.Math.radToDeg(self.obj.angle)) + " градусов\n";
      text += "Угол вертикальный: " + self.getAngleVert() + "\n";
      text += "Угол горизонтальный: " + self.getAngleGorizont() + "\n";
      text += "Высота: " + self.obj.getWorldPosition().y + "\n";
    }

    return text.split('\n');
  }
  
  this.getAngleVert = function(){
    var vector = self.obj.getWorldDirection().projectOnPlane (  new THREE.Vector3(1, 0, 0) )
    var inRad = self.obj.getWorldDirection().angleTo( vector );
//    return inRad;
    var inDeg = Math.ceil(THREE.Math.radToDeg(inRad));
    return inDeg;
  }
  
  this.getAngleGorizont = function(){
    var vector = self.obj.getWorldDirection().projectOnPlane (  new THREE.Vector3(0, 1, 0) )
    var inRad = self.obj.getWorldDirection().angleTo( vector );
//    return inRad;
    var inDeg = Math.ceil(THREE.Math.radToDeg(inRad));
    return inDeg;
  }  
  
  return this.view();
  
}
function noteAdd(obj, message, type, parameters)
{
  
  var obj = obj || {};
  var message = message || '';
  var type = type || 'note';
  
  var notification = {};
  
  switch (type) {
    case 'note':
      notification = new noteSimple( obj, message, parameters );
      break;
    case 'noteCameraInfo':
      notification = new noteCameraInfo( obj, message, parameters );
      break;    
  }
  
  if(typeof obj.add == 'function')  {
    
    obj.add(notification);
    
  }
  
  return notification;
  
}


//Размеры
function dimensionCameraAdd(obj, parameters){
  var dim = new dimension(obj, parameters);
}
function dimension(obj, parameters)
{
  var self = this;
  
  this.obj = obj;
  this.note_type = 'dimension';
  this.ray_point = null;
  this.ray_distance;
  this.gr ; //группа размера
  this.line;//линия размера
  this.note;//примечание размера
  
	if ( parameters === undefined ) parameters = {};
	this.type2 = parameters.hasOwnProperty("type") ? parameters["type"] : "front"; 
  this.relative_position = parameters.hasOwnProperty("relative_position") ? parameters["relative_position"] : 0.5; 
  
  
  this.calculate = function()
  {
    self.direction = self.obj.getWorldDirection();
    self.position = self.obj.getWorldPosition();
    self.ray_distance = Infinity;
    
    switch (self.type2) {
      case 'front':
        var a = new THREE.Euler( 0, 0, 0, 'YXZ' );
        self.note_position = new THREE.Vector3( 0, 5, 50 );
        break;
      case 'back':  
        var a = new THREE.Euler( 0, Math.PI, 0, 'YXZ' );
        self.note_position = new THREE.Vector3( 0, 5, -50 );
        break;
      case 'left':
        var a = new THREE.Euler( 0, -Math.PI/2, 0, 'YXZ' );
        self.note_position = new THREE.Vector3( -50, 5, 0 );
        break;
      case 'right':
        var a = new THREE.Euler( 0, Math.PI/2, 0, 'YXZ' );
         self.note_position = new THREE.Vector3( 50, 5, 0 );
        break;
    }

    self.direction.applyEuler(a);
  
    var raycaster = new THREE.Raycaster(self.position, self.direction, 0, 10000 );
      //проход по элементам сцены
    scene.traverse(function(el){

      if(el.name == 'wall'){

        point = null;

        var intersects = raycaster.intersectObject(el);

        if (intersects.length > 0) {
          var point  = intersects[0].point;
          var distance  = intersects[0].distance;
        } 

        if(point){
          if (distance < self.ray_distance){
          self.ray_distance  = distance;
          self.ray_point = point;
          }
        }        
      }

    }); 
    
  }
  this.update = function()
  {

      self.calculate();
      
      self.line.setLength(self.ray_distance, 10);
      self.ray_distance = Math.ceil(self.ray_distance);
      if(self.ray_distance == Infinity){
        self.note.visible = false;
      } else {
        self.note.visible = true;
      }
      self.note.setMessage(" " + self.ray_distance.toString() + " ");
      switch (self.type2) {
        case 'front':
          self.note_position = new THREE.Vector3( 0, 5, self.ray_distance * self.relative_position );
          break;
        case 'back':  
          self.note_position = new THREE.Vector3( 0, 5, -self.ray_distance * self.relative_position );
          break;
        case 'left':
          self.note_position = new THREE.Vector3( -self.ray_distance * self.relative_position, 5, 0 );
          break;
        case 'right':
           self.note_position = new THREE.Vector3( self.ray_distance * self.relative_position, 5, 0 );
          break;
      }

      self.note.position.set(
        self.note_position.x,
        self.note_position.y,
        self.note_position.z
      );

      self.note.update();
  }
  this.drawRayLine = function()
  {
    self.ray_point = self.ray_point ? self.obj.worldToLocal(self.ray_point.clone()): self.direction.floor();
    self.ray_distance = self.ray_distance == Infinity ? 1 : self.ray_distance;
      
    self.line = new THREE.ArrowHelper(  self.ray_point.normalize(), new THREE.Vector3(0,0,0), self.ray_distance, 'blue', 10);

    self.gr = new THREE.Group();
    self.gr.note_type = self.note_type;
    self.gr.update = function(){ return self.update();};
    self.gr.add(self.line)

    self.ray_distance = Math.ceil(self.ray_distance);
    self.note = noteAdd(self.gr, " " + self.ray_distance.toString() + " ");
    
    self.note.position.set(
      self.note_position.x,
      self.note_position.y,
      self.note_position.z
    );

    self.obj.add(self.gr);
    return self.gr;
    
  }

  this.calculate();
  return this.drawRayLine(); 
}
  

//Радиусная стена
function arcWall(data) {
  // From d3-threeD.js
  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this file,
   * You can obtain one at http://mozilla.org/MPL/2.0/. */
  function d3threeD(exports) {
  var/*const*/ DEGS_TO_RADS = Math.PI / 180, UNIT_SIZE = 100;
  var/*const*/ DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46, MINUS = 45;
  exports.transformSVGPath =
  function transformSVGPath(pathStr) {
    var path = new THREE.ShapePath();
    var idx = 1, len = pathStr.length, activeCmd,
      x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
      x1 = 0, x2 = 0, y1 = 0, y2 = 0,
      rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;
    function eatNum() {
      var sidx, c, isFloat = false, s;
      // eat delims
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE)
          break;
        idx++;
      }
      if (c === MINUS)
        sidx = idx++;
      else
        sidx = idx;
      // eat number
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (DIGIT_0 <= c && c <= DIGIT_9) {
          idx++;
          continue;
        }
        else if (c === PERIOD) {
          idx++;
          isFloat = true;
          continue;
        }
        s = pathStr.substring(sidx, idx);
        return isFloat ? parseFloat(s) : parseInt(s);
      }
      s = pathStr.substring(sidx);
      return isFloat ? parseFloat(s) : parseInt(s);
    }
    function nextIsNum() {
      var c;
      // do permanently eat any delims...
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE)
          break;
        idx++;
      }
      c = pathStr.charCodeAt(idx);
      return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
    }
    var canRepeat;
    activeCmd = pathStr[0];
    while (idx <= len) {
      canRepeat = true;
      switch (activeCmd) {
        // moveto commands, become lineto's if repeated
        case 'M':
          x = eatNum();
          y = eatNum();
          path.moveTo(x, y);
          activeCmd = 'L';
          firstX = x;
          firstY = y;
          break;
        case 'm':
          x += eatNum();
          y += eatNum();
          path.moveTo(x, y);
          activeCmd = 'l';
          firstX = x;
          firstY = y;
          break;
        case 'Z':
        case 'z':
          canRepeat = false;
          if (x !== firstX || y !== firstY)
            path.lineTo(firstX, firstY);
          break;
        // - lines!
        case 'L':
        case 'H':
        case 'V':
          nx = (activeCmd === 'V') ? x : eatNum();
          ny = (activeCmd === 'H') ? y : eatNum();
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
        case 'l':
        case 'h':
        case 'v':
          nx = (activeCmd === 'v') ? x : (x + eatNum());
          ny = (activeCmd === 'h') ? y : (y + eatNum());
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
        // - cubic bezier
        case 'C':
          x1 = eatNum(); y1 = eatNum();
        case 'S':
          if (activeCmd === 'S') {
            x1 = 2 * x - x2; y1 = 2 * y - y2;
          }
          x2 = eatNum();
          y2 = eatNum();
          nx = eatNum();
          ny = eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx; y = ny;
          break;
        case 'c':
          x1 = x + eatNum();
          y1 = y + eatNum();
        case 's':
          if (activeCmd === 's') {
            x1 = 2 * x - x2;
            y1 = 2 * y - y2;
          }
          x2 = x + eatNum();
          y2 = y + eatNum();
          nx = x + eatNum();
          ny = y + eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx; y = ny;
          break;
        // - quadratic bezier
        case 'Q':
          x1 = eatNum(); y1 = eatNum();
        case 'T':
          if (activeCmd === 'T') {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = eatNum();
          ny = eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx;
          y = ny;
          break;
        case 'q':
          x1 = x + eatNum();
          y1 = y + eatNum();
        case 't':
          if (activeCmd === 't') {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = x + eatNum();
          ny = y + eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx; y = ny;
          break;
        // - elliptical arc
        case 'A':
          rx = eatNum();
          ry = eatNum();
          xar = eatNum() * DEGS_TO_RADS;
          laf = eatNum();
          sf = eatNum();
          nx = eatNum();
          ny = eatNum();
          if (rx !== ry) {
            console.warn("Forcing elliptical arc to be a circular one :(",
              rx, ry);
          }
          // SVG implementation notes does all the math for us! woo!
          // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
          // step1, using x1 as x1'
          x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
          y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
          // step 2, using x2 as cx'
          var norm = Math.sqrt(
             (rx*rx * ry*ry - rx*rx * y1*y1 - ry*ry * x1*x1) /
             (rx*rx * y1*y1 + ry*ry * x1*x1));
          if (laf === sf)
            norm = -norm;
          x2 = norm * rx * y1 / ry;
          y2 = norm * -ry * x1 / rx;
          // step 3
          cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
          cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;
          var u = new THREE.Vector2(1, 0),
            v = new THREE.Vector2((x1 - x2) / rx,
                                  (y1 - y2) / ry);
          var startAng = Math.acos(u.dot(v) / u.length() / v.length());
          if (u.x * v.y - u.y * v.x < 0)
            startAng = -startAng;
          // we can reuse 'v' from start angle as our 'u' for delta angle
          u.x = (-x1 - x2) / rx;
          u.y = (-y1 - y2) / ry;
          var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
          // This normalization ends up making our curves fail to triangulate...
          if (v.x * u.y - v.y * u.x < 0)
            deltaAng = -deltaAng;
          if (!sf && deltaAng > 0)
            deltaAng -= Math.PI * 2;
          if (sf && deltaAng < 0)
            deltaAng += Math.PI * 2;
          sf=!sf
          path.currentPath.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
          x = nx;
          y = ny;
          break;
        default:
          throw new Error("weird path command: " + activeCmd);
      }
      // just reissue the command
      if (canRepeat && nextIsNum())
        continue;
      activeCmd = pathStr[idx++];
    }
    return path;
  }
  }
  var $d3g = {};
  d3threeD($d3g);

  function initSVGObject ( wall ) {

    var obj = {};
    var is = wall.inner.start;
    var ie = wall.inner.end;
    var os = wall.outer.start;
    var oe = wall.outer.end;
    var dataArc = wall.arcPath.split(' ');
    var arcOuter = '';
    var arcInner = '';

    if(dataArc.length > 0){

      dataArc.splice(0,2);

      dataArc.length = dataArc.length-2;
      var clockwise = dataArc[dataArc.length - 1].split(',');
      dataArc.push(os.x, os.y);
      arcOuter = dataArc.join(' ');

      dataArc.length = dataArc.length-2;
      if(+clockwise[0]){
        clockwise[0] = 0 + ",";
      } else {
        clockwise[0] = 1 + ",";
      }
      dataArc[dataArc.length-1] = clockwise[0];
      dataArc.push(ie.x, ie.y);
      arcInner = dataArc.join(' ');
    }

    obj.amounts = [ wall.height.start ];

    //смещение объекта отн. центра если необходимо
    obj.center = { x:0, y:0 };

    obj.paths = [

     "M" + ie.x + "," + ie.y + " L" + oe.x + "," + oe.y +
     arcOuter  +
     "L" + is.x + "," + is.y +
     arcInner

    ]

    return obj;
  };
  
  
  /**
   * Adds object as child of first @param object.
   * @param {Object} Scene|THREE.Object3D .
   * @param {Object} object with wall data.
   * @param {Object} parameters (THREE.Color, THREE.Material).
   */
  data.add = function add ( group, wall, parameters ) {

    if ( parameters === undefined ) parameters = {};

    var color = parameters.hasOwnProperty("color") ? 
      parameters["color"] :  new THREE.Color( 0xC07000 );;
    var material = parameters.hasOwnProperty("material") ? 
      parameters["material"] : new THREE.MeshLambertMaterial({
                                                              color: color,
                                                              emissive: color
                                                            });


    var svgObject = initSVGObject(wall);

    var i,j, len, len1;
    var path, mesh, color, material, amount, simpleShapes, simpleShape;
    var thePaths = svgObject.paths;
    var theAmounts = svgObject.amounts;

    var theCenter = svgObject.center;
    len = thePaths.length;
    for (i = 0; i < len; ++i) {
      path = $d3g.transformSVGPath( thePaths[i] );
      amount = theAmounts[i];
      simpleShapes = path.toShapes(true);
      len1 = simpleShapes.length;
      for (j = 0; j < len1; ++j) {
        simpleShape = simpleShapes[j];

        var extrudeSettings = {
          amount: amount,
          bevelEnabled: false
        }

        var geometry = new THREE.ExtrudeGeometry( simpleShape, extrudeSettings );
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI/2;
        mesh.translateZ( - amount);
        mesh.translateX( - theCenter.x);
        mesh.translateY( - theCenter.y);

        group.add(mesh);

      }
    }
  };

}
var $arcWall = {};
arcWall($arcWall);