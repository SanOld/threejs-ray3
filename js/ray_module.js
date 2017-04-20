

/* global this */

//=== to addCameraRay
var Dimensions = new THREE.Object3D(0,3000,0); //объект хранилище размеров
var Areas = new THREE.Object3D(0,3000,0); //объект хранилище размеров площадей
var videocameraArr = [];
var videocameraName = 'videocamera';
var active_camera = null;

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
var wallControlPointMaterial = new THREE.MeshBasicMaterial({
  wireframe: false,
  opacity: 0.3,
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  color: 'red'
});
var wallControlPointMaterial_hover = new THREE.MeshBasicMaterial({
  wireframe: false,
  opacity: 1,
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  color: 'red'
});
var LineBasicMaterialRed = new THREE.LineBasicMaterial( {color: 'red'} );

var dimensionMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
var transparentMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0} );


var dimGeometry = new THREE.SphereBufferGeometry( 100, 32, 32 );

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

      var geometry = new THREE.SphereGeometry( 50, 32, 32 );
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
  var roomHeight = 2700; //высота комнаты ????????
  var floor_scale = 40;
  var near = 1; //начало видимой области
  var far = 10000;//окончание видимой области
  var angle = THREE.Math.degToRad(30);//угол обзора камеры
//  var ray_axis_x; // доп ось камеры
//  var ray_axis_y; // доп ось камеры
  var allCamArr = [];

  //глобальный объект размеров
  scene.add(Dimensions);
  //глобальный объект размеров gkjofltq
  scene.add(Areas);

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
      var geometry = new THREE.SphereGeometry( 100, 32, 32 );
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
      arrowHelperAdd( videocamera, null, 'red', 350 );
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

var ray = new THREE.Raycaster(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), 0 , 100000);
var geometry = new THREE.Geometry();
geometry.vertices.push(
	new THREE.Vector3( 1, 5, 0 ),
	new THREE.Vector3( 10, 5, 0 )
);

//var line = new THREE.Line( geometry );


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

//      if(event.ctrlKey){
//        if($wallCreator.enabled){
//          $wallCreator.off();
//        } else {
//          $wallCreator.on();
//        }
//      }
      break;
    case 49: /*1*/
      if(event.altKey){
        if($projection.enabled){
          $projection.off();
        } else {
          $projection.on('top');
        }
      }
      break;
    case 50: /*2*/
      if(event.altKey){
        if($projection.enabled){
          $projection.off();
        } else {
          $projection.on('left');
        }
      }
      break;
    case 51: /*3*/
      if(event.altKey){
        if($projection.enabled){
          $projection.off();
        } else {
          $projection.on('right');
        }
      }
      break;
    case 57: /*9*/
      if(event.altKey){
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
      if(event.ctrlKey){
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
      if(event.ctrlKey){

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

//  if($wallCreator.enabled){
//
//    return false;
//  }



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
		var geometry = new THREE.SphereGeometry(100, 32, 32 );
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


/**
 *
 * @param {type} vector3
 * @param {type} camera
 * @returns {getScreenCoord.vector2}
 */
function getScreenCoord( vector3, camera ) {
        var p = vector3;
        var vector = p.project(camera);

        vector.x = (vector.x + 1) / 2 * window.innerWidth;
        vector.y = -(vector.y - 1) / 2 * window.innerHeight;

        return vector;
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
     self.roundRect(self.context, x, y, width, height, 5);

  }

  this.clearRect = function(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
      self.clearRect();
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
    self.clearRect();
    self.addRectangle();
    self.addText();
    self.toCanvas2();
    self.texture = self.getTexture();
    self.sprite = self.getSprite();
    //увеличение масштаба (масштабирование сторон в методе getSprite)
    self.sprite.scale.set(self.sprite.scale.x * 30, self.sprite.scale.y * 30 , 1);
    return  self.sprite;
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
			text += window.opener.i18next.t('cam_level_3d') + (self.obj.getWorldPosition().y / self.obj.floor_scale - self.obj.userData.camera_props.camera_off_z).toFixed(accuracy_measurements) + '\n';
		}
		else {
			text += "Объект: камера \n" ;
		    text += "Угол обзора: " + Math.ceil(THREE.Math.radToDeg(self.obj.angle)) + " градусов\n";
		    text += "Угол вертикальный: " + self.getAngleVert() + "\n";
		    text += "Угол горизонтальный: " + self.getAngleGorizont() + "\n";
		    //text += "Высота: " + Math.ceil(self.obj.getWorldPosition().y / self.obj.floor_scale) + "\n";
		    text += "Высота: " + (self.obj.getWorldPosition().y / self.obj.floor_scale - self.obj.userData.camera_props.camera_off_z).toFixed(accuracy_measurements) + "\n";
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
    var inDeg = parseFloat(THREE.Math.radToDeg(Math.acos(-vector.y)).toFixed(accuracy_measurements));
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
    var inDeg = parseFloat(THREE.Math.radToDeg(Math.atan2(vector.x,vector.z)).toFixed(accuracy_measurements));
    return inDeg;
  }

  return this.view();

}
function noteAdd( obj, message, type, parameters )
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
  var dim = new camDimension(obj, parameters);
}
function camDimension(obj, parameters)
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


    var raycaster = new THREE.Raycaster(self.position, self.direction.normalize(), 0, 100000 );


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
		self.note.setMessage( (parseFloat(self.ray_distance) / self.obj.floor_scale).toFixed(accuracy_measurements) );
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
    var note = self.ray_distance === Infinity ? "aaaaaaa" : self.ray_distance; //резерв 5 символов
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

//Проекция
function initProjection(obj){
  var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;
	var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
  var frustumSize = 12500;
  var currentCamera;

  
  obj.enabled = false;
  obj.type = false;
  obj.plane = null;

  obj.walls = [];//массив установленных стен TODO - заполнить при инициализации редактора
  obj.projectionWallMaterial
  obj.acsWallMaterial

  obj.projectionWallMaterial = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      color: 'black'
    });
  obj.acsWallMaterial = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      color: '#d5c7ac'//бежевый
    });

  obj.wallDimensionType = 'center';

  obj.on = function(type){
    obj.enabled = !obj.enabled;
    currentCamera = camera.clone();
    obj.type = type || 'top';
    obj.cameraAdd();
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableRotate = false;

    obj.planeHelperAdd();

    obj.setMaterialToWall(obj.projectionWallMaterial);

    obj.doorwaysProjectionMode();

    $wallEditor.on();

  }
  obj.off = function(){

    obj.enabled = !obj.enabled;
    camera = currentCamera.clone();
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    currentCamera = null;

    scene.remove( obj.plane );
    delete obj.plane;

    Dimensions.visible = false;
    obj.setMaterialToWall(obj.acsWallMaterial);


    obj.doorways3DMode();

    $wallCreator.off();
    $wallEditor.off();
    $dimensionEditorMode.off();

  }
  obj.cameraAdd = function(){
    camera = new THREE.OrthographicCamera(
                                          frustumSize * ASPECT / - 2,
                                          frustumSize * ASPECT / 2,
                                          frustumSize / 2,
                                          frustumSize / - 2,
                                          1,
                                          50000
                                        );

    switch (obj.type) {
      case 'top':
        camera.position.set(0, 30000, 0);
        break;
      case 'left':
        camera.position.set(-30000, 0, 0);
        break;
      case 'right':
        camera.position.set(30000, 0, 0);
        break;
    }

    camera.lookAt(new THREE.Vector3(0,0,0));



  }
  obj.planeHelperAdd = function(){
    var geometry = new THREE.PlaneGeometry( 100000, 100000, 1 );
    obj.plane = new THREE.Mesh( geometry );
    obj.plane.rotateX( -Math.PI/2 );
    obj.plane.translateZ ( -5 );
    obj.plane.material.visible = false;
    scene.add( obj.plane );
  }

  obj.getWalls = function(){

    var result = [];
    scene.children.forEach(function(item){
      if(item.type == 'Wall' ){
        result.push(item);
      }
    })

    return result;

  };
  obj.setMaterialToWall = function(material){

    $wallCreator.walls.forEach(function(item){
      item.material = material;
    })

  }
  obj.doorways3DMode = function(){

    $wallCreator.walls.forEach(function(item){
      item.doorway3DMode();
    })

  };
  obj.doorwaysProjectionMode = function(){

    $wallCreator.walls.forEach(function(item){
      item.doorwayProjectionMode();
    })

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

  }
  function onDocumentMouseMoveProjection(event){
    if (!obj.enabled)
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  }
  function onKeyDownProjection ( event ){
    if (!obj.enabled)
      return false;
    if(event.ctrlKey || event.altKey) {
      event.preventDefault();
    }

    switch( event.keyCode ) {
      case 27: /*esc*/
        scene.remove(obj.selected1,obj.selected2);
        break;
      case 67: /*c*/
        if(event.altKey){
          $wallEditor.off();
          $dimensionEditorMode.off();
          if($wallCreator.enabled)$wallCreator.off();
          $wallCreator.on();
        }
        break;
      case 68: /*d*/
        if(event.altKey){
          $wallEditor.off();
          $wallCreator.off();
          $dimensionEditorMode.on();
        }
        break;
      case 69: /*e*/
        if(event.altKey){
           $wallCreator.off();
           $dimensionEditorMode.off();
           $wallEditor.on();
        }
        break;
    }
  }
  function onKeyUpProjection ( event ){
  if (!obj.enabled)
        return false;
//      event.preventDefault();
    }


  $('.wall_dim_type').on('click','li',function(){

		obj.wallDimensionType = $(this).attr('data-type');
    $wallEditor.showWallDimensions();

    $('.wall_dim_type').find('button').html($(this).find('a').text() + ' <span class="caret"></span>');

	})
  $('.footer').on('click','[action = loadFloor]',function(){
    
    $(this).parent().find('.floorLoader').trigger('click');
//    $(this).parent().find('.floorLoader').off('change');
    $(this).parent().find('.floorLoader').on('change', function(){

        
        renderImage(this.files[0], function(src){

          var image = $('.localImage')
          image[0].src = src;

          var texture = new THREE.Texture(image[0]);
          texture.needsUpdate = true;

          scene.getObjectByName('floor').material.map = texture;

        })

      });

      function renderImage(file, callback) {

       // генерация нового объекта FileReader
        var reader = new FileReader();

       // подстановка изображения в атрибут src
        reader.onload = function(event) {
          callback(event.target.result);
        }

       // при считке файла, вызывается метод, описанный выше
        reader.readAsDataURL(file);
      };

	})
  $('.footer').on('click','[action = exportJSON]',function(){

    $wallEditor.on();
    
    $wallEditor.getJSON(function(result){
      window.console.log( result );
    }) ;

    $wallEditor.off();
    
  })

  $('.footer').on('click','[action = hideWalls]',function(){
    
    $wallEditor.walls.forEach(function( item ){
      
      if(item.visible){
        item.hide();
      } else {
        item.show();
      }
      
    })

  })



}
$projection = {};
initProjection($projection);


