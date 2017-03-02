

//=== to addCameraRay
var Dimensions = new THREE.Object3D(0,200,0); //объект хранилище размеров
var videocameraArr = [];
var videocameraName = 'videocamera';
var active_camera = null;
var ctrl = 0; //флаг клавиши ctrl
var alt = 0; //флаг клавиши alt
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

	  scene.add( group );

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

function arrowHelperAdd(obj, dir, hex, length)
{
  var dir = dir || new THREE.Vector3( 0, 0, 1 );
  var hex = hex || 0xffff00;
  dir.normalize();
  var origin = new THREE.Vector3( 0, 0, 0 );
  var length = length|| 35;
  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  obj.add( arrowHelper );
}

function cameraWrapper(videocamera_one){
    //камера
    var camera_g = new THREE.Group();
    camera_g.userData = JSON.parse(JSON.stringify(videocamera_one.userData));
		videocamera_one.userData.is_camera = false;
		camera_g.userData.is_cam_group = true;
		camera_g.fscale = videocamera_one.fscale;
		//debugger;
    //расположение камеры

    camera_g.position.copy(videocamera_one.getWorldPosition());
    camera_g.rotation.copy(videocamera_one.getWorldRotation());
    videocamera_one.position.set(0,0,0);
    videocamera_one.rotation.set(0,0,0);

    var X = camera_g.userData.camera_props.camera_off_x * camera_g.fscale;
    var Y = camera_g.userData.camera_props.camera_off_y * camera_g.fscale;
    var Z = camera_g.userData.camera_props.camera_off_z * camera_g.fscale;
    var rX = THREE.Math.degToRad(camera_g.userData.camera_props.camera_start_angle);


	  camera_g.position.y += Y;
		camera_g.position.x += X;
		camera_g.position.z += Z;
//    camera_g.rotateX( rX ); //вращать нельзя!!!

	  videocamera_one.position.y -= Y;
		videocamera_one.position.x -= X;
		videocamera_one.position.z -= Z;
    videocamera_one.rotateX( -rX );

    videocamera_one.matrixWorldNeedsUpdate = true;
    camera_g.matrixWorldNeedsUpdate = true;

    camera_g.add( videocamera_one );

    return camera_g;
}