//Режим установки размеров
function initDimensionEditorMode(obj){

  var current_dim = null;

  obj.enabled = false;
  
  obj.planeMousePoint; //точка пересечения луча с плоскостью
  obj.currentEdge = {};
  obj.currentEdge.material = {};
  obj.currentPoint = {}
  obj.currentPoint.material = {};
  obj.selected1 = null;
  obj.selected2 = null;
  obj.currentDimension;
  obj.dimensionMenu = [];
  
  obj.on = function(){

    obj.plane = $projection.plane;
    obj.enabled = true;
    //ребра
    obj.edgesAdd();
    //узлы
    obj.pointsAdd();
    //размеры
    Dimensions.visible = true;
    Dimensions.children.forEach(function(item){
      item.activate();
    })

    obj.activate();

  }
  obj.off = function(){
    obj.enabled = false;
    Dimensions.visible = false;
    Dimensions.children.forEach(function(item){
      item.deactivate();
    })
    obj.deactivate();
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

  obj.getDimensionMenu = function(){
    var elements =  $('.DimensionMenu').find('.ActiveElementMenuAnimated');

    //считываем координаты для восстановления
    if(elements){
      elements.each( function( i, item ){
        obj.dimensionMenu[i] = ( {left: item.style.left, top: item.style.top} );
        item.style.left = 0;
        item.style.top = 0;
      });
    }

  }
  obj.hideAllMenu = function(){
    $('.DimensionMenu').css('display','none');
  }

  obj.dimensionAdd = function(){

    var param1 = null;
    var param2 = null;

    if(obj.selected1)
    param1 = obj.selected1.isLine ? obj.selected1 : obj.selected1.position
    if(obj.selected2)
    param2 = obj.selected2.isLine ? obj.selected2 : obj.selected2.position

    current_dim = new Dimension(param1, param2, obj.plane);
    Dimensions.add(current_dim);
    
    obj.deactivateSelectControls();
    obj.activateSelectControls();

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

  obj.activate = function(){
    document.addEventListener( 'mousedown', onDocumentMouseDownProjection, false );
    document.addEventListener( 'mousemove', onDocumentMouseMoveProjection, false );
    document.addEventListener( 'keydown', onKeyDownProjection, false );
    document.addEventListener( 'keyup', onKeyUpProjection, false );

    obj.activateSelectControls();
  };
  obj.deactivate = function(){
    document.removeEventListener( 'mousedown', onDocumentMouseDownProjection );
    document.removeEventListener( 'mousemove', onDocumentMouseMoveProjection );
    document.removeEventListener( 'keydown', onKeyDownProjection );
    document.removeEventListener( 'keyup', onKeyUpProjection );

    obj.deactivateSelectControls();
  };
  
  obj.activateSelectControls = function(){
    var objects = [];
    Dimensions.children.forEach(function(item){
      objects.push(item.note);
    });

    obj.selectControls = new SelectControls( objects, camera, renderer.domElement );
    obj.selectControls.addEventListener( 'select', obj.select );
    obj.selectControls.addEventListener( 'unselect', obj.unselect );
//    obj.dragControls.addEventListener( 'end', obj.dragend );
    obj.selectControls.addEventListener( 'hoveron', obj.hoveron );
    obj.selectControls.addEventListener( 'hoveroff', obj.hoveroff );
    obj.selectControls.addEventListener( 'select_contextmenu', obj.select_contextmenu );
  }
  obj.deactivateSelectControls = function(){

    if(obj.selectControls ){
      obj.selectControls.removeEventListener( 'select', obj.select, false );
  //    obj.dragControls.removeEventListener( 'end', obj.dragend, false );
      obj.selectControls.removeEventListener( 'hoveron', obj.hoveron, false );
      obj.selectControls.removeEventListener( 'hoveroff', obj.hoveroff, false );
      obj.selectControls.removeEventListener( 'select_contextmenu', obj.select_contextmenu, false );

      obj.selectControls.deactivate();
      obj.selectControls = null;
    }

  }
  obj.select = function(event){

    obj.hideAllMenu();
    if( 'select' in event.object.parent )
    event.object.parent.select(event);
    obj.selected = event.object.parent;

  }
  obj.select_contextmenu = function(event){
    obj.hideAllMenu();
    if('select_contextmenu' in event.object.parent){
    event.object.parent.select_contextmenu(event);
    obj.selected = event.object.parent;
    }

  }
  obj.unselect = function( event ){
    obj.hideAllMenu();
    obj.selected = null;
  }
  obj.hoveron = function( event ){
    if( 'hoveron' in event.object.parent )
    event.object.parent.hoveron( event );
  }
  obj.hoveroff = function( event ){
    if( 'hoveroff' in event.object.parent )
    event.object.parent.hoveroff(event);
  }


  function onDocumentMouseDownProjection( event ){
    if (!obj.enabled)
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    if( obj.currentEdge.material.visible ){
      obj.setSelected( obj.currentEdge );
    } else if(obj.currentPoint.material.visible){
      obj.setSelected( obj.currentPoint );
    }else {
      scene.remove(obj.selected1,obj.selected2);
    }


    //возможность перемещать размер
//    var mouse_raycaster = new THREE.Raycaster();
//    mouse_raycaster.setFromCamera( mouse, camera );
//    var intersectObjects = mouse_raycaster.intersectObjects(Dimensions.children);
//    if(intersectObjects.length > 0){
//      if(intersectObjects[0].object.name == 'dimensionBoundingSphere'){
//        intersectObjects[0].object.dimension.activate();
//      }
//    }

  }
  function onDocumentMouseMoveProjection(event){
    if (!obj.enabled)
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

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

      //определение текущего размера
      if(intersectObjects[ 0 ].object.parent.isDimension){
        obj.currentDimension = intersectObjects[ 0 ].object.parent;
      }

    }
//

//    var intersectObjects = mouse_raycaster.intersectObjects(Dimensions.children, true);
//    if(intersectObjects.length > 0){
//      if(intersectObjects[0].object.name == 'dimensionBoundingSphere' && intersectObjects[0].object.dimension.enabled == false){
//        intersectObjects[0].object.dimension.activate();
//      }
//    }

  }
  
  function onKeyDownProjection ( event ){
    if (!obj.enabled)
      return false;
//    event.preventDefault();

    switch( event.keyCode ) {
      case 27: /*esc*/
        scene.remove(obj.selected1,obj.selected2);
        break;
      case 67: /*c*/
        if(event.altKey){
          if($wallCreator.enabled){
            $wallCreator.off();
          } else {
            $wallCreator.on();
            $wallEditor.off();
            $dimensionEditorMode.off();
          }
        }
        break;
      case 68: /*d*/
        if(event.altKey){
          $dimensionEditorMode.on();
          $wallEditor.off();
          $wallCreator.off();
        }
        break;
      case 69: /*e*/
        if(event.altKey){
          if($wallEditor.enabled){
            $wallEditor.off();
          } else {
            $wallEditor.on();
            $wallCreator.off();
            $dimensionEditorMode.off();
          }
        }
        break;
    }
  }
  function onKeyUpProjection ( event ){
  if (!obj.enabled)
        return false;
//      event.preventDefault();
    }

  //оодноразовая операция
  obj.getDimensionMenu();

  $('.DimensionMenu').on('click', '[action = remove]', function(){
    obj.hideAllMenu();
		Dimensions.remove(obj.selected);
    obj.selected = null;
	});
  $('.DimensionMenu').on('click', '[action = action_n]', function(){
		alert('action_n');
	});

}
$dimensionEditorMode = {};
//Object.setPrototypeOf( $dimensionEditorMode, $projection );
initDimensionEditorMode( $dimensionEditorMode );

//Создание стен
function initWallCreator(obj){

  var currentWall = null; //стена над которой находится поинтер
  var intersectWalls = []; //стены под т-образное соединение
  var ray = new THREE.Ray();
  var pointHelper_material = new THREE.MeshBasicMaterial( {color: '#00FF00'} );
  var wallPointHelper_material = new THREE.MeshBasicMaterial( {color: 'red'} );

  obj.enabled = false;
//  obj.plane = null;
  obj.lineHelper = null;
  obj.lineHelperGeometry = new THREE.Geometry();//хранилище точек линии хелпера
  obj.magnitVerticies = [];//массив точек для примагничивания
  obj.magnitVerticiesSphere = [];//массив сфер в точка для примагничивания
  obj.magnitValue = 200;
  obj.pointerHelper = null; //объект указателя
  obj.pointerHelpersArray = []; //массив временных красных сфер (удалить)
  obj.dashedLineArr = [];//массив пунктирных
  obj.lineHelperMaterial = new THREE.LineDashedMaterial( {
      color: 0x0000ff,
      dashSize: 100,
      gapSize: 30,
    } );
  obj.lineDashedMaterial = new THREE.LineDashedMaterial( {
      color: 'black',
      dashSize: 100,
      gapSize: 30,
    } );

  obj.dimensions = [];//размеры
  obj.dimHelper = {}; //размер хелпер
  obj.dimHelper.direction = new THREE.Vector3();// направление построения размера
  obj.dimHelper.p1 = new THREE.Vector3();// точка размера
  obj.dimHelper.p2 = new THREE.Vector3();// точка размера

  //временный параметр
  obj.wall_width = 100; //толщина стены по умолчанию

  obj.on = function(){

    obj.enabled = !obj.enabled;
    if(obj.walls.length == 0){
      obj.walls = obj.getWalls();
    }

    pointerHelperAdd();

    obj.magnitVerticiesCreate();

    document.addEventListener( 'mousedown', onDocumentMouseDownWallCreator, false );
    document.addEventListener( 'mousemove', onDocumentMouseMoveWallCreator, false );
    document.addEventListener( 'keydown', onKeyDownWallCreator, false );

  }
  obj.off = function(){

    obj.enabled = !obj.enabled;
    obj.reset();
    scene.remove(obj.plane);
    scene.remove(obj.pointerHelper);
    delete obj.plane;
    delete obj.pointerHelper;

    //удаление временных красных сфер
//    pointerHelpersRemove();

    scene.remove(obj.lineHelper);
    obj.lineHelper = null;
    obj.lineHelperGeometry = new THREE.Geometry();//хранилище точек линии хелпера
    //деактивация отслеживания событий размеров
    obj.deactivateDimensions();

    document.removeEventListener( 'mousedown', onDocumentMouseDownWallCreator, false );
    document.removeEventListener( 'mousemove', onDocumentMouseMoveWallCreator, false );
    document.removeEventListener( 'keydown', onKeyDownWallCreator, false );

  }

  function pointerHelperAdd(){
    
    var geometry = new THREE.SphereBufferGeometry( 50, 32, 32 );
    obj.pointerHelper = new THREE.Mesh( geometry, pointHelper_material );
    scene.add( obj.pointerHelper );

  }
//  function pointerHelpersRemove(){
//    obj.pointerHelpersArray.forEach( function( item ){
//      scene.remove( item );
//    })
//  }


  obj.hideAllMenu = function(){
    
    $('.ActiveElementMenu').css('display','none');
    $('.FourStateSwitcher').css('display','none');
    $('.TwoStateSwitcher').css('display','none');
    $('.DoorwayMenu').css('display','none');

    obj.hideAllDimensions();


  }
  obj.hideAllDimensions = function(){
    //поле размера
    $('.EditableField').css('display','none');
    obj.walls.forEach(function(wall){
      wall.doors.forEach(function(door){
        door.unselect();
      })
    })
  }
  obj.reIndexWall = function(){
    obj.walls.forEach(function( item, i ){
      item.index = i;
    });
  }
  obj.updateWalls = function(){

    obj.walls.forEach(function( item, i, arr ){
      item.update( obj.walls );
    })

    obj.calculateRooms();
    
  }
  obj.updateWallsNodes = function(){

    obj.walls.forEach(function( item, i ){
      item.setDefaultNode();
    });

  }
  obj.calculateRooms = function(){
    obj.rooms = $wallEditor.getRooms();
  }
  obj.removeWall = function(wall){

      if(wall.parent){
        wall.parent.remove(wall);
      } else {
        delete wall;
        return;
      }
      

      obj.walls.splice( wall.index, 1 );
      obj.reIndexWall();

      wall = null;
      
      $wallCreator.updateWalls();

      obj.hideAllMenu();
  }

  /*
   *
   * @param {Array} [Vector3, Vector3] vertices
   * @param {Object} params
   * @returns {type Mesh}
   */
  obj.addWall = function( vertices, params ){
    var vertices = vertices;
    var params = params || {width: obj.wall_width};

    if( !params.auto_building )
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

    } else {
      window.console.warn("Ошибка при создании стены!");
      return false;
    }
    
    setTimeout(function(){
      obj.updateWalls();           //Обновляем состояние стен
      obj.magnitVerticiesCreate(); //пересоздание магнитных точек
    },100)

    $wallEditor.deactivateSelectControls();
    $wallEditor.activateSelectControls();

    return wall;

  }

  function isBelongToLine(point, line){

    ray.origin = line.start;
    ray.direction = line.delta().normalize();
    var param1 = Math.round(ray.distanceToPoint (point) * 1000)/1000;

    ray.origin = line.end;
    ray.direction = ray.direction.negate();
    var param2 = Math.round(ray.distanceToPoint (point) * 1000)/1000;

    return !(param1 + param2);

  }
  function isIntersectCollinear(newWallVertices){
    var result = false;

    var result1 = 0;
    var result2 = 0;
    var result3 = 0;
    var result4 = 0;
    var result5 = 0;
    var result6 = 0;
    var result7 = 0;

    obj.walls.forEach(function( item, i ){

      //принадлежность прямой
      result1 = isBelongToLine(newWallVertices[0], new THREE.Line3(item.v1, item.v2));
      result2 = isBelongToLine(newWallVertices[1], new THREE.Line3(item.v1, item.v2));
      //совпадение с точками прямой
      result3 = newWallVertices[0].equals(item.v1) || newWallVertices[0].equals(item.v2);
      result4 = newWallVertices[1].equals(item.v1) || newWallVertices[1].equals(item.v2);

      var dot = newWallVertices[1].clone().sub(newWallVertices[0]).normalize().dot(item.direction);
      result5 = Math.abs(dot) > 0.999;

      //обратная принадлежность прямой
      result6 = isBelongToLine(item.v1, new THREE.Line3(newWallVertices[0], newWallVertices[1]));
      result7 = isBelongToLine(item.v2, new THREE.Line3(newWallVertices[0], newWallVertices[1]));


      //проверка выполнения условий
      if ( ( result1 == true && result2 == true ) ||
           ( result6 == true && result7 == true ) ||
           ( result5 && (result1 == true || result2 == true ) && !result3 && !result4) ||
           ( result3 && result4 ) )
      {
        result = true;
        return;
      }

    });


    return result;
 
  }
  function changeIntersectWalls (){

    intersectWalls.forEach(function( item, i ){

      if(item.wall && item.wall.v1.distanceTo( item.point ) > item.wall.width/2 &&
         item.wall.v2.distanceTo(item.point) > item.wall.width/2) {

          var vertices1 = [ item.wall.v1, item.point ];
          var vertices2 = [ item.point, item.wall.v2 ];
          var params = { width: item.wall.width, height: item.wall.height };

          item.wall.remove();
          item.wall = null;
          currentWall = null;

          obj.addWall( vertices1, params );
          obj.addWall( vertices2, params );

      }

    })

  }

  //Добавленеи линии размера
  obj.addDimension = function(){

      if( obj.lineHelper && new THREE.Line3( obj.lineHelper.geometry.vertices[0],  obj.lineHelper.geometry.vertices[1]).distance()  > obj.magnitValue )      
      if( obj.dimensions.length > 0 ) {

        if(obj.lineHelper.material.visible){

          obj.updateDimensions();
          obj.showDimensions();

        };

      } else {

        obj.calcDimensionsPoints();
        
        obj.createDimensions();
        obj.activateDimensions();

      }

  }

  //добавление точки для построения линии по кликам
  obj.lineHelperPointAdd = function( isMove ) {
    var isMove = isMove || false;//false при клике мыши; true - при движении курсора
    var isClick = !isMove;
    var point = obj.pointerHelper.position.clone();

    //текущая стена при совпадении с одной из крайних точек
//    if( currentWall && (currentWall.v1.equals(obj.pointerHelper.position) || currentWall.v2.equals(obj.pointerHelper.position)) ){
//      currentWall = null;
//    }

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
  obj.lineHelperAdd = function( isMove ){
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

        //модификация зависимой стены
        if( ! isIntersectCollinear( obj.lineHelperGeometry.vertices ) ){

          changeIntersectWalls();
          obj.addWall(obj.lineHelperGeometry.vertices);

          //очистка
          obj.lineHelperGeometry.vertices = [];
          intersectWalls = [];
          obj.hideDimensions();

          //установка следующей точки
          currentWall = obj.walls.length > 0 ? obj.walls[obj.walls.length - 1] : null;
          obj.lineHelperPointAdd();
          
        } else {
          window.console.warn("Неверные параметры для создания стены!");

          //неполная очистка
          obj.lineHelperGeometry.vertices.length = 1;
          intersectWalls.length = 1;

        }
        
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

    obj.hideDimensions();
    
  }

  obj.dashedLineAdd = function( start, end ){

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

  //массив для примагничивания опорных точек
  obj.magnitVerticiesCreate = function(){

    //очистка
    obj.magnitVerticies = [];
//    obj.magnitVerticiesSphere.forEach(function(item){
//      scene.remove(item);
//    })

    //наполнение массива точек
    scene.children.forEach(function(item, idx) {
//      if(item.name == 'wall'){
//
//        item.geometry.vertices.forEach(function(item2, idx) {
//          obj.magnitVerticies.push(item2.clone().applyMatrix4(item.matrixWorld).projectOnPlane ( new THREE.Vector3(0,1,0) ));
//        })
//
//      }

//      if(item.type == 'Wall'){
//
//        item.geometry.vertices.forEach(function(item2, idx) {
//           obj.magnitVerticies.push(item2.clone().applyMatrix4(item.matrixWorld).projectOnPlane ( new THREE.Vector3(0,1,0) ));
//        })
//
//      }

      if(item.type == 'Wall'){

        obj.magnitVerticies.push(item.v1.clone().projectOnPlane ( new THREE.Vector3(0,1,0) ));
        obj.magnitVerticies.push(item.v2.clone().projectOnPlane ( new THREE.Vector3(0,1,0) ));

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
//    obj.magnitVerticies.forEach(function(item, idx) {
//      var geometry = new THREE.SphereBufferGeometry( 30, 32, 32 );
//      var mesh = new THREE.Mesh( geometry, wallPointHelper_material );
//      mesh.position.x = item.x;
//      mesh.position.z = item.z;
//      obj.magnitVerticiesSphere.push(mesh);
//      scene.add(mesh);
//
//      obj.pointerHelpersArray.push( mesh );
//
//    })


  }
  //получение объекта с коорд примагничивания
  obj.getMagnitObject = function( point ){

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
  /**
   * 
   * @param {type} object
   * @param {Vector3} pointer
   * @returns {undefined}
   */
  obj.magnit = function( object, pointer ){
          //удаляем пунктирные
      obj.dashedLineRemoveAll();

      //позиционирование хелпера
      var magnitObject = obj.getMagnitObject(pointer);
      object.position.x = pointer.x;
      object.position.z = pointer.z;

      //позиционирование хелпера указателя к точкам
      if(magnitObject.distanceX < obj.magnitValue){
        object.position.x = magnitObject.itemX.x;
        obj.dashedLineAdd(object.position.clone(), magnitObject.itemX);
        currentWall = null;
      }

      if(magnitObject.distanceZ < obj.magnitValue){
        object.position.z = magnitObject.itemZ.z;
        obj.dashedLineAdd(object.position.clone(), magnitObject.itemZ);
        currentWall = null;
      }

      //позиционирование хелпера указателя к осевой
      if(magnitObject.distanceToWallAxis < obj.magnitValue){

        object.position.x = magnitObject.itemOnWallAxis.x;
        object.position.z = magnitObject.itemOnWallAxis.z;
        currentWall = magnitObject.wall;//стена над которой находится поинтер

        var ray = new THREE.Ray(magnitObject.wall.v1, magnitObject.wall.direction);
        var  optionalPointOnSegment = new THREE.Vector3();
        var  optionalPointOnRay = new THREE.Vector3();

        //позиционирование при смешанном совпадении
        if(magnitObject.distanceZ < obj.magnitValue  &&
           magnitObject.distanceZ < 2 * magnitObject.distanceToWallAxis &&
           magnitObject.wall.direction.clone().cross(new THREE.Vector3(1,0,0)).length()){

          ray.distanceSqToSegment (
              new THREE.Vector3(-100000,0,magnitObject.itemZ.z),
              new THREE.Vector3( 100000,0,magnitObject.itemZ.z),
              optionalPointOnRay,
              optionalPointOnSegment );

          if( optionalPointOnRay && Math.abs(optionalPointOnRay.x) != 100000 ){
            object.position.x =  optionalPointOnRay.x;
            object.position.z = optionalPointOnRay.z;
//            currentWall = magnitObject.wall;//стена над которой находится поинтер
          }

        }
        //позиционирование при смешанном совпадении
        if(magnitObject.distanceX < obj.magnitValue  &&
           magnitObject.distanceX < 2 * magnitObject.distanceToWallAxis &&
           magnitObject.wall.direction.clone().cross(new THREE.Vector3(0,0,1)).length()){

          ray.distanceSqToSegment (
              new THREE.Vector3(magnitObject.itemX.x,0,-100000),
              new THREE.Vector3(magnitObject.itemX.x,0, 100000),
              optionalPointOnRay,
              optionalPointOnSegment );

          if( optionalPointOnRay && Math.abs(optionalPointOnRay.z) != 100000){
            object.position.x = optionalPointOnRay.x;
            object.position.z = optionalPointOnRay.z;
//            currentWall = magnitObject.wall;//стена над которой находится поинтер
          }

        }



      }

  }

  /*===================*/
  function onDocumentMouseDownWallCreator( event ){
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
  function onDocumentMouseMoveWallCreator( event ){
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
      obj.addDimension();

      obj.magnit( obj.pointerHelper, intersectObjects[0].point );

    }

  }
  function onKeyDownWallCreator ( event ){
    if (!obj.enabled)
      return false;
//    event.preventDefault();
    if(event.ctrlKey || event.altKey) {
      event.preventDefault();
    }

    switch( event.keyCode ) {
      case 46: /*del*/
      case 27: /*esc*/

        break;
      case 49: /*1*/
        if(event.ctrlKey)
        obj.wall_width = 100;
        break;
      case 50: /*2*/
        if(event.ctrlKey)
        obj.wall_width = 200;
        break;
      case 51: /*3*/
        if(event.ctrlKey)
        obj.wall_width = 300;
        break;
      case 52: /*4*/
        if(event.ctrlKey)
        obj.wall_width = 400;
        break;
      case 53: /*5*/
        if(event.ctrlKey)
        obj.wall_width = 500;
        break;
    }
  }

  obj.calcDimensionsPoints = function(){

    if( obj.lineHelper.geometry.vertices[1].x >= obj.lineHelper.geometry.vertices[0].x ){

      var dir = obj.lineHelper.geometry.vertices[1].clone().sub( obj.lineHelper.geometry.vertices[0].clone() );

    } else {

      var dir = obj.lineHelper.geometry.vertices[0].clone().sub( obj.lineHelper.geometry.vertices[1].clone() );

    };

    obj.dimHelper.direction.x = dir.z;
    obj.dimHelper.direction.z = -dir.x;
    obj.dimHelper.direction.y = dir.y;
    obj.dimHelper.direction.normalize();

    obj.dimHelper.p1.copy( obj.lineHelper.geometry.vertices[0] );
    obj.dimHelper.p2.copy( obj.lineHelper.geometry.vertices[1] );

  }
  obj.createDimensions = function(){

    var params = {direction: obj.dimHelper.direction, offset_direction: 200, editable: true, noteState: 'hide'}

    obj.dimensions.push( new Dimension( obj.dimHelper.p1,   obj.dimHelper.p2, $projection.plane, params ) );

    obj.dimensions.forEach(function(item){
      scene.add( item );
    })


  }
  obj.updateDimensions = function(){
    //перерасчет размеров
    obj.calcDimensionsPoints();

    obj.dimensions.forEach(function(item){
      item.const_direction.copy( obj.dimHelper.direction );
      item.update();
    })
  }
  obj.showDimensions = function(){
    obj.dimensions.forEach(function(item){
      item.visible = true;
      item.editableModeOn();
    })
  }
  obj.hideDimensions = function(){

    obj.dimensions.forEach(function(item){
      item.visible = false;
      item.unselect();
    })
    
  }
  obj.removeDimensions = function(){
    obj.dimensions.forEach(function( item, index ){
      scene.remove( item );
    })
  }
  obj.activateDimensions = function(){

    obj.dimensions.forEach(function(item){
      item.addEventListener( 'edit', onChangeDim );
      item.addEventListener( 'keydown', onKeydownDim );
      item.addEventListener( 'esc', onEscDim );
    })

  }
  obj.deactivateDimensions = function(){

    obj.dimensions.forEach(function(item){
      item.removeEventListener( 'edit', onChangeDim );
      item.removeEventListener( 'keydown', onKeydownDim );
      item.removeEventListener( 'esc', onEscDim );

    })

    obj.dimensions = [];//размеры
    obj.dimHelper = {}; //размер хелпер
    obj.dimHelper.direction = new THREE.Vector3();// направление построения размера
    obj.dimHelper.p1 = new THREE.Vector3();// точка размера
    obj.dimHelper.p2 = new THREE.Vector3();// точка размера

  }

  function onKeydownDim( event ){

    if( !event.ctrlKey && !event.altKey  )
    document.removeEventListener( 'mousemove', onDocumentMouseMoveWallCreator, false );
   
  }
  function onEscDim( event ){

    obj.reset();
    obj.off();
    
  }
  function onChangeDim( event ){

    var direction = obj.lineHelper.geometry.vertices[1].clone().sub( obj.lineHelper.geometry.vertices[0] ).normalize();
    obj.pointerHelper.position.copy( obj.lineHelper.geometry.vertices[0].clone().add( direction.multiplyScalar( event.value ) ) );
    obj.lineHelperPointAdd();
    obj.lineHelperAdd();
    obj.hideDimensions();

    document.addEventListener( 'mousemove', onDocumentMouseMoveWallCreator, false );
    
  }

}
$wallCreator = {};
Object.setPrototypeOf( $wallCreator, $projection );
initWallCreator( $wallCreator );

//Редактор стен
function initWallEditor( obj ){

  obj.enabled = false;
  obj.currentWall = null;
  obj.selected = null;

  obj.maxNeighboorsDistance = 0.5;
  obj.wallMenuCoord = [];
  obj.doorblockSwitcherCoord = [];
  obj.windowblockSwitcherCoord = [];
  obj.doorwayMenu = [];

  obj.raycaster = new THREE.Raycaster();

  obj.on = function(){
    
    obj.enabled = true;
//    obj.activate();
    
    obj.activateWallMover();
    obj.activateDoorway();
    obj.activateControlPoint();
    obj.activateWallDimensions();
    

//    obj.deactivateSelectControls();
    obj.activateSelectControls();
    
  }
  obj.off = function(){
    obj.enabled = false;
    obj.deactivateWallMover();
    obj.deactivateDoorway();
    obj.deactivateControlPoint();
    
    obj.deactivateSelectControls();
//    obj.deactivate();

  }

  obj.getWallMenuCoord = function(){
    var elements =  $('.ActiveElementMenu').find('.ActiveElementMenuAnimated');

    //считываем координаты для восстановления
    if(elements){
      elements.each( function( i, item ){
        obj.wallMenuCoord[i] = ( {left: item.style.left, top: item.style.top} );
        item.style.left = 0;
        item.style.top = 0;
      });
    }

  }
  obj.getSwitcherCoord = function(switcher, arr){
    var elements =  $('.' + switcher).find('.ActiveElementMenuAnimated');

    //считываем координаты для восстановления
    if(elements){
      elements.each( function( i, item ){
        arr[i] = ( {left: item.style.left, top: item.style.top} );
        item.style.left = 0;
        item.style.top = 0;
      });
    }

  }
  obj.getDoorwayMenu = function(){
    var elements =  $('.DoorwayMenu').find('.ActiveElementMenuAnimated');

    //считываем координаты для восстановления
    if(elements){
      elements.each( function( i, item ){
        obj.doorwayMenu[i] = ( {left: item.style.left, top: item.style.top} );
        item.style.left = 0;
        item.style.top = 0;
      });
    }

  }

  obj.activateWallMover = function(){
    obj.walls.forEach(function(item){
      item.mover.activate();
    })
  }
  obj.deactivateWallMover = function(){
    obj.walls.forEach(function(item){
      item.mover.deactivate();
    })
  }

  obj.activateWallDimensions = function(){
    obj.walls.forEach(function(item){
      item.activateDimensions();
    })
  }


  obj.activateControlPoint = function(){
    obj.walls.forEach(function(item){
      item.controlPoint1.activate();
      item.controlPoint2.activate();
    })
  }
  obj.deactivateControlPoint = function(){
    obj.walls.forEach(function(item){
      item.controlPoint1.deactivate();
      item.controlPoint2.deactivate();
    })
  }

  obj.activateDoorway = function(){
    obj.walls.forEach(function( item ){
      item.doors.forEach(function( item2 ){
        item2.activate();
      });
    })
  }
  obj.deactivateDoorway = function(){
    obj.walls.forEach(function(item){
      item.doors.forEach(function(item2){
        item2.deactivate();
      });
    })
  }
  
  obj.activateSelectControls = function(){
    var objects = [];
    obj.walls.forEach(function(wall){
      objects = objects.concat(wall.doors, wall)

      //добавление размеров стен в массив выбора
      wall.dimensions.forEach(function(dim){
          objects = objects.concat(dim.note)
      })

      //добавление размеров проемов в массив выбора
      wall.doors.forEach(function(door){
        door.dimensions.forEach(function(dim){
          objects = objects.concat(dim.note)
        })
      })
    });

    if(obj.selectControls){

      obj.selectControls.activate();

    } else {

      obj.selectControls = new SelectControls( objects, camera, renderer.domElement );

    }


    
    obj.selectControls.addEventListener( 'select', obj.select );
    obj.selectControls.addEventListener( 'unselect', obj.unselect );
//    obj.dragControls.addEventListener( 'end', obj.dragend );
    obj.selectControls.addEventListener( 'hoveron', obj.hoveron );
    obj.selectControls.addEventListener( 'hoveroff', obj.hoveroff );
    obj.selectControls.addEventListener( 'select_contextmenu', obj.select_contextmenu );
  }
  obj.deactivateSelectControls = function(){

    if(obj.selectControls ){

      obj.selectControls.removeEventListener( 'select', obj.select, false );
  //    obj.dragControls.removeEventListener( 'end', obj.dragend, false );
      obj.selectControls.removeEventListener( 'hoveron', obj.hoveron, false );
      obj.selectControls.removeEventListener( 'hoveroff', obj.hoveroff, false );
      obj.selectControls.removeEventListener( 'select_contextmenu', obj.select_contextmenu, false );

      obj.selectControls.deactivate();
      obj.selectControls = null;
    }

  }
  obj.select = function(event){

//    obj.hideAllMenu();
    if( 'select' in event.object )
    event.object.select(event);
    obj.selected = event.object;

  }
  obj.select_contextmenu = function(event){
    obj.hideAllMenu();
    if('select_contextmenu' in event.object){
    event.object.select_contextmenu(event);
    obj.selected = event.object;
    }

  }
  obj.unselect = function( event ){
    obj.hideAllMenu();
    if( obj.selected && ('unselect' in obj.selected) )
    obj.selected.unselect(event);
    obj.selected = null;
  }
  obj.hoveron = function( event ){
    if( 'hoveron' in event.object )
    event.object.hoveron( event );
  }
  obj.hoveroff = function( event ){
    if( 'hoveroff' in event.object )
    event.object.hoveroff(event);
  }
  
  obj.removeWall = function( wall ){
    $wallCreator.removeWall(wall);
  }
  obj.showWallDimensions = function(){

    obj.walls.forEach(function( item ){
      item.showDimensions();
    })

  }
  obj.isPointsNeighboors = function( p1, p2, koef ){

    var p1 = p1 || new THREE.Vector3();
    var p2 = p2 || new THREE.Vector3();
    var koef = koef || 1;

    if(p1.distanceToSquared ( p2 ) < obj.maxNeighboorsDistance * obj.maxNeighboorsDistance*koef*koef){
      return true;
    }

    return false;

  }

  obj.getJSON = function(callback){
    var export_data;
    $.getJSON("../data/export_example.json", function(data) {

                export_data = data;

                var rooms = obj.getRooms();

                rooms.forEach(function(room, room_index){



                  export_data.floors[0].rooms[ room_index ] =
                                                                {
                                                                  "id": room.uuid,
                                                                  "furniture": [],
                                                                  "closedRoom": true,
                                                                  "roomID": "",
                                                                  "room_type": "undefined",
                                                                  "room_name": "",
                                                                  "room_number": "",
                                                                  "room_zone": "",
                                                                  "room_area": room.area,
                                                                  "area_coords": room.area_coords,
                                                                  "walls": [],
                                                                  "elements": []
                                                                };

                  room.walls.forEach(function(uuid){

                  var item = scene.getObjectByProperty('uuid', uuid)
                  //координаты
                  if ( item.v11.distanceTo( item.v21 ) < item.v12.distanceTo( item.v22 ) ){

                    var inner = {start: {x: item.v11.x, y: item.v11.z }, end: {x: item.v21.x, y: item.v21.z } };
                    var outer = {start: {x: item.v12.x, y: item.v12.z }, end: {x: item.v22.x, y: item.v22.z } };

                  } else {

                    var inner = {start: {x: item.v12.x, y: item.v12.z }, end: {x: item.v22.x, y: item.v22.z } };
                    var outer = {start: {x: item.v11.x, y: item.v11.z }, end: {x: item.v21.x, y: item.v21.z } };

                  }

                  var center = {start: {x: item.v1.x, y: item.v1.z }, end: {x: item.v2.x, y: item.v2.z } };

                  //проемы
                  var openings = [];
                  item.doors.forEach(function(doorway){

                    var doorway_inner = {start: {x: doorway.p_11.x, y: doorway.p_11.z }, end: {x: doorway.p_21.x, y: doorway.p_21.z } };
                    var doorway_outer = {start: {x: doorway.p_12.x, y: doorway.p_12.z }, end: {x: doorway.p_22.x, y: doorway.p_22.z } };
                    var cellAngle = 0;
                    if(doorway.location){
                      switch (doorway.location) {
                        case 1:
                          cellAngle = 0;
                          break;
                        case 2:
                          cellAngle = 90;
                          break;
                        case 3:
                          cellAngle = 180;
                          break;
                        case 4:
                          cellAngle = 270;
                          break;

                      }
                    }

                    openings.push(
                                  {
                                    id: doorway.id,
                                    inner: doorway_inner,
                                    outer: doorway_outer,
                                    cellPosition: {
                                      x: 0,
                                      y: 0
                                    },
                                    cellAngle: cellAngle,
                                    flipped: false,
                                    type: "entry_door",
                                    systype: "entry_door",
                                    height: doorway.height,
                                    heightAboveFloor: doorway.elevation
                                  }
                                );
                  })


                  export_data.floors[0].rooms[ room_index ].walls.push(
                                          {
                                          id: item.id,
                                          inner: inner,
                                          outer: outer,
                                          center: center,
                                          arcPath: null,
                                          mount_type: "",
                                          wall_length_mm: item.axisLength,
                                          width_px: item.width,
                                          width_units: item.width * current_unit.c,
                                          type: "bearing_wall",
                                          height: {
                                            start: item.height,
                                            end: item.height
                                          },
                                          openings: openings,
                                          external_wall: false,
                                          room_wall_num: 0,
                                          outer_wall_num: 0
                                        }
                          )

                })
                })

                callback( JSON.stringify(export_data) );
            });

  }

  //комнаты TODO перенести в объект
  obj.getRooms = function(){

    window.console.time('t');

//    obj.walls.forEach(function( item, i ){
//      item.setDefaultNode();
//      item.update();
//    })
    
//    $wallCreator.updateWalls();
    obj.hideAreaNotifications();

    var rooms = [];
    var nodes =  obj.getNodes();
    var pathes = obj.getPathes();
    var chains = obj.getChains(nodes, pathes);
    obj.ExclusionExternalChain(nodes, chains);
 

    //удаление линий контура комнат
    obj.removeCounturLine();
    
    //=================

    chains.forEach(function(chain){

      var walls = [];
      var countur = [];

      if(chain){
            //отрисовка контура комнаты
             obj.addCounturLine(chain, nodes);
            //=================
        
          chain.forEach(function(item){

            if(countur.length == 0){
              countur.push( new THREE.Vector2( nodes[item.source.id].position.x, nodes[item.source.id].position.z ) );
              countur.push( new THREE.Vector2( nodes[item.target.id].position.x, nodes[item.target.id].position.z ) );
            } else if(countur[countur.length-1].x == nodes[item.target.id].position.x && countur[countur.length-1].y == nodes[item.target.id].position.z ){
              countur.push( new THREE.Vector2( nodes[item.source.id].position.x, nodes[item.source.id].position.z ) );
            } else {
              countur.push( new THREE.Vector2( nodes[item.target.id].position.x, nodes[item.target.id].position.z ) );
            }
            
            if( walls.indexOf( item.wall_uuid ) == -1 ){
              walls.push( item.wall_uuid );
            }

          });
          countur.length = countur.length - 1;

          var objArea = obj.getArea( countur );

          rooms.push({
                      id: THREE.Math.generateUUID(),
                      walls: walls,
                      area: objArea.area,
                      area_coords: {x: objArea.coord.x, y: objArea.coord.z},
                      area_coords_3D: objArea.coord
                    })


          if( Areas.children.length < rooms.length && objArea.area){

            obj.addAreaNotification( objArea.coord, objArea.area );

          } else if(+objArea.area){

            var note = Areas.children[ rooms.length - 1 ];
            note.position.copy( objArea.coord );
            note.setMessage( objArea.area + " " + area_unit.short_name );
            note.update();
            note.material.visible = true;

          }

      }

    })

    window.console.timeEnd('t');

    return rooms;

  }
  obj.getNodes = function(){

    var nodes = {};

    obj.walls.forEach(function( item ){

      if( ! nodes[ item.node11.id ]){
        nodes[item.node11.id] = item.node11 ;
      }
      if( ! nodes[ item.node12.id ]){
        nodes[item.node12.id] = item.node12 ;
      }
      if( ! nodes[ item.node21.id ]){
        nodes[item.node21.id] = item.node21 ;
      }
      if( ! nodes[ item.node22.id ]){
        nodes[item.node22.id] = item.node22 ;
      }

    });

    return nodes;

  };
  obj.getPathes = function(){
    
    var pathes = [];

    obj.walls.forEach(function( item ){

      pathes.push({
                    id: item.uuid + '_11',
                    wall_uuid:item.uuid,
                    source: { id: item.node11.id },
                    target: { id: item.node21.id },
                  });
      pathes.push({
                    id: item.uuid + '_12',
                    wall_uuid:item.uuid,
                    source: { id: item.node12.id },
                    target: { id: item.node22.id },
                  });
      //из исключения толстая тонкая
      if(item._e_path11){

        pathes.push(item._e_path11);

      };
      if(item._e_path12){

        pathes.push(item._e_path12);

      };
      if(item._e_path21){

        pathes.push(item._e_path21);

      };
      if(item._e_path22){

        pathes.push(item._e_path22);

      };

      //при отсуствии соседей
      if( item.mover.v1_neighbors.length == 0){
        pathes.push({
                    id: item.uuid + '_01',
                    wall_uuid:item.uuid,
                    source: { id: item.node11.id },
                    target: { id: item.node12.id },
                  });
      }

      if( item.mover.v2_neighbors.length == 0){
        pathes.push({
                    id: item.uuid + '_02',
                    wall_uuid:item.uuid,
                    source: { id: item.node21.id },
                    target: { id: item.node22.id },
                  });
      }


    })

    return pathes;
    
  }
  obj.getChains = function( nodes, pathes ){

    var result = [];
    for(var key in nodes){
      var unit = [];
      obj.getChain( pathes, nodes[key].id, unit );
      if( unit.length != 0 ){
        result.push( unit );
      }
    }

    return result;

  }
  obj.getChain = function( pathes, search_id, unit ){

    pathes.forEach(function(path, index){

      if( path.source.id == search_id ){
        unit.push(path);
        pathes.splice(index, 1);
        obj.getChain(pathes, path.target.id, unit);
        return;
      }
      if( path.target.id == search_id ){
        unit.push(path);
        pathes.splice(index, 1);
        obj.getChain(pathes, path.source.id, unit);
        return;
      }

    })

  }
  obj.ExclusionExternalChain = function(nodes, chains){

    var toRemove = [];

    chains.forEach(function(item, index){

      var wall_uuid = item[0].wall_uuid;
      var wall = scene.getObjectByProperty ( 'uuid', wall_uuid );
      
      if( wall ){
        obj.isWallInRoom(nodes, wall, item) ? delete chains[index] : ''
      }
    });

    toRemove.forEach(function(item){
      chains.splice(item,1);
    })

  };
  obj.isWallInRoom = function(nodes, wall, chain){

    //массив диний для проверки пересечения
    var objects = [];
    chain.forEach(function(item){

      var geometry = new THREE.Geometry();
      if(!nodes[item.source.id] || !nodes[item.target.id]){
        debugger
      }
      geometry.vertices.push( nodes[item.source.id].position, nodes[item.target.id].position );
//      var material = new THREE.LineBasicMaterial({
//        color: 'red'
//      });
      var line = new THREE.Line(geometry);
      objects.push( line );

    })

    //параметры луча
    obj.raycaster.ray.origin = wall.axisLine.getCenter();
    obj.raycaster.ray.direction.copy( new THREE.Vector3(0, 0, 1) );
//    obj.raycaster.linePrecision = 3;

    //визуализация луча
//    var geometry = new THREE.Geometry();
//    geometry.vertices.push(wall.axisLine.getCenter().clone());
//    geometry.vertices.push(wall.axisLine.getCenter().clone().add(new THREE.Vector3(0, 0, 1).multiplyScalar(1000000)));
//    var line = new THREE.Line(geometry);
//    scene.add(line);

    //пересечение
    var intersectObjects = obj.raycaster.intersectObjects(objects);
    if( (intersectObjects.length % 2) != 0){
      return true;
    }

    return false;
  };
  obj.getArea = function(countur){

    var result = {};
    result.area = Math.abs( THREE.ShapeUtils.area( countur )* area_unit.c ).toFixed( area_accuracy_measurements );

    var area_coord = new THREE.Vector3();
    var max_area = 0;
    var triangles = THREE.ShapeUtils.triangulate( countur );
    window.console.log(countur);
    window.console.log(triangles);
    
    if(triangles)
    triangles.forEach(function( item2 ){

      var triangle = new THREE.Triangle(
                                    new THREE.Vector3(item2[0].x, 0, item2[0].y),
                                    new THREE.Vector3(item2[1].x, 0, item2[1].y),
                                    new THREE.Vector3(item2[2].x, 0, item2[2].y)
                                    )

      
      var current_area = triangle.area();
      if( current_area > max_area ){
        max_area = current_area;
        area_coord = triangle.midpoint();
      }

    });


    result.coord = area_coord;


    return  result ;
  };
  obj.addAreaNotification = function( area_coord, area ){

    var notification = new noteSimple(
                                      null,
                                      area + " " + area_unit.short_name,
                                      {
                                        backgroundColor: { r:255, g:255, b:255, a:0 },
                                        borderColor:     { r:255, g:255, b:255, a:0 },
                                        fontsize: 48
                                      }
                                      );
    notification.position.copy( area_coord );
    notification.position.setY( 3000 );
    Areas.add( notification );
    
  };
  obj.removeAreaNotifications = function(){

    Areas.children.forEach(function(item){
      item.parent.remove(item);
    })

    Areas.children.length = 0;
    
  };
  obj.hideAreaNotifications = function(){
    Areas.children.forEach(function(item){
      item.material.visible = false;
    })
  }
  obj.addCounturLine = function(chain, nodes){
    chain.forEach(function(item){

      var geometry = new THREE.Geometry();
      geometry.vertices.push( nodes[item.source.id].position, nodes[item.target.id].position );
      var line = new THREE.Line(geometry, LineBasicMaterialRed);
      line.name = 'room_line';

      scene.add( line );

    })
  }
  obj.removeCounturLine = function(){
    var _lines = [];
    scene.children.forEach(function(line){
      if(line.name === 'room_line'){
        _lines.push(line);
      }
    })
    _lines.forEach(function(item){
      scene.remove(item);
    })
  }
  //============

  /*===================*/
  obj.activate = function(){
    document.addEventListener( 'mousedown', onDocumentMouseDownWallEditor, false );
    document.addEventListener( 'mousemove', onDocumentMouseMoveWallEditor, false );
    document.addEventListener( 'keydown', onKeyDownWallEditor, false );

//    document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  };
  obj.deactivate = function(){
    document.removeEventListener( 'mousedown', onDocumentMouseDownWallEditor, false );
    document.removeEventListener( 'mousemove', onDocumentMouseMoveWallEditor, false );
    document.removeEventListener( 'keydown', onKeyDownWallEditor, false );

//    document.removeEventListener( 'wheel', onDocumentMouseWheel, false );
  }
  
  function onDocumentMouseDownWallEditor( event ){
    if (!obj.enabled)
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    switch (event.which) {
      case 1: //ЛКМ
        var mouse_raycaster = new THREE.Raycaster();
        var intersectObjects = [];

//        mouse_raycaster.setFromCamera( mouse, camera );
//        var intersectObjects = mouse_raycaster.intersectObjects(obj.walls);
//        if(intersectObjects.length > 0){
//          obj.currentWall = intersectObjects[0].object;
//          intersectObjects[0].object.mover.activate();
//        }

        break;

      case 3: //ПКМ

        break;
    }
  }
  function onDocumentMouseMoveWallEditor(event){
    obj.currentWall = null;//стена над которой находится поинтер

    if ( !obj.enabled )
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


  }
  function onKeyDownWallEditor ( event ){
    if (!obj.enabled)
      return false;
//    event.preventDefault();

    switch( event.keyCode ) {
      case 46: /*del*/
      case 27: /*esc*/

        break;
    }
  }

  function onDocumentMouseWheel ( event )
  {

//            camera.fov += event.deltaY * 0.05;
//            camera.updateProjectionMatrix();

//    var element = $( '.EditableField' );
//    var field = element.find('input');
//
//    element.css('left', 0);
//    element.css('top', 0);
//    var coord = getScreenCoord(self.position.clone(), camera);
//    element.offset({left: coord.x - field.width()/2 , top: coord.y - field.height()/2 });
  }

  //считываем координаты элементов меню
  obj.getWallMenuCoord();
  obj.getSwitcherCoord('FourStateSwitcher', obj.doorblockSwitcherCoord);
  obj.getSwitcherCoord('TwoStateSwitcher', obj.windowblockSwitcherCoord);
  obj.getDoorwayMenu();

  /**
	 * удаление стены
	 */
	$('.ActiveElementMenu').on('click', '[action = remove]', function(){
		obj.selected.remove();
	});
  $('.ActiveElementMenu').on('click', '[action = addDoorway]', function(){
		obj.selected.addDoorway('doorway');
	});
  $('.ActiveElementMenu').on('click', '[action = addSingleDoorblock]', function(){
		obj.selected.addDoorway('singleDoor');
	});
  $('.ActiveElementMenu').on('click', '[action = addDoubleDoorblock]', function(){
		obj.selected.addDoorway('doubleDoor');
	});
  $('.ActiveElementMenu').on('click', '[action = addWindow]', function(){
		obj.selected.addDoorway('windowblock');
	});
  $('.ActiveElementMenu').on('click', '[action = addArch]', function(){
		obj.selected.addDoorway('arch');
	});
  $('.ActiveElementMenu').on('click', '[action = addNiche]', function(){
		obj.selected.addDoorway('niche');
	});
  $('.ActiveElementMenu').on('click', '[action = scaleFloor]', function(event){
		obj.selected.setFloorScale(event);
	});

  $('.FourStateSwitcher').on('click', '[action = location_1]', function(){
    obj.selected.setLocation(1);
    obj.selected.update();
	});
  $('.FourStateSwitcher').on('click', '[action = location_2]', function(){
		obj.selected.setLocation(2);
    obj.selected.update();
	});
  $('.FourStateSwitcher').on('click', '[action = location_3]', function(){
		obj.selected.setLocation(3);
    obj.selected.update();
	});
  $('.FourStateSwitcher').on('click', '[action = location_4]', function(){
		obj.selected.setLocation(4);
    obj.selected.update();
	});

  $('.TwoStateSwitcher').on('click', '[action = location_1]', function(){
    obj.selected.setLocation(1);
    obj.selected.update();
	});
  $('.TwoStateSwitcher').on('click', '[action = location_3]', function(){
		obj.selected.setLocation(3);
    obj.selected.update();
	});

  $('.DoorwayMenu').on('click', '[action = remove]', function(){

    obj.deactivateSelectControls();

		obj.selected.remove();

    obj.activateSelectControls();

	})

}
$wallEditor = {};
Object.setPrototypeOf($wallEditor, $wallCreator);
initWallEditor($wallEditor);

//Размеры проекции
/*
 * @param1 - vector3 | line
 * @param1 - vector3 | line
 */
function Dimension( param1, param2, plane, parameters ){

  THREE.Group.call( this );

  if ( parameters === undefined ) parameters = {};

	this.const_direction = new THREE.Vector3();
  parameters.hasOwnProperty("direction") ? this.const_direction.copy( parameters["direction"] ) : this.const_direction = null;
  this.offset_direction = parameters.hasOwnProperty("offset_direction") ? parameters["offset_direction"] : null;
  this.editable = parameters.hasOwnProperty("editable") ? parameters["editable"] : false;
  this.dragable = parameters.hasOwnProperty("dragable") ? parameters["dragable"] : true;
  this.name = parameters.hasOwnProperty("name") ? parameters["name"] : 'dimension';
  this.noteState = parameters.hasOwnProperty("noteState") ? parameters["noteState"] : 'show';
  this.arrow = parameters.hasOwnProperty("arrow") ? parameters["arrow"] : false;
  this.dim_type = parameters.hasOwnProperty("dim_type") ? parameters["dim_type"] : '';


  var self = this;
  self.arguments = arguments;

  this.enabled = true;
  this.ready = false;
  this.type = 'Dimension';
  this._type = '';
  this.isDimension = true;
  
  this.lkmMenu = '';
  this.rkmMenu = '.DimensionMenu';

  this.planeNormal;

  this.point1 = null;
  this.point2 = null;
  this.dimLine = null;
  this.direction = null;
  this.plane = plane || null;
  this.planeNormal = new THREE.Vector3( 0, 1, 0 );
  this.planeMousePoint = new THREE.Vector3();
  this.raycaster = new THREE.Raycaster();

  //используется для стрелок размеров стены
  this.leftArrowActivated = false;
  this.rightArrowActivated = false;
  this.downArrowActivated = false;
  this.upArrowActivated = false;
  //htlfrnbhetvjt поле и стрелки
  this.editableFieldWrapper =  $( '.EditableField' );
  this.editableField = self.editableFieldWrapper.find('input');
  this.leftArrow = self.editableFieldWrapper.find('.dim-arrow.left');
  this.rightArrow = self.editableFieldWrapper.find('.dim-arrow.right');
  this.downArrow = self.editableFieldWrapper.find('.dim-arrow.down');
  this.upArrow = self.editableFieldWrapper.find('.dim-arrow.up');

  //примечание (текст размера)
//  var geometry = new THREE.SphereBufferGeometry( 100, 32, 32 );
  var geometry = dimGeometry;
  var material = transparentMaterial;
  this.note = new THREE.Mesh( geometry, material );
  this.note.name = 'dimensionBoundingSphere';
  this.noteState == 'show' ? this.note.visible = true : this.note.visible = false;

 
  this.defineDimType();
  this.setPlaneNormal();
  this.definePoints();
  if(this.enabled);
  this.projectOnPlane();

  //события
  this.dragstart =          function ( event ) {

    if (!self.enabled)
      return false;

	};
  this.drag =               function ( event ) {
    if (!self.enabled)
      return false;

//    self.raycaster.setFromCamera( mouse, camera );
//
//    var intersectPointsOnPlane = [];
//    plane.raycast(self.raycaster,intersectPointsOnPlane )
//    if(intersectPointsOnPlane.length > 0){
//      self.planeMousePoint = intersectPointsOnPlane[0].point;
//    }

    self.planeMousePoint = event.object.position;

    self.update();
	};
  this.dragend =            function ( event ) {
    if (!self.enabled)
    return false;

  };

  this.hoveron =            function ( event ) {


	};
  this.hoveroff =           function ( event ) {

  };

  this.select =             function ( event ) {

    self.showMenuLKM(event.screenCoord);

  };
  this.unselect =           function ( event ) {


    $( '.EditableField' ).offset( {left: 0 , top: 0} );
    $( '.EditableField' ).css('display', 'none');
    if(event)
    self.hideMenuLKM( event.screenCoord );
    
  };
  this.select_contextmenu = function ( event ) {
    self.showMenu(event.screenCoord);
  };

  this.edit =             function ( event ) {

    var element = self.editableFieldWrapper;

    var obj = event.object;

    element.css('left', 0);
    element.css('top', 0);
    var coord = getScreenCoord(obj.position.clone(), camera);
    element.offset({left: coord.x - self.editableField.width()/2 , top: coord.y - self.editableField.height()/2 });
    element.css('display', 'block');

    self.editableField.val( ( current_unit.c * self.dimLine.distance() ).toFixed( accuracy_measurements ) );
    self.editableField.focus();
    self.editableField.select();

    if( self.arrow ){

      if(self.point1.x == self.point2.x){

        self.leftArrow.find('.fa-hand-o-left').removeClass('fa-hand-o-left').addClass('fa-hand-o-up');
        self.rightArrow.find('.fa-hand-o-right').removeClass('fa-hand-o-right').addClass('fa-hand-o-down');

      } else {

        self.leftArrow.find('.fa-hand-o-up').removeClass('fa-hand-o-up').addClass('fa-hand-o-left');
        self.rightArrow.find('.fa-hand-o-down').removeClass('fa-hand-o-down').addClass('fa-hand-o-right');
       
      }
      
      self.leftArrow.css('display', 'block');
      self.rightArrow.css('display', 'block');

      self.leftArrow.removeClass( "active" );
      self.rightArrow.removeClass( "active" );

      self.leftArrowActivated = false;
      self.rightArrowActivated = false;

    } else {
      self.leftArrow.css('display', 'none');
      self.rightArrow.css('display', 'none');
    }

    self.editableField.off('change');
    self.editableField.on('change', function(){

        self.dispatchEvent( { type: 'edit', object: obj, value: + self.editableField.val()/current_unit.c } );

      });

    self.editableField.off('keydown');
    self.editableField.on('keydown', function( event ){

      if(event.ctrlKey || event.altKey) {
        event.preventDefault();
        return;
      }

      self.dispatchEvent( { type: 'keydown', object: obj } );

      if( event.keyCode == 13 ){

        self.unselect();

      } else if( event.keyCode == 27 ){

        self.dispatchEvent( { type: 'esc', object: obj } );
      }

    });

    self.leftArrow.off('click');
    self.leftArrow.on('click', function(){

      $( this ).toggleClass( "active" );
      self.leftArrowActivated = !self.leftArrowActivated;

      if( self.leftArrowActivated && self.rightArrowActivated ){
        self.rightArrow.toggleClass( "active" );
        self.rightArrowActivated = !self.rightArrowActivated;
      }

    });
    self.rightArrow.off('click');
    self.rightArrow.on('click', function(){

      $( this ).toggleClass( "active" );
      self.rightArrowActivated = !self.rightArrowActivated;

      if( self.leftArrowActivated && self.rightArrowActivated ){
        self.leftArrow.toggleClass( "active" );
        self.leftArrowActivated = !self.leftArrowActivated;
      }


    });
    
  };
  this.editableModeOn = function(){

    this.edit( {object: this.note} );

  }

  this.onkeydown = function ( event ){
    if (!self.enabled)
      return false;
    
    switch( event.keyCode ) {
      case 46: /*del*/
      case 27: /*esc*/

        if( $dimensionEditorMode.carrentDimension == self ){

          Dimensions.remove(self);

        } else {

          self.unselect();

        }

        break;
    }

  }

  this.activate =  function(){
    this.enabled = true;
    this.ready = false;

    if( this.dragable ){
      if(this.dragControls){
        this.dragControls.activate();
      } else {
        this.dragControls = new DragControls( [this.note], camera, renderer.domElement );
      }

      this.dragControls.addEventListener( 'dragstart', this.dragstart );
      this.dragControls.addEventListener( 'drag', this.drag );
      this.dragControls.addEventListener( 'dragend', this.dragend );
      this.dragControls.addEventListener( 'hoveron', this.hoveron );
      this.dragControls.addEventListener( 'hoveroff', this.hoveroff );
    }

    document.addEventListener( 'keydown', this.onkeydown );

    
    if( this.editable ){

      if( this.selectControls ){
        this.selectControls.activate();
      } else {
        this.selectControls = new SelectControls( [this.note], camera, renderer.domElement );
      }
      
      this.selectControls.addEventListener( 'select', self.edit );
      
    }
    
  };
  this.deactivate = function(){
    this.enabled = false;
    this.ready = true;

    if( this.dragControls ){

      this.dragControls.removeEventListener( 'dragstart', this.dragstart );
      this.dragControls.removeEventListener( 'drag', this.drag );
      this.dragControls.removeEventListener( 'dragend', this.dragend );
      this.dragControls.removeEventListener( 'hoveron', this.hoveron );
      this.dragControls.removeEventListener( 'hoveroff', this.hoveroff );

      document.removeEventListener( 'keydown', this.onkeydown, false );

      this.dragControls.deactivate();

    }

    if( this.editable ){

      this.selectControls.removeEventListener( 'select', this.edit );

      this.selectControls.deactivate();

    }

  };

  this.activate();
  this.update();

}
Dimension.prototype = Object.assign( Object.create( THREE.Group.prototype ),{

  constructor: Dimension,
  
  defineDimType: function(){
    if(this.arguments.length > 0)
    for( var key = 0;key < 2; key++ ){
      if(this.arguments[key] && this.arguments[key].isVector3)
        this._type +='P';
      if(this.arguments[key] && this.arguments[key].isLine)
        this._type +='L';
    }
  },
  setPlaneNormal: function(){

    if(this.plane){

      this.planeNormal = this.plane.geometry.faces[0].normal.clone();
      this.planeNormal.applyMatrix4(this.plane.matrixWorld).round();

    }
    
  },
  definePoints: function(){
    switch (this._type) {
      case 'LP':
        this.point1 = this.getLineCenter(  this.arguments[0].geometry.vertices[0].clone().applyMatrix4(this.arguments[0].matrixWorld),
                                      this.arguments[0].geometry.vertices[1].clone().applyMatrix4(this.arguments[0].matrixWorld)
                                      );
        this.direction = this.getDirection(  this.arguments[0].geometry.vertices[0].clone().applyMatrix4(this.arguments[0].matrixWorld),
                                        this.arguments[0].geometry.vertices[1].clone().applyMatrix4(this.arguments[0].matrixWorld)
                                     );

        this.point2 = this.arguments[1];
        break;
      case 'PL':
        this.point1 = this.getLineCenter(  this.arguments[1].geometry.vertices[0].clone().applyMatrix4(this.arguments[1].matrixWorld),
                                      this.arguments[1].geometry.vertices[1].clone().applyMatrix4(this.arguments[1].matrixWorld)
                                    );
        this.direction = this.getDirection(  this.arguments[1].geometry.vertices[0].clone().applyMatrix4(this.arguments[1].matrixWorld),
                                        this.arguments[1].geometry.vertices[1].clone().applyMatrix4(this.arguments[1].matrixWorld)
                                      );

        this.point2 = this.arguments[0];
        break;
      case 'PP':
        this.point1 = this.arguments[0];
        this.point2 = this.arguments[1];
        this.direction = this.getDirectionPP(this.point1, this.point2);
        break;
      case 'L':
        this.point1 = this.arguments[0].geometry.vertices[0].clone().applyMatrix4(this.arguments[0].matrixWorld);
        this.point2 = this.arguments[0].geometry.vertices[1].clone().applyMatrix4(this.arguments[0].matrixWorld);
        this.direction = this.getDirectionPP(this.point1, this.point2);
        break;
      default:
        console.warn("Данные некорректны");
        this.enabled = false;
        break;
    }
  },
  projectOnPlane: function(){
    if(this.planeNormal && this.point1 && this.point2){
      this.point1.projectOnPlane(this.planeNormal);
      this.point2.projectOnPlane(this.planeNormal);
      this.direction.projectOnPlane(this.planeNormal).normalize();
    }
  },

  getLineCenter: function(start, end){
    var result = new THREE.Vector3();
		return result.addVectors( start, end ).multiplyScalar( 0.5 );
  },
  getDirection: function(start, end){
    var result = new THREE.Vector3();
		return result.subVectors( end, start );
  },
  getDirectionPP: function(p1, p2){

    if(this.const_direction){
      return this.const_direction.clone().projectOnPlane(this.planeNormal).normalize();
    }

    var result = new THREE.Vector3();

    result.z = this.planeMousePoint.x > p1.x && this.planeMousePoint.x < p2.x ? 1 : 0;
    if(result.z) return result;
    result.z = this.planeMousePoint.x > p2.x && this.planeMousePoint.x < p1.x ? 1 : 0;
    if(result.z) return result;

    result.y = this.planeMousePoint.y > p1.y && this.planeMousePoint.y < p2.y ? 1 : 0;
    if(result.y) return result;
    result.y = this.planeMousePoint.y > p2.y && this.planeMousePoint.y < p1.y ? 1 : 0;
    if(result.y) return result;

    result.x = this.planeMousePoint.z > p1.z && this.planeMousePoint.z < p2.z ? 1 : 0;
    if(result.x) return result;
    result.x = this.planeMousePoint.z > p2.z && this.planeMousePoint.z < p1.z ? 1 : 0;
    if(result.x) return result;

    var d = this.getDirection(p1, p2);
    var dx = d.x;
    var dz = d.z;
    d.x = dz;
    d.z = -dx;

    result = d;
    return result.projectOnPlane(this.planeNormal).normalize();

  },
  
  drawExtline: function(){

    if(this.planeMousePoint.equals(new THREE.Vector3()) ){

      var l = new THREE.Line3( this.point1.clone(), this.point2.clone() );
      var m = l.getCenter();

    } else {

      var m = this.planeMousePoint;
      
    }
    
    var p1_start = this.point1;
    var p2_start = this.point2;
    var p1_end, p2_end;

    if (this._type == 'PP' || this._type == 'L'){
      this.direction = this.getDirectionPP(this.point1, this.point2);
    }

    var n = this.direction.clone();

    var l_m =        m.clone().projectOnVector( n );
    var l1  = p1_start.clone().projectOnVector( n );
    var l2  = p2_start.clone().projectOnVector( n );
    var dist1 = dist2 = 0;

    if( this.offset_direction ){
      dist1 = dist2 = this.offset_direction;
      var point_var1 = new THREE.Vector3().addVectors(p1_start, n.clone().multiplyScalar( dist1 ));
      p1_end = point_var1.clone();

      var point_var1 = new THREE.Vector3().addVectors(p2_start, n.clone().multiplyScalar( dist2 ));
      p2_end = point_var1.clone()

    } else {
      var dist1 = l_m.distanceTo ( l1 );
      var dist2 = l_m.distanceTo ( l2 );

      var point_var1 = new THREE.Vector3().addVectors(p1_start, n.clone().multiplyScalar( dist1 ));
      var point_var2 = new THREE.Vector3().addVectors(p1_start, n.clone().negate().multiplyScalar( dist1 ));
      m.distanceTo(point_var1) < m.distanceTo(point_var2) ? p1_end = point_var1.clone(): p1_end = point_var2.clone();

      var point_var1 = new THREE.Vector3().addVectors(p2_start, n.clone().multiplyScalar( dist2 ));
      var point_var2 = new THREE.Vector3().addVectors(p2_start, n.clone().negate().multiplyScalar( dist2 ));
      m.distanceTo(point_var1) < m.distanceTo(point_var2) ? p2_end = point_var1.clone(): p2_end = point_var2.clone();

    }

    

    if(this.ln1 && this.ln2){

      this.ln1.geometry.vertices[0] = p1_start;
      this.ln1.geometry.vertices[1] = p1_end;
      this.ln1.geometry.verticesNeedUpdate = true;

      this.ln2.geometry.vertices[0] = p2_start;
      this.ln2.geometry.vertices[1] = p2_end;
      this.ln2.geometry.verticesNeedUpdate = true;

      this.dimLine.set ( p1_end, p2_end );

    } else {

      var material = dimensionMaterial;

      var geometry1 = new THREE.Geometry();
      geometry1.vertices.push( p1_start, p1_end );

      var geometry2 = new THREE.Geometry();
      geometry2.vertices.push( p2_start, p2_end );

      this.ln1 = new THREE.Line( geometry1, material );
      this.ln2 = new THREE.Line( geometry2, material );

      this.add(this.ln1, this.ln2);

      this.dimLine = new THREE.Line3(p1_end, p2_end);

    }

  },
  drawDimline: function(){

    if(this.line_part1 && this.line_part2){

      this.remove( this.line_part1, this.line_part2 );

      this.line_part1 = new THREE.ArrowHelper( this.dimLine.delta().normalize(), this.dimLine.getCenter(), this.dimLine.distance()/2, dimensionMaterial.color, this.dimLine.distance()/2 > 100 ? 100 : 0.001 );
      this.line_part2 = new THREE.ArrowHelper( this.dimLine.delta().normalize().negate(), this.dimLine.getCenter(), this.dimLine.distance()/2, dimensionMaterial.color, this.dimLine.distance()/2 > 100 ? 100 : 0.001 );

      this.add( this.line_part1, this.line_part2 );

      this.note.position.copy(this.dimLine.getCenter().clone());
      this.note.children[0].setMessage( (current_unit.c * this.dimLine.distance() ).toFixed( accuracy_measurements ));
      this.note.children[0].update();

    } else {

      this.line_part1 = new THREE.ArrowHelper( this.dimLine.delta().normalize(), this.dimLine.getCenter(), this.dimLine.distance()/2, dimensionMaterial.color, this.dimLine.distance()/2 > 100 ? 100 : 0.001 );
      this.line_part2 = new THREE.ArrowHelper( this.dimLine.delta().normalize().negate(), this.dimLine.getCenter(), this.dimLine.distance()/2, dimensionMaterial.color, this.dimLine.distance()/2 > 100 ? 100 : 0.001 );

      //спрайт текста
      noteAdd( this.note, ( current_unit.c * this.dimLine.distance() ).toFixed( accuracy_measurements ), null, {y: 100} );
      this.note.position.copy(this.dimLine.getCenter().clone());
      this.note.dimension = this;

      this.add(this.line_part1, this.line_part2, this.note );
    }

    this.ready = true;
  },

  update: function(){

    try {

      this.drawExtline();
      this.drawDimline();

    } catch (err) {

      this.remove(this.ln1, this.ln2);
      this.remove(this.line_part1, this.line_part2, this.note );

    }

    if( this.dimLine.distance() == 0){
      this.remove(this.ln1, this.ln2);
      this.remove(this.line_part1, this.line_part2, this.note );
    }


    
  },

  hideMenu: function() {
    $(this.rkmMenu).css('display','none');
  },
  showMenu: function(center){
    var self = this;

    var elements =  $( this.rkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    })

    //отображаем меню
    $( self.rkmMenu ).css('display','block');
    $( self.rkmMenu ).offset({top:center.y, left:center.x});

    //отображаем пункты меню
    setTimeout(function(){
      elements.each( function( i, item ){
        item.style.left = $dimensionEditorMode.dimensionMenu[i].left;
        item.style.top = $dimensionEditorMode.dimensionMenu[i].top;
      })

    }, 50);

  },

  hideMenuLKM: function() {

  },
  showMenuLKM: function(center){

  },
  
  hide: function() {
    this.note.visible = false;
    this.visible = false;
  },
  show: function(){
    this.note.visible = true;
    this.visible = true;
  }
});

//Объект стены
function Wall(vertices, parameters){

  THREE.Mesh.call( this, new THREE.Geometry() );

  if ( parameters === undefined ) parameters = {};

//  this.uid = THREE.Math.generateUUID();
  this.type = 'Wall';
  this.name = 'wall';
  this._wall = null; // объект стены с проемами
  this.index = '';//присваивается в редакторе
  this.walls = []//заполнение при обновлении
  this.doors = [];
  var self = this;

  this.editableFieldWrapper =  $( '.EditableField' );
  this.editableField = self.editableFieldWrapper.find('input');

  this.width = parameters.hasOwnProperty("width") ? parameters["width"] : 100;
  this.height = parameters.hasOwnProperty("height") ? parameters["height"] : 2700;
  this.v1 = vertices[0].clone();
  this.v2 = vertices[1].clone();

  
//    this.offset = {x: this.v1.x, y: this.v1.z};

  this.axisLine = new THREE.Line3(this.v1,this.v2);
  this.direction = this.axisLine.delta().normalize();
  this.direction90 = new THREE.Vector3( this.direction.z, 0 , -this.direction.x );
  this.axisLength = this.axisLine.distance();

  this.v11 = parameters.hasOwnProperty("v11") ? parameters["v11"] : this.v1.clone().add( this.direction90.clone().multiplyScalar(this.width/2) );
  this.v12 = parameters.hasOwnProperty("v12") ? parameters["v12"] : this.v1.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) );
  this.v21 = parameters.hasOwnProperty("v21") ? parameters["v21"] : this.v2.clone().add( this.direction90.clone().multiplyScalar(this.width/2) );
  this.v22 = parameters.hasOwnProperty("v22") ? parameters["v22"] : this.v2.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) );

  
  this.dimensions = []; //массив хранения объектов размеров стены
  this.p1 = new THREE.Vector3();
  this.p2 = new THREE.Vector3();
  this.p11 = new THREE.Vector3();
  this.p21 = new THREE.Vector3();
  this.p12 = new THREE.Vector3();
  this.p22 = new THREE.Vector3();
  this.dimension_lines = [
    new THREE.Line3(this.p11, this.p21),
    new THREE.Line3(this.p12, this.p22),
    new THREE.Line3(this.p1, this.p2),
  ]
  
  this.geometry = this.buildGeometry();

//    this.material = $projection.projectionWallMaterial
  this.material.transparent = true;
  this.material.opacity = 0.8;

  this.rotation.x = Math.PI/2;
  this.position.set( 0, self.height, 0 )

  if(this.geometry)
  this.geometry.verticesNeedUpdate = true;

  this.mover = new WallMover( this );
  scene.add( this.mover );

  this.controlPoint1 = new WallControlPoint( this, 'v1' );
  this.controlPoint2 = new WallControlPoint( this, 'v2' );
  scene.add( this.controlPoint1, this.controlPoint2 );

  //хелпер примечание id
//  noteAdd( this.controlPoint1, this.id.toString(), null, {y: 3000} );

  //хелпер осей
//  var axisHelper = new THREE.AxisHelper( 50 );
//  this.add( axisHelper );
  this.setDefaultNode = function(){

    this.node1 = {
      id: this.uuid + '_1',
      position: {x:this.v1.x, y: this.v1.z }
    }
    this.node2 = {
      id: this.uuid + '_2',
      position: {x:this.v2.x, y: this.v2.z }
    }

    this.node11 = {
      id: this.uuid + '_11',
      position: this.v11.clone()
    }
    this.node12 = {
      id: this.uuid + '_12',
      position: this.v12.clone()
    }
    this.node21 = {
      id: this.uuid + '_21',
      position: this.v21.clone()
    }
    this.node22 = {
      id: this.uuid + '_22',
      position: this.v22.clone()
    }
  },
          //Ноды
  this.setDefaultNode();

  this.changeDim =       function ( event ) {

    var offset = 0;
    var left_point;
    var right_point;
    var dimension = null;
    var index = self.dimensions.indexOf( event.target )

    //расчитываем смещение
    dimension = self.dimensions[index];
    offset = event.value - self.dimension_lines[index].distance();
//    offset = offset / Math.abs(offset);


    //точка сдвига
    if( self.v1.x < self.v2.x ){
      left_point = "v1";
      right_point = "v2";
    } else if( self.v2.x < self.v1.x ){
      left_point = "v2";
      right_point = "v1";
    } else if( self.v1.x == self.v2.x && self.v1.z < self.v2.z ){
      left_point = "v1";
      right_point = "v2";
    } else if( self.v1.x == self.v2.x && self.v2.z < self.v1.z ){
      left_point = "v2";
      right_point = "v1";
    }

    if( dimension.leftArrowActivated ){
      self.movePoint( left_point, offset, dimension.dim_type == 'center' );
    }
    if( dimension.rightArrowActivated ){
      self.movePoint( right_point, offset, dimension.dim_type == 'center' );
    }
    if( !dimension.leftArrowActivated && !dimension.rightArrowActivated && dimension.dim_type == 'center' ){
      
      self.movePoint( right_point, offset/2, dimension.dim_type == 'center' );
      self.movePoint( left_point, offset/2, dimension.dim_type == 'center' );
      
    }

//    self.update();

    $wallCreator.updateWalls();
    $wallCreator.updateWalls();
    
  };

  setTimeout(function(){
    self.calcDimensionsPoints();
    self.createDimensions();
    self.updateDimensions();
//    self.showDimensions();
  });

}
Wall.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

  constructor: Wall,

  buildGeometry: function(){
    var wallShape = new THREE.Shape();

				wallShape.moveTo( this.v1.x,  this.v1.z );
				wallShape.lineTo( this.v11.x, this.v11.z );
				wallShape.lineTo( this.v21.x, this.v21.z );
        wallShape.lineTo( this.v2.x,  this.v2.z );
				wallShape.lineTo( this.v22.x, this.v22.z );
        wallShape.lineTo( this.v12.x, this.v12.z );
        wallShape.lineTo( this.v1.x,  this.v1.z );

    var extrudeSettings = {
      amount: this.height,
      bevelEnabled: false
    };
    try{

//      var shapePoints = wallShape.extractPoints();
//      var vertices = shapePoints.shape;
//      THREE.ShapeUtils.isClockWise(vertices)

//      var arr = THREE.ShapeUtils.triangulate( vertices, false );

//
//      if( arr.lenth > 0 ){
//        var geometry = new THREE.ExtrudeGeometry( wallShape, extrudeSettings );
//      } else {
//        return null;
//      }

      var geometry = new THREE.ExtrudeGeometry( wallShape, extrudeSettings );
    } catch (e){
      return null;
    }
    return geometry;
  },
  getV22: function (walls){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = - Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();

    var target = null;
    var target_foundation = null;
    var self = this;

    walls.forEach(function(item, i){
      if(self.index != i){
        if( $wallEditor.isPointsNeighboors( self.v2, item.v1 ) ){

          var angle = self.direction.angleTo(item.direction) ;
          var cross = self.direction.clone().cross(item.direction).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;


          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v22;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v12, node_id: item.node12.id};
          }
        }

        if($wallEditor.isPointsNeighboors( self.v2, item.v2 ) ){

          var angle = self.direction.angleTo( item.direction.clone().negate() ) ;
          var cross = self.direction.clone().cross( item.direction.clone().negate() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v11;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v21, node_id: item.node21.id};
          } 
        }
      }

    })

    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path22 = null;
    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;
      exception = true;

    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;

    }
    //пересечение
    if(angle_max > -Math.PI && angle_max != 0){

      var ray = new THREE.Ray(self.v12, self.direction);
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    if(exception){
      self._e_path22 = {
                  id: self.uuid + '_e22',
                  wall_uuid: self.uuid,
                  source: { id: self.node22.id },
                  target: { id: target_foundation.node_id },
                };
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
        if( $wallEditor.isPointsNeighboors( self.v2, item.v1 ) ){

          var angle = self.direction.angleTo(item.direction) ;
          var cross = self.direction.clone().cross(item.direction).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v21;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v11, node_id: item.node11.id};
          }
        }

        if( $wallEditor.isPointsNeighboors( self.v2, item.v2 ) ){

          var angle = self.direction.angleTo( item.direction.clone().negate() ) ;
          var cross = self.direction.clone().cross( item.direction.clone().negate() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v12;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v22, node_id: item.node22.id};
          }
        }
      }

    })


    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path21 = null;

    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){
      
      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;
      exception = true;
      
    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;

    }
    //пересечение
    if(angle_max < Math.PI && angle_max != 0){

      var ray = new THREE.Ray(self.v11, self.direction);
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    if(exception){
      self._e_path21 = {
                  id: self.uuid + '_e21',
                  wall_uuid: self.uuid,
                  source: { id: self.node21.id },
                  target: { id: target_foundation.node_id },
                };
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
        if( $wallEditor.isPointsNeighboors( self.v1, item.v2 ) ){

          var angle = self.direction.clone().negate().angleTo(item.direction.clone().negate()) ;
          var cross = self.direction.clone().negate().cross(item.direction.clone().negate()).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v12;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v22, node_id: item.node22.id};
          }
        }

        if( $wallEditor.isPointsNeighboors( self.v1, item.v1 ) ){

          var angle = self.direction.clone().negate().angleTo( item.direction.clone() ) ;
          var cross = self.direction.clone().negate().cross( item.direction.clone() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle < angle_max) {
            angle_max = angle;
            segment_start = item.v21;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v11, node_id: item.node11.id};
          }
        }
      }

    })

    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path12 = null;

    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;
      exception = true;

    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;

    }
    //пересечение
    if(angle_max < Math.PI && angle_max != 0){

      var ray = new THREE.Ray(self.v22, self.direction.clone().negate());
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    if(exception){
        self._e_path12 = {
                    id: self.uuid + '_e12',
                    wall_uuid: self.uuid,
                    source: { id: self.node12.id },
                    target: { id: target_foundation.node_id },
                  };
      }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  getV11: function ( walls ){
    var result_point =  new THREE.Vector3();
    var walls = walls || [];
    var angle_max = - Math.PI;

    var segment_start = new THREE.Vector3();
    var segment_end = new THREE.Vector3();
    
    var target = null;
    var target_foundation = null;;
    var self = this;

    walls.forEach(function(item, i){
      if(self.index != i){
        if($wallEditor.isPointsNeighboors( self.v1, item.v2 ) ){

          var angle = self.direction.clone().negate().angleTo(item.direction.clone().negate()) ;
          var cross = self.direction.clone().negate().cross(item.direction.clone().negate()).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v11;
            segment_end = segment_start.clone().add( item.direction.clone().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v2, p2: item.v21, node_id: item.node21.id};
          }
        }

        if($wallEditor.isPointsNeighboors( self.v1, item.v1 ) ){

          var angle = self.direction.clone().negate().angleTo( item.direction.clone() ) ;
          var cross = self.direction.clone().negate().cross( item.direction.clone() ).getComponent ( 1 );
          angle = cross < 0 ? angle : - angle;

          if(angle > angle_max) {
            angle_max = angle;
            segment_start = item.v22;
            segment_end = segment_start.clone().add( item.direction.clone().negate().multiplyScalar(item.axisLength * 2) );
            target = item;
            target_foundation = {p1: item.v1, p2: item.v12, node_id: item.node12.id};
          }
        }
      }

    })

    //при разнице оснований и угол меньше 45 примыкание к основанию
    var exception = false;
    self._e_path11 = null;
    
    if(target && Math.abs(angle_max) < Math.PI/4 && target.width / self.width > 2 ){

      segment_start = target_foundation.p1;
      segment_end = target_foundation.p2;
      exception = true;
      
    }
    if(target && Math.abs(angle_max) < Math.PI/4 && self.width / target.width > 2 ){

      angle_max = 0;
      exception = true;
      


    }
    //пересечение
    if(angle_max > -Math.PI && angle_max != 0){
      
      var ray = new THREE.Ray(self.v21, self.direction.clone().negate());
      ray.distanceSqToSegment ( segment_start, segment_end, result_point );

    }

    
    if(exception){
        self._e_path11 = {
                    id: self.uuid + '_e11',
                    wall_uuid: self.uuid,
                    source: { id: self.node11.id },
                    target: { id: target_foundation.node_id },
                  };
      }

    return result_point.equals(new THREE.Vector3()) ? null : result_point;
  },
  //перерасчет при изменении толщины стены
  recalculatePoints: function (){

    this.axisLine = new THREE.Line3(this.v1,this.v2);
    this.direction = this.axisLine.delta().normalize();
    this.direction90 = new THREE.Vector3( this.direction.z, 0 , -this.direction.x );
    this.axisLength = this.axisLine.distance();

    this.node1.position.x = this.v1.x;
    this.node1.position.y = this.v1.z;
    this.node2.position.x = this.v2.x;
    this.node2.position.y = this.v2.z;

    this.node11.position.copy(this.v11);
    this.node12.position.copy(this.v12);
    this.node21.position.copy(this.v21);
    this.node22.position.copy(this.v22);

    this.v11.copy( this.v1.clone().add( this.direction90.clone().multiplyScalar(this.width/2) ) );
    this.v12.copy( this.v1.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) ) );
    this.v21.copy( this.v2.clone().add( this.direction90.clone().multiplyScalar(this.width/2) ) );
    this.v22.copy( this.v2.clone().add( this.direction90.clone().negate().multiplyScalar(this.width/2) ) );

    

  },

  update: function( walls ){

      this.walls = walls || this.walls;
     
      //если изменилась ширина
      this.recalculatePoints();

      var v11 = this.getV11(this.walls);
      var v12 = this.getV12(this.walls);
      var v21 = this.getV21(this.walls);
      var v22 = this.getV22(this.walls);
      this.v11 = v11 ? v11 : this.v11 ;
      this.v12 = v12 ? v12 : this.v12 ;
      this.v21 = v21 ? v21 : this.v21 ;
      this.v22 = v22 ? v22 : this.v22 ;

      var new_geometry = this.buildGeometry();
      if(new_geometry){
        this.geometry = new_geometry;
        this.geometry.verticesNeedUpdate = true;
        this.material.visible = true;
      } else {
        this.geometry = new THREE.Geometry();
        this.material.visible = false;
      }


      this.setDefaultNode();
      
      if( this.mover )
      this.mover.wall = this;
      this.mover.update();
      
      this.controlPoint1.update();
      this.controlPoint2.update();

      

      this.doors.forEach(function(item){
        item.update();
      });

      this.updateDimensions();

  },
  remove: function(object){

    if(object){

      THREE.Mesh.prototype.remove.call(this, object);

    } else {

      if(this.mover){
        this.mover.deactivate();
        this.mover.parent.remove( this.mover );
        this.mover = null;
      }

      this.children.forEach(function( item ){
        scene.remove(item);
      })

      //удаление проемов
      this.doors.forEach(function( item ){

        //удаление размеров проемов
        item.dimensions.forEach(function( dim ){
          scene.remove( dim );
        })
        //удаление тел проемов
        scene.remove(item.doorwayBody);

      })

      //удаление размеров стены
      this.dimensions.forEach(function( dim ){
        dim.deactivate();
        scene.remove( dim );
      })

      //удаление опорных точек
      scene.remove( this.controlPoint1, this.controlPoint2 );

      $wallEditor.removeWall( this );

    }

  },
  
  select: function( event ) {
    
  },
  hoveron: function( event ) {
  },
  hoveroff: function( event ) {
  },

  select_contextmenu: function(event){
    this.showMenu(event.screenCoord);
  },
  hideMenu: function() {
    $('.ActiveElementMenu').css('display','none');
  },
  showMenu: function(center){

    var elements =  $('.ActiveElementMenu').find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    })

    //отображаем меню
    $('.ActiveElementMenu').css('display','block');
    $('.ActiveElementMenu').css('left',center.x);
    $('.ActiveElementMenu').css('top',center.y);

    //отображаем пункты меню
    setTimeout(function(){
      elements.each( function( i, item ){
        item.style.left = $wallEditor.wallMenuCoord[i].left;
        item.style.top = $wallEditor.wallMenuCoord[i].top;
      })
    }, 50);
    
  },

  hide: function(){
    this.visible = false;
    this.hideControlPoints();
    this.hideDimensions();
  },
  show: function(){
    this.visible = true;
    this.showControlPoints();
    this.showDimensions();

  },

  addDoorway: function( type ){
    
    var type = type || 'doorway';
    var obj = null;

    if( type == 'doorway' ){
      var obj = new Doorway(this);
    } else if( type == 'singleDoor' ){
      var obj = new Doorblock(this);
    } else if( type == 'doubleDoor' ){
      var obj = new DoubleDoorBlock(this, { width: 1800, height: 2100 });
    } else if( type == 'windowblock' ){
      var obj = new WindowBlock(this, { elevation: 800, width: 1450, height: 1450 } );
    } else if( type == 'niche' ){
//      var obj = new Doorblock(this);
    } else if( type == 'arch' ){
//      var obj = new Doorblock(this);
    }

    this.doors.push(obj);
    this.add( obj );
    obj.activate();

    $wallEditor.deactivateSelectControls();
    $wallEditor.activateSelectControls();
    $wallEditor.selected = obj;

  },
  removeDoorway: function( doorway ){

    this.doors.splice( this.doors.indexOf(doorway), 1 );
    this.remove(doorway);
    delete doorway;

    

    this.update();

  },

  doorway3DMode: function(){

    var self = this;

    //очищаем
    if(this._wall){
      
      scene.remove(this._wall);
      this._wall = null;

    }

    //расчитываем
    self.doors.forEach(function( item ){

      //вырезаем проемы
      var wallBSP = new ThreeBSP( self._wall || item.wall );
      var doorwayBodyBSP = new ThreeBSP( item.doorwayBody );
      var newBSP = wallBSP.subtract( doorwayBodyBSP );
      self._wall = newBSP.toMesh( self.material );

      //отображаем объекты
      if( 'showDepObject' in item ){ item.showDepObject() }
      if( 'hideDimensions' in item ){ item.hideDimensions() }
      
    })

    if(self._wall){
      scene.add( self._wall );
      self.visible = false;
    }

    //скрываем размеры
    this.hideDimensions();
    //
    //скрываем опорные точки
     this.hideControlPoints();

  },
  doorwayProjectionMode: function(){

    var self = this;

    self.visible = true;

    if(self._wall){
        self._wall.visible = false;
    }

    self.doors.forEach(function( item ){

      if( 'hideDepObject' in item ){ item.hideDepObject() }

    });

    //отображаем размеры
    this.showDimensions();
    //
    //отображаем опорные точки
     this.showControlPoints();

 },

  createDimensions: function(){

    var self = this;

    var params = {
      direction: this.direction90,
      offset_direction: 200,
      editable: true,
      arrow: true,
      dragable: false,
      dim_type: this.p11.distanceTo(this.p21) < this.p12.distanceTo(this.p22) ? 'inner' : 'outer'
    }
    this.dimensions.push( new Dimension( this.p11,   this.p21, $projection.plane, params ) );

    params.direction = this.direction90.clone().negate();
    params.dim_type  = this.p11.distanceTo(this.p21) > this.p12.distanceTo(this.p22) ? 'inner' : 'outer';
    this.dimensions.push( new Dimension( this.p12,   this.p22, $projection.plane, params ) );

    //по осевой
    var params = {
      direction: this.direction90,
      offset_direction: 200,
      editable: true,
      arrow: true,
      dragable: false,
      dim_type: 'center'
    }
    this.dimensions.push( new Dimension( this.p1,   this.p2, $projection.plane, params ) );


    this.dimensions.forEach(function(item){
      item.activate();
      scene.add( item );
    })

  },
  calcDimensionsPoints: function(){

    var Y = this.height;

    this.p1.copy( this.v1.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p2.copy( this.v2.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p11.copy( this.v11.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p21.copy( this.v21.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p12.copy( this.v12.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p22.copy( this.v22.clone().add(new THREE.Vector3( 0, Y, 0)) );


    this.dimension_lines = [
    new THREE.Line3(this.p11, this.p21),
    new THREE.Line3(this.p12, this.p22),
    new THREE.Line3(this.p1, this.p2),
  ]

  },
  updateDimensions: function(){
    //перерасчет размеров
    this.calcDimensionsPoints();

    if(this.dimensions.length > 0){

      this.dimensions[0].dim_type = this.p11.distanceTo(this.p21) <= this.p12.distanceTo(this.p22) ? 'inner' : 'outer';
      this.dimensions[1].dim_type  = this.p11.distanceTo(this.p21) > this.p12.distanceTo(this.p22) ? 'inner' : 'outer';

      this.dimensions[0].const_direction = this.direction90;
      this.dimensions[1].const_direction = this.direction90.clone().negate();
      this.dimensions[2].const_direction = this.direction90;
    }
    
    this.dimensions.forEach(function(item){
      item.update();
    })

    this.showDimensions();

  },
  showDimensions: function(){

    var self = this;
    
    this.dimensions.forEach(function(item, i, arr){

      if ( $projection.wallDimensionType ==  item.dim_type) {

        item.show();
        if ( ! item.hasEventListener ( 'edit', self.changeDim ) )
        item.addEventListener( 'edit', self.changeDim );
        item.activate();

      } else {

        item.hide();
        if ( item.hasEventListener ( 'edit', self.changeDim ) )
        item.removeEventListener( 'edit', self.changeDim );
        item.deactivate();

      }

    })


//    this.dimensions.forEach(function(item, i, arr){
//
//      if( ! arr[i].hasEventListener ( 'edit', self.changeDim ))
//      arr[i].addEventListener( 'edit', self.changeDim );
//
//    })
    

  },
  hideDimensions: function(){
    this.dimensions.forEach(function(item, i){
      item.visible = false;

      item.removeEventListener( 'edit', this.changeDim );

      item.deactivate();
    })
//
//    this.dimensions[0].removeEventListener( 'edit', this.changeDim );
//    this.dimensions[1].removeEventListener( 'edit', this.changeDim );

  },
  removeDimensions: function(){
    this.dimensions.forEach(function( item, index ){
      scene.remove( item );
    })
  },
  activateDimensions: function(){
    this.dimensions.forEach(function( item, index ){
      item.activate();
    })
  },

  hideControlPoints: function(){
    this.controlPoint1.hide();
    this.controlPoint2.hide();
  },
  showControlPoints: function(){
    this.controlPoint1.show();
    this.controlPoint2.show();
  },

  movePoint: function( point, offset, center_line ){

    var self = this;

    if( point == 'v1' ){

//
      if(this.mover.v1_neighbors.length == 1){

        this.mover.v1_neighbors[0].wall.mover.position.copy(self.mover.position.clone().add(self.direction.clone().negate().multiplyScalar( offset )))
        this.mover.v1_neighbors[0].wall.mover.dragstart({object: this.mover.v1_neighbors[0].wall.mover});
        this.mover.v1_neighbors[0].wall.mover.drag({object: this.mover.v1_neighbors[0].wall.mover});
        this.mover.v1_neighbors[0].wall.mover.dragend({object: this.mover.v1_neighbors[0].wall.mover});

      } else if ( this.mover.v1_neighbors.length == 0 || ( this.mover.v1_neighbors.length > 1 && center_line ) ){

        this.v1.copy( this.v2.clone().add(this.direction.clone().negate().multiplyScalar(this.v1.distanceTo( this.v2 ) + offset)) );

        this.mover.v1_neighbors.forEach( function( item ){
          item.point.copy( self.v1.clone() ) ;
        })

      } else if( this.mover.v1_neighbors.length > 1 ){

        var walls = [];
        var position = new THREE.Vector3(self.mover.position.x, self.mover.position.y, self.mover.position.z)
        var direction = new THREE.Vector3(self.direction.x, self.direction.y, self.direction.z)

        this.mover.v1_neighbors.forEach(function( item, i, arr ){

          if ( Math.abs( arr[i].wall.mover && item.wall.direction.clone().dot ( self.direction.clone() ) ) < 0.001 ){

            walls.push( arr[i].wall.id );

          }

        })

        walls.forEach(function(item2, i){

          var item = scene.getObjectById(item2);
          if( ! item ){return;}

            item.mover.position.copy(position.clone().add(direction.clone().negate().multiplyScalar( offset )))
            item.mover.dragstart({object: item.mover});
            item.mover.drag({object: item.mover, intersect_disable: true});
            item.mover.dragend({object: item.mover});

        })

      }

      
    }
    if(point == 'v2'){

      if(this.mover.v2_neighbors.length == 1){

        this.mover.v2_neighbors[0].wall.mover.position.copy(self.mover.position.clone().add(self.direction.clone().multiplyScalar( offset )))
        this.mover.v2_neighbors[0].wall.mover.dragstart({object: this.mover.v2_neighbors[0].wall.mover});
        this.mover.v2_neighbors[0].wall.mover.drag({object: this.mover.v2_neighbors[0].wall.mover});
        this.mover.v2_neighbors[0].wall.mover.dragend({object: this.mover.v2_neighbors[0].wall.mover});

      } else if ( this.mover.v2_neighbors.length == 0 || ( this.mover.v2_neighbors.length > 1 && center_line ) ){

        this.v2.copy( this.v1.clone().add(this.direction.clone().multiplyScalar(this.v1.distanceTo( this.v2 ) + offset)) );

        this.mover.v2_neighbors.forEach(function(item){
          item.point.copy( self.v2.clone() ) ;
        })

      } else if( this.mover.v2_neighbors.length > 1 ){

        var walls = [];
        var position = new THREE.Vector3(self.mover.position.x, self.mover.position.y, self.mover.position.z)
        var direction = new THREE.Vector3(self.direction.x, self.direction.y, self.direction.z)


        this.mover.v2_neighbors.forEach(function( item, i, arr ){

          if ( Math.abs( arr[i].wall.mover && item.wall.direction.clone().dot ( self.direction.clone() ) ) < 0.001 ){

            walls.push( arr[i].wall.id );

//            arr[i].wall.mover.position.copy(position.clone().add(direction.clone().multiplyScalar( offset )))
//            arr[i].wall.mover.dragstart({object: arr[i].wall.mover});
//            arr[i].wall.mover.drag({object: arr[i].wall.mover, intersect_disable: true});
//            arr[i].wall.mover.dragend({object: arr[i].wall.mover});

          }

        })

        walls.forEach(function(item2, i){

          var item = scene.getObjectById(item2);
          if( ! item ){return;}

            item.mover.position.copy(position.clone().add(direction.clone().multiplyScalar( offset )))
            item.mover.dragstart({object: item.mover});
            item.mover.drag({object: item.mover , intersect_disable: true});
            item.mover.dragend({object: item.mover});

        })

      }

    }

  },
  setPointPosition: function( point, position){
    var self = this;

    if( ! this.mover ){ return; }

    if( point == 'v1' ){

      this.v1.copy( position.clone() );

      this.mover.v1_neighbors.forEach(function(item){
        item.point.copy( self.v1.clone() ) ;
      })
    } else if( point == 'v2' ){

      this.v2.copy( position.clone() );

      this.mover.v2_neighbors.forEach(function(item){
        item.point.copy( self.v2.clone() ) ;
      })
    }
  },

  setFloorScale: function(event){

    var self = this

    var element = this.editableFieldWrapper;
    element.css('left', 0);
    element.css('top', 0);
    var coord = { x: event.screenX, y: event.screenY };
    element.offset({left: coord.x - this.editableField.width() / 2 , top: coord.y - this.editableField.height() / 2 });
    element.css('display', 'block');

    this.editableField.val( ( current_unit.c * this.axisLength ).toFixed( accuracy_measurements ) );
    this.editableField.focus();
    this.editableField.select();

    this.editableField.off('change');
    this.editableField.on('change', function(){

      var val = +self.editableField.val() / current_unit.c ;

      var floorScaleX = 1;
      var floorScaleY = 1;
      var floorScaleZ = 1;

      if (self.v1.x == self.v2.x ){

        floorScaleY = val / self.axisLength;

      } else if ( self.v1.z == self.v2.z ){

        floorScaleX = val / self.axisLength;

      } else if ( self.v1.x != self.v2.x  && self.v1.z != self.v2.z ){

        floorScaleX = floorScaleY = val / self.axisLength;

      }


      scene.getObjectByName('floor').scale.set ( 
                                                scene.getObjectByName('floor').scale.x * floorScaleX,
                                                scene.getObjectByName('floor').scale.y * floorScaleY,
                                                scene.getObjectByName('floor').scale.z * floorScaleZ
                                                );




      self.dimensions.forEach(function( item ){

        if(item.dim_type == 'center'){
          self.changeDim({target: item, value: val});
          return;
        }

      })

    });

    this.editableField.off('keydown');
    this.editableField.on('keydown', function( event ){

      if(event.ctrlKey || event.altKey) {
        event.preventDefault();
        return;
      }

      if( event.keyCode == 13 ){

        element.css('display', 'none');

      } else if( event.keyCode == 27 ){

        element.css('display', 'none');
      }

    });
  }

});

//Хелпер перемещения
function WallMover( wall ){

  THREE.Mesh.call( this, new THREE.Geometry());

  this.type = 'WallMover';
  this.name = 'wall_mover';

  var self = this;

  var _ray = new THREE.Ray();
  var enabled = true;
  
  this.raycaster = new THREE.Raycaster();
  this.wall = wall;
  this.height = 1;
  //массивы соседних стен
  this.v1_neighbors = [];
  this.v2_neighbors = [];
  this.neighborsNeedUpdate = true;
  this.needRemove = false;

  var material_1 = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.5,
      transparent: true,
      depthWrite: false,
      color: 'blue'
    });

  this.geometry = this.buildGeometry();
  this.material = material_1;
  this.material.visible = false;

  //позиционирование
  this.setStartPosition();
  
  this.dragControls = null;

   /**
   * проверка длин соседей (удаление нулевой стены)
   */
  this.checkNeighborsLength = function(){
    var result = false;
    var v1_offset = Infinity;
    var v2_offset = Infinity;
    var v1_dir = null;
    var v2_dir = null;
    var v1_item, v2_item;
    var v1_index, v2_index;

    //вычисляем направление и необходимое смещение
    self.v1_neighbors.forEach(function( item, i, arr ){

//      var dot = self.wall.direction.clone().dot(item.wall.direction);

      if( item.wall.axisLength < item.wall.width  ){
        v1_dir = item.opposite_point.clone().sub( item.point ).normalize();
        v1_offset = v1_dir.clone().multiplyScalar ( item.wall.axisLength );
        v1_item = item;
        v1_index = i;
        return;
      }

    });
    self.v2_neighbors.forEach(function( item, i, arr ){

//      var dot = self.wall.direction.clone().dot( item.wall.direction );

      if( item.wall.axisLength < item.wall.width  ){
        v2_dir = item.opposite_point.clone().sub( item.point ).normalize();
        v2_offset = v2_dir.clone().multiplyScalar ( item.wall.axisLength );
        v2_item = item;
        v2_index = i;
        return;
      }

    });

    //проверяем условия угол в радианах
    if(v1_dir && v2_dir && ( v1_dir.equals(v2_dir) || THREE.Math.radToDeg(v1_dir.angleTo(v2_dir)) < 5 ) ){

      switch (true) {
        case v1_offset.length == v2_offset.length :

          self.wall.v1.add( v1_offset );
          self.wall.v2.add( v1_offset );

          v1_item.wall.remove();
          v2_item.wall.remove();

          self.v1_neighbors.splice(v1_index, 1);
          self.v2_neighbors.splice(v2_index, 1);

          result = true;

          break;

        case v1_offset.length < v2_offset.length:

          self.wall.v1.add( v1_offset );
          self.wall.v2.add( v1_offset );

          v1_item.wall.remove();
          self.v1_neighbors.splice(v1_index, 1);
          result = true;

          break;
        case v1_offset.length > v2_offset.length:

          self.wall.v1.add( v2_offset );
          self.wall.v2.add( v2_offset );

          v2_item.wall.remove();
          self.v2_neighbors.splice(v2_index, 1);
          result = true;

          break;
      }

      return result;

    }

    if(v1_dir){

      self.wall.v1.add( v1_offset );
      self.wall.v2.add( v1_offset );

      self.v1_neighbors.splice(v1_index, 1);
      v1_item.wall.remove();

      result = true;

    }

    if(v2_dir){

      self.wall.v1.add( v2_offset );
      self.wall.v2.add( v2_offset );

      self.v2_neighbors.splice(v2_index, 1);
      v2_item.wall.remove();

      result = true;

    }


    return result;
  }

  function checkSelfLength(){

    var v1_offset = Infinity;
    var v2_offset = Infinity;
    var v1_dir = null;
    var v2_dir = null;
    var v1_end_segment, v2_end_segment;
    var point_intersect = new THREE.Vector3();

    if(self.wall.axisLength < 5 ){

      switch (true) {
        case (self.v1_neighbors.length == 1 && self.v2_neighbors.length == 1):
          v1_dir = self.v1_neighbors[0].point.clone().sub( self.v1_neighbors[0].opposite_point ).normalize();
          v2_dir = self.v2_neighbors[0].point.clone().sub( self.v2_neighbors[0].opposite_point ).normalize();

          v1_end_segment = self.v1_neighbors[0].opposite_point.clone().add( v1_dir.clone().multiplyScalar ( 100000 ) );
          v2_end_segment = self.v2_neighbors[0].opposite_point.clone().add( v2_dir.clone().multiplyScalar ( 100000 ) );

          _ray.origin = self.v1_neighbors[0].opposite_point;
          _ray.direction = v1_dir;
          _ray.distanceSqToSegment(self.v2_neighbors[0].opposite_point, v2_end_segment, point_intersect);

          self.v1_neighbors[0].wall.v1 = self.v1_neighbors[0].point.equals(self.v1_neighbors[0].wall.v1) ? point_intersect.clone(): self.v1_neighbors[0].wall.v1 ;
          self.v1_neighbors[0].wall.v2 = self.v1_neighbors[0].point.equals(self.v1_neighbors[0].wall.v2) ? point_intersect.clone(): self.v1_neighbors[0].wall.v2 ;
          self.v2_neighbors[0].wall.v1 = self.v2_neighbors[0].point.equals(self.v2_neighbors[0].wall.v1) ? point_intersect.clone(): self.v2_neighbors[0].wall.v1 ;
          self.v2_neighbors[0].wall.v2 = self.v2_neighbors[0].point.equals(self.v2_neighbors[0].wall.v2) ? point_intersect.clone(): self.v2_neighbors[0].wall.v2 ;

          break;

        default:

          break;
      }

      return true;
    }

    return false;

  }

  /**
   * проверка движения вдоль стены в варианте один ко многим
   * @param {type} Array neighbors
   * @param {type} Vector3 point
   * @returns {neighbors.wall|false}
   */
  function isIntersect(neighbors, point){

    var result = false;
    var result1 = 1;
    var result2 = 1;
    neighbors.forEach(function(item){
      var dot = self.wall.direction.clone().dot( item.wall.direction );
      if(  Math.abs( dot ) < 0.001 ){

        _ray.origin = point.clone();
        _ray.direction = self.wall.direction.clone();
        var distance = _ray.distanceSqToSegment( item.wall.v1.clone(), item.wall.v2.clone() );
        if( ! distance ) {
          result = item.wall;
          return;
        };

        _ray.origin = point.clone();
        _ray.direction = self.wall.direction.negate().clone();
        var distance = _ray.distanceSqToSegment( item.wall.v1.clone(), item.wall.v2.clone() );
        if( ! distance ) {
          result = item.wall;
          return;
        };

//        _ray.origin = item.wall.v1.clone();
//        _ray.direction = self.wall.direction.clone();
//        var result1 = _ray.distanceSqToPoint ( point );
//
//        _ray.origin = item.wall.v1.clone();
//        _ray.direction = self.wall.direction.negate().clone();
//        var result2 = _ray.distanceSqToPoint ( point );

      }
    })

//    return (result1 == 0 && result2 == 0);
  return result;
  }

  //события
  this.dragstart =  function ( event ) {

        controls.enabled = false;

        enabled = true;
        self.updateNeighbors();
        self.neighborsNeedUpdate = false;

		  };
  this.drag =       function ( event, newCoord ) {
    
    var neighborsNeedUpdate = false;
    var v1_exception1 = false;
    var v2_exception1 = false;
    var newCoord = newCoord || null;

    if(!enabled) return;

    //предупреждаем возникновение ошибки
    if(self.geometry.vertices.length == 0){
      self.hoveroff();
      self.dragend();
      enabled = false;
    };

    //удаляем стену с мин длиной
//    if( self.checkNeighborsLength() ){
//
//      newCoord = {v1: self.wall.v1, v2: self.wall.v2};
//      enabled = false;
//
//    }

    //удаляем активную стену при достижении min длины
    if( checkSelfLength() ){
      self.needRemove = true;
      self.hoveroff();
      self.deactivate();
      self.dragend();
      return;
    }


  if( enabled ){
    //проекция вектора движения
      var y = event.object.position.y;
      event.object.position.projectOnVector ( event.object.wall.direction90.clone() );
      event.object.position.setY(y);
      //новые координаты стены

    if( newCoord ){

      self.writeCoordToWall( event, newCoord );

    } else {

      newCoord = self.getNewCoord();
      self.writeCoordToWall( event, newCoord );

    }





    }
      
    

    if( self.v1_neighbors.length > 0 || self.v2_neighbors.length > 0 ){

      //particular case exception1
      if( self.v1_neighbors.length == 2 ){

        var dot1 = self.wall.direction.clone().dot( self.v1_neighbors[0].wall.direction.clone() );
        var dot2 = self.wall.direction.clone().dot( self.v1_neighbors[1].wall.direction.clone() );

        if( Math.abs(dot1) < 0.001 && Math.abs(dot2) < 0.001 ){

          self.v1_neighbors[0].point.copy( event.object.wall.v1.clone() ) ;
          self.v1_neighbors[1].point.copy( event.object.wall.v1.clone() ) ;

          v1_exception1 = true;

        }

      }

      if( self.v2_neighbors.length == 2 ){

        var dot1 = self.wall.direction.clone().dot( self.v2_neighbors[0].wall.direction.clone() );
        var dot2 = self.wall.direction.clone().dot( self.v2_neighbors[1].wall.direction.clone() );

        if( Math.abs(dot1) < 0.001 && Math.abs(dot2) < 0.001 ){

          self.v2_neighbors[0].point.copy( event.object.wall.v2.clone() ) ;
          self.v2_neighbors[1].point.copy( event.object.wall.v2.clone() ) ;

          v2_exception1 = true;

        }

      }

      //global condition1
      if( self.v1_neighbors.length > 1 && !v1_exception1 ){

        if( newCoord.v1.distanceTo(self.v1_neighbors[0].point) > 10 ){

          var intersected = isIntersect(self.v1_neighbors, newCoord.v1);

          if(intersected){

            var v1 = intersected.v1.clone();
            var v2 = intersected.v2.clone();
            intersected.remove();

            var w1 = self.addWall( [v1, newCoord.v1], event.object.wall.width );
            var w2 = self.addWall( [v2, newCoord.v1], event.object.wall.width );

            neighborsNeedUpdate = true;

          } else {

            self.addWall( [self.v1_neighbors[0].point.clone(), event.object.wall.v1], event.object.wall.width );
            self.v1_neighbors.length = 0;

            neighborsNeedUpdate = true;

          }

        }

      }
      if( self.v2_neighbors.length > 1 && !v2_exception1 ){

        if( newCoord.v2.distanceTo(self.v2_neighbors[0].point) > 10 ){

          var intersected = isIntersect(self.v2_neighbors, newCoord.v2);

          if(intersected){

            var v1 = intersected.v1.clone();
            var v2 = intersected.v2.clone();
            intersected.remove();

            var w1 = self.addWall( [v1, newCoord.v2], event.object.wall.width );
            var w2 = self.addWall( [v2, newCoord.v2], event.object.wall.width );

            neighborsNeedUpdate = true;
          } else {

            self.addWall( [ self.v2_neighbors[0].point, event.object.wall.v2 ], event.object.wall.width );
            self.v2_neighbors.length = 0;

            neighborsNeedUpdate = true;

          }

        }

      }

      //global condition2
      if( self.v2_neighbors.length == 1 ){

        var dot = self.wall.direction.clone().dot( self.v2_neighbors[0].wall.direction.clone() );

        switch ( Math.abs(dot) > 0.999 ) {
          case true:
            if( newCoord.v2.distanceTo( self.v2_neighbors[0].point ) > 10 ){

              self.addWall( [ self.v2_neighbors[0].point, event.object.wall.v2 ], event.object.wall.width );
              neighborsNeedUpdate = true;

            }
            break;
          case false:

            _ray.origin = event.object.wall.v1.clone().add( event.object.wall.direction.clone().negate().multiplyScalar( 100000 ));;
            _ray.direction = event.object.wall.direction.clone();

            var result_point = new THREE.Vector3();
            _ray.distanceSqToSegment ( self.v2_neighbors[0].line_segment.start, self.v2_neighbors[0].line_segment.end, result_point );

            if( ! result_point.equals(new THREE.Vector3()) ){

              event.object.wall.v2 = result_point.clone();
              self.v2_neighbors[0].point.copy( event.object.wall.v2.clone() ) ;

            }
            break;
        }

      }
      if( self.v1_neighbors.length == 1 ){

        var dot = self.wall.direction.clone().dot( self.v1_neighbors[0].wall.direction.clone() );

        switch ( Math.abs(dot) > 0.999 ) {
          case true:
            if( newCoord.v1.distanceTo( self.v1_neighbors[0].point) > 10 ){

              self.addWall( [ self.v1_neighbors[0].point.clone(), event.object.wall.v1 ], event.object.wall.width );
              neighborsNeedUpdate = true;

            }

            break;
          case false:

            _ray.origin = event.object.wall.v2.clone().add( event.object.wall.direction.clone().multiplyScalar( 100000 ));
            _ray.direction = event.object.wall.direction.clone().negate();

            var result_point = new THREE.Vector3();
            _ray.distanceSqToSegment ( self.v1_neighbors[0].line_segment.start, self.v1_neighbors[0].line_segment.end, result_point );

            if( ! result_point.equals(new THREE.Vector3()) ){

              event.object.wall.v1 = result_point.clone();
              self.v1_neighbors[0].point.copy( event.object.wall.v1.clone() ) ;

            }
            break;
        }
      }

    }

    if( ! enabled){
      self.hoveroff();
      self.dragend();
    } else {
      self.neighborsNeedUpdate = neighborsNeedUpdate ? true : false;
      self.updateNeighborsWalls();
      self.wall.update();
      self.neighborsNeedUpdate = neighborsNeedUpdate = false;
    }

	};
  this.dragend =    function ( event ) {

      if( self.checkNeighborsLength() ){

      var newCoord = {v1: self.wall.v1, v2: self.wall.v2};

      self.drag(event, newCoord);

    }


    self.neighborsNeedUpdate = true;

    controls.enabled = true;

    if( self.needRemove ) self.wall.remove();

    $wallCreator.updateWalls();

  };
  this.hoveron =    function ( event ) {

    self.material.visible = true;

  };
  this.hoveroff =   function ( event ) {

    self.material.visible = false;

  };

}
WallMover.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{

  constructor: WallMover,

  buildGeometry: function(){

    var wallShape = new THREE.Shape();
				wallShape.moveTo( this.wall.v1.x, this.wall.v1.z );
				wallShape.lineTo( this.wall.v11.x, this.wall.v11.z );
				wallShape.lineTo( this.wall.v21.x, this.wall.v21.z );
        wallShape.lineTo( this.wall.v2.x, this.wall.v2.z );
				wallShape.lineTo( this.wall.v22.x, this.wall.v22.z );
        wallShape.lineTo( this.wall.v12.x, this.wall.v12.z );
        wallShape.lineTo( this.wall.v1.x, this.wall.v1.z );

    var extrudeSettings = {
      amount: this.height,
      bevelEnabled: false
    };
    try{

//      var shapePoints = wallShape.extractPoints();
//      var vertices = shapePoints.shape;
//      THREE.ShapeUtils.isClockWise(vertices)
//      var arr = THREE.ShapeUtils.triangulate( vertices, false );
//
//
//      if( arr.lenth > 0 ){
//        var geometry = new THREE.ExtrudeGeometry( wallShape, extrudeSettings );
//      } else {
//        return null;
//      }

      var geometry = new THREE.ExtrudeGeometry( wallShape, extrudeSettings );
      
    } catch (e){

      return null;

    }
    return geometry;
  },

  setStartPosition: function(){
    this.rotation.x = this.wall.rotation.x;
    this.position.set( 0, this.wall.height + this.height, 0);
  },

  update: function(){

    var geometry = this.buildGeometry();
    
    if(geometry){
      this.geometry = geometry;
      this.geometry.verticesNeedUpdate = true;
      this.position.set(0,0,0);
      this.setStartPosition();
      this.geometry.verticesNeedUpdate = true;
    } else {
        this.geometry = new THREE.Geometry();
        this.material.visible = false;
    }

//    this.checkNeighborsLength();
    this.updateNeighbors();
    
  },
  updateNeighbors: function(){

    if(! this.neighborsNeedUpdate ) return;

    var self = this;

    self.v1_neighbors = [];
    self.v2_neighbors = [];

    

    this.wall.walls.forEach(function( item, i ){


      if( item.type == 'Wall' && self.wall.index != i ){

        

        var arr = null;
        var arg1;
        var arg2;
        var opposite_point;

        switch ( true ) {
          case $wallEditor.isPointsNeighboors( self.wall.v1, item.v1, 1 ) :
            arr = 'v1_neighbors';
            arg1 = 'v1';
            arg2 = 'v1';
            opposite_point = 'v2';
            item.node1.id = self.wall.node1.id;
            item.node11.id = $wallEditor.isPointsNeighboors( self.wall.v12, item.v11, 1 ) ? self.wall.node12.id : item.node11.id;
            item.node12.id = $wallEditor.isPointsNeighboors( self.wall.v11, item.v12, 1 ) ? self.wall.node11.id : item.node12.id;
            break;
          case $wallEditor.isPointsNeighboors( self.wall.v1, item.v2, 1  ):
            arr = 'v1_neighbors';
            arg1 = 'v1';
            arg2 = 'v2';
            opposite_point = 'v1';
            item.node2.id = self.wall.node1.id;
            item.node21.id = $wallEditor.isPointsNeighboors( self.wall.v11, item.v21, 1 ) ? self.wall.node11.id : item.node21.id;
            item.node22.id = $wallEditor.isPointsNeighboors( self.wall.v12, item.v22, 1 ) ? self.wall.node12.id : item.node22.id;

            break;
          case $wallEditor.isPointsNeighboors( self.wall.v2, item.v1, 1  ):
            arr = 'v2_neighbors';
            arg1 = 'v2';
            arg2 = 'v1';
            opposite_point = 'v2';
            item.node1.id = self.wall.node2.id;
            item.node11.id = $wallEditor.isPointsNeighboors( self.wall.v21, item.v11, 1 ) ? self.wall.node21.id : item.node11.id;
            item.node12.id = $wallEditor.isPointsNeighboors( self.wall.v22, item.v12, 1 ) ? self.wall.node22.id : item.node12.id;
            break;
          case $wallEditor.isPointsNeighboors( self.wall.v2, item.v2, 1  ):
            arr = 'v2_neighbors';
            arg1 = 'v2';
            arg2 = 'v2';
            opposite_point = 'v1';
            item.node2.id = self.wall.node2.id;
            item.node21.id = $wallEditor.isPointsNeighboors( self.wall.v22, item.v21, 1 ) ? self.wall.node22.id : item.node21.id;
            item.node22.id = $wallEditor.isPointsNeighboors( self.wall.v21, item.v22, 1 ) ? self.wall.node21.id : item.node22.id;
            break;
        }


        if(arr){
          self[arr].push({
              wall: item,
              point: item[arg2],
              opposite_point: item[opposite_point],
              line_segment: {
                start: item[arg1].clone().add( item.direction.clone().negate().multiplyScalar(100000) ),
                end: item[arg1].clone().add( item.direction.clone().multiplyScalar(100000) )
              },
  //            angle: angle
            })
        }

      }
    
    })

  },
  updateNeighborsWalls: function (){
    $wallCreator.updateWalls();

    //maybe TODO что бы не перебирать все стены
//    this.v1_neighbors.forEach(function( item, i, arr ){
//
//      item.wall.update();
//
//    });
//    this.v2_neighbors.forEach(function( item, i, arr ){
//
//      item.wall.update();
//
//    });

  },

  //установка значений координат
  writeCoordToWall: function(event, newCoord){

    var wallsWithoutNeighbors = event.object.wall.walls.slice();

    //исключение данной стены
    wallsWithoutNeighbors.splice( this.wall.index, 1 );
    //исключение из проверки соседних стен
    this.v1_neighbors.forEach(function(item){
      var index = wallsWithoutNeighbors.indexOf(item.wall);
      if( index != -1){
        wallsWithoutNeighbors.splice( index, 1 );
      }
    })
    this.v2_neighbors.forEach(function(item){
      var index = wallsWithoutNeighbors.indexOf(item.wall);
      if( index != -1){
        wallsWithoutNeighbors.splice( index, 1 );
      }
    })


    //вычисление пересечения
    //исключили вычисление пересечения при перемещении
    //после изменения размера
    if( !event.intersect_disable ){
      var offset = newCoord.v1.multiply(new THREE.Vector3(1,0,1)).clone().sub(event.object.wall.v1);

      event.object.wall.geometry.computeBoundingBox();
      var originPoint = event.object.wall.geometry.boundingBox.getCenter().applyMatrix4( event.object.wall.matrix ).clone().add(offset);

      for (var i = 0; i < event.object.wall.geometry.vertices.length; i++)
      {
        var localVertex = event.object.wall.geometry.vertices[i].clone();
        var globalVertex = localVertex.applyMatrix4( event.object.wall.matrix ).clone().add(offset);;
        var directionVector = globalVertex.sub( originPoint.clone() );

        this.raycaster.set ( originPoint, directionVector.clone().normalize() );
        var collisionResults = this.raycaster.intersectObjects( wallsWithoutNeighbors );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
          return;
      }
    }

    //новые координаты
    event.object.wall.v1.copy( newCoord.v1.clone() );
    event.object.wall.v2.copy( newCoord.v2.clone() );

    event.object.wall.v1.multiply(new THREE.Vector3(1,0,1));
    event.object.wall.v2.multiply(new THREE.Vector3(1,0,1));

  },
  //координаты стены после передвижеия курсора
  getNewCoord: function(){

    this.updateMatrixWorld();

    var result = {};
    if(this.geometry.vertices.length > 0){
      result.v1 = this.geometry.vertices[0].clone().applyMatrix4(this.matrixWorld.clone());
      result.v2 = this.geometry.vertices[3].clone().applyMatrix4(this.matrixWorld.clone());
      result.v1.multiply(new THREE.Vector3(1,0,1));
      result.v2.multiply(new THREE.Vector3(1,0,1));
    }
    return result;

  },
  //дополнительная стена
  addWall: function(vertices, width){
    var wall = null;
    var width = width || $wallCreator.wall_width;
    wall = $wallCreator.addWall( vertices,
                          {
                            width: width,
                            auto_building: true
                          });
    $wallCreator.walls[ $wallCreator.walls.length -1 ].mover.activate();

    return wall;
  },

  activate:   function() {

    if(this.dragControls){

      this.dragControls.activate();

    } else {

      this.dragControls = new DragControls2( [this], camera, renderer.domElement );

    }

      this.dragControls.addEventListener( 'dragstart', this.dragstart );
      this.dragControls.addEventListener( 'drag', this.drag );
      this.dragControls.addEventListener( 'dragend', this.dragend );
      this.dragControls.addEventListener( 'hoveron', this.hoveron );
      this.dragControls.addEventListener( 'hoveroff', this.hoveroff );

    this.update();

	},
  deactivate: function () {

    if(this.dragControls){
      this.dragControls.removeEventListener( 'dragstart', this.dragstart, false );
      this.dragControls.removeEventListener( 'drag', this.drag, false );
      this.dragControls.removeEventListener( 'dragend', this.dragend, false );
      this.dragControls.removeEventListener( 'hoveron', this.hoveron, false );
      this.dragControls.removeEventListener( 'hoveroff', this.hoveroff, false );

      this.dragControls.deactivate();
      this.dragControls = null;
    }

	}


});

//Хелпер опорной точки
function WallControlPoint( wall, point ){
  THREE.Mesh.call( this, new THREE.Geometry());

  this.type = 'WallControlPoint';
  this.name = 'wall_point';

  var self = this;
  
  this.wall = wall;

  this.referencePoint = point;

  this.radius = 45;
  this.geometry = new THREE.SphereBufferGeometry( this.radius , 32, 32 );
  this.material = wallControlPointMaterial;

  //позиционирование
  this.setStartPosition();
  
  this.dragControls = null;

  //события
  this.dragstart =  function ( event ) {

    controls.enabled = false;

	};
  this.drag =       function ( event ) {

    //примагничивание
    $wallCreator.magnit(event.object, event.object.position);
//
  
    if(self.wall.parent){

      self.wall.setPointPosition(self.referencePoint, event.object.position.clone().multiply( new THREE.Vector3(1,0,1)));
      self.wall.update();

    }
    
    $wallCreator.updateWalls();

	};
  this.dragend =    function ( event ) {

    controls.enabled = true;
    $wallCreator.dashedLineRemoveAll();
    $wallCreator.updateWalls();
    setTimeout(function(){
      $wallCreator.magnitVerticiesCreate(); //пересоздание магнитных точек
    },100)

  };
  this.hoveron =    function ( event ) {

    self.material = wallControlPointMaterial_hover;
    this.radius = 50;

    if( self.wall.mover ){
      self.wall.mover.hoveroff();
      self.wall.mover.deactivate();
    }

  };
  this.hoveroff =   function ( event ) {

    self.material = wallControlPointMaterial;
    this.radius = 30;

    if(self.wall.mover)
    self.wall.mover.activate();

  };

  this.activate();
  
}
WallControlPoint.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{
  constructor: WallControlPoint,

  setStartPosition: function(){

    this.rotation.x = this.wall.rotation.x;
    this.position.set( this.wall[ this.referencePoint ].x, this.wall.height + this.radius, this.wall[ this.referencePoint ].z );
  },
  update: function(){
    this.setStartPosition();
  },

  hide: function(){
    this.visible = false;
  },
  show: function(){
    this.visible = true;
  },


  activate:   function() {

    if( this.dragControls ){

      this.dragControls.activate();

    } else {

      this.dragControls = new DragControls( [this], camera, renderer.domElement );

    }

      this.dragControls.addEventListener( 'dragstart', this.dragstart );
      this.dragControls.addEventListener( 'drag', this.drag );
      this.dragControls.addEventListener( 'dragend', this.dragend );
      this.dragControls.addEventListener( 'hoveron', this.hoveron );
      this.dragControls.addEventListener( 'hoveroff', this.hoveroff );


	},
  deactivate: function () {

    if(this.dragControls){
      this.dragControls.removeEventListener( 'dragstart', this.dragstart, false );
      this.dragControls.removeEventListener( 'drag', this.drag, false );
      this.dragControls.removeEventListener( 'dragend', this.dragend, false );
      this.dragControls.removeEventListener( 'hoveron', this.hoveron, false );
      this.dragControls.removeEventListener( 'hoveroff', this.hoveroff, false );

      this.dragControls.deactivate();
      this.dragControls = null;
    }

	},

});