function addCameraRay(scene)
{
  var roomHeight = 150; //высота комнаты ????????
  var floor_scale = 40;
  var near = 2; //начало видимой области
  var far = 800;//окончание видимой области
  var angle = THREE.Math.degToRad(30);//угол обзора камеры
//  var ray_axis_x; // доп ось камеры
//  var ray_axis_y; // доп ось камеры
  var allCamArr = [];

  //глобальный объект размеров
  scene.add(Dimensions);

  scene.children.forEach(function(videocamera_one, idx) {
      if(videocamera_one.userData.is_camera == true && videocamera_one.parent.name != 'ray_axis_x')
		allCamArr.push(videocamera_one);
  });

  allCamArr.forEach(function(videocamera_one, idx)
		{
      //камера
	    var videocamera = cameraWrapper(videocamera_one);

      scene.add( videocamera );

  	  videocamera.name = videocameraName;
      videocameraArr.push(videocamera);

      videocamera.roomHeight = roomHeight;
      videocamera.near = near;
      videocamera.far = far;
      videocamera.angle = angle;
	  videocamera.floor_scale = floor_scale;

      if (videocamera.userData.camera_props)
        videocamera.roomHeight = videocamera.userData.camera_props.roomHeight;
      if (videocamera.userData.camera_props)
        videocamera.far = videocamera.userData.camera_props.far;
      if (videocamera.userData.camera_props)
        videocamera.angle = THREE.Math.degToRad(videocamera.userData.camera_props.angle);
	  if (videocamera.userData.camera_props && videocamera.userData.camera_props.floor_scale)
        videocamera.floor_scale = videocamera.userData.camera_props.floor_scale;

      //луч
      {
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
      }
      //хелпер фокуса
        {
      var geometry = new THREE.SphereGeometry( 3, 32, 32 );
      var material = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
      var focus = new THREE.Mesh( geometry, material );
      focus.name = 'focus';
      focus.position.z = videocamera.far + 5;
      focus.visible = false;
      }
      //ось вращения1
      var ray_axis_x = new THREE.Object3D();
      ray_axis_x.name = 'ray_axis_x';
      ray_axis_x.rotateX( THREE.Math.degToRad(videocamera.userData.camera_props.camera_start_angle) );

      //ось вращения2
      var ray_axis_y = new THREE.Object3D();
      ray_axis_y.name = 'ray_axis_y';

      ray_axis_y.position.copy(videocamera.getWorldPosition());
      ray_axis_y.rotation.copy(videocamera.getWorldRotation());

      videocamera.position.set(0,0,0);
      videocamera.rotation.set(0,0,0);

      scene.add( ray_axis_y );

      ray_axis_y.add(ray_axis_x);
      ray_axis_x.add(videocamera);
      videocamera.add( focus );
      videocamera.add(rayMesh);
      videocamera.add(rayMesh2);
      videocamera.add(rayMesh3);

      //ось z - хелпер
      arrowHelperAdd( videocamera, null, 'red', 35 );
//      arrowHelperAdd( ray_axis_x, null, 'blue', 30 );
//      arrowHelperAdd( ray_axis_x, ray_axis_x.up, 'blue', 30 );
//      arrowHelperAdd( ray_axis_y, null, 'green', 25);
//      arrowHelperAdd( ray_axis_y, ray_axis_y.up, 'green', 25);
      //ось z - хелпер

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

var ray = new THREE.Raycaster(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), 0 , 1000);
var geometry = new THREE.Geometry();
geometry.vertices.push(
	new THREE.Vector3( 1, 5, 0 ),
	new THREE.Vector3( 10, 5, 0 )
);

//var line = new THREE.Line( geometry );
//  window.console.log(ray.intersectObject(line)[0]);;

}

function cameraDecorator(camera)
{

    camera.updateDimesions = function()
    {

      this.parent.parent.traverse(function(item){
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
      var obj = this.parent.parent;
      if(obj.traverse){
        var items = obj.children;
        var i = items.length;
        while(--i){
          if(items[i]['note_type']){
            obj.remove(items[i]);
          }
        }
      }
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
    camera.removeRay = function(){
      var index = 4;
      while(--index){
        scene.remove( scene.getObjectByName(camera.id + "_ray" + index) );
      }
    }

}
function raysShowAll()
{

  for(var key in videocameraArr){

    roomCalculate(scene, videocameraArr[key]);

    if(videocameraArr[key].room){
      drawRay(videocameraArr[key], '1');
      drawRay(videocameraArr[key], '2');
      drawRay(videocameraArr[key], '3');
    }

  }

}

function drawRay(videocamera, index)
{
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
      index = 1;
	  /*
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
    */
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
      alt = false;
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
      if(ctrl){
        if($wallEditor.enabled){
          $wallEditor.off();
        } else {
          $wallEditor.on();
        }
      }  
      break;
    case 17: /*ctrl*/
      ctrl = true;
      break;
    case 18: /*alt*/
      alt = true;
      break;
    case 49: /*1*/
      if(alt){
        if($projection.enabled){
          $projection.off();
        } else {
          $projection.on('top');
        }
      }
      break;
    case 50: /*2*/
      if(alt){
        if($projection.enabled){
          $projection.off();
        } else {
          $projection.on('left');
        }
      }
      break;
    case 51: /*3*/
      if(alt){
        if($projection.enabled){
          $projection.off();
        } else {
          $projection.on('right');
        }
      }
      break;
    case 57: /*9*/
      if(alt){
        $projection.off();
      }
      break;
    case 82: /*r*/
      if(active_camera){

        active_camera.removeRay();

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

  if($wallEditor.enabled){
    var intersects = mouse_raycaster.intersectObject
    return false;
  }



  var intersects = mouse_raycaster.intersectObjects(videocameraArr, true );



  var click_cam = null;
  // найдем камеру среди кликнутых объктов:
  if(intersects.length > 0 && active_camera !== intersects[ 0 ].object){
	if ('name' in intersects[ 0 ].object && intersects[ 0 ].object['userData'].is_camera === true ) {
		click_cam = intersects[ 0 ].object;
	}
  }

  if (!click_cam) {
	  for(var i = 0; i < intersects.length; i++)
	  {
		if (intersects[i].object && intersects[i].object.userData && intersects[i].object['userData'].is_camera === true)
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
			active_camera.parent.parent.worldToLocal(lPos.copy(wPos));

			//сдвиг осей камеры
			active_camera.parent.lookAt(new THREE.Vector3(active_camera.parent.position.x, lPos.y ,lPos.z));
			active_camera.parent.parent.lookAt(new THREE.Vector3(wPos.x, active_camera.parent.parent.position.y, wPos.z));

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
      self.textWidth = self.getTextWidth(self.message) * 1.0;
      self.fontheight = self.getFontHeight(self.context.font) * 1.0;
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
function noteCameraInfo()
{
  var self = this;
  noteMaker.apply(this, arguments);
  this.note_type = 'noteCameraInfo';

  this.getMessage = function(){
    var text = '';
    if(self.obj.userData.is_camera){
        if (window.opener) {
		    text += window.opener.i18next.t('cam_obj_3d') +  ' \n';
		    text += window.opener.i18next.t('cam_angle_3d') + ' ' + Math.ceil(THREE.Math.radToDeg(self.obj.angle)) + ' ' + window.opener.i18next.t('cam_angle_degrees_3d') + ' \n';
		    text += window.opener.i18next.t('cam_angle_vert_3d') + ' ' + self.getAngleVert() + '\n';
		    text += window.opener.i18next.t('cam_angle_hor_3d') + ' ' + self.getAngleGorizont() + '\n';
		    //text += window.opener.i18next.t('cam_level_3d') + Math.ceil(self.obj.getWorldPosition().y / self.obj.floor_scale) + '\n';
			text += window.opener.i18next.t('cam_level_3d') + (self.obj.getWorldPosition().y / self.obj.floor_scale - self.obj.userData.camera_props.camera_off_z).toFixed(2) + '\n';
		}
		else {
			text += "Объект: камера \n" ;
		    text += "Угол обзора: " + Math.ceil(THREE.Math.radToDeg(self.obj.angle)) + " градусов\n";
		    text += "Угол вертикальный: " + self.getAngleVert() + "\n";
		    text += "Угол горизонтальный: " + self.getAngleGorizont() + "\n";
		    //text += "Высота: " + Math.ceil(self.obj.getWorldPosition().y / self.obj.floor_scale) + "\n";
		    text += "Высота: " + (self.obj.getWorldPosition().y / self.obj.floor_scale - self.obj.userData.camera_props.camera_off_z).toFixed(2) + "\n";
		}

    }

    return text.split('\n');
  }

  this.getAngleVert = function(){

	/*
	var vector = self.obj.getWorldDirection().projectOnPlane (  new THREE.Vector3(1, 0, 0) )
    var inRad = self.obj.getWorldDirection().angleTo( vector );
//    return inRad;
    var inDeg = Math.ceil(THREE.Math.radToDeg(inRad));
	*/
    var vector = self.obj.getWorldDirection();
    var inDeg = parseFloat(THREE.Math.radToDeg(Math.acos(-vector.y)).toFixed(0));
    return inDeg;
  }

  this.getAngleGorizont = function(){
    /*
    var vector = self.obj.getWorldDirection().projectOnPlane (  new THREE.Vector3(0, 1, 0) )
    var inRad = self.obj.getWorldDirection().angleTo( vector );
//    return inRad;
    var inDeg = Math.ceil(THREE.Math.radToDeg(inRad));
	*/
    var vector = self.obj.getWorldDirection();
    var inDeg = parseFloat(THREE.Math.radToDeg(Math.atan2(vector.x,vector.z)).toFixed(0));
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

//Размеры камеры
function dimensionCameraAdd(obj, parameters){
  var dim = new dimension(obj, parameters);
}
function dimension(obj, parameters)
{
  var self = this;

  //this.obj = obj.parent.parent;
  this.obj = obj;
  this.note_type = 'dimension';
  this.ray_point = null;
  this.ray_distance = Infinity;
  this.gr = null; //группа размера
  this.line = null;//линия размера
  this.note = null;//примечание размера
  this.angle = null;

	if ( parameters === undefined ) parameters = {};
	this.type2 = parameters.hasOwnProperty("type") ? parameters["type"] : "front";
  this.relative_position = parameters.hasOwnProperty("relative_position") ? parameters["relative_position"] : 0.5;


  this.calculate = function()
  {
    //debugger;
    self.direction = self.obj.parent.parent.getWorldDirection();
    self.position = self.obj.getWorldPosition();
    self.ray_distance = Infinity;

    switch (self.type2) {
      case 'front':
        self.angle = new THREE.Euler( 0, 0, 0, 'XYZ' );
        break;
      case 'back':
        self.angle = new THREE.Euler( 0, Math.PI, 0, 'XYZ' );
        break;
      case 'left':
        self.angle = new THREE.Euler( 0, -Math.PI/2, 0, 'XYZ' );
        break;
      case 'right':
        self.angle = new THREE.Euler( 0, Math.PI/2, 0, 'XYZ' );
        break;
    }

    self.direction.applyEuler(self.angle);


    var raycaster = new THREE.Raycaster(self.position, self.direction.normalize(), 0, 10000 );


    var intersects = raycaster.intersectObjects( scene.children );

    for ( var i = 0; i < intersects.length; i++ ) {

      if(intersects[ i ].object.name == 'wall' && intersects[ i ].distance < self.ray_distance){

        self.ray_distance  = intersects[ i ].distance;
        self.ray_point = intersects[ i ].point;

      }

    }

  }

  this.setNotePosition = function()
  {
    self.note.rotation.x += -self.gr.getWorldRotation().x;
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

  }
  this.update = function()
  {
      self.calculate();

      self.line.setLength(self.ray_distance, 10);
      self.ray_distance = Math.ceil(self.ray_distance);

      if(self.ray_distance === Infinity){
        self.note.visible = false;
        self.line.visible = false;
      } else {
        self.note.visible = true;
        self.line.visible = true;
      }
	  if( self.ray_distance != Infinity)
	  {
		self.note.setMessage( (parseFloat(self.ray_distance) / self.obj.floor_scale).toFixed(2) );
	  }
	  else {
		self.note.setMessage(self.ray_distance.toString());
	  }
      self.setNotePosition();

	  self.note.update();
  }

  this.drawRayLine = function()
  {
    self.gr = new THREE.Group();
    self.gr.note_type = self.note_type;
    self.gr.update = function(){ return self.update();};
    self.obj.parent.parent.add(self.gr);

    var dim_direction = new THREE.Vector3(0,0,1);
    self.line = new THREE.ArrowHelper(  dim_direction.applyEuler(self.angle).normalize(), new THREE.Vector3(0,0,0), self.ray_distance, 'blue', 10);
    self.gr.add(self.line);

    self.ray_distance = Math.ceil(self.ray_distance);
    var note = self.ray_distance === Infinity ? "aaaaa" : self.ray_distance; //резерв 5 символов
    self.note = noteAdd(self.obj.parent.parent,note.toString());
    self.setNotePosition();

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

//Редактор стен
function initWallEditor(obj){

  var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;
	var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
  var frustumSize = 1000;

  var currentCamera;
  var currentWall = null; //стена над которой находится поинтер
  var intersectWalls = []; //стены под т-образное соединение

  obj.enabled = false;
  obj.plane = null;
  obj.lineHelper = null;
  obj.lineHelperGeometry = new THREE.Geometry();//хранилище точек линии хелпера
  obj.magnitVerticies = [];//массив точек для примагничивания
  obj.magnitVerticiesSphere = [];//массив сфер в точка для примагничивания
  obj.magnitValue = 10;
  obj.pointerHelper = null; //объект указателя
  obj.dashedLineArr = [];//массив пунктирных
  obj.lineHelperMaterial = new THREE.LineDashedMaterial( {
      color: 0x0000ff,
      dashSize: 10,
      gapSize: 3,
    } );
  obj.lineDashedMaterial = new THREE.LineDashedMaterial( {
      color: 'black',
      dashSize: 10,
      gapSize: 3,
    } );


  obj.walls = [];//массив установленных стен TODO - заполнить при инициализации редактора

  //временный параметр
  obj.wall_width = 10; //толщина стены по умолчанию


  obj.on = function(){
    obj.enabled = !obj.enabled;
    currentCamera = camera.clone();
    cameraAdd();
    planeHelperAdd();
    pointerHelperAdd();
    magnitVerticiesCreate();

  }
  obj.off = function(){
    obj.enabled = !obj.enabled;
    camera = currentCamera.clone();
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    currentCamera = null;
    scene.remove(obj.plane);
    scene.remove(obj.pointerHelper);
    delete obj.plane;
    delete obj.pointerHelper;
  }

  function cameraAdd(){
    camera = new THREE.OrthographicCamera(
                                          frustumSize * ASPECT / - 2,
                                          frustumSize * ASPECT / 2,
                                          frustumSize / 2,
                                          frustumSize / - 2,
                                          10,
                                          1000
                                        );
    camera.position.set(0, 500, 0);
    camera.lookAt(new THREE.Vector3(0,0,0));
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableRotate = false;
  }
  function planeHelperAdd(){
    var geometry = new THREE.PlaneBufferGeometry( 1000, 1000, 32 );
    var material = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.2,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      color: 'green'

    });
    obj.plane = new THREE.Mesh( geometry, material );
    obj.plane.rotateX(Math.PI/2);
    obj.plane.position.y = -5;

    scene.add( obj.plane );
  }
  function pointerHelperAdd(){
    var geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    obj.pointerHelper = new THREE.Mesh( geometry, material );
    scene.add( obj.pointerHelper );
  }
  //массив для примагничивания опорных точек
  function magnitVerticiesCreate(){

    //очистка
    obj.magnitVerticies = [];
    obj.magnitVerticiesSphere.forEach(function(item){
      scene.remove(item);
    })

    //наполнение массива точек
    scene.children.forEach(function(item, idx) {
      if(item.name == 'wall'){

        item.geometry.vertices.forEach(function(item2, idx) {
          obj.magnitVerticies.push(item2.clone().applyMatrix4(item.matrixWorld).projectOnPlane ( new THREE.Vector3(0,1,0) ));
        })

      }

      if(item.type == 'Wall'){

        item.geometry.vertices.forEach(function(item2, idx) {
          obj.magnitVerticies.push(item2.clone().projectOnPlane ( new THREE.Vector3(0,1,0) ));
        })

      }
    })


    //уникальные значения
      obj.magnitVerticies = obj.magnitVerticies.filter(function (elem, pos, arr) {
        var i = pos;
        while(i < obj.magnitVerticies.length-1){
          i++;
          if(arr[i].equals(elem)) return false;
        }
        return true;
      });


    //красная сфера для наглядности
    var material = new THREE.MeshBasicMaterial( {color: 'red'} );
    obj.magnitVerticies.forEach(function(item, idx) {
      var geometry = new THREE.SphereBufferGeometry( 3, 32, 32 );
      var mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = item.x;
      mesh.position.z = item.z;
      obj.magnitVerticiesSphere.push(mesh);
      scene.add(mesh);

    })


  }


  obj.updateWalls = function(){
    obj.walls.forEach(function( item, i, arr ){
      item.update( obj.walls );
    })
  }
  /*
   *
   * @param {Array} [Vector3, Vector3] vertices
   * @param {Object} params
   * @returns {type Mesh}
   */

  obj.wallAdd = function(vertices, params){
    var vertices = vertices;
    var params = params || {width: obj.wall_width};

    //проверка doubleclck и расстояние меньше половины ширины стены
    if(vertices && vertices[0].equals(vertices[1]) || vertices[0].distanceTo(vertices[1]) < params.width/2){
      window.console.warn("Неверные параметры для создания стены!");
      return false;
    }

    var wall = new Wall(vertices, params);
    if(wall){
      obj.walls.push(wall);
      wall.index = obj.walls.length - 1;

      scene.add(wall);

    //Обновляем состояние стен
    obj.updateWalls();

    } else {
      window.console.warn("Ошибка при создании стены!");
      return false;
    }
    

    setTimeout(function(){
      magnitVerticiesCreate(); //пересоздание магнитных точек
    },200)


  }
  function changeIntersectWalls (){
    var wall = null;

    intersectWalls.forEach(function( item, i ){
      if( item.wall && (item.wall.v1.distanceTo(item.point) > item.wall.width/2 && item.wall.v2.distanceTo(item.point) > item.wall.width/2) ){

        wall = item.wall;

        var vertices1 = [item.wall.v1, item.point];
        var vertices2 = [item.point, item.wall.v2];
        var params = {width: item.wall.width, heigth: item.wall.heigth};

        delete obj.walls[item.wall.index];
        scene.remove(item.wall);
        item.wall = null;

        obj.wallAdd(vertices1, params);
        obj.wallAdd(vertices2, params);
//        setTimeout(function(){
//
//        }, 200);
        
      }
    })


  }

  //добавление точки для построения линии по кликам
  obj.lineHelperPointAdd = function( isMove ) {
    var isMove = isMove || false;//false при клике мыши; true - при движении курсора
    var isClick = !isMove;
    var point = obj.pointerHelper.position.clone();

    //текущая стена при совпадении с одной из крайних точек
    if( currentWall && (currentWall.v1.equals(obj.pointerHelper.position) || currentWall.v2.equals(obj.pointerHelper.position)) ){
      currentWall = null;
    }

    switch (obj.lineHelperGeometry.vertices.length) {
      case 0:
        if(isClick){
          obj.lineHelperGeometry.vertices[0] = point;
          intersectWalls[0] = {wall:currentWall, point:point};
          obj.magnitVerticies.push(point);//для примагничивания
        }
        break;
      case 1:
        obj.lineHelperGeometry.vertices.push(point);
        if(currentWall !== intersectWalls[0].wall)
        intersectWalls.push({wall:currentWall, point:point});
        break;
      case 2:
        if(isMove){
          obj.lineHelperGeometry.vertices[1] = point;
        } else {
          obj.lineHelperGeometry.vertices = [];
          obj.lineHelperGeometry.vertices.push(point);

          intersectWalls = [];
          intersectWalls.push({wall:currentWall, point:point});
        }
        break;
    }

    

  }
  obj.lineHelperAdd = function(isMove){
    var isMove = isMove || false;//false при клике мыши; true - при движении курсора
    var isClick = !isMove;

    if(obj.lineHelperGeometry.vertices.length == 2){

      //Добавленеи линии хелпера
      if( obj.lineHelper ){
        obj.lineHelper.material.visible = true;
        obj.lineHelper.geometry = obj.lineHelperGeometry.clone();
      } else {
        obj.lineHelper = new THREE.Line(obj.lineHelperGeometry.clone(), obj.lineHelperMaterial);
      }

      //если клик
      if(isClick){
        obj.wallAdd(obj.lineHelperGeometry.vertices);
        changeIntersectWalls();

        //очистка
        obj.lineHelperGeometry.vertices = [];
        intersectWalls = [];
        //установка следующей точки
        obj.lineHelperPointAdd();
      } else {

        obj.lineHelperGeometry.vertices.length = 1;

        intersectWalls.length = 1;
      }

      obj.lineHelper.geometry.computeLineDistances();
      scene.add(obj.lineHelper);
    }
  }
  obj.lineHelperRemove = function(){
    if(obj.lineHelper)
    obj.lineHelper.material.visible = false;
  }

  obj.reset = function(){
    obj.lineHelperGeometry.vertices = [];
    intersectWalls = [];
    currentWall = null;
    obj.lineHelperRemove();
    obj.dashedLineRemoveAll();
  }

  obj.dashedLineAdd = function(start, end){

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(start.x, 1, start.z));
    geometry.vertices.push(new THREE.Vector3(end.x, 1, end.z));

    var line = new THREE.Line(geometry, obj.lineDashedMaterial);
    geometry.computeLineDistances();
    obj.dashedLineArr.push(line);
    scene.add(line);
  }
  obj.dashedLineRemoveAll = function(){
    for(var key in obj.dashedLineArr){
      scene.remove(obj.dashedLineArr[key]);
    }
    obj.dashedLineArr.length = 0;
  }
  
  obj.getMagnitObject = function (point){

    var result = {};
    result.distanceX = Infinity ;
    result.distanceZ = Infinity ;
    result.distanceToWallAxis = Infinity ;
    result.distanceToStart = Infinity;
    result.distanceToEnd = Infinity;

    //проход по массиву опорных точек
    //(при использовании стен построенных в редакторе
    //проверка будет осуществляться в массиве стен )
    if(obj.magnitVerticies.length){
      obj.magnitVerticies.forEach(function(item, i, arr) {

        var distanceX = Math.abs((item.x) - (point.x));
        var distanceZ = Math.abs((item.z) - (point.z));

        if(result.distanceX > distanceX){
          result.distanceX = distanceX;
          result.itemX = item;
        }

        if(result.distanceZ > distanceZ){
          result.distanceZ = distanceZ;
          result.itemZ = item;
        }
      });
    }

    //проход по массиву стен
    obj.walls.forEach(function(wall, i, arr) {
      var clampToLine = true;
      var pointOnAxis = wall.axisLine.closestPointToPoint ( point, clampToLine )
      var distanceToWallAxis = pointOnAxis.distanceTo ( point );

      if(result.distanceToWallAxis > distanceToWallAxis){
          result.distanceToWallAxis = distanceToWallAxis;
          result.itemOnWallAxis = pointOnAxis;
          result.wall = wall;
          result.distanceToStart = pointOnAxis.distanceTo ( wall.axisLine.start );;
          result.distanceToEnd = pointOnAxis.distanceTo ( wall.axisLine.end );;
        }
    })

    return result;
  }

  /*===================*/
  document.addEventListener( 'mousedown', onDocumentMouseDownWallEditor, false );
  document.addEventListener( 'mousemove', onDocumentMouseMoveWallEditor, false );
  document.addEventListener( 'keydown', onKeyDownWallEditor, false );

  function onDocumentMouseDownWallEditor( event ){
    if (!obj.enabled)
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    switch (event.which) {
      case 1: //ЛКМ
        var mouse_raycaster = new THREE.Raycaster();
        mouse_raycaster.setFromCamera( mouse, camera );

        var intersectObjects = mouse_raycaster.intersectObject(obj.plane)
        if(intersectObjects.length > 0){
          obj.lineHelperPointAdd();
          obj.lineHelperAdd();
        }
        break;

      case 3: //ПКМ
        obj.reset();
        break;
    }
    

   

  }
  function onDocumentMouseMoveWallEditor(event){
    currentWall = null;//стена над которой находится поинтер

    if (!obj.enabled)
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    var mouse_raycaster = new THREE.Raycaster();
    mouse_raycaster.setFromCamera( mouse, camera );

    var intersectObjects = mouse_raycaster.intersectObject(obj.plane);
    if(intersectObjects.length > 0){
      obj.lineHelperPointAdd( true );

      obj.lineHelperRemove();
      obj.lineHelperAdd(true);

      //удаляем пунктирные
      obj.dashedLineRemoveAll();

      //позиционирование хелпера
      var magnitObject = obj.getMagnitObject(intersectObjects[0].point);
      obj.pointerHelper.position.x = intersectObjects[0].point.x;
      obj.pointerHelper.position.z = intersectObjects[0].point.z;

      

      //позиционирование хелпера указателя к точкам
      if(magnitObject.distanceX < obj.magnitValue){
        obj.pointerHelper.position.x = magnitObject.itemX.x;
        obj.dashedLineAdd(obj.pointerHelper.position.clone(), magnitObject.itemX);
        currentWall = null;
      }

      if(magnitObject.distanceZ < obj.magnitValue){
        obj.pointerHelper.position.z = magnitObject.itemZ.z;
        obj.dashedLineAdd(obj.pointerHelper.position.clone(), magnitObject.itemZ);
        currentWall = null;
      }

   

      //позиционирование хелпера указателя к осевой
      if(magnitObject.distanceToWallAxis < obj.magnitValue){

        obj.pointerHelper.position.x = magnitObject.itemOnWallAxis.x;
        obj.pointerHelper.position.z = magnitObject.itemOnWallAxis.z;
        currentWall = magnitObject.wall;//стена над которой находится поинтер

        var ray = new THREE.Ray(magnitObject.wall.v1, magnitObject.wall.direction);
        var  optionalPointOnSegment = new THREE.Vector3();
        var  optionalPointOnRay = new THREE.Vector3();

        //позиционирование при смешанном совпадении
        if(magnitObject.distanceZ < obj.magnitValue  && 
           magnitObject.distanceZ < 2 * magnitObject.distanceToWallAxis &&
           magnitObject.wall.direction.clone().cross(new THREE.Vector3(1,0,0)).length()){

          ray.distanceSqToSegment (
              new THREE.Vector3(-10000,0,magnitObject.itemZ.z),
              new THREE.Vector3( 10000,0,magnitObject.itemZ.z),
              optionalPointOnRay,
              optionalPointOnSegment );

          if( optionalPointOnRay && Math.abs(optionalPointOnRay.x) != 10000 ){
            obj.pointerHelper.position.x =  optionalPointOnRay.x;
            obj.pointerHelper.position.z = optionalPointOnRay.z;
//            currentWall = magnitObject.wall;//стена над которой находится поинтер
          }

        }
        //позиционирование при смешанном совпадении
        if(magnitObject.distanceX < obj.magnitValue  && 
           magnitObject.distanceX < 2 * magnitObject.distanceToWallAxis &&
           magnitObject.wall.direction.clone().cross(new THREE.Vector3(0,0,1)).length()){

          ray.distanceSqToSegment ( 
              new THREE.Vector3(magnitObject.itemX.x,0,-10000),
              new THREE.Vector3(magnitObject.itemX.x,0, 10000),
              optionalPointOnRay,
              optionalPointOnSegment );

          if( optionalPointOnRay && Math.abs(optionalPointOnRay.z) != 10000){
            obj.pointerHelper.position.x = optionalPointOnRay.x;
            obj.pointerHelper.position.z = optionalPointOnRay.z;
//            currentWall = magnitObject.wall;//стена над которой находится поинтер
          }

        }

        

      }



    }


  }
  function onKeyDownWallEditor ( event ){
    if (!obj.enabled)
      return false;
//    event.preventDefault();

    switch( event.keyCode ) {
      case 46: /*del*/
      case 27: /*esc*/

        break;
      case 49: /*1*/
        obj.wall_width = 10;
        break;
      case 50: /*2*/
        obj.wall_width = 20;
        break;
      case 51: /*3*/
        obj.wall_width = 30;
        break;
      case 52: /*4*/
        obj.wall_width = 40;
        break;
      case 53: /*5*/
        obj.wall_width = 50;
        break;
    }
  }

}
$wallEditor = {};
initWallEditor($wallEditor);

//Проекция
function initProjection(obj){
  var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;
	var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
  var frustumSize = 1000;
  var currentCamera;

  var current_dim = null;

  obj.enabled = false;
  obj.dim_mode_enabled = false; //возможно будут еще режимы
  obj.wallEditor_mode_enabled = false; //возможно будут еще режимы
  obj.type = false;
  obj.plane = null;
  obj.planeMousePoint; //точка пересечения луча с плоскостью
  obj.currentEdge = {};
  obj.currentEdge.material = {};
  obj.currentPoint = {}
  obj.currentPoint.material = {};
  obj.selected1 = null;
  obj.selected2 = null;
  
  obj.on = function(type){
    obj.enabled = !obj.enabled;
    currentCamera = camera.clone();
    obj.type = type || 'top';
    obj.cameraAdd();
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableRotate = false;

    obj.planeHelperAdd();

  }
  obj.off = function(){
    obj.enabled = !obj.enabled;
    camera = currentCamera.clone();
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    currentCamera = null;   
//    scene.remove(obj.plane);
    delete obj.plane;

    Dimensions.visible = false;


  }
  obj.cameraAdd = function(){
    camera = new THREE.OrthographicCamera(
                                          frustumSize * ASPECT / - 2,
                                          frustumSize * ASPECT / 2,
                                          frustumSize / 2,
                                          frustumSize / - 2,
                                          10,
                                          10000
                                        );

    switch (obj.type) {
      case 'top':
        camera.position.set(0, 300, 0);
        break;
      case 'left':
        camera.position.set(-300, 0, 0);
        break;
      case 'right':
        camera.position.set(300, 0, 0);
        break;
    }

    camera.lookAt(new THREE.Vector3(0,0,0));



  }
  obj.planeHelperAdd = function(){
    var geometry = new THREE.PlaneGeometry( 1000, 1000, 32 );
    obj.plane = new THREE.Mesh( geometry );
    obj.plane.rotateX(-Math.PI/2);
    obj.plane.translateZ (-100);
    scene.add( obj.plane );
  }

  obj.edgesAdd = function(){

    scene.traverse(function(item, idx) {
      if(item.name == 'wall'){
        var edges = new THREE.EdgesGeometry( item.geometry );
        var positions = edges.attributes.position.array;
        for(var i = 0; i < positions.length;i+=2)
        {
          var material = new THREE.LineBasicMaterial({
            color: 'red',
            visible: false
          });
          var geometry = new THREE.Geometry();
          geometry.vertices.push(
            new THREE.Vector3().fromArray(positions,i*3),
            new THREE.Vector3().fromArray(positions,i*3+3)
          );
          var line = new THREE.Line( geometry, material );
          line.applyMatrix(item.matrixWorld);
          scene.add( line );
        }
      }
    })
  }
  obj.pointsAdd = function(){
    var geometry = new THREE.SphereGeometry( 3 );
		obj.currentPointMaterial = new THREE.MeshBasicMaterial( { color: 'red', visible: false } );
		obj.currentPoint = new THREE.Mesh( geometry, obj.currentPointMaterial );
    scene.add( obj.currentPoint );

    scene.traverse(function(item, idx) {
      if(item.name == 'wall'){

          var material2 = new THREE.PointsMaterial({
            color: 'red',
            opacity: 0.1,
            visible: false
          });
          var points = new THREE.Points( item.geometry, material2 );
          points.applyMatrix(item.matrixWorld);
          scene.add( points );

      }
    })
  }
  obj.dimensionAdd = function(){

    var param1 = null;
    var param2 = null;

    if(obj.selected1)
    param1 = obj.selected1.isLine ? obj.selected1 : obj.selected1.position
    if(obj.selected2)
    param2 = obj.selected2.isLine ? obj.selected2 : obj.selected2.position
     
    current_dim = new Dimension(param1, param2, obj.plane);

  }
  obj.setSelected = function(selectObj){

    var selected = selectObj.clone();
    selected.geometry = selectObj.geometry.clone();
    selected.material = selectObj.material.clone();
    selected.position.copy(selectObj.getWorldPosition())

    if( ! obj.selected1 || (obj.selected1 && obj.selected2)){
      scene.remove(obj.selected1,obj.selected2);
        obj.selected1 = obj.selected2 = null;
        obj.selected1 = selected;
      scene.add(selected);

      if(selected.isLine){
        obj.dimensionAdd();
      }
      return;
    }
    if( ! obj.selected2 ){
      obj.selected2 = selected;
      scene.add(selected);

      if(current_dim && current_dim.enabled == true){
        current_dim.remove();
      }
      obj.dimensionAdd();
    
      scene.remove(obj.selected1,obj.selected2);
      current_dim = null;
      return;
    }
  }

  /*===================*/
  document.addEventListener( 'mousedown', onDocumentMouseDownProjection, false );
  document.addEventListener( 'mousemove', onDocumentMouseMoveProjection, false );
  document.addEventListener( 'keydown', onKeyDownProjection, false );
  document.addEventListener( 'keyup', onKeyUpProjection, false );

  function onDocumentMouseDownProjection( event ){
    if (!obj.enabled)
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    if(obj.dim_mode_enabled){
      dimModeMouseDown();
    }

  }
  function onDocumentMouseMoveProjection(event){
    if (!obj.enabled)
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    if(obj.dim_mode_enabled){
      dimModeMouseMove();
    }

  }
  function onKeyDownProjection ( event ){
    if (!obj.enabled)
      return false;
//    event.preventDefault();

    switch( event.keyCode ) {
      case 27: /*esc*/
        scene.remove(obj.selected1,obj.selected2);
        break;
      case 68: /*d*/
        if(alt){
          dimModeSwitch();
        }
        break; 
    }
  }
  function onKeyUpProjection ( event ){
  if (!obj.enabled)
        return false;
//      event.preventDefault();
    }

  function dimModeSwitch(){
    obj.dim_mode_enabled = !obj.dim_mode_enabled;

    if(obj.dim_mode_enabled ){
      //ребра
      obj.edgesAdd();
      //узлы
      obj.pointsAdd();
      //размеры
      Dimensions.visible = true;
    } else {

      //TODO obj.edgesRemove();
      //TODO obj.pointsRemove();
      Dimensions.visible = false;
    }


  }
  function dimModeMouseDown(){

    if( obj.currentEdge.material.visible ){
      obj.setSelected( obj.currentEdge );
    } else if(obj.currentPoint.material.visible){
      obj.setSelected( obj.currentPoint );
    }else {
      scene.remove(obj.selected1,obj.selected2);
    }


    //возможность перемещать размер
    var mouse_raycaster = new THREE.Raycaster();
    mouse_raycaster.setFromCamera( mouse, camera );
    var intersectObjects = mouse_raycaster.intersectObjects(Dimensions.children);
    if(intersectObjects.length > 0){
      if(intersectObjects[0].object.name == 'dimensionBoundingSphere'){
        intersectObjects[0].object.dimension.enabled = true;
        intersectObjects[0].object.dimension.ready = false;
      }
    }
  }
  function dimModeMouseMove(){

    var mouse_raycaster = new THREE.Raycaster();
    mouse_raycaster.setFromCamera( mouse, camera );

    mouse_raycaster.linePrecision = 3;
    mouse_raycaster.params = {Points: { threshold: 5 }};

    var intersectObjects = mouse_raycaster.intersectObjects(scene.children);
    if(intersectObjects.length > 0){

      obj.currentEdge.material.visible = false;
      obj.currentPoint.material.visible = false;

      //определение линии
      if(intersectObjects[ 0 ].object.isLine ){
        intersectObjects[ 0 ].object.material.visible = true;
        obj.currentEdge = intersectObjects[ 0 ].object;
      } else {
        obj.currentEdge.material.visible = false;
      }

      //определение точки
      if(intersectObjects[ 0 ].object.isPoints ){

        //Найти ближайшую точку на объекте, установить позицию
        var distance = Infinity;
        var position = intersectObjects[ 0 ].point;
        intersectObjects[ 0 ].object.geometry.vertices.forEach(function(item, i, arr){
          var point = item.clone().applyMatrix4(intersectObjects[ 0 ].object.matrixWorld)
          var clculate_distance = point.distanceTo(intersectObjects[ 0 ].point)
          if(clculate_distance < distance){
            distance = clculate_distance;
            position = point;
          }
        });

        obj.currentPoint.position.copy(position);

        obj.currentPoint.material.visible = true;
      } else {
        obj.currentPoint.material.visible = false;
        obj.currentPoint.position.set(0,0,0)
      }

    }
  }
}
$projection = {};
initProjection($projection);

//Размеры проекции
/*
 * @param1 - vector3 | line
 * @param1 - vector3 | line
 */
function Dimension(param1, param2, plane){
  THREE.Group.call( this );

  this.enabled = true;
  this.ready = false;
  this.type = 'dimension';
  this.dim_type = '';
  this.planeNormal
  this.dimLine = null;

  var point1 = null;
  var point2 = null;
  var direction = null;
  var plane = plane || null;
  var planeMousePoint = new THREE.Vector3();
  var raycaster = new THREE.Raycaster();
  
  var self = this;
  self.arguments = arguments;

  function defineDimType(){
    if(self.arguments.length > 0)
    for( var key = 0;key < 2; key++ ){
      if(self.arguments[key] && self.arguments[key].isVector3)
        self.dim_type +='P';
      if(self.arguments[key] && self.arguments[key].isLine)
        self.dim_type +='L';
    }
  }
  function setPlaneNormal(){
    if(plane){
      planeNormal = plane.geometry.faces[0].normal.clone();
      planeNormal.applyMatrix4(plane.matrixWorld).round();
    }
  }
  function definePoints(){
    switch (self.dim_type) {
      case 'LP':
        point1 = getLineCenter(  self.arguments[0].geometry.vertices[0].clone().applyMatrix4(self.arguments[0].matrixWorld),
                                      self.arguments[0].geometry.vertices[1].clone().applyMatrix4(self.arguments[0].matrixWorld)
                                      );
        direction = getDirection(  self.arguments[0].geometry.vertices[0].clone().applyMatrix4(self.arguments[0].matrixWorld),
                                        self.arguments[0].geometry.vertices[1].clone().applyMatrix4(self.arguments[0].matrixWorld)
                                     );

        point2 = self.arguments[1];
        break;
      case 'PL':
        point1 = getLineCenter(  self.arguments[1].geometry.vertices[0].clone().applyMatrix4(self.arguments[1].matrixWorld),
                                      self.arguments[1].geometry.vertices[1].clone().applyMatrix4(self.arguments[1].matrixWorld)
                                    );
        direction = getDirection(  self.arguments[1].geometry.vertices[0].clone().applyMatrix4(self.arguments[1].matrixWorld),
                                        self.arguments[1].geometry.vertices[1].clone().applyMatrix4(self.arguments[1].matrixWorld)
                                      );

        point2 = self.arguments[0];
        break;
      case 'PP':
        point1 = self.arguments[0];
        point2 = self.arguments[1];
        direction = getDirectionPP(point1, point2);
        break;
      case 'L':
        point1 = self.arguments[0].geometry.vertices[0].clone().applyMatrix4(self.arguments[0].matrixWorld);
        point2 = self.arguments[0].geometry.vertices[1].clone().applyMatrix4(self.arguments[0].matrixWorld);
        direction = getDirectionPP(point1, point2);
        break;
      default:
        console.warn("Данные некорректны");
        self.enabled = false;
        break;
    }
  }
  function projectOnPlane(){
    if(planeNormal){
      point1.projectOnPlane(planeNormal);
      point2.projectOnPlane(planeNormal);
      direction.projectOnPlane(planeNormal).normalize();
    }
  }

  function init(){
    defineDimType();
    setPlaneNormal();
    definePoints()
    if(self.enabled)
    projectOnPlane();
  }

  function getLineCenter(start, end){
    var result = new THREE.Vector3();
		return result.addVectors( start, end ).multiplyScalar( 0.5 );
  }
  function getDirection(start, end){
    var result = new THREE.Vector3();
		return result.subVectors( end, start );
  }
  function getDirectionPP(p1, p2){

    var result = new THREE.Vector3();

    result.z = planeMousePoint.x > p1.x && planeMousePoint.x < p2.x ? 1 : 0;
    if(result.z) return result;
    result.z = planeMousePoint.x > p2.x && planeMousePoint.x < p1.x ? 1 : 0;
    if(result.z) return result;

    result.y = planeMousePoint.y > p1.y && planeMousePoint.y < p2.y ? 1 : 0;
    if(result.y) return result;
    result.y = planeMousePoint.y > p2.y && planeMousePoint.y < p1.y ? 1 : 0;
    if(result.y) return result;

    result.x = planeMousePoint.z > p1.z && planeMousePoint.z < p2.z ? 1 : 0;
    if(result.x) return result;
    result.x = planeMousePoint.z > p2.z && planeMousePoint.z < p1.z ? 1 : 0;
    if(result.x) return result;

    var d = getDirection(p1, p2);
    var dx = d.x;
    var dz = d.z;
    d.x = dz;
    d.z = -dx;

    result = d;
    return result.projectOnPlane(planeNormal).normalize();

  }
  
  function drawExtline(){
    var m = planeMousePoint;
    var p1_start = point1;
    var p2_start = point2;
    var p1_end, p2_end;

    if (self.dim_type == 'PP' || self.dim_type == 'L'){
      direction = getDirectionPP(point1, point2);
    }

    var n = direction.clone();
    
    var l_m =        m.clone().projectOnVector( n );
    var l1  = p1_start.clone().projectOnVector( n );
    var l2  = p2_start.clone().projectOnVector( n );

    var point_var1 = new THREE.Vector3().addVectors(p1_start, n.clone().multiplyScalar(l_m.distanceTo ( l1 )));
    var point_var2 = new THREE.Vector3().addVectors(p1_start, n.clone().negate().multiplyScalar(l_m.distanceTo ( l1 )));
    m.distanceTo(point_var1) < m.distanceTo(point_var2) ? p1_end = point_var1.clone(): p1_end = point_var2.clone()

    var point_var1 = new THREE.Vector3().addVectors(p2_start, n.clone().multiplyScalar(l_m.distanceTo ( l2 )));
    var point_var2 = new THREE.Vector3().addVectors(p2_start, n.clone().negate().multiplyScalar(l_m.distanceTo ( l2 )));
    m.distanceTo(point_var1) < m.distanceTo(point_var2) ? p2_end = point_var1.clone(): p2_end = point_var2.clone()


    var material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    var geometry1 = new THREE.Geometry();
    geometry1.vertices.push( p1_start, p1_end );

    var geometry2 = new THREE.Geometry();
    geometry2.vertices.push( p2_start, p2_end );

    Dimensions.remove(self.ln1, self.ln2);
      self.ln1 = new THREE.Line( geometry1, material );
      self.ln2 = new THREE.Line( geometry2, material );
    Dimensions.add(self.ln1, self.ln2);

    self.dimLine = new THREE.Line3(p1_end, p2_end)
    
  };
  function drawDimline(){

    Dimensions.remove(self.line_part1, self.line_part2, self.note );
      self.line_part1 = new THREE.ArrowHelper( self.dimLine.delta().normalize(), self.dimLine.getCenter(), self.dimLine.distance()/2, 'blue', 10 );
      self.line_part2 = new THREE.ArrowHelper( self.dimLine.delta().normalize().negate(), self.dimLine.getCenter(), self.dimLine.distance()/2, 'blue', 10 );

      //примечание (текст размера)
      var geometry = new THREE.SphereGeometry( 5, 32, 32 );
      var material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0} );
      self.note = new THREE.Mesh( geometry, material );
      self.note.name = 'dimensionBoundingSphere';

      //спрайт текста
      noteAdd(self.note,self.dimLine.distance().toFixed(2));
      self.note.position.copy(self.dimLine.getCenter().clone());
      self.note.dimension = self;
    Dimensions.add(self.line_part1, self.line_part2, self.note );

    self.ready = true;
  }

  this.update = function(){
    drawExtline();
    drawDimline();
  }
  this.remove = function(){
    Dimensions.remove(self.ln1, self.ln2);
    Dimensions.remove(self.line_part1, self.line_part2, self.note);
    self.enabled = false;
  }

 
  
  /*=Interaction==================*/
  document.addEventListener( 'mousedown', onDocumentMouseDownDimension, false );
  document.addEventListener( 'mousemove', onDocumentMouseMoveDimension, false );
  document.addEventListener( 'keydown', onKeyDownDimension, false );
  document.addEventListener( 'keyup', onKeyUpDimension, false );

  function onDocumentMouseDownDimension( event ){
    if (!self.enabled)
      return false;
    event.preventDefault();

    mouse.x =   ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    if(self.ready){
      self.enabled = false;
    }

  }
  function onDocumentMouseMoveDimension(event){

    if (!self.enabled)
      return false;
    event.preventDefault();

    mouse.x =   ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersectPointsOnPlane = [];
    plane.raycast(raycaster,intersectPointsOnPlane )
    if(intersectPointsOnPlane.length > 0){
      planeMousePoint = intersectPointsOnPlane[0].point;
    }

    self.update();
  }
  function onKeyDownDimension ( event ){
    if (!self.enabled)
      return false;
//    event.preventDefault();
    switch( event.keyCode ) {
      case 46: /*del*/
      case 27: /*esc*/
        self.remove();
        break;
    }
  }
  function onKeyUpDimension ( event ){
  if (!self.enabled)
        return false;
//      event.preventDefault();
    }
  /*=Interaction==================*/

  return  init();
}

//Объект стены
function Wall(vertices, parameters){
    THREE.Object3D.call( this );
    if ( parameters === undefined ) parameters = {};
    this.type = 'Wall';
    this.name = 'wall';
    this.index = '';//присваивается в редакторе
    var self = this;


    this.width = parameters.hasOwnProperty("width") ? parameters["width"] : 10;
    this.height = parameters.hasOwnProperty("height") ? parameters["height"] : 150;
    this.v1 = vertices[0].round ();
    this.v2 = vertices[1].round ();

    this.axisLine = new THREE.Line3(this.v1,this.v2);
    this.direction = this.axisLine.delta().normalize();
    this.direction90 = new THREE.Vector3( this.direction.z, 0 , -this.direction.x );
    this.axisLength = this.axisLine.distance();

    this.v11 = parameters.hasOwnProperty("v11") ? parameters["v11"] : this.v1.clone().add( this.direction90.clone().multiplyScalar(this.width/2) );
    this.v12 = parameters.hasOwnProperty("v12") ? parameters["v12"] : this.v1.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) );
    this.v21 = parameters.hasOwnProperty("v21") ? parameters["v21"] : this.v2.clone().add( this.direction90.clone().multiplyScalar(this.width/2) );
    this.v22 = parameters.hasOwnProperty("v22") ? parameters["v22"] : this.v2.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) );

    //используется для примагничивания
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push( this.v1 );
    this.geometry.vertices.push( this.v2 );

    var geometry = this.geometryBuild();
    
    var material_1 = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      color: 'gray'
    });
    var material_2 = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false
    });


    this.mesh = new THREE.Mesh(geometry);
    this.mesh.material.transparent = true;
    this.mesh.material.opacity = 0.8;

    

    //    this.mesh = new THREE.Mesh(geometry, material_1);
    this.mesh.name = 'wall';
    this.mesh.rotation.x = Math.PI/2;
    this.mesh.translateZ( -self.height );



    this.add(this.mesh);
    this.mesh.geometry.verticesNeedUpdate = true;