//Проем
function Doorway( wall, parameters ){

  THREE.Mesh.call( this, new THREE.Geometry());

  var parameters = parameters || {};
  var self = this;

  this.type = 'Doorway';
  this.name = 'doorway';
  this.wall = wall;

  this.lkmMenu = '';
  this.rkmMenu = '.DoorwayMenu';

  this.raycaster = new THREE.Raycaster();
  this.top_offset = 2; //отступ от верха стены

 
  this.offset = this.wall.axisLength / 2; //отступ от v1 до центра проема


  this.width = parameters.hasOwnProperty("width") ? parameters["width"] : 900;
  this.height = parameters.hasOwnProperty("height") ? parameters["height"] : 2100;
  this.thickness = parameters.hasOwnProperty("thickness") ? parameters["thickness"] : this.wall.width;
  this.elevation = parameters.hasOwnProperty("elevation") ? parameters["elevation"] : 0;

  this.dimensions = []; //массив хранения объектов размеров проемов
  //точки привязки для размеров
  this.p11 = new THREE.Vector3();
  this.p12 = new THREE.Vector3();
  this.p21 = new THREE.Vector3();
  this.p22 = new THREE.Vector3();
  this.p_11 = new THREE.Vector3();
  this.p_12 = new THREE.Vector3();
  this.p_21 = new THREE.Vector3();
  this.p_22 = new THREE.Vector3();
  this.dimension_lines = [
    new THREE.Line3(this.p11, this.p_11),
    new THREE.Line3(this.p_21, this.p21),
    new THREE.Line3(this.p_11, this.p_21),
    new THREE.Line3(this.p12, this.p_12),
    new THREE.Line3(this.p_22, this.p22)
  ]

//  this.geometry = new THREE.PlaneBufferGeometry( this.width, this.thickness+1 );
  this.geometry = new THREE.BoxBufferGeometry( this.width, this.thickness+1, 1 );
  this.material = new THREE.MeshBasicMaterial( {color: 'white', side: THREE.DoubleSide} );

  //тело проема
  var geometry = new THREE.BoxGeometry();
  this.doorwayBody = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {color: 'white', side: THREE.BackSide} ) );
  this.doorwayBody.visible = false;

  this.rebuildGeometry();

  //позиционирование
  this.setStartPosition();
  this.setDoorwayBodyPosition();

  scene.add(this.doorwayBody);

  setTimeout(function(){
    self.calcDimensionsPoints();
    self.createDimensions();
    self.updateDimensions();
  })
  

  this.dragControls = null;

  //события
  this.dragstart =          function ( event ) {

//    alert('dragstart дверного проема');
    self.wall.mover.dragend();
    self.wall.mover.hoveroff();
    self.wall.mover.deactivate();

    controls.enabled = false;


    var position = event.object.position.clone().projectOnVector (
                                      self.wall.worldToLocal ( self.wall.v2.clone() )
                                      .sub( self.wall.worldToLocal( self.wall.v1.clone() ) )

                                      );
    self.direction_offset =  position.sub(event.object.position.clone());

	};
  this.drag =               function ( event ) {

    //скрываем меню выбора положения
    self.hideMenuLKM();

    var position = event.object.position.clone().projectOnVector (
                                          self.wall.worldToLocal ( self.wall.v2.clone() )
                                          .sub( self.wall.worldToLocal( self.wall.v1.clone() ) )

                                          );


    event.object.position.copy(position.sub(self.direction_offset));


    //вычисление смещения
    var vec = event.object.getWorldPosition().clone().sub(self.wall.v1.clone()).projectOnVector(self.wall.direction.clone());
    self.offset = vec.length();
    var dot = vec.dot ( self.wall.direction.clone() )

    if ( self.wall.axisLength - self.width/2 < self.offset  ){
      self.offset = self.wall.axisLength - self.width/2;
      self.update();
    } else if( self.offset < self.width/2 || dot < 0 ){
      self.offset = self.width/2;
      self.update();
    }

    //обновление размера
    self.updateDimensions();

	};
  this.dragend =            function ( event ) {
//  alert('dragend дверного проема');
        controls.enabled = true;
        self.wall.mover.activate();

        self.update();

		  };

  this.hoveron =            function ( event ) {

    if( self.wall.mover ){
      self.wall.mover.hoveroff();
      self.wall.mover.deactivate();
    }
    
	};
  this.hoveroff =           function ( event ) {

//        self.material.visible = false;
//    self.wall.mover.hoveron();
    if(self.wall.mover)
    self.wall.mover.activate();

  };

  this.select =             function ( event ) {
//    alert('select дверного проема');
    $wallCreator.hideAllDimensions();
    
    self.showMenuLKM(event.screenCoord);
    self.showDimensions();
    
  };
  this.unselect =           function ( event ) {
//    alert('unselect дверного проема');
    if(event)
    self.hideMenuLKM(event.screenCoord);
  
    self.hideDimensions();
  };
  this.select_contextmenu = function ( event ) {
    self.showMenu(event.screenCoord);
  };
  this.changeDoorwayDim =       function ( event ) {
    
    switch ( self.dimensions.indexOf( event.target ) ) {
      case 0:
        self.offset += event.value - self.dimension_lines[0].distance();
        break;
      case 1:
        self.offset += -( event.value - self.dimension_lines[1].distance() );
        break;
      case 2:
        self.width = +event.value;
        break;
      case 3:
        self.offset += event.value - self.dimension_lines[3].distance();
        break;
      case 4:
        self.offset += -( event.value - self.dimension_lines[4].distance() );
        break;
    }

    self.update();
  };

}
Doorway.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{

  constructor: Doorway,

  rebuildGeometry: function() {

    this.geometry = new THREE.BoxBufferGeometry( this.width, this.thickness+1, 1 );
    this.doorwayBody.geometry = new THREE.BoxGeometry( this.width, this.height, this.wall.width + 1 );
  },

  getCalculatePosition: function(){

    var result = new THREE.Vector3();
    result.copy( this.wall.worldToLocal(  this.wall.v1.clone().add( this.wall.direction.clone().multiplyScalar( this.offset ) ) ) );
    result.add( new THREE.Vector3(0,0,-(this.wall.height + this.top_offset)) );

    return result;

  },
  setStartPosition: function(){

    this.position.copy( this.getCalculatePosition() );

    //поворот по стене
    var cross = this.localToWorld ( new THREE.Vector3(1,0,0) ).cross ( this.wall.direction.clone() );
    var angle = this.localToWorld ( new THREE.Vector3(1,0,0) ).angleTo ( this.wall.direction.clone() );

    if( cross.y > 0 ){
      angle *= -1;
    }

    this.rotateZ ( angle );

  },

  setDoorwayBodyPosition: function(){

    this.doorwayBody.position.copy( this.wall.localToWorld(this.position.clone()) );
    this.doorwayBody.rotation.y = - this.rotation.z;
    this.doorwayBody.position.y = this.doorwayBody.position.y  - this.wall.height - this.top_offset + this.height/2 + this.elevation;
    
  },

  hideMenu: function() {
    $(this.rkmMenu).css('display','none');
  },
  showMenu: function(center){
    var self = this;

    var elements =  $( this.rkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    })

    //отображаем меню
    $( self.rkmMenu ).css('display','block');
    $( self.rkmMenu ).offset({top:center.y, left:center.x});

    //отображаем пункты меню
    setTimeout(function(){
      elements.each( function( i, item ){
        item.style.left = $wallEditor.doorwayMenu[i].left;
        item.style.top = $wallEditor.doorwayMenu[i].top;
      })
      
    }, 50);

  },

  hideMenuLKM: function() {

  },
  showMenuLKM: function(center){

  },

  setLocation: function(location){
    this.location = location || 1;
  },

  update: function(){
    
    this.rebuildGeometry();

    this.position.copy( this.getCalculatePosition() );
    
    this.setDoorwayBodyPosition();

    this.updateDimensions();
    
  },
  remove: function(object){

    if(object){

      THREE.Mesh.prototype.remove.call(this, object);

    } else {

      this.hideMenu();
      this.hideMenuLKM();
      this.hideDimensions();
      this.removeDimensions();
      this.deactivate();
      this.wall.removeDoorway(this);

    }
  },

  activate:   function() {

    if(this.dragControls){

      this.dragControls.activate();

    } else {

      this.dragControls = new DragControls( [this], camera, renderer.domElement );

    }

      this.dragControls.addEventListener( 'dragstart', this.dragstart );
      this.dragControls.addEventListener( 'drag', this.drag );
      this.dragControls.addEventListener( 'dragend', this.dragend );
      this.dragControls.addEventListener( 'hoveron', this.hoveron );
      this.dragControls.addEventListener( 'hoveroff', this.hoveroff );

      this.dimensions.forEach(function(item){
        item.activate();
      })
    

	},
  deactivate: function () {

    if(this.dragControls){
      this.dragControls.removeEventListener( 'dragstart', this.dragstart, false );
      this.dragControls.removeEventListener( 'drag', this.drag, false );
      this.dragControls.removeEventListener( 'dragend', this.dragend, false );
      this.dragControls.removeEventListener( 'hoveron', this.hoveron, false );
      this.dragControls.removeEventListener( 'hoveroff', this.hoveroff, false );

      this.dragControls.deactivate();
      this.dragControls = null;
    }

	},

  reverseWindingOrder: function(object3D) {

    if (object3D.type === "Mesh" && object3D.geometry.faces) {

//        if( ! object3D.geometry.isBufferGeometry){
//          var bg = new THREE.BufferGeometry();
//          bg.fromGeometry ( object3D.geometry );
//          object3D.geometry = bg;
//        }
        var geometry = object3D.geometry;
        for (var i = 0, l = geometry.faces.length; i < l; i++) {

            var face = geometry.faces[i];
            var temp = face.a;
            face.a = face.c;
            face.c = temp;

        }

        var faceVertexUvs = geometry.faceVertexUvs[0];
        for (i = 0, l = faceVertexUvs.length; i < l; i++) {

            var vector2 = faceVertexUvs[i][0];
            faceVertexUvs[i][0] = faceVertexUvs[i][2];
            faceVertexUvs[i][2] = vector2;
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
    }

    if (object3D.children) {

        for (var j = 0, jl = object3D.children.length; j < jl; j++) {

            this.reverseWindingOrder(object3D.children[j]);
        }
    }
  },

  createDimensions: function(){

    var self = this;

    var params = {direction: this.wall.direction90, offset_direction: 200, editable: true}

    this.dimensions.push( new Dimension( this.p11,   this.p_11, $projection.plane, params ) );
    this.dimensions.push( new Dimension( this.p_21,  this.p21, $projection.plane, params ) );
    this.dimensions.push( new Dimension( this.p_11,  this.p_21, $projection.plane, params ) );

    params.direction = this.wall.direction90.clone().negate();
    this.dimensions.push( new Dimension( this.p12,   this.p_12, $projection.plane, params ) );
    this.dimensions.push( new Dimension( this.p_22,  this.p22, $projection.plane, params ) );

    this.dimensions.forEach(function(item){
      scene.add( item );
    })


    $wallEditor.deactivateSelectControls();
    $wallEditor.activateSelectControls();

  },
  calcDimensionsPoints: function(){
    
    var Y = this.getWorldPosition().y;

    this.p11.copy( this.wall.v11.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p21.copy( this.wall.v21.clone().add(new THREE.Vector3( 0, Y, 0)) );

    this.raycaster.ray.origin = this.p11.clone();
    this.raycaster.ray.direction = this.wall.direction.clone();
    var intersects = [];
    intersects = this.raycaster.intersectObject(this);
    if(intersects.length > 0){
      this.p_11.copy( intersects[0].point );
    }

    this.raycaster.ray.origin = this.p21.clone();
    this.raycaster.ray.direction = this.wall.direction.clone().negate();
    var intersects = [];
    intersects = this.raycaster.intersectObject(this);
    if(intersects.length > 0){
      this.p_21.copy( intersects[0].point );
    }

    this.p12.copy( this.wall.v12.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p22.copy( this.wall.v22.clone().add(new THREE.Vector3( 0, Y, 0)) );

    this.raycaster.ray.origin = this.p12.clone();
    this.raycaster.ray.direction = this.wall.direction.clone();
    var intersects = [];
    intersects = this.raycaster.intersectObject(this);
    if(intersects.length > 0){
      this.p_12.copy( intersects[0].point );
    }

    this.raycaster.ray.origin = this.p22.clone();
    this.raycaster.ray.direction = this.wall.direction.clone().negate();
    var intersects = [];
    intersects = this.raycaster.intersectObject(this);
    if(intersects.length > 0){
      this.p_22.copy( intersects[0].point );
    }


    //расчет точек при наличии соседей
    var fullCopy = this.wall.doors.slice();
    fullCopy.splice( this.wall.doors.indexOf(this) ,1);

    this.raycaster.ray.origin = this.p_11.clone();
    this.raycaster.ray.direction = this.wall.direction.clone().negate();
    var intersects = [];
    intersects = this.raycaster.intersectObjects(fullCopy);
    if(intersects.length > 0){
      this.p11.copy( intersects[0].point );
    }

    this.raycaster.ray.origin = this.p_12.clone();
    this.raycaster.ray.direction = this.wall.direction.clone().negate();
    var intersects = [];
    intersects = this.raycaster.intersectObjects(fullCopy);
    if(intersects.length > 0){
      this.p12.copy( intersects[0].point );
    }


    this.raycaster.ray.origin = this.p_21.clone();
    this.raycaster.ray.direction = this.wall.direction.clone();
    var intersects = [];
    intersects = this.raycaster.intersectObjects(fullCopy);
    if(intersects.length > 0){
      this.p21.copy( intersects[0].point );
    }

    this.raycaster.ray.origin = this.p_22.clone();
    this.raycaster.ray.direction = this.wall.direction.clone();
    var intersects = [];
    intersects = this.raycaster.intersectObjects(fullCopy);
    if(intersects.length > 0){
      this.p22.copy( intersects[0].point );
    }

  },
  updateDimensions: function(){
    //перерасчет размеров
    this.calcDimensionsPoints();
    this.dimensions.forEach(function(item){
      item.update();
    })
  },
  showDimensions: function(){
    this.dimensions.forEach(function(item){
      item.visible = true;
    })

    this.dimensions[0].addEventListener( 'edit', this.changeDoorwayDim );
    this.dimensions[1].addEventListener( 'edit', this.changeDoorwayDim );
    this.dimensions[2].addEventListener( 'edit', this.changeDoorwayDim );
    this.dimensions[3].addEventListener( 'edit', this.changeDoorwayDim );
    this.dimensions[4].addEventListener( 'edit', this.changeDoorwayDim );

  },
  hideDimensions: function(){
    this.dimensions.forEach(function(item){
      item.visible = false;
    })

    this.dimensions[0].removeEventListener( 'edit', this.changeDoorwayDim );
    this.dimensions[1].removeEventListener( 'edit', this.changeDoorwayDim );
    this.dimensions[2].removeEventListener( 'edit', this.changeDoorwayDim );
    this.dimensions[3].removeEventListener( 'edit', this.changeDoorwayDim );
    this.dimensions[4].removeEventListener( 'edit', this.changeDoorwayDim );
  },
  removeDimensions: function(){
    this.dimensions.forEach(function( item, index ){
      scene.remove( item );
    })
  },

});
//Дверной блок
function Doorblock( wall, parameters ){

  Doorway.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'Doorblock';
  this.name = 'singleDoor';

  this.lkmMenu = '.FourStateSwitcher';
  this.rkmMenu = '.DoorwayMenu';

  this.door_thickness = parameters.hasOwnProperty("thicdoor_thicknesskness") ? parameters["door_thickness"] : 40;
  //свойство положения
  this.location = parameters.hasOwnProperty("location") ? parameters["location"] : 1;

  //условное графическое изображение
  this.CGI = {};
  this.addCGI();

  this.dragControls = null;

  //зависимый объект
  this.depObject = null;
  this.loadObject();

}
Doorblock.prototype = Object.assign( Object.create( Doorway.prototype ),{

  constructor: Doorblock,

  addCGI: function(){
      //УГО двери
    this.CGI.door = new THREE.Mesh( this.getCGIDoorGeometry(), $projection.projectionWallMaterial );
    this.CGI.door.material.copy( $projection.projectionWallMaterial.clone() );
    this.CGI.door.lookAt(new THREE.Vector3(0, 0, -1));

    //параметры дуги
    this.CGI.ax = 0;
    this.CGI.ay = 0;
    this.CGI.xRadius = this.CGI.yRadius = 0;
    this.CGI.aStartAngle = 0;
    this.CGI.aEndAngle =  Math.PI/4;
    this.CGI.aClockwise = 0;
    this.CGI.aRotation = 0;

    //позиционирование дополнительных объектов двери и дуги
    this.setCGILocation();

    this.CGI.door.rotateZ( Math.PI/2 );
    this.CGI.arc = this.getArc();

    this.add( this.CGI.door, this.CGI.arc);

  },
  setCGILocation: function(){

    switch (this.location) {
      case 1:

        this.CGI.door.position.x = this.width/2 - this.door_thickness/2;
        this.CGI.door.position.y = this.width/2 + this.thickness/2 + 1;

        //параметры дуги
        this.CGI.ax = this.CGI.door.position.x + this.door_thickness/2;
        this.CGI.ay = this.thickness/2;
        this.CGI.xRadius = this.CGI.yRadius = this.width - 2;
        this.CGI.aStartAngle = Math.PI/2;
        this.CGI.aEndAngle = Math.PI ;

        break;
      case 2:
        this.CGI.door.position.x = - this.width/2 + this.door_thickness/2;
        this.CGI.door.position.y = this.width/2 + this.thickness/2 + 1;

        //параметры дуги
        this.CGI.ax = this.CGI.door.position.x - this.door_thickness/2;
        this.CGI.ay = this.thickness/2;
        this.CGI.xRadius = this.CGI.yRadius = this.width - 2;
        this.CGI.aStartAngle = 0;
        this.CGI.aEndAngle = Math.PI/2 ;

        break;
      case 3:
        this.CGI.door.position.x = this.width/2 - this.door_thickness/2;
        this.CGI.door.position.y = -this.width/2 - this.thickness/2 + 1;

        //параметры дуги
        this.CGI.ax = this.CGI.door.position.x + this.door_thickness/2;
        this.CGI.ay = -this.thickness/2;
        this.CGI.xRadius = this.CGI.yRadius = this.width - 2;
        this.CGI.aStartAngle = Math.PI;
        this.CGI.aEndAngle = Math.PI + Math.PI/2 ;

        break;
      case 4:
        this.CGI.door.position.x = - this.width/2 + this.door_thickness/2;
        this.CGI.door.position.y = - this.width/2 - this.thickness/2 + 1;

        //параметры дуги
        this.CGI.ax = this.CGI.door.position.x - this.door_thickness/2;
        this.CGI.ay = -this.thickness/2;
        this.CGI.xRadius = this.CGI.yRadius = this.width - 2;
        this.CGI.aStartAngle = Math.PI + Math.PI/2 ;
        this.CGI.aEndAngle =  0;

        break;
    }

  },
  getCGIDoorGeometry: function(){
    return new THREE.PlaneBufferGeometry( this.width, this.door_thickness );
  },
  getArc: function(){

    var curve = new THREE.EllipseCurve(
      this.CGI.ax, this.CGI.ay,
      this.CGI.xRadius, this.CGI.yRadius,
      this.CGI.aStartAngle, this.CGI.aEndAngle,
      this.CGI.aClockwise,
      this.CGI.aRotation
    );

    var path = new THREE.Path( curve.getPoints( 50 ) );
    var geometry = path.createPointsGeometry( 50 );
    var material = new THREE.LineBasicMaterial( { color : this.CGI.door.material.color } );

        // Create the final object to add to the scene
    return  (new THREE.Line( geometry, material ) );
  },

  loadObject: function(){

    var self = this;

    loadJSON('sc/door.json','door', function(item){
      if(item){
        self.depObject = item;
        self.setDepObjectPosition();
        self.setDepObjectSize();
        self.depObject.visible = false;
      }
    });
  },
  setDepObjectPosition: function(){
    
    this.depObject.position.copy( this.wall.localToWorld(this.position.clone()) );
    this.depObject.rotation.y =  Math.PI - this.rotation.z;
    this.depObject.position.y = this.depObject.position.y  - this.wall.height - this.top_offset  + this.elevation;

  },
  setDepObjectSize: function(){

    this.depObject.children[0].geometry.computeBoundingBox();
    var box = this.depObject.children[0].geometry.boundingBox;

    var height = Math.abs( box.max.applyMatrix4( this.depObject.matrixWorld ).y - box.min.applyMatrix4( this.depObject.matrixWorld ).y );
    var width = Math.abs( box.max.applyMatrix4( this.depObject.matrixWorld ).x - box.min.applyMatrix4( this.depObject.matrixWorld ).x );


    if( ! this.depObject.children[0].scale.x){
      this.depObject.children[0].scale.set(1,1,1);
    }
    var koef_height = height * this.depObject.children[0].scale.y / (this.height - 1);
    var koef_width = width * this.depObject.children[0].scale.x / (this.width - 1);

    var X = this.depObject.children[0].scale.x / koef_width ;
    var Y = this.depObject.children[0].scale.y / koef_height ;

    this.depObject.children[0].scale.set( X, Y, X < Y ? X : Y );

  },
  setDepObjectLocation: function(location){

      if(location != this.location){

        switch (this.location) {
          case 1:

            this.depObject.children[0].geometry.scale(-1,1,1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 2:

            this.depObject.children[0].geometry.scale(1, 1, 1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 3:

            this.depObject.children[0].geometry.scale(-1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 4:

            this.depObject.children[0].geometry.scale(1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
        }

        switch (location) {
          case 1:

            this.depObject.children[0].geometry.scale(-1,1,1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 2:

            this.depObject.children[0].geometry.scale(1, 1, 1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 3:

            this.depObject.children[0].geometry.scale(-1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 4:

            this.depObject.children[0].geometry.scale(1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
        }

    }

  },
  showDepObject: function(){
    this.depObject.visible = true;
  },
  hideDepObject: function(){
    this.depObject.visible = false;
  },
  removeDepObject: function(){
    scene.remove( this.depObject );
  },
  

  setLocation: function(location){

    this.setDepObjectLocation(location);

    this.location = location;

    this.setCGILocation();

  },

  hideMenu: function() {
    $( this.rkmMenu  ).css('display','none');
  },
  showMenu: function(center){

    var elements =  $( this.rkmMenu  ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    })

    //отображаем меню
    $( this.rkmMenu  ).css('display','block');
    $( this.rkmMenu  ).offset({top:center.y, left:center.x});

    //отображаем пункты меню
    setTimeout(function(){
      elements.each( function( i, item ){
        item.style.left = $wallEditor.doorwayMenu[i].left;
        item.style.top = $wallEditor.doorwayMenu[i].top;
      })

    }, 50);

  },

  hideMenuLKM: function() {
    $( this.lkmMenu ).css('display','none');
  },
  showMenuLKM: function(center){

    var elements =  $( this.lkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    })

    //отображаем меню
    $( this.lkmMenu ).css('display','block');
    $( this.lkmMenu ).offset({top:center.y, left:center.x});

    //отображаем пункты меню
//    setTimeout(function(){
//      elements.each( function( i, item ){
//        item.style.left = $wallEditor.doorblockSwitcherCoord[i].left;
//        item.style.top = $wallEditor.doorblockSwitcherCoord[i].top;
//      })
//
//    }, 50);

    setTimeout(function(){
      elements[1].style.left = $wallEditor.doorblockSwitcherCoord[1].left;
      elements[1].style.top = $wallEditor.doorblockSwitcherCoord[1].top;

      elements[2].style.left = $wallEditor.doorblockSwitcherCoord[2].left;
      elements[2].style.top = $wallEditor.doorblockSwitcherCoord[2].top;
    }, 50);
    setTimeout(function(){
      elements[0].style.left = $wallEditor.doorblockSwitcherCoord[0].left;
      elements[0].style.top = $wallEditor.doorblockSwitcherCoord[0].top;

      elements[3].style.left = $wallEditor.doorblockSwitcherCoord[3].left;
      elements[3].style.top = $wallEditor.doorblockSwitcherCoord[3].top;
    }, 100);

  },

  update: function(){

//    this.position.copy( this.getCalculatePosition() );
//
//    this.setDoorwayBodyPosition();
//
//    this.updateDimensions();
    
    Doorway.prototype.update.call(this);

    this.remove(this.CGI.arc)
    this.CGI.door.geometry = this.getCGIDoorGeometry();
    this.setCGILocation();//здесь необходим при изм размеров
    this.CGI.arc = this.getArc();

    this.add(this.CGI.arc);

    this.setDepObjectSize();
    this.setDepObjectLocation(this.location);//здесь необходим при изм размеров
    this.setDepObjectPosition();

  },
  remove: function(object){
    if(object){

      Doorway.prototype.remove.call(this, object);

    } else {

      this.removeDepObject();
      Doorway.prototype.remove.call(this);

    }
  },

});
//Окно
function WindowBlock( wall, parameters ){

  Doorblock.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'WindowBlock';
  this.name = 'windowblock';

  this.lkmMenu = '.TwoStateSwitcher';
  this.rkmMenu = '.DoorwayMenu';

}
WindowBlock.prototype = Object.assign( Object.create( Doorblock.prototype ),{

  constructor: WindowBlock,

  addCGI: function(){

    this.CGI.window_line = new THREE.LineSegments( this.getCGIGeometry(), $projection.projectionWallMaterial.clone());

//позиционирование дополнительных объектов двери и дуги
    this.setCGILocation();

    this.add( this.CGI.window_line);
    
  },
  setCGILocation: function(){

    this.CGI.window_line.rotateZ( Math.PI );
    this.CGI.window_line.position.z = -2;
    
    
  },
  getCGIGeometry: function(){
    //УГО окна
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( -this.width/2,  this.wall.width/4+1, 0));
    geometry.vertices.push(new THREE.Vector3(  this.width/2,  this.wall.width/4+1, 0));
    geometry.vertices.push(new THREE.Vector3( -this.width/2, -this.wall.width/4+1, 0));
    geometry.vertices.push(new THREE.Vector3(  this.width/2, -this.wall.width/4+1, 0));

    return geometry;
  },

  loadObject: function(){

    var self = this;

    loadJSON('sc/window.json','window', function(item){
      if(item){
        self.depObject = item;
        self.setDepObjectPosition();
        self.setDepObjectSize();
        self.depObject.visible = false;
      }
    });

  },
  setDepObjectPosition: function(){

    this.depObject.position.copy( this.wall.localToWorld(this.position.clone()) );
    this.depObject.rotation.y =  Math.PI - this.rotation.z;
    this.depObject.position.y = this.depObject.position.y  - this.wall.height - this.top_offset  + this.elevation;

  },
  setDepObjectSize: function(){

    this.depObject.children[0].geometry.computeBoundingBox();
    var box = this.depObject.children[0].geometry.boundingBox;

    var height = Math.abs( box.max.applyMatrix4( this.depObject.matrixWorld ).y - box.min.applyMatrix4( this.depObject.matrixWorld ).y );
    var width = Math.abs( box.max.applyMatrix4( this.depObject.matrixWorld ).x - box.min.applyMatrix4( this.depObject.matrixWorld ).x );


    if( ! this.depObject.children[0].scale.x){
      this.depObject.children[0].scale.set(1,1,1);
    }
    var koef_height = height * this.depObject.children[0].scale.y / (this.height - 1);
    var koef_width = width * this.depObject.children[0].scale.x / (this.width - 1);

    var X = this.depObject.children[0].scale.x / koef_width;
    var Y = this.depObject.children[0].scale.y / koef_height;

    this.depObject.children[0].scale.set( X, Y, X < Y ? X : Y );

  },
  setDepObjectLocation: function(location){

      if(location != this.location){

        switch (this.location) {
          case 1:

            this.depObject.children[0].geometry.scale(-1,1,1);
            this.reverseWindingOrder( this.depObject );

            break;
          case 2:

            this.depObject.children[0].geometry.scale(1, 1, 1);
            this.reverseWindingOrder( this.depObject );

            break;
          case 3:

            this.depObject.children[0].geometry.scale(-1, 1, -1);
            this.reverseWindingOrder( this.depObject );

            break;
          case 4:

            this.depObject.children[0].geometry.scale(1, 1, -1);
            this.reverseWindingOrder( this.depObject );

            break;
        }

        switch (location) {
          case 1:

            this.depObject.children[0].geometry.scale(-1,1,1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 2:

            this.depObject.children[0].geometry.scale(1, 1, 1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 3:

            this.depObject.children[0].geometry.scale(-1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 4:

            this.depObject.children[0].geometry.scale(1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
        }

    }

  },

  showMenuLKM: function(center){

    var elements =  $( this.lkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    })

    //отображаем меню
    $( this.lkmMenu ).css('display','block');
    $( this.lkmMenu ).offset({top:center.y, left:center.x});


    setTimeout(function(){
      elements[0].style.left = $wallEditor.windowblockSwitcherCoord[0].left;
      elements[0].style.top = $wallEditor.windowblockSwitcherCoord[0].top;

      elements[1].style.left = $wallEditor.windowblockSwitcherCoord[1].left;
      elements[1].style.top = $wallEditor.windowblockSwitcherCoord[1].top;
    }, 50);

  },

  update: function(){

    Doorway.prototype.update.call(this);

    this.CGI.window_line.geometry = this.getCGIGeometry();
    
    this.setDepObjectSize();
    this.setDepObjectLocation(this.location);//здесь необходим при изм размеров
    this.setDepObjectPosition();

  }

});
//Двойная дверь
function DoubleDoorBlock( wall, parameters ){

  Doorblock.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'DoubleDoorBlock';
  this.name = 'doubleDoor';

  this.lkmMenu = '.TwoStateSwitcher';
  this.rkmMenu = '.DoorwayMenu';

}
DoubleDoorBlock.prototype = Object.assign( Object.create( Doorblock.prototype ),{

  constructor: DoubleDoorBlock,

  addCGI: function(){
      //УГО двери
    this.CGI.door = new THREE.Mesh( this.getCGIDoorGeometry(), $projection.projectionWallMaterial );
    this.CGI.door.material.copy( $projection.projectionWallMaterial.clone() );
    this.CGI.door.lookAt(new THREE.Vector3(0, 0, -1));

    this.CGI.door2 = this.CGI.door.clone();

    //параметры дуги//

    this.CGI.prop_arc = {};
    this.CGI.prop_arc2 = {};
    //позиционирование дополнительных объектов двери и дуги
    this.setCGILocation();

    this.CGI.door.rotateZ( Math.PI/2 );
    this.CGI.door2.rotateZ( Math.PI/2 );
    this.CGI.arc = this.getArc( this.CGI.prop_arc );
    this.CGI.arc2 = this.getArc( this.CGI.prop_arc2 );

    this.add( this.CGI.door, this.CGI.arc, this.CGI.door2, this.CGI.arc2);

  },
  setCGILocation: function(){

    this.CGI.prop_arc.aClockwise = this.CGI.prop_arc2.aClockwise = 0;
    this.CGI.prop_arc.aRotation = this.CGI.prop_arc2.aRotation = 0;

    switch (this.location) {
      case 1:

        this.CGI.door.position.x = this.width/2 - this.door_thickness/2;
        this.CGI.door.position.y = this.width/4 + this.thickness/2 + 1;

        this.CGI.door2.position.x = - this.width/2 + this.door_thickness/2;
        this.CGI.door2.position.y = this.width/4 + this.thickness/2 + 1;

        //параметры дуги
        this.CGI.prop_arc.ax = this.CGI.door.position.x + this.door_thickness/2;;
        this.CGI.prop_arc.ay = this.thickness/2;
        this.CGI.prop_arc.xRadius = this.CGI.prop_arc.yRadius = this.width/2 - 2;
        this.CGI.prop_arc.aStartAngle = Math.PI/2;
        this.CGI.prop_arc.aEndAngle = Math.PI ;

        //параметры дуги
        this.CGI.prop_arc2.ax = this.CGI.door2.position.x - this.door_thickness/2;;
        this.CGI.prop_arc2.ay = this.thickness/2;
        this.CGI.prop_arc2.xRadius = this.CGI.prop_arc2.yRadius = this.width/2 - 2;
        this.CGI.prop_arc2.aStartAngle = 0;
        this.CGI.prop_arc2.aEndAngle = Math.PI/2 ;

        break;
      case 2:


        break;
      case 3:
        this.CGI.door.position.x = this.width/2 - this.door_thickness/2;
        this.CGI.door.position.y = -this.width/4 - this.thickness/2 + 1;

        this.CGI.door2.position.x = - this.width/2 + this.door_thickness/2;
        this.CGI.door2.position.y = - this.width/4 - this.thickness/2 + 1;

        //параметры дуги
        this.CGI.prop_arc.ax = this.CGI.door.position.x + this.door_thickness/2;;
        this.CGI.prop_arc.ay = -this.thickness/2;
        this.CGI.prop_arc.xRadius = this.CGI.prop_arc.yRadius = this.width/2 - 2;
        this.CGI.prop_arc.aStartAngle = Math.PI;
        this.CGI.prop_arc.aEndAngle = Math.PI + Math.PI/2 ;

        //параметры дуги
        this.CGI.prop_arc2.ax = this.CGI.door2.position.x - this.door_thickness/2;;
        this.CGI.prop_arc2.ay = -this.thickness/2;
        this.CGI.prop_arc2.xRadius = this.CGI.prop_arc2.yRadius = this.width/2 - 2;
        this.CGI.prop_arc2.aStartAngle = Math.PI + Math.PI/2 ;
        this.CGI.prop_arc2.aEndAngle =  0;

        break;
      case 4:


        break;
    }

  },
  getCGIDoorGeometry: function(){
    return new THREE.PlaneBufferGeometry( this.width/2, this.door_thickness );
  },
  getArc: function( prop ){

    var curve = new THREE.EllipseCurve(
      prop.ax, prop.ay,
      prop.xRadius, prop.yRadius,
      prop.aStartAngle, prop.aEndAngle,
      prop.aClockwise,
      prop.aRotation
    );

    var path = new THREE.Path( curve.getPoints( 50 ) );
    var geometry = path.createPointsGeometry( 50 );
    var material = new THREE.LineBasicMaterial( { color : this.CGI.door.material.color } );

        // Create the final object to add to the scene
    return  (new THREE.Line( geometry, material ) );
  },


  loadObject: function(){

    var self = this;

    loadOBJ_door2('sc/Dooropen2.obj','double_door', function(item){
      if(item){
        self.depObject = item;
        self.setDepObjectPosition();
        self.setDepObjectSize();
        self.depObject.visible = false;
      }
    });

  },
  setDepObjectPosition: function(){

    this.depObject.position.copy( this.wall.localToWorld(this.position.clone()) );
    this.depObject.rotation.y =  Math.PI - this.rotation.z;
    this.depObject.position.y = this.depObject.position.y  - this.wall.height - this.top_offset  + this.elevation;

  },
  setDepObjectSize: function(){

    this.depObject.children[0].geometry.computeBoundingBox();
    var box = this.depObject.children[0].geometry.boundingBox;

    var height = Math.abs( box.max.applyMatrix4( this.depObject.matrixWorld ).y - box.min.applyMatrix4( this.depObject.matrixWorld ).y );
    var width = Math.abs( box.max.applyMatrix4( this.depObject.matrixWorld ).x - box.min.applyMatrix4( this.depObject.matrixWorld ).x );


    if( ! this.depObject.children[0].scale.x){
      this.depObject.children[0].scale.set(1,1,1);
    }
    var koef_height = height * this.depObject.children[0].scale.y / (this.height - 1);
    var koef_width = width * this.depObject.children[0].scale.x / (this.width - 1);

    var X = this.depObject.children[0].scale.x / koef_width;
    var Y = this.depObject.children[0].scale.y / koef_height;

    this.depObject.children[0].scale.set( X, Y, X < Y ? X : Y );

  },
  setDepObjectLocation: function(location){

      if(location != this.location){

        switch (this.location) {
          case 1:

            this.depObject.children[0].geometry.scale(-1,1,1);
            this.reverseWindingOrder( this.depObject );

            break;
          case 2:

            this.depObject.children[0].geometry.scale(1, 1, 1);
            this.reverseWindingOrder( this.depObject );

            break;
          case 3:

            this.depObject.children[0].geometry.scale(-1, 1, -1);
            this.reverseWindingOrder( this.depObject );

            break;
          case 4:

            this.depObject.children[0].geometry.scale(1, 1, -1);
            this.reverseWindingOrder( this.depObject );

            break;
        }

        switch (location) {
          case 1:

            this.depObject.children[0].geometry.scale(-1,1,1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 2:

            this.depObject.children[0].geometry.scale(1, 1, 1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 3:

            this.depObject.children[0].geometry.scale(-1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 4:

            this.depObject.children[0].geometry.scale(1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
        }

    }

  },

  showMenuLKM: function(center){

    var elements =  $( this.lkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    })

    //отображаем меню
    $( this.lkmMenu ).css('display','block');
    $( this.lkmMenu ).offset({top:center.y, left:center.x});


    setTimeout(function(){
      elements[0].style.left = $wallEditor.windowblockSwitcherCoord[0].left;
      elements[0].style.top = $wallEditor.windowblockSwitcherCoord[0].top;

      elements[1].style.left = $wallEditor.windowblockSwitcherCoord[1].left;
      elements[1].style.top = $wallEditor.windowblockSwitcherCoord[1].top;
    }, 50);

  },

  update: function(){

//    this.position.copy( this.getCalculatePosition() );

    Doorway.prototype.update.call(this);

    this.remove( this.CGI.arc );
    this.remove( this.CGI.arc2 );
    this.CGI.door.geometry = this.getCGIDoorGeometry();
    this.CGI.door2.geometry = this.CGI.door.geometry.clone();
    this.setCGILocation();//здесь необходим при изм размеров
    this.CGI.arc = this.getArc( this.CGI.prop_arc );
    this.CGI.arc2 = this.getArc( this.CGI.prop_arc2 );
    this.add( this.CGI.arc, this.CGI.arc2);

//    this.setDoorwayBodyPosition();
//
//    this.setDepObjectPosition();

    this.setDepObjectSize();
    this.setDepObjectLocation(this.location);//здесь необходим при изм размеров
    this.setDepObjectPosition();

  }

});
//Окно
function WindowBlock2( wall, parameters ){

  Doorway.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'WindowBlock';
  this.name = 'windowblock';

  this.location = parameters.hasOwnProperty("location") ? parameters["location"] : 1;

  //условное графическое изображение
  this.CGI = {};
  this.addCGI();

  this.dragControls = null;

  //зависимый объект
  this.depObject = null;
  this.loadObject();
  
}
WindowBlock2.prototype = Object.assign( Object.create( Doorway.prototype ),{

  constructor: WindowBlock2,

  addCGI: function(){
    
    //УГО окна
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( -this.width/2,  this.wall.width/4+1, 0));
    geometry.vertices.push(new THREE.Vector3(  this.width/2,  this.wall.width/4+1, 0));
    geometry.vertices.push(new THREE.Vector3( -this.width/2, -this.wall.width/4+1, 0));
    geometry.vertices.push(new THREE.Vector3(  this.width/2, -this.wall.width/4+1, 0));

    this.CGI.window_line = new THREE.LineSegments(geometry, $projection.projectionWallMaterial.clone());

    this.add( this.CGI.window_line);
  },
  setCGIPosition: function(){

    switch (this.location) {
      case 1:

        this.CGI.window_line.rotateZ( Math.PI );

        break;
      case 2:

        break;
      case 3:

        this.CGI.window_line.rotateZ( Math.PI );

        break;
      case 4:

        break;
    }

  },
  setCGILocation: function(){
    this.CGI.window_line.rotateZ( Math.PI );
  },
  
  loadObject: function(){

    var self = this;

    loadJSON('sc/window.json','window', function(item){
      if(item){
        self.depObject = item;
        self.setDepObjectPosition();
        self.setDepObjectSize();
        self.depObject.visible = false;
      }
    });

  },
  setDepObjectPosition: function(){

    this.depObject.position.copy( this.wall.localToWorld(this.position.clone()) );
    this.depObject.rotation.y =  Math.PI - this.rotation.z;
    this.depObject.position.y = this.depObject.position.y  - this.wall.height - this.top_offset  + this.elevation;

  },
  setDepObjectSize: function(){

    this.depObject.children[0].geometry.computeBoundingBox();
    var box = this.depObject.children[0].geometry.boundingBox;

    var height = Math.abs( box.max.applyMatrix4( this.depObject.matrixWorld ).y - box.min.applyMatrix4( this.depObject.matrixWorld ).y );
    var width = Math.abs( box.max.applyMatrix4( this.depObject.matrixWorld ).x - box.min.applyMatrix4( this.depObject.matrixWorld ).x );


    if( ! this.depObject.children[0].scale.x){
      this.depObject.children[0].scale.set(1,1,1);
    }
    var koef_height = height * this.depObject.children[0].scale.y / (this.height - 1);
    var koef_width = width * this.depObject.children[0].scale.x / (this.width - 1);

    var X = this.depObject.children[0].scale.x / koef_width;
    var Y = this.depObject.children[0].scale.y / koef_height;

    this.depObject.children[0].scale.set( X, Y, X < Y ? X : Y );

  },
  setDepObjectLocation: function(location){

      if(location != this.location){

        switch (this.location) {
          case 1:

            this.depObject.children[0].geometry.scale(-1,1,1);
            this.reverseWindingOrder( this.depObject );

            break;
          case 2:

            this.depObject.children[0].geometry.scale(1, 1, 1);
            this.reverseWindingOrder( this.depObject );

            break;
          case 3:

            this.depObject.children[0].geometry.scale(-1, 1, -1);
            this.reverseWindingOrder( this.depObject );

            break;
          case 4:

            this.depObject.children[0].geometry.scale(1, 1, -1);
            this.reverseWindingOrder( this.depObject );

            break;
        }

        switch (location) {
          case 1:

            this.depObject.children[0].geometry.scale(-1,1,1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 2:

            this.depObject.children[0].geometry.scale(1, 1, 1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 3:

            this.depObject.children[0].geometry.scale(-1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
          case 4:

            this.depObject.children[0].geometry.scale(1, 1, -1);
            this.reverseWindingOrder(this.depObject);

            break;
        }

    }

  },

  setLocation: function(location){

    this.setDepObjectLocation(location);

    this.location = location;

    this.setCGILocation();

  },

  hideMenu: function() {
    $('.DoorwayMenu').css('display','none');
  },
  showMenu: function(center){

    var elements =  $('.DoorwayMenu').find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    })

    //отображаем меню
    $('.DoorwayMenu').css('display','block');
    $(".DoorwayMenu").offset({top:center.y, left:center.x});

    //отображаем пункты меню
    setTimeout(function(){
      elements.each( function( i, item ){
        item.style.left = $wallEditor.doorwayMenu[i].left;
        item.style.top = $wallEditor.doorwayMenu[i].top;
      })

    }, 50);

  },

  hideMenuLKM: function() {
    $('.TwoStateSwitcher').css('display','none');
  },
  showMenuLKM: function(center){

    var elements =  $('.TwoStateSwitcher').find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    })

    //отображаем меню
    $('.TwoStateSwitcher').css('display','block');
    $(".TwoStateSwitcher").offset({top:center.y, left:center.x});


    setTimeout(function(){
      elements[0].style.left = $wallEditor.windowblockSwitcherCoord[0].left;
      elements[0].style.top = $wallEditor.windowblockSwitcherCoord[0].top;

      elements[1].style.left = $wallEditor.windowblockSwitcherCoord[1].left;
      elements[1].style.top = $wallEditor.windowblockSwitcherCoord[1].top;
    }, 50);

  },

  update: function(){

    this.position.copy( this.getCalculatePosition() );

    this.setDoorwayBodyPosition();

    this.setDepObjectPosition();

  }

});


//Перемещение mover стены
DragControls2 = function ( _objects, _camera, _domElement, _plane_normal ) {

	if ( _objects instanceof THREE.Camera ) {

		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}

	var _plane = new THREE.Plane();
  _plane.normal = _plane_normal || new THREE.Vector3( 0, 1, 0 );
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();

	var _selected = null, _hovered = null;

	//

	var scope = this;

	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function dispose() {

		deactivate();

	}

	function onDocumentMouseMove( event ) {

		event.preventDefault();

		_mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

//        _selected.position.copy(_intersection.clone().sub( _offset )) ;
        _selected.position.copy( _selected.parent.worldToLocal(_intersection.clone().sub( _offset )) )  ;

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

//      _offset.copy( _intersection.clone() .sub( _selected.position ) );   //=============
      if(_selected.parent)
      _offset.copy( _intersection ).sub( _selected.parent.localToWorld(_selected.position.clone()) );

			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );

    intersects = [];

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

		}

	}

	function onDocumentMouseDown( event ) {
    
		event.preventDefault();
    _mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

//				_offset.copy( _intersection ).sub( _selected.position.clone() );
        if(_selected.parent)
        _offset.copy( _intersection ).sub( _selected.parent.localToWorld(_selected.position.clone()) );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentMouseUp( event ) {

		event.preventDefault();

		if ( _selected ) {

      scope.dispatchEvent( { type: 'dragend', object: _selected } );
        _selected = null;
			
		}

		_domElement.style.cursor = 'auto';

	}

	activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls2: setObjects() has been removed.' );

	};


};
DragControls2.prototype = Object.create( THREE.EventDispatcher.prototype );
DragControls2.prototype.constructor = DragControls2;
//Перемещение
DragControls = function ( _objects, _camera, _domElement, _plane_normal ) {

	if ( _objects instanceof THREE.Camera ) {

		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}

	var _plane = new THREE.Plane();
  _plane.normal = _plane_normal || new THREE.Vector3( 0, 1, 0 );
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();

	var _selected = null, _hovered = null;

	//

	var scope = this;

	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );

	}

	function dispose() {

		deactivate();

	}

	function onDocumentMouseMove( event ) {

		event.preventDefault();

		_mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

//        _selected.position.copy(_intersection.clone().sub( _offset )) ;
        if(_selected.parent)
        _selected.position.copy( _selected.parent.worldToLocal(_intersection.clone().sub( _offset )) )  ;

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

//      _offset.copy( _intersection.clone() .sub( _selected.position ) );   //=============
//      _offset.copy( _intersection ).sub( _selected.parent.localToWorld(_selected.position.clone()) );

			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );

    intersects = [];

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

		}

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();
    _mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

//				_offset.copy( _intersection ).sub( _selected.position.clone() );
        if(_selected.parent)
        _offset.copy( _intersection ).sub( _selected.parent.localToWorld(_selected.position.clone()) );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentMouseUp( event ) {

		event.preventDefault();

		if ( _selected ) {

      scope.dispatchEvent( { type: 'dragend', object: _selected } );
        _selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls: setObjects() has been removed.' );

	};

};
DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
DragControls.prototype.constructor = DragControls;
//выбор элемента
SelectControls = function ( _objects, _camera, _domElement ){

  if ( _objects instanceof THREE.Camera ) {

		console.warn( 'SelectControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}


  var _plane = new THREE.Plane();
  _plane.normal = new THREE.Vector3( 0, 1, 0 );
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _selected = null, _hovered = null;
  var _coord = null;

	//

	var scope = this;

  function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
    _domElement.addEventListener( 'contextmenu', onDocumentContextMenu, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    _domElement.removeEventListener( 'contextmenu', onDocumentContextMenu, false );

	}

  function onDocumentMouseMove( event ) {

		event.preventDefault();

		_mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );


		_raycaster.setFromCamera( _mouse, _camera );

    intersects = [];

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

		}

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();
    _mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

//			_domElement.style.cursor = 'move';
      _coord = {x:event.clientX, y:event.clientY};
			scope.dispatchEvent( { type: 'select', object: _selected, screenCoord: _coord } );

		} else {
      scope.dispatchEvent( { type: 'unselect', object: _selected, screenCoord: _coord } );
    }


	}

	function onDocumentMouseUp( event ) {

		event.preventDefault();

		if ( _selected ) {

      scope.dispatchEvent( { type: 'end', object: _selected } );
        _selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

  function onDocumentContextMenu( event ){
   		event.preventDefault();
    _mouse.x = ( event.clientX / _domElement.width ) * 2 - 1;
		_mouse.y = - ( event.clientY / _domElement.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

      _coord = {x:event.clientX, y:event.clientY};
			scope.dispatchEvent( { type: 'select_contextmenu', object: _selected, screenCoord: _coord } );

		} else {
      scope.dispatchEvent( { type: 'unselect', object: _selected, screenCoord: _coord } );
    }
  }
  
  activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;


}
SelectControls.prototype = Object.create( THREE.EventDispatcher.prototype );
SelectControls.prototype.constructor = SelectControls;