//    return mesh;

}

Wall.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {
  constructor: Wall,

  geometryBuild: function(){
    var wallShape = new THREE.Shape();
				wallShape.moveTo( this.v1.x, this.v1.z );
				wallShape.lineTo( this.v11.x, this.v11.z );
				wallShape.lineTo( this.v21.x, this.v21.z );
        wallShape.lineTo( this.v2.x, this.v2.z );
				wallShape.lineTo( this.v22.x, this.v22.z );
        wallShape.lineTo( this.v12.x, this.v12.z );
        wallShape.lineTo( this.v1.x, this.v1.z );

    var extrudeSettings = {
      amount: this.height,
      bevelEnabled: false
    };
    try{
      var geometry = new THREE.ExtrudeGeometry( wallShape, extrudeSettings );
    } catch (e){
      return null;
    }
    return geometry;
  },
  getV22: function (walls){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = -Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();

    var target = null;
    var target_foundation = null;
    var self = this;

    walls.forEach(function(item, i){
      if(self.index != i){
        if(self.v2.equals(item.v1)){

          var angle = self.direction.angleTo(item.direction) ;
          var cross = self.direction.clone().cross(item.direction).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v22;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v12};
          }
        }

        if(self.v2.equals(item.v2)){

          var angle = self.direction.angleTo( item.direction.clone().negate() ) ;
          var cross = self.direction.clone().cross( item.direction.clone().negate() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v11;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v21};
          } 
        }
      }

    })

    //при разнице оснований и угол меньше 45 примыкание к основанию
    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;

    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;

    }
    //пересечение
    if(angle_max > -Math.PI && angle_max != 0){
      var ray = new THREE.Ray(self.v12, self.direction);

      ray.distanceSqToSegment ( segment_start, segment_end, result_point );
//
//      var material_ray = new THREE.LineBasicMaterial({ color: 'red' });
//      var material = new THREE.LineBasicMaterial({ color: 'blue' });
//
//      var geometry_ray = new THREE.Geometry();
//      geometry_ray.vertices.push(self.v12);
//      geometry_ray.vertices.push(self.v12.clone().add( self.direction.clone().multiplyScalar(200) ));
//
//      var geometry = new THREE.Geometry();
//      geometry.vertices.push( segment_start );
//      geometry.vertices.push( segment_end );
//
//      var line_ray = new THREE.Line(geometry_ray, material_ray);
//      var line = new THREE.Line(geometry, material);
//      scene.add(line_ray, line);

    }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  getV21: function (walls){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();

    var target = null;
    var target_foundation = null;
    var self = this;

    walls.forEach(function(item, i){
      if(self.index != i){
        if(self.v2.equals(item.v1)){

          var angle = self.direction.angleTo(item.direction) ;
          var cross = self.direction.clone().cross(item.direction).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v21;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v11};
          }
        }

        if(self.v2.equals(item.v2)){

          var angle = self.direction.angleTo( item.direction.clone().negate() ) ;
          var cross = self.direction.clone().cross( item.direction.clone().negate() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v12;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v22};
          }
        }
      }

    })


    //при разнице оснований и угол меньше 45 примыкание к основанию
    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){
      
      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;
      
    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;

    }
    //пересечение
    if(angle_max < Math.PI && angle_max != 0){

      var ray = new THREE.Ray(self.v11, self.direction);
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  getV12: function (walls){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();

    var target = null;
    var target_foundation = null;
    var self = this;

    walls.forEach(function(item, i){
      if(self.index != i){
        if(self.v1.equals(item.v2)){

          var angle = self.direction.clone().negate().angleTo(item.direction.clone().negate()) ;
          var cross = self.direction.clone().negate().cross(item.direction.clone().negate()).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v12;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v22};
          }
        }

        if(self.v1.equals(item.v1)){

          var angle = self.direction.clone().negate().angleTo( item.direction.clone() ) ;
          var cross = self.direction.clone().negate().cross( item.direction.clone() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v21;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v11};
          }
        }
      }

    })

    //при разнице оснований и угол меньше 45 примыкание к основанию
    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;

    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;

    }
    //пересечение
    if(angle_max < Math.PI && angle_max != 0){

      var ray = new THREE.Ray(self.v22, self.direction.clone().negate());
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  getV11: function (walls){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = -Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();
    
    var target = null;
    var target_foundation = null;;
    var self = this;

    walls.forEach(function(item, i){
      if(self.index != i){
        if(self.v1.equals(item.v2)){

          var angle = self.direction.clone().negate().angleTo(item.direction.clone().negate()) ;
          var cross = self.direction.clone().negate().cross(item.direction.clone().negate()).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v11;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v21};
          }
        }

        if(self.v1.equals(item.v1)){

          var angle = self.direction.clone().negate().angleTo( item.direction.clone() ) ;
          var cross = self.direction.clone().negate().cross( item.direction.clone() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v22;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v12};
          }
        }
      }

    })

    //при разнице оснований и угол меньше 45 примыкание к основанию
    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;
      
    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;

    }
    //пересечение
    if(angle_max > -Math.PI && angle_max != 0){
      
      var ray = new THREE.Ray(self.v21, self.direction.clone().negate());
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  //перерасчет при изменении толщины стены
  recalculatePoints: function (){
    this.v11 = this.v1.clone().add( this.direction90.clone().multiplyScalar(this.width/2) );
    this.v12 = this.v1.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) );
    this.v21 = this.v2.clone().add( this.direction90.clone().multiplyScalar(this.width/2) );
    this.v22 = this.v2.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) );
  },

  update: function(walls){
    var walls = walls || [];
      //если изменилась ширина
      this.recalculatePoints();

      var v11 = this.getV11(walls);
      var v12 = this.getV12(walls);
      var v21 = this.getV21(walls);
      var v22 = this.getV22(walls);
      this.v11 = v11 ? v11 : this.v11 ;
      this.v12 = v12 ? v12 : this.v12 ;
      this.v21 = v21 ? v21 : this.v21 ;
      this.v22 = v22 ? v22 : this.v22 ;

      var new_geometry = this.geometryBuild();
      if(new_geometry){
        this.mesh.geometry = new_geometry;
      }
      
  }


});
