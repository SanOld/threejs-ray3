

//Редактор
function Editor(obj){

  obj.lights = [];

  obj.timerId = undefined; //id интервала сохранения
  obj.timeSaveInterval = 15000;//мс
  obj.storageEnabled = true;
  obj.floor = null; //подложка
  obj.hidedFloorTexture = null;
  obj.timeStamp = 0;


//  obj.wallCreationModes = [ 'center', 'inner', 'outer' ];
  obj.wallActions = [ 'notChangable', 'installation', 'deinstallation' ];
  obj.wallBearingType = {
                          'bear_wall': 'Несущая',
                          'partition_wall': 'Перегородка',
                          'pillar': 'Колонна',
                          'stairs': 'Лестница'
                        };

  obj.wallColors = {
    notChangable: 'black',
    installation: 'green',
    deinstallation: 'red'
  };

  obj.default_params = {
//    wallCreationMode: obj.wallCreationModes[0],
    wallWidth: 100,
    opacity: 0.8,
    Wall:{
      main_color: 'black',
      color_3D: '#d5c7ac',
      active_color: '#00FFFF'
    },
    wallMover:{
      hover_color: '#ADFF2F'
    },
    Doorway:{
      width: 100,
      height: 2100,
      elevation: 0,
      main_color: 'white',
      active_color: '#00FFFF'
    },
    Room:{
      main_color: '#FFCC99',
      active_color: '#00FFFF',
      hover_color: '#ADFF2F'
    },
    RoomSurface:{
      main_color: 'black',
      width: 50
    },
    RoomDoorway:{
      main_color: '#A0A0A0'
    },
    PointerHelper:{
      radius: 175
    }
  };


  obj.on = function(){


    obj.addPropGui();

    obj.addFloor();
    obj.addLight();
    obj.loadData();
//    obj.loadFromLocalStorage();
    obj.setPositionLight();

    //активация
    obj.activate();

    controls.target.set( obj.floor.position.x, obj.floor.position.y, obj.floor.position.z );
    camera.lookAt(obj.floor.position.clone());
    controls.update();

    scene.add( Dimensions );//глобальный объект-хранилище размеров
//    scene.add( Areas );//глобальный объект-хранилище размеров площадей комнат
//    scene.add( AreaCounturs );//глобальный объект-хранилище размеров контуров комнат
    //режим чертежа
    switch (MODE) {
      case 'selection':

        toggleMode('2D');
        $projection.toggleModeIn2D( 'selection' );

        break;

      default:

        if( ! $projection.enabled){

          toggleMode('2D');
          $projection.toggleModeIn2D( 'creation' );

        }

        break;
    }

  };
  obj.off = function(){
    obj.deactivate();
    obj.localSavingOff();
  };

  obj.addPropGui = function(){

    var gui = new dat.GUI();
				gui.add( obj.default_params, 'opacity', 0, 1 ).onChange( function () {

          acsWallMaterial2.opacity = obj.default_params.opacity;

					projectionWallMaterial_black.opacity = obj.default_params.opacity;
          projectionWallMaterial_green.opacity = obj.default_params.opacity;
          projectionWallMaterial_red.opacity = obj.default_params.opacity;

				} );
				gui.open();

  };
  obj.showPropGui = function(){

    $('div.dg.main.a').show();

  };
  obj.hidePropGui = function(){

    $('div.dg.main.a').hide();

  };

  obj.activate = function(){
    document.addEventListener( 'keydown', onKeyDownEditor, false );
  //  document.addEventListener( 'keyup', onKeyUpEditor, false );
  //  document.addEventListener( 'mousedown', onDocumentMouseDownEditor, false );
  //  document.addEventListener( 'mousemove', onDocumentMouseMoveEditor, false );
  //  document.addEventListener( 'wheel', onDocumentMouseWheelEditor, false );
  };
  obj.deactivate = function(){
    document.removeEventListener( 'keydown', onKeyDownEditor, false );
  //  document.removeEventListener( 'keyup', onKeyUpEditor, false );
  //  document.removeEventListener( 'mousedown', onDocumentMouseDownEditor, false );
  //  document.removeEventListener( 'mousemove', onDocumentMouseMoveEditor, false );
  //  document.removeEventListener( 'wheel', onDocumentMouseWheelEditor, false );
  };

  obj.localSavingOn = function(){

    if( obj.storageEnabled )

    obj.timerId = setInterval(function() {

      obj.saveOnLocalStorage();

    }, obj.timeSaveInterval);

  };
  obj.localSavingOff = function(){

    if( obj.timerId ){

      clearTimeout( obj.timerId );

    }

  };
  obj.storageAvailable = function( type ) {
      try {
        var storage = window[type],
          x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
      }
      catch(e) {
        return false;
      }
    };
  obj.prepareDataToSave = function(){

    var date = new Date();
    var cad5 = {};

    cad5.timeStamp = date.getTime();
    if( ! cad5.id ){cad5.id = THREE.Math.generateUUID(); }
    cad5.walls = [];

    scene.children.forEach(function(el){

      if( el.type == 'Wall'){

        cad5.walls.push( JSON.stringify( el ) );

      } else if( el.type == 'Floor' ){

        cad5.floor = JSON.parse( JSON.stringify( el ) );
        cad5.floor.images = '';
        cad5.floor = JSON.stringify( cad5.floor );

      }

    });

    return JSON.stringify( cad5 );

  };
  obj.saveOnLocalStorage = function(){

    window.localStorage.setItem( 'cad5',  obj.prepareDataToSave() );

  };

  obj.loadData = function(){

//$.getJSON("data/project.json", function( data ) {

//    serverData = data;


    var localData = obj.getLocalData();
    serverData = obj.getServerData();


    switch ( true ) {

      case ! serverData :
        window.localStorage.removeItem( 'cad5' );
        break;

      case ( ! $Editor.isEmptyObject(serverData) ) && ( ! $Editor.isEmptyObject(localData) ):

        if( localData.id == serverData.id && localData.timeStamp > serverData.timeStamp ){
          obj.parseData( localData );
        } else if( ! $Editor.isEmptyObject( serverData ) ){
          obj.parseData( serverData );
        }
        break;

      case ( ! serverData ) && !localData:
        obj.parseData( serverData );
        break;

//      case ! serverData && ( ! $Editor.isEmptyObject(localData) ):
//        obj.parseData( localData );
//        break;

      default:
        window.localStorage.removeItem( 'cad5' );
        break;

    }

    if(obj.storageEnabled){
      obj.localSavingOn();
    }

//    });

  };
  obj.getLocalData = function(){
    if(obj.storageEnabled){
      if (obj.storageAvailable('localStorage') && window.localStorage['cad5']) {

        var json = localStorage.getItem("cad5");

        if ( json  ) {
          var data = JSON.parse( json );
          return data;
        }
      }
    }

    return false;
  };
  obj.getServerData = function(){

    if( !obj.isEmptyObject( serverData ) ){
      var data = JSON.parse( serverData );
      return data;
    }

    return false;
  };

  obj.parseData = function( cad5 ){

    //СТЕНЫ
    var i = cad5.walls.length;
    while (i--) {

      //восстанавливаем стены
      var item = JSON.parse( cad5.walls[i] );
      var v1 = item.object.userData.v1;
      var v2 = item.object.userData.v2;
      item.object.userData.v1 = new THREE.Vector3(v1.x, v1.y, v1.z);
      item.object.userData.v2 = new THREE.Vector3(v2.x, v2.y, v2.z);
      item.object.userData.uuid = item.object.uuid;

      var wall = $wallCreator.addWall( null, item.object.userData );

      //восстанавливаем проемы
      if(item.object.children){

        var y = item.object.children.length;

        while ( y-- ) {

          var door = item.object.children[y];

          switch (door.type) {
            case 'Doorway':
            case 'Niche':
            case 'DoorBlock':
            case 'DoorBlockFloor':
            case 'WindowBlock':
            case 'DoubleDoorBlock':
            case 'DoubleDoorBlockFloor':
              wall.addDoorway( door.type, door.userData );
              wall.doors[ wall.doors.length-1 ].uuid = door.uuid;
              break;
          }

        }
      }

    }

    //ПОЛ
    var floor = JSON.parse( cad5.floor );
    $Editor.floor.scale.set( floor.object.userData.scale.x, floor.object.userData.scale.y, floor.object.userData.scale.z );
    $Editor.floor.width = floor.object.userData.width;
    $Editor.floor.length = floor.object.userData.length;
    if( floor.object.userData.textureFile != '' ){
      obj.setFloorTexture( floor.object.userData.textureFile );
    }


    setTimeout(function(){
      $wallCreator.updateWalls();
    });

  };
  obj.addLight = function(){

    var light1 = new THREE.PointLight(0xffffff);
    light1.position.set(-10000, 5000, -10000);
    var light2 = new THREE.PointLight(0xffffff);
    light2.position.set(-10000, 5000, 10000);
    var light3 = new THREE.PointLight(0xffffff);
    light3.position.set(10000,5000, 10000);
    var light4 = new THREE.PointLight(0xffffff);
    light4.position.set(10000, 5000, -10000);
    var light5 = new THREE.PointLight(0xffffff);
    light5.position.set(0, 5000, 0);

    obj.lights.push(light1, light2, light3, light4, light5);
    scene.add(light1, light3);

//    light1.shadowMapWidth = 1024; // default is 512
//    light1.shadowMapHeight = 1024; // default is 512
//
//    light3.shadowMapWidth = 1024; // default is 512
//    light3.shadowMapHeight = 1024; // default is 512

  };
  obj.addFloor = function(){

    obj.floor = new Floor();
    scene.add( obj.floor );

    obj.floor.setLocation();

  };
  obj.changeFloorVisible = function(){
    if( obj.floor && !obj.hidedFloorTexture ){
//      obj.floor.visible = !obj.floor.visible;
      obj.hidedFloorTexture = obj.floor.material.map;
      obj.floor.material = floorMaterial;

    } else if( obj.floor &&obj.hidedFloorTexture ){
      $Editor.floor.material = new THREE.MeshBasicMaterial( { map: obj.hidedFloorTexture, side: THREE.FrontSide } );
      obj.hidedFloorTexture = null;
    }
  };
  obj.changeGridVisible = function(){

    if( obj.floor.gridHelper ){
      obj.floor.gridHelper.material.visible  = ! obj.floor.gridHelper.material.visible;
    } else {
      obj.floor.addHelper();
    }


  };
  obj.setFloorTexture = function(filename) {
	// instantiate a loader
	var loader = new THREE.TextureLoader();
	loader.setCrossOrigin('');
	// load a resource
	loader.load(
		// resource URL
		filename,
		// Function when resource is loaded
		function ( floorTexture ) {
			// do something with the texture

      floorTexture.needsUpdate = true;
      floorTexture.repeat.set( 1, 1 );
      $Editor.floor.material = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.FrontSide } );
      $Editor.floor.material.anisotropy = maxAnisotropy;
      $Editor.floor.textureFile = filename;

		},
		// Function called when download progresses
		function ( xhr ) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
		},
		// Function called when download errors
		function ( xhr ) {
			console.log( 'An error happened' );
		}
	);
};
  obj.setPositionLight = function(){



    obj.lights[0].position.set( 0, floorHeight * 2 , 0 );
    obj.lights[1].position.set( obj.floor.length, floorHeight * 2 , 0 );
    obj.lights[2].position.set( obj.floor.length, floorHeight * 2 , obj.floor.width );
    obj.lights[3].position.set( 0, floorHeight * 2 , obj.floor.width );

    obj.lights[4].position.set( obj.floor.length/2, floorHeight  , obj.floor.width/2 );
  };

  obj.msg = function( parameters ){

    var type = parameters.hasOwnProperty("type") ? parameters["type"] : 'attention';
    var title = parameters.hasOwnProperty("title") ? parameters["title"] : 'Внимание';
    var text = parameters.hasOwnProperty("text") ? parameters["text"] : '';
    var callback = parameters.hasOwnProperty("response") ? parameters["response"] : function(){};
    var modal = parameters.hasOwnProperty("modal") ? parameters["modal"] : true;

    $('#dimToolTip').find('p').text( text );

    switch (type) {
      case 'attention':
        $( "#dimToolTip" ).dialog({
          dialogClass: "no-close",
          autoOpen: false,
          title: title,
          show: {
            effect: "blind",
            duration: 1000
          },
          hide: {
            effect: "explode",
            duration: 1000
          }
        });


        $( "#dimToolTip" ).dialog( "open" );

        setTimeout(function(){
          $( "#dimToolTip" ).dialog( "close" );
        }, 2000);


        break;

      case 'confirm':
        $( "#dimToolTip" ).dialog({
          dialogClass: "no-close",
          autoOpen: false,
          title: title,
          show: {
            effect: "blind",
            duration: 1000
          },
          hide: {
            effect: "explode",
            duration: 1000
          },
          modal: modal,
          buttons: {
            "Ok": function() {
              callback.call(null, true);
              $( this ).dialog( "close" );
            },
            Cancel: function() {
              callback.call(null, false);
              $( this ).dialog( "close" );
            }
          }
        });

        $( "#dimToolTip" ).dialog( "open" );

        break;
    }

  };

  function onKeyDownEditor ( event ){
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

      break;
    case 49: /*1*/
      if(event.altKey){
        if($projection.enabled){
          toggleMode('3D');
        } else {
          toggleMode('2D');
        }
      }
      break;
    case 50: /*2*/
      if(event.altKey){
        if( $selectMode.enabled ){
          $projection.toggleModeIn2D( 'creation' );
        } else {
          $projection.toggleModeIn2D( 'selection' );
        }
      }
      break;
    case 51: /*3*/
      if(event.altKey){
        if( $selectMode.enabled ){
          $selectMode.selectAllDoors();
        }
      }
      break;
    case 52: /*4*/
      if(event.altKey){
        if( $selectMode.enabled ){
          $selectMode.selectAllWindows();
        }
      }
      break;
    case 53: /*5*/
      if(event.altKey){
        if( $selectMode.enabled ){
          $selectMode.selectAllFloors();
        }
      }
      break;
    case 54: /*6*/
      if(event.altKey){
        if( $selectMode.enabled ){
          $selectMode.selectAllOuterSurfaces();
        }
      }
      break;
    case 55: /*7*/
      if(event.altKey){
        if( $selectMode.enabled ){
          $selectMode.selectAllInnerSurfaces();
        }
      }
      break;

  }
}


  $('.footer').on('click','[action = mode]',function(){

  if($projection.enabled){

    toggleMode('3D');

  } else {

    toggleMode('2D');

  }

});
  $('.footer').on('click','[action]', function(){
    if($(this).context.tagName == 'INPUT'){
      $(this).focus();
    }

  });//фокус
  $('.footer').on('click','[param]', function(){
    if($(this).context.tagName == 'INPUT'){
      $(this).focus();
    }

  });//фокус


  obj.getAdditionalPoints = function(data){

    var response;

    $.ajax({
      url: "classes/additionalPoints.php",
      type: "GET",
      data: {data: JSON.stringify(data)},
      async:false,
      dataType: "json",
      success: function success(res, textStatus, jqXHR) {
        response = res;
      },
      error: function error(jqXHR, textStatus, errorThrown) {

      }
    });

  return response;

  };
  obj.getMagnitVerticies = function(data, callback){
    $.get( "classes/getMagnitVerticies.php", {data: JSON.stringify(data)} )
    .done(function( response ) {
      var response = JSON.parse(response);
      callback( response );
    });
  };
  obj.getPointerHelperPosition = function(data, callback){

    $.ajax({
      url: "classes/getPointerHelperPosition.php",
      type: "GET",
      data: {data: JSON.stringify(data)},
      async:false,
      dataType: "json",
      success: function success(res, textStatus, jqXHR) {

        callback( res );
      },
      error: function error(jqXHR, textStatus, errorThrown) {

      }
    });

  };

  obj.isEmptyObject = function (obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
  };

    //хелпер
//  obj.box = new THREE.Box3();
//	obj.selectionBox = new THREE.BoxHelper();
//	obj.selectionBox.material.depthTest = false;
//	obj.selectionBox.material.transparent = true;
//	obj.selectionBox.visible = false;





}
var $Editor = {};
Editor($Editor);

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

  obj.copied = null; //объект скопированный посредством ctrl+c

  obj.walls = [];//массив установленных стен TODO - заполнить при инициализации редактора

  obj.wallDimensionType = 'center';

  obj.on = function(type){
    obj.enabled = !obj.enabled;
    currentCamera = camera.clone();
    obj.type = type || 'top';

    obj.cameraAdd();

    controls.object = camera;
    controls.enableRotate = false;
    controls.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };
    controls.update();

    obj.planeHelperAdd();

    obj.setMaterialToWall('2D');

    obj.doorwaysProjectionMode();

//    Areas.visible = true;
//    AreaCounturs.visible = true;

    $wallEditor.on();

//    $Editor.hidePropGui();

  };
  obj.off = function(){

    obj.enabled = !obj.enabled;
    camera = currentCamera.clone();
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( $Editor.floor.position.x, $Editor.floor.position.y, $Editor.floor.position.z );
    camera.lookAt($Editor.floor.position.clone());
    controls.update();
    currentCamera = null;

    scene.remove( obj.plane );
    delete obj.plane;

    Dimensions.visible = false;
//    Areas.visible = false;
//    AreaCounturs.visible = false;
    obj.setMaterialToWall('3D');


    obj.doorways3DMode();

    $wallCreator.off();
    $wallEditor.off();
    $dimensionEditorMode.off();
    $selectMode.off();

//    $Editor.showPropGui();

  };
  obj.cameraAdd = function(){
     camera = new THREE.OrthographicCamera(
                                          frustumSize * ASPECT / - 2,
                                          frustumSize * ASPECT / 2,
                                          frustumSize / 2,
                                          frustumSize / - 2,
                                          1,
                                          1000000
                                        );


    camera.position.copy( $Editor.floor.position.clone() );


    switch (obj.type) {
      case 'top':
        camera.position.add( new THREE.Vector3(0, 30000, 0) );
        break;
      case 'left':
//        camera.position.set(-30000, 0, 0);
        break;
      case 'right':
//        camera.position.set(30000, 0, 0);
        break;
    }

    camera.lookAt( $Editor.floor.position.clone() );



  };
  obj.planeHelperAdd = function(){
    var geometry = new THREE.PlaneGeometry( 100000, 100000, 1 );
    obj.plane = new THREE.Mesh( geometry );
    obj.plane.rotateX( -Math.PI/2 );
    obj.plane.translateZ ( -5 );
    obj.plane.material.visible = false;
    scene.add( obj.plane );
  };

  obj.getWalls = function(){

    var result = [];
    scene.children.forEach(function(item){
      if(item.type == 'Wall' ){
        result.push(item);
      }
    });

    return result;

  };
  obj.setMaterialToWall = function(mode){
    switch (mode) {
      case '2D':

        $wallCreator.walls.forEach( function( item ){

          if( item.action && item.action.length > 0){
            item.material.color = new THREE.Color( $Editor.wallColors[item.action] );
          } else {
            item.material.color = new THREE.Color( $Editor.default_params.Wall.main_color );
          }

        });

        break;

      case '3D':

        $wallCreator.walls.forEach( function( item ){


          if( item.material.color.equals ( new THREE.Color( $Editor.default_params.Wall.main_color ) )  )
          item.material.color = new THREE.Color( $Editor.default_params.Wall.color_3D );//acsWallMaterial2;

        });

        break;
    }


  };
  obj.doorways3DMode = function(){

    $wallCreator.walls.forEach(function(item){
      item.doorway3DMode();
    });

  };
  obj.doorwaysProjectionMode = function(){

    $wallCreator.walls.forEach(function(item){
      item.doorwayProjectionMode();
    });

  };

  obj.activateSelectControls = function(){
    var objects = [];
    obj.walls.forEach(function(wall){
      objects = objects.concat(wall.doors, wall);

      //добавление размеров стен в массив выбора
      wall.dimensions.forEach(function(dim){
          objects = objects.concat(dim.note);
      });

      //добавление размеров проемов в массив выбора
      wall.doors.forEach(function(door){
        door.dimensions.forEach(function(dim){
          objects = objects.concat(dim.note);
        });
      });
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
  };
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

  };
  obj.select = function(event){

//    obj.hideAllMenu();
//    obj.selected = event.object;
//    if( 'select' in event.object )
//    event.object.select(event);


  };
  obj.select_contextmenu = function(event){
    obj.hideAllMenu();
    if('select_contextmenu' in event.object){
    event.object.select_contextmenu(event);
    obj.selected = event.object;
    }

  };

  obj.toggleModeIn2D = function( mode ){

    switch ( mode ) {
      case 'creation':

        $wallEditor.off();
        $dimensionEditorMode.off();
        $selectMode.off();
        if($wallCreator.enabled)$wallCreator.off();
        $wallCreator.on();

        $('.footer').find('[action = modeC]').addClass('active');
        $('.footer').find('[action = modeE]').removeClass('active');
        $('.footer').find('[action = modeD]').removeClass('active');
        $('.footer').show();

        break;
      case 'edition':

        $wallCreator.off();
        $dimensionEditorMode.off();
        $selectMode.off();
        $wallEditor.on();

        $('.footer').find('[action = modeE]').addClass('active');
        $('.footer').find('[action = modeC]').removeClass('active');
        $('.footer').find('[action = modeD]').removeClass('active');
        $('.footer').show();

        break;
      case 'dimension':

        $wallEditor.off();
        $wallCreator.off();
        $selectMode.off();
        $dimensionEditorMode.on();

        $('.footer').find('[action = modeD]').addClass('active');
        $('.footer').find('[action = modeC]').removeClass('active');
        $('.footer').find('[action = modeE]').removeClass('active');
        $('.footer').show();

        break;
      case 'selection':

        $wallEditor.off();
        $wallCreator.off();
        $dimensionEditorMode.off();
        $selectMode.on();

        $('.footer').find('[action = modeD]').removeClass('active');
        $('.footer').find('[action = modeC]').removeClass('active');
        $('.footer').find('[action = modeE]').removeClass('active');
        $('.footer').hide();

        break;

    }

  };

  obj.setWallBearingTypeValue = function( type ){

//    var part = '';
    $('.wall_type').show();
    $('.wall_type').find('[type=radio]').prop('checked', false );

    if( type && type != '' ){

      $('#' + type).prop('checked', 'checked' );

    }

  };
  obj.setWallAction = function( action ){


    $('[name=wall_action][type=radio]').prop('checked', false );

    if( action && action != '' ){

      $('#' + action).prop('checked', 'checked' );

    }

  };

  obj.showObjParams = function( parameters ){

//    $('.objParams').show();
    var elements = $('.objParams').children();

    //скрываем все параметры
    var i = elements.length;
    while (i--) {
      $(elements[i]).hide();
    }

    //отображаем необходимые
    for( var param in parameters ){

      if( parameters[ param ].hasOwnProperty('checked') ){

        $('.objParams').find('[param = '+ param +']').prop('checked', parameters[ param ].checked );

      } else if( param == 'isEntryDoor' ){

        var els = $('.objParams').find('[param = '+ param +']');
        $( els[0] ).prop('checked',  ! parameters[ param ].isEntryDoor);
        $( els[1] ).prop('checked', parameters[ param ].isEntryDoor);

      } else {

        $('.objParams').find('[param = '+ param +']').val( parameters[ param ].val );

      }

      $('.objParams').find('.' + param).show();
      $('.objParams').find('span.' + param).text( parameters[ param ].label );

      $('.objParams').find('.' + param).parent().show();
    }



  };
  obj.hideObjParams = function( parameters ){

    $('.objParams').hide();
    $('div.wall_type').closest('div').css('display','none');


  };

  obj.copySelected = function(){
    obj.copied = $wallEditor.selected;
  };
  obj.pasteToSelected = function(){

    if( $wallEditor.selected && obj.copied ){

      switch ($wallEditor.selected.type) {
        case 'Wall':
          if( obj.copied.parent && obj.copied.parent.type == 'Wall'){

            var params = $wallEditor.getMainDoorwayParams( obj.copied );
            $wallEditor.selected.addDoorway( obj.copied.type, params);

          }
          break;

        default:

          break;
      }

    }

  };


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

  };
  function onDocumentMouseMoveProjection(event){
    if (!obj.enabled)
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  };
  function onKeyDownProjection ( event ){

    if (!obj.enabled)
      return false;
    if( event.ctrlKey || event.altKey ) {
      event.preventDefault();
    }

    switch( event.keyCode ) {
      case 27: /*esc*/

        if( ! $selectMode.enabled ){

          scene.remove( obj.selected1,obj.selected2 );
          obj.toggleModeIn2D('edition');

        }

        break;
      case 67: /*c*/
        if( event.altKey ){
          obj.toggleModeIn2D('creation');
        } else if(event.ctrlKey){
          obj.copySelected();
        }
        break;
      case 68: /*d*/
        if( event.altKey ){
          obj.toggleModeIn2D('dimension');
        }
        break;
      case 69: /*e*/
        if( event.altKey ){
          obj.toggleModeIn2D('edition');
        }
        break;
      case 86: /*v*/
        if(event.ctrlKey){
          obj.pasteToSelected();
        }
        break;
    }
  };
  function onKeyUpProjection ( event ){
  if (!obj.enabled)
        return false;
//      event.preventDefault();
    };

  $('.wall_dim_type').on('click','li',function(){

		obj.wallDimensionType = $(this).attr('data-type');
    $wallEditor.showWallDimensions();

    $('.wall_dim_type').find('a').first().text( $(this).find('a').text() );


	});
  $('.footer').on('click','[action = loadFloor]',function(){

    $(this).parent().find('.floorLoader').trigger('click');
    //$(this).parent().find('.floorLoader').off('change');

    $(this).parent().find('.floorLoader1').on('change', function(){
		//setFloorPlan($('.floorLoader'));
		setFloorPlan($('[name=floor_plan_form]')[0]);
		return;
        /*
		renderImage(this.files[0], function(src){

          var image = $('.localImage')
          image[0].src = src;

          var texture = new THREE.Texture(image[0]);
          texture.needsUpdate = true;

          scene.getObjectByName('floor').material.map = texture;

        })
		*/

      });

      function renderImage(file, callback) {

       // генерация нового объекта FileReader
        var reader = new FileReader();

       // подстановка изображения в атрибут src
        reader.onload = function(event) {
          callback(event.target.result);
        };

       // при считке файла, вызывается метод, описанный выше
        reader.readAsDataURL(file);
      };

	});
  $('.footer').on('click','[action = exportJSON]',function(){

    $wallEditor.on();

    $wallEditor.getJSON(function(result){
      //window.console.log( result );
	  post_ok(result);
    }) ;

    $wallEditor.off();

  });
  $('.footer').on('click','[action = cancel]',function(){

    $wallEditor.off();
    post_cancel();

  });

  $('.footer').on('click','[action = hideWalls]',function(){

    $wallEditor.walls.forEach(function( item ){

      if(item.visible){
        item.hide();
      } else {
        item.show();
      }

    });

  });
  $('.footer').on('click','[action = changeFloorVisible]',function(){

    $Editor.changeFloorVisible();

  });
   $('.footer').on('click','[action = changeGridVisible]',function(){

    $Editor.changeGridVisible();

  });

  $('.footer').on('click','[action = modeC]',function(event){

    event.preventDefault();
    obj.toggleModeIn2D('creation');

  });
  $('.footer').on('click','[action = modeE]',function(event){

    event.preventDefault();
    obj.toggleModeIn2D('edition');

  });
  $('.footer').on('click','[action = modeD]',function(event){

    event.preventDefault();
    obj.toggleModeIn2D('dimension');

  });

  $('.footer').on('click','[action = sceneToConsole]',function(event){

    window.console.dir(scene.children);

  });





}
$projection = {};
initProjection($projection);

//Режим установки размеров
function initDimensionEditorMode(obj){

  var current_dim = null;

  obj.enabled = false;

  //obj.planeMousePoint; //точка пересечения луча с плоскостью
  obj.currentEdge = {};
  obj.currentEdge.material = {};
  obj.currentPoint = {};
  obj.currentPoint.material = {};
  obj.selected1 = null;
  obj.selected2 = null;
  //obj.currentDimension;
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
    });

    obj.activate();

  };
  obj.off = function(){
    obj.enabled = false;
    Dimensions.visible = false;
    Dimensions.children.forEach(function(item){
      item.deactivate();
    });
    obj.deactivate();
  };

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
    });
  };
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
    });
  };

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

  };
  obj.hideAllMenu = function(){
    $('.DimensionMenu').css('display','none');
  };

  obj.dimensionAdd = function(){

    var param1 = null;
    var param2 = null;

    if(obj.selected1)
    param1 = obj.selected1.isLine ? obj.selected1 : obj.selected1.position;
    if(obj.selected2)
    param2 = obj.selected2.isLine ? obj.selected2 : obj.selected2.position;

    current_dim = new Dimension(param1, param2, obj.plane);
    Dimensions.add(current_dim);

    obj.deactivateSelectControls();
    obj.activateSelectControls();

  };
  obj.setSelected = function(selectObj){

    var selected = selectObj.clone();
    selected.geometry = selectObj.geometry.clone();
    selected.material = selectObj.material.clone();
    selected.position.copy(selectObj.getWorldPosition());

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
  };

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
  };
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

  };
  obj.select = function(event){

    obj.hideAllMenu();
    if( 'select' in event.object.parent )
    event.object.parent.select(event);
    obj.selected = event.object.parent;

  };
  obj.select_contextmenu = function(event){
    obj.hideAllMenu();
    if('select_contextmenu' in event.object.parent){
    event.object.parent.select_contextmenu(event);
    obj.selected = event.object.parent;
    }

  };
  obj.unselect = function( event ){
    obj.hideAllMenu();
    obj.selected = null;
  };
  obj.hoveron = function( event ){
    if( 'hoveron' in event.object.parent )
    event.object.parent.hoveron( event );
  };
  obj.hoveroff = function( event ){
    if( 'hoveroff' in event.object.parent )
    event.object.parent.hoveroff(event);
  };


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
          var point = item.clone().applyMatrix4(intersectObjects[ 0 ].object.matrixWorld);
          var clculate_distance = point.distanceTo(intersectObjects[ 0 ].point);
          if(clculate_distance < distance){
            distance = clculate_distance;
            position = point;
          }
        });

        obj.currentPoint.position.copy(position);

        obj.currentPoint.material.visible = true;
      } else {
        obj.currentPoint.material.visible = false;
        obj.currentPoint.position.set(0,0,0);
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

  //одноразовая операция
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
  var pointHelper_material = new THREE.MeshBasicMaterial( {color: '#00FF00'} );
  var isChanged = false;//контроль  изменения размера
  var wallsNeedUpdate = true;

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
      gapSize: 30
    } );
  obj.lineDashedMaterial = new THREE.LineDashedMaterial( {
      color: 'black',
      dashSize: 100,
      gapSize: 30
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

    if( ! obj.pointerHelper ) pointerHelperAdd();


    obj.magnitVerticiesCreate();

    document.addEventListener( 'mousedown', onDocumentMouseDownWallCreator, false );
    document.addEventListener( 'mousemove', onDocumentMouseMoveWallCreator, false );
    document.addEventListener( 'keydown', onKeyDownWallCreator, false );

  };
  obj.off = function(){

    obj.enabled = !obj.enabled;
    obj.reset();
    scene.remove(obj.plane);
    scene.remove(obj.pointerHelper);
    delete obj.plane;
    delete obj.pointerHelper;


    scene.remove(obj.lineHelper);
    obj.lineHelper = null;
    obj.lineHelperGeometry = new THREE.Geometry();//хранилище точек линии хелпера
    //деактивация отслеживания событий размеров
    obj.deactivateDimensions();

    document.removeEventListener( 'mousedown', onDocumentMouseDownWallCreator, false );
    document.removeEventListener( 'mousemove', onDocumentMouseMoveWallCreator, false );
    document.removeEventListener( 'keydown', onKeyDownWallCreator, false );

  };

  function pointerHelperAdd(){

    var geometry = new THREE.SphereBufferGeometry( $Editor.default_params.PointerHelper.radius, 32, 32 );
    obj.pointerHelper = new THREE.Mesh( geometry, pointHelper_material );
    scene.add( obj.pointerHelper );

  };

  obj.hideAllMenu = function(){

    $('.ActiveElementMenu').css('display','none');
    $('.FourStateSwitcher').css('display','none');
    $('.TwoStateSwitcher').css('display','none');
    $('.DoorwayMenu').css('display','none');

    obj.hideAllDimensions();


  };
  obj.hideAllDimensions = function(){
    //поле размера
    $('.EditableField').css('display','none');
    obj.walls.forEach(function(wall){
      wall.doors.forEach(function(door){
        door.hideDimensions();
      });
    });
  };
  obj.reIndexWall = function(){
    obj.walls.forEach(function( item, i ){
      item.index = i;
    });
  };
  obj.updateWalls = function(){

    if( wallsNeedUpdate ){

      obj.walls.forEach(function( item, i, arr ){
        item.update( obj.walls );
      });

      obj.calculateRooms();

    }

  };
  obj.updateWallsNodes = function(){

    obj.walls.forEach(function( item, i ){
      item.setDefaultNode();
    });

  };
  obj.calculateRooms = function(){

    obj.rooms = $wallEditor.getRooms();
    $wallEditor.showRoomsArea();

  };

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
  };
  obj.addWall = function( vertices, parameters ){
    var vertices = vertices || [];
    var parameters = parameters || {};

    var needUpdate = parameters.hasOwnProperty("needUpdate") ? parameters["needUpdate"] : true;

    vertices[0] = parameters.hasOwnProperty("v1") ? parameters["v1"] : vertices[0].clone();
    vertices[1] = parameters.hasOwnProperty("v2") ? parameters["v2"] : vertices[1].clone();


    if( !parameters.auto_building )
    //проверка doubleclck и расстояние меньше половины ширины стены
    if( vertices && vertices[0].equals( vertices[1] ) || vertices[0].distanceTo( vertices[1] ) < parameters.width/2 ){

      window.console.warn("Неверные параметры для создания стены!");
      return false;

    }

    var wall = new Wall( vertices, parameters );
    if( wall ){

//Простой вариант построения по типу размера
//      setTimeout(function(){
//
//        var dim = wall.getDimensionByType( $Editor.default_params.wallCreationMode );
//        dim.rightArrowActivated = true;
//        var event = {
//          target: dim,
//          value: vertices[0].distanceTo( vertices[1] )
//        };
//        wall.changeDim ( event );
//
//      });


      obj.walls.push( wall );
      wall.index = obj.walls.length - 1;

      scene.add( wall );

      if(needUpdate){
        obj.updateWalls();           //Обновляем состояние стен
      }
      obj.magnitVerticiesCreate(); //пересоздание магнитных точек

      $wallEditor.deactivateSelectControls();
      $wallEditor.activateSelectControls();

     wall.toJSON();

    } else {

      window.console.warn("Ошибка при создании стены!");
      return false;

    }

    return wall;

  };

  function isBelongToLine( point, line ){

    var dist1 = point.distanceTo(line.start);
    var dist2 = point.distanceTo(line.end);
    return Math.abs( dist1 + dist2 - line.distance() ) < 0.01;

  }
  function isIntersectCollinear( newWallVertices ){

    var result = false;

    var result1, result2, result3, result4, result5, result6, result7 = 0;

    obj.walls.forEach(function( item, i ){

      //принадлежность прямой
      result1 = isBelongToLine(newWallVertices[0], new THREE.Line3(item.v1, item.v2));
      result2 = isBelongToLine(newWallVertices[1], new THREE.Line3(item.v1, item.v2));
      //совпадение с точками прямой
      result3 = newWallVertices[0].clone().floor().equals(item.v1.clone().floor()) || newWallVertices[0].clone().floor().equals(item.v2.clone().floor());
      result4 = newWallVertices[1].clone().floor().equals(item.v1.clone().floor()) || newWallVertices[1].clone().floor().equals(item.v2.clone().floor());

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

          var vertices1 = [ item.wall.v1.clone(), item.point.clone() ];
          var vertices2 = [ item.point.clone(), item.wall.v2.clone() ];
          var params = {
            width: item.wall.width,
            height: item.wall.height,
            needUpdate: false
          };

          wallsNeedUpdate = false;
          item.wall.remove();
          item.wall = null;
          currentWall = null;

          obj.addWall( vertices1, params );
          obj.addWall( vertices2, params );

      }

    });

    wallsNeedUpdate = true;
    obj.updateWalls();

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

  };

  //добавление точки для построения линии по кликам
  obj.lineHelperPointAdd = function( isMove ) {
    var isMove = isMove || false;//false при клике мыши; true - при движении курсора
    var isClick = !isMove;

    var point = obj.pointerHelper.position.clone();


    switch (obj.lineHelperGeometry.vertices.length) {
      case 0:
        if(isClick){

//          $Editor.getPointerHelperPosition(obj.pointerHelper.position, function(p){
//
//            var point = new THREE.Vector3(p.x, p.y, p.z);
//
//            obj.lineHelperGeometry.vertices[0] = point;
//            intersectWalls[0] = {wall:currentWall, point:point};
//            obj.magnitVerticies.push(point);//для примагничивания
//
//          });

          var point = new THREE.Vector3(obj.pointerHelper.position.x, obj.pointerHelper.position.y, obj.pointerHelper.position.z);

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



  };
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
  };
  obj.lineHelperRemove = function(){

    if(obj.lineHelper)
    obj.lineHelper.material.visible = false;

  };

  obj.reset = function(){

    obj.lineHelperGeometry.vertices = [];
    intersectWalls = [];
    currentWall = null;
    obj.lineHelperRemove();
    obj.dashedLineRemoveAll();

    obj.hideDimensions();

  };

  obj.dashedLineAdd = function( start, end ){

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(start.x, 1, start.z));
    geometry.vertices.push(new THREE.Vector3(end.x, 1, end.z));

    var line = new THREE.Line(geometry, obj.lineDashedMaterial);
    geometry.computeLineDistances();
    obj.dashedLineArr.push(line);
    scene.add(line);
  };
  obj.dashedLineRemoveAll = function(){
    for(var key in obj.dashedLineArr){
      scene.remove(obj.dashedLineArr[key]);
    }
    obj.dashedLineArr.length = 0;
  };

  //массив для примагничивания опорных точек
  obj.magnitVerticiesCreate = function(){

    //очистка
    obj.magnitVerticies = [];

    //наполнение массива точек
    scene.children.forEach(function(item, idx) {

      if(item.name == 'wall'){

        $Editor.getMagnitVerticies({ v1: item.v1, v2: item.v2 }, function(response){
          if(response){
            obj.magnitVerticies.push(response[0]);
            obj.magnitVerticies.push(response[1]);
          }
        });

      }
    });

    //уникальные значения
      obj.magnitVerticies = obj.magnitVerticies.filter(function (elem, pos, arr) {
        var i = pos;
        while(i < obj.magnitVerticies.length-1){
          i++;
          if(arr[i].equals(elem)) return false;
        }
        return true;
      });

  };
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
      var pointOnAxis = wall.axisLine.closestPointToPoint ( point, clampToLine );
      var distanceToWallAxis = pointOnAxis.distanceTo ( point );

      if(result.distanceToWallAxis > distanceToWallAxis){
          result.distanceToWallAxis = distanceToWallAxis;
          result.itemOnWallAxis = pointOnAxis;
          result.wall = wall;
          result.distanceToStart = pointOnAxis.distanceTo ( wall.axisLine.start );
          result.distanceToEnd = pointOnAxis.distanceTo ( wall.axisLine.end );
        }
    });

    return result;
  };
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
      var magnitObject = obj.getMagnitObject( pointer );
      object.position.x = pointer.x;
      object.position.z = pointer.z;


      //позиционирование хелпера указателя к линии точек
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

      if( ! magnitObject.wall ){return;}

      //позиционирование хелпера указателя к осевой
      if( magnitObject.distanceToWallAxis < obj.magnitValue ){

        object.position.sub( magnitObject.wall.v1.clone() ).projectOnVector ( magnitObject.wall.v2.clone().sub(magnitObject.wall.v1.clone()) ).add(magnitObject.wall.v1.clone());
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

          if( optionalPointOnRay && Math.abs(optionalPointOnRay.x) != 100000 )
          if( ! optionalPointOnRay.clone().round().equals( magnitObject.wall.v1.clone().round() ) &&
              ! optionalPointOnRay.clone().round().equals( magnitObject.wall.v2.clone().round() )  ){
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

          if( optionalPointOnRay && Math.abs(optionalPointOnRay.z) != 100000)
          if( ! optionalPointOnRay.clone().round().equals( magnitObject.wall.v1.clone().round() ) &&
              ! optionalPointOnRay.clone().round().equals( magnitObject.wall.v2.clone().round() )  ){
            object.position.x = optionalPointOnRay.x;
            object.position.z = optionalPointOnRay.z;
//            currentWall = magnitObject.wall;//стена над которой находится поинтер
          }

        }


        }



      if( object.position.distanceTo( magnitObject.wall.v1 ) < obj.magnitValue ){
        object.position.copy( magnitObject.wall.v1.clone() );
      }
      if( object.position.distanceTo( magnitObject.wall.v2 ) < obj.magnitValue ){
        object.position.copy( magnitObject.wall.v2.clone() );
      }

  };

  /*===================*/
  function onDocumentMouseDownWallCreator( event ){

    if (!obj.enabled || event.target.localName != 'canvas')
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    switch (event.which) {
      case 1: //ЛКМ
        var mouse_raycaster = new THREE.Raycaster();
        mouse_raycaster.setFromCamera( mouse, camera );

        var intersectObjects = mouse_raycaster.intersectObject(obj.plane);
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
//      obj.pointerHelper.position.x = intersectObjects[0].point.x
//      obj.pointerHelper.position.z = intersectObjects[0].point.z


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

  };
  obj.createDimensions = function(){

    var params = {direction: obj.dimHelper.direction, offset_direction: 400, editable: true, noteState: 'hide'};

    obj.dimensions.push( new Dimension( obj.dimHelper.p1,   obj.dimHelper.p2, $projection.plane, params ) );

    obj.dimensions.forEach(function(item){
      scene.add( item );
    });


  };
  obj.updateDimensions = function(){
    //перерасчет размеров
    obj.calcDimensionsPoints();

    obj.dimensions.forEach(function(item){
      item.const_direction.copy( obj.dimHelper.direction );
      item.update();
    });
  };
  obj.showDimensions = function(){
    obj.dimensions.forEach(function(item){
      item.visible = true;
      item.editableModeOn();
    });
  };
  obj.hideDimensions = function(){

    obj.dimensions.forEach(function(item){
      item.visible = false;
      item.unselect();
    });
  };
  obj.removeDimensions = function(){
    obj.dimensions.forEach(function( item, index ){
      scene.remove( item );
    });
  };
  obj.activateDimensions = function(){

    obj.dimensions.forEach(function(item){

      item.addEventListener( 'edit', onChangeDim );
      item.addEventListener( 'keydown', onKeydownDim );
      item.addEventListener( 'esc', onEscDim );

    });

  };
  obj.deactivateDimensions = function(){

    obj.dimensions.forEach(function(item){
      item.removeEventListener( 'edit', onChangeDim );
      item.removeEventListener( 'keydown', onKeydownDim );
      item.removeEventListener( 'esc', onEscDim );

    });

    obj.dimensions = [];//размеры
    obj.dimHelper = {}; //размер хелпер
    obj.dimHelper.direction = new THREE.Vector3();// направление построения размера
    obj.dimHelper.p1 = new THREE.Vector3();// точка размера
    obj.dimHelper.p2 = new THREE.Vector3();// точка размера

  };

  function onKeydownDim( event ){

      switch( event.keyCode ) {
        case 13: /*enter*/

        setTimeout(function(){

          if( ! isChanged ){

//            document.removeEventListener( 'mousemove', onDocumentMouseMoveWallCreator, false );
            obj.lineHelperPointAdd();
            obj.lineHelperAdd();

          } else {

            isChanged = false;

          }

        });

          break;
    }


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
    isChanged = true;

//    document.addEventListener( 'mousemove', onDocumentMouseMoveWallCreator, false );

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
  obj.selectedArray = [];// мультивыбор
  obj.multySelectMode = false;
//  obj.changingObject = null;
  obj.lastDoorway = {};// объект с информацией о последнем добавленом проеме

  obj.maxNeighboorsDistance = 0.5;
  obj.wallMenuCoord = [];
  obj.doorblockSwitcherCoord = [];
  obj.windowblockSwitcherCoord = [];
  obj.doorwayMenu = [];
  obj.ControlPointMenu = [];

  obj.raycaster = new THREE.Raycaster();

  obj.on = function(){

    obj.enabled = true;
    obj.activate();

    obj.activateWallMover();
    obj.activateDoorway();
    obj.activateControlPoint();
    obj.activateWallDimensions();

    obj.deactivateSelectControls();
    obj.activateSelectControls();

  };
  obj.off = function(){

    obj.unselect();
    obj.enabled = false;
    obj.deactivateWallMover();
    obj.deactivateDoorway();
    obj.deactivateControlPoint();

    obj.deactivateSelectControls();

    obj.deactivate();

  };

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

  };
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

  };
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

  };
  obj.getControlPointMenu = function(){
    var elements =  $('.ControlPointMenu').find('.ActiveElementMenuAnimated');

    //считываем координаты для восстановления
    if(elements){
      elements.each( function( i, item ){
        obj.ControlPointMenu[i] = ( {left: item.style.left, top: item.style.top} );
        item.style.left = 0;
        item.style.top = 0;
      });
    }

  };

  obj.activateWallMover = function(){
    obj.walls.forEach(function(item){
      item.mover.activate();
    });
  };
  obj.deactivateWallMover = function(){
    obj.walls.forEach(function(item){
      item.mover.deactivate();
    });
  };

  obj.activateWallDimensions = function(){
    obj.walls.forEach(function(item){
      item.activateDimensions();
    });
  };

  obj.activateControlPoint = function(){
    obj.walls.forEach(function(item){
      item.controlPoint1.activate();
      item.controlPoint2.activate();
    });
  };
  obj.deactivateControlPoint = function(){
    obj.walls.forEach(function(item){
      item.controlPoint1.deactivate();
      item.controlPoint2.deactivate();
    });
  };

  obj.activateDoorway = function(){
    obj.walls.forEach(function( item ){
      item.doors.forEach(function( item2 ){
        item2.activate();
      });
    });
  };
  obj.deactivateDoorway = function(){
    obj.walls.forEach(function(item){
      item.doors.forEach(function(item2){
        item2.deactivate();
      });
    });
  };

  obj.activateSelectControls = function(){
    var objects = [];
    obj.walls.forEach(function(wall){
      objects = objects.concat(wall.doors, wall);

      //добавление размеров стен в массив выбора
      wall.dimensions.forEach(function(dim){

          objects = objects.concat(dim.note);

      });

      //добавление размеров проемов в массив выбора
      wall.doors.forEach(function(door){
        door.dimensions.forEach(function(dim){
          objects = objects.concat(dim.note);
        });
      });

      //добавление контрольных точек
      objects.push(wall.controlPoint1, wall.controlPoint2);
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
  };
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

  };

  obj.objectSelectedAdd = function( event, callback ){

    var object = event.object;

    if ( ! obj.multySelectMode ){
      //взываем unselect на ранее выбранном объекте
      if(obj.selected && obj.selected != event.object && ('unselect' in obj.selected))
      obj.selected.unselect(event);
      obj.selectedArray = [];
    }

		if ( object !== null && obj.selectedArray.indexOf(object.uuid) == -1    ) {

      if( obj.selectedArray.length > 0 && scene.getObjectByProperty( 'uuid', obj.selectedArray[0] ).type != object.type ){

        $Editor.msg({
          type: 'confirm',
          text: 'Вы выбираете объект другого типа. \n Выбранные объекты будут сброшены. \n Продолжить?',
          modal: false,
          response: function(response){
            if(response){

              obj.objectSelectedClear(event);
              obj.selectedArray.push( object.uuid );
              obj.selected = object;
              callback(true);


            } else {
              callback(false);;
            }
          }

        });

      } else {
        obj.selectedArray.push( object.uuid );
        obj.selected = object;
        callback(true);
      }

		}

  };
  obj.objectSelectedClear = function( event ){

    obj.selected = null;
    obj.selectedArray.forEach(function (item, index, arr) {
      var el = scene.getObjectByProperty( 'uuid', item );
      if( el && 'unselect' in el)
      el.unselect( event );
    });
    obj.selectedArray = [];

  };

  obj.select = function(event){

    //фиксируем выбранный объект
    obj.objectSelectedAdd( event, function(response){
      if(response){

          //скрываем свойства и меню
          obj.hideAllMenu();
          $projection.hideObjParams();

          //взываем select на выбранном объекте
          if( 'select' in event.object )
          event.object.select(event);

          //по типу отображаем свойства
          if( obj.selected.type == 'Wall'){

            $projection.showObjParams({
              height: {val: obj.getSelectedPropertyByName('height'), label: 'Высота'},
              width: {val: obj.getSelectedPropertyByName('width'), label: 'Толщина'},
              width_ed_izm:{label: current_unit.short_name},
              height_ed_izm:{label: current_unit.short_name},
              // elevation_ed_izm:{label:'мм'},
              wall_type: {},
              wall_action: {}
            });

            $('div.wall_type').parents('div').css('display','block');
            $('.left_panel_custom').css({'bottom':'213px'});

            $projection.setWallBearingTypeValue( obj.getSelectedPropertyByName('bearingType') );
            $projection.setWallAction( obj.getSelectedPropertyByName('action') );

          } else if( obj.selected.type == 'WindowBlock'){

            $projection.showObjParams({
              height: {val: obj.getSelectedPropertyByName('height'), label: 'Высота'},
              width: {val: obj.getSelectedPropertyByName('width'), label: 'Ширина'},
              depObject_thickness: {val: obj.selected.depObject_thickness, label: 'Толщина'},
              elevation: {val: obj.getSelectedPropertyByName('elevation'), label: 'От пола'},
              slope: {val: obj.getSelectedPropertyByName('slope'), label: 'Откос'},

              elevation_ed_izm:{label: current_unit.short_name},
              slope_ed_izm:{label: current_unit.short_name},
              width_ed_izm:{label: current_unit.short_name},
              height_ed_izm:{label: current_unit.short_name}

            });
            $('.left_panel_custom').css({'bottom':'10px'});

          } else if( obj.selected.type == 'DoorBlockFloor' || obj.selected.type == 'DoubleDoorBlockFloor' ){

            $projection.showObjParams({
              height: {val: obj.getSelectedPropertyByName('height'), label: 'Высота'},
              width: {val: obj.getSelectedPropertyByName('width'), label: 'Ширина'},

              depObject_thickness: {val: obj.getSelectedPropertyByName('depObject_thickness'), label: 'Толщина'},
              elevation: {val: obj.getSelectedPropertyByName('elevation'), label: 'От пола'},
              slope: {val: obj.getSelectedPropertyByName('slope'), label: 'Откос'},
              isEntryDoor: {isEntryDoor: obj.getSelectedPropertyByName('isEntryDoor'), label: 'Входная'},
              notEntryDoor:{label:'Межкомнатная'},
              entryDoor:{label:'Входная'},
              width_ed_izm:{label: current_unit.short_name},
              height_ed_izm:{label: current_unit.short_name},
              elevation_ed_izm:{label: current_unit.short_name},
              dep_th_ed_izm:{label: current_unit.short_name},
              slope_ed_izm:{label: current_unit.short_name}
            });
            $('.left_panel_custom').css({'bottom':'78px'});
            $('#border-div').css({'display':'block'});
            $('.doors_all_block_1').css({'display':'block'});
            $('.doors_all_block').css({'display':'flex'});

          } else if( obj.selected.type == 'Doorway' || obj.selected.type == 'Niche' ){
            $projection.showObjParams({
              height: {val: obj.getSelectedPropertyByName('height'), label: 'Высота'},
              width: {val: obj.getSelectedPropertyByName('width'), label: 'Ширина'},
              thickness: {val: obj.getSelectedPropertyByName('thickness'), label: 'Толщина'},
              elevation: {val: obj.getSelectedPropertyByName('elevation'), label: 'От пола'},
              th_ed_izm:{label: current_unit.short_name},
              width_ed_izm:{label: current_unit.short_name},
              height_ed_izm:{label: current_unit.short_name},
              elevation_ed_izm:{label: current_unit.short_name}
              // dep_th_ed_izm:{label:'мм'},
              // slope_ed_izm:{label:'мм'}

            });
            $('.left_panel_custom').css({'bottom':'10px'});
          }

      } else {

        return;
      }
    } );


  };
  obj.getSelectedPropertyByName = function( property ){


    if( obj.selectedArray.length == 0)
    return '';

    var object = scene.getObjectByProperty('uuid', obj.selectedArray[0] );


    //первое значение
    if( object && property in object )
    var result = object[ property ];


    for (var i = 1; i < obj.selectedArray.length; i++) {


      object = scene.getObjectByProperty('uuid', obj.selectedArray[i] );

      if( object&& property in object && object[ property ] != result){
        return '';
      }

    }

    return result;


  };
  obj.select_contextmenu = function( event ){
    obj.hideAllMenu();
    if('select_contextmenu' in event.object){
    event.object.select_contextmenu(event);
    obj.selected = event.object;
    }

  };
  obj.unselect = function( event ){

    obj.hideAllMenu();
    $projection.hideObjParams();
    if( obj.selected && ('unselect' in obj.selected) )
    obj.selected.unselect(event);

    obj.objectSelectedClear( event );

  };
  obj.deleteSelected = function(){

    obj.selectedArray.forEach(function (item, index, arr) {

      var item = scene.getObjectByProperty('uuid', item);
      item.remove();
      obj.unselect();

    });

  };
  obj.hoveron = function( event ){
    if( 'hoveron' in event.object )
    event.object.hoveron( event );
  };
  obj.hoveroff = function( event ){
    if( 'hoveroff' in event.object )
    event.object.hoveroff(event);
  };

  obj.removeWall = function( wall ){
    $wallCreator.removeWall(wall);
  };
  obj.showWallDimensions = function(){

    obj.walls.forEach(function( item ){
      item.showDimensions();
    });

  };
  obj.isPointsNeighboors = function( p1, p2, koef ){

    var p1 = p1 || new THREE.Vector3();
    var p2 = p2 || new THREE.Vector3();
    var koef = koef || 1;

    if(p1.distanceToSquared ( p2 ) < obj.maxNeighboorsDistance * obj.maxNeighboorsDistance*koef*koef){
      return true;
    }

    return false;

  };

  obj.getJSON = function( callback, selectMode ){

    var selectMode = selectMode || false;
    var toDelete = []; //фиксация индексов и удаление внешних комнат
    var export_data;

    $.getJSON("data/architectural.json", function( data ) {

        export_data = data;

        if( ! selectMode ){

          export_data.drawing = $Editor.prepareDataToSave();
          window.localStorage.setItem( 'cad5',  export_data.drawing  );
          var rooms = obj.getRooms();
          obj.defineFreeRoom( rooms );

        } else {

          var rooms = selectMode.rooms;
        }

        //totals sum parameters
        var s_floors  = 0; //Площадь полов
        var s_floors_without_openings = 0; //Чистая площадь полов за вычетом отверстий
        var p_outer_contur = 0; //Внешний периметр здания
        var s_inner_walls  = 0; //Площадь внутренних стен
        var s_inner_walls_without_openings = 0; //Площадь внутренних стен без проемов
        var s_outer_walls = 0; //Площадь внешних стен
        var s_outer_walls_without_opnening = 0;//Площадь внешних стен с вычетом проемов
        var p_otkos = 0; //Периметр наружных дверных откосов и окон
        var outer_lintel_length = 0;//Длина перемычек на наружных стенах верхней линии над входными дверьми и окнами

        var outer_angle90_length  = 0; //Длина прямых углов внешних стен (длина углов здания которые равны 90 )
        var outer_angle_N90_length  = 0; //Длина непрямых углов внешних стен
        var p_outer_openings = 0; //Периметр наружных проёмов(окна+двери)
        var s_outer_openings  = 0; //Площадь наружных проёмов (окна+двери)
        var p_outer_otkos_door  = 0; //Периметр наружных дверных откосов

        var num_out_doors = 0; //Количество дверей входных
        var num_doors = 0; //Количество межкомнатных дверей
        var num_windows = 0;//Количество окон

        //selected sum parameters
        var s_room_without_openings = 0;
        var p_room = 0;
        var n_outer_angle90_room = 0;
        var n_outer_angle_N90_room = 0;

        var wall_length = 0;
        var h_wall = 0;
        var p_wall = 0;
        var s_wall_without_openings = 0;

        var p_otkos_door = 0;
        var s_otkos_door = 0;
        var door_lintel_length = 0;

        var p_otkos_window = 0;
        var s_otkos_window = 0;
        var window_lintel_length = 0;

        var p_nichee = 0;
        var s_niche_wall = 0;
        var window_lintel_length = 0;



//        obj.defineExternalWall( rooms );
//        obj.setRoomWallNumbers( rooms );
//        obj.resetOuterWallNumber();
//        obj.setOuterWallNumbers( rooms );


        rooms.forEach(function( room, room_index ){

          window.console.log('room: ' + room.area );

          if( true/*! room.external */){


            export_data.floors[0].rooms[ room_index ] =
            {
              "furniture": [],
              "closedRoom": room.closedRoom,
              "roomID": '',//room.id,
              "room_type": room._type,
              "room_name": "",
              "room_number": "",
              "room_zone": "",
              "room_area": +( room.area * area_unit.c ).toFixed( area_accuracy_measurements ),
              "area_coords":{x: room.getAreaCoords( room.countur ).x, y: room.getAreaCoords( room.countur ).z}, //old
              "s_room_without_openings": +( room.getAreaWithoutOpenings() * area_unit.c ).toFixed( area_accuracy_measurements ),
              "p_room": +( room.getFloorPerimeter() * current_unit.c ).toFixed( accuracy_measurements ),
              "n_outer_angle90_room": room.numberAnglesEquals90,
              "n_outer_angle_N90_room": room.numberAnglesNotEquals90,
              "walls": [],
              "elements": room.getElements()
            };

            if( room.floor && room.floor.actived ){
              s_room_without_openings += +export_data.floors[0].rooms[ room_index ].s_room_without_openings;
              p_room += +export_data.floors[0].rooms[ room_index ].p_room;
              n_outer_angle90_room += +export_data.floors[0].rooms[ room_index ].n_outer_angle90_room;
              n_outer_angle_N90_room += +export_data.floors[0].rooms[ room_index ].n_outer_angle_N90_room;
            }



            //стены комнаты
            for(var j = 0; j < room.surfaces.length; j++){
//            var j = room.surfaces.length;
//            while (j--) {

              var item = room.surfaces[j];
              var arrSurfaces = export_data.floors[0].rooms[ room_index ].walls;

              arrSurfaces.push({
                //old
                id: item.uuid,
                inner:{start:{x: item.source.x, y: item.source.z}, end:{x: item.target.x, y: item.target.z}},
                outer:{start:{x: item.sourceBase.x, y: item.sourceBase.z}, end:{x: item.targetBase.x, y: item.targetBase.z}},
                center:{start:{x: item.sourceBase.x, y: item.sourceBase.z}, end:{x: item.targetBase.x, y: item.targetBase.z}},
                arcPath: null,
                mount_type: '',
                wall_length_mm: +( item.getLength() * current_unit.c ).toFixed( accuracy_measurements ),
                width_px: +item.walls[0].width,
                width_units: +( item.walls[0].width * current_unit.c ).toFixed( accuracy_measurements ),
                type: item.walls[0].bearingType,
                wall_action: item.walls[0].wallAction,
                height: {
                  start: +( item.getHeight() * current_unit.c ).toFixed( accuracy_measurements ),
                  end:   +( item.getHeight() * current_unit.c ).toFixed( accuracy_measurements )
                },
                external_wall: true,
                room_wall_num: j+1,
                outer_wall_num: 0,

                //new
                wall_length: +( item.getLength() * current_unit.c ).toFixed( accuracy_measurements ),
                h_wall: +( item.getHeight() * current_unit.c ).toFixed( accuracy_measurements ),
                p_wall: +( item.getPerimeter() * current_unit.c ).toFixed( accuracy_measurements ),
                s_wall: +(item.getArea() * area_unit.c ).toFixed( area_accuracy_measurements ),
                s_wall_without_openings: +( item.getAreaWithoutOpenings() * area_unit.c ).toFixed( area_accuracy_measurements ),
//                openings: {
//                  0: item.doorsParams.concat(item.windowsParams, item.nichesParams),
//                  doors: item.doorsParams,
//                  windows: item.windowsParams,
//                  niches: item.nichesParams
//                }
                openings:

                 item.doorsParams.length>0 ||
                 item.windowsParams.length>0 ||
                 item.nichesParams.length>0 ?
                 item.doorsParams.concat(item.windowsParams, item.nichesParams) :
                 []



              });


              if( item.actived ){
                wall_length += +arrSurfaces[arrSurfaces.length - 1].wall_length;
                h_wall += +arrSurfaces[arrSurfaces.length - 1].h_wall;
                p_wall += +arrSurfaces[arrSurfaces.length - 1].p_wall;
                s_wall_without_openings += +arrSurfaces[arrSurfaces.length - 1].s_wall_without_openings;
              }

            }


            if( room._type != 'freeRoom'){

                s_floors  = +( room.area * area_unit.c ).toFixed( area_accuracy_measurements ); //Площадь полов
                s_floors_without_openings += +( room.getAreaWithoutOpenings() * area_unit.c ).toFixed( area_accuracy_measurements ); //Чистая площадь полов за вычетом отверстий
                s_inner_walls  += +(( room.getSurfacesArea() * area_unit.c ).toFixed( area_accuracy_measurements )); //Площадь внутренних стен
                s_inner_walls_without_openings += +( room.getSurfacesAreaWithoutOpenings() * area_unit.c ).toFixed( area_accuracy_measurements ); //Площадь внутренних стен без проемов

              }


          } else { //если не внешняя комната

            p_outer_contur += +( room.getFloorPerimeter() * current_unit.c ).toFixed( accuracy_measurements );//Внешний периметр здания
            s_outer_walls += +( room.getSurfacesArea() * area_unit.c ).toFixed( area_accuracy_measurements ); //Площадь внешних стен
            s_outer_walls_without_opnening += +( room.getSurfacesAreaWithoutOpenings() * area_unit.c ).toFixed( area_accuracy_measurements );//Площадь внешних стен с вычетом проемов
            p_otkos += +( ( room.getPerimeter3Doors() + room.getPerimeter3Windows() ) * current_unit.c ).toFixed( accuracy_measurements ); //Периметр наружных дверных откосов и окон
            outer_lintel_length += +( room.getLintelLength() * current_unit.c ).toFixed( accuracy_measurements );//Длина перемычек на наружных стенах верхней линии над входными дверьми и окнами


            p_outer_openings += +( ( room.getPerimeter4Doors() + room.getPerimeter4Windows() ) * current_unit.c ).toFixed( accuracy_measurements );; //Периметр наружных проёмов(окна+двери)
            s_outer_openings  += +( room.getAreaDoors() * area_unit.c ).toFixed( area_accuracy_measurements ); //Площадь наружных проёмов (окна+двери)
            p_outer_otkos_door  += +( room.getPerimeter3Doors() * current_unit.c ).toFixed( accuracy_measurements ); //Периметр наружных дверных откосов

            outer_angle90_length  += +( room.lengthAnglesEquals90 * current_unit.c ).toFixed( accuracy_measurements ); //Длина прямых углов внешних стен (длина углов здания которые равны 90 )
            outer_angle_N90_length  += +( room.lengthAnglesNotEquals90 * current_unit.c ).toFixed( accuracy_measurements ); //Длина непрямых углов внешних стен

            //фиксация индекса внешней комнаты
            toDelete.push( room_index );

          }

        });

        //удаление внешней комнаты из массива
        toDelete.forEach(function (item, index, arr) {
           export_data.floors[0].rooms.splice(item,1) ;
        });


        export_data.floors[0].totals.s_floors = s_floors;
        export_data.floors[0].totals.s_floors_without_openings = s_floors_without_openings;
        export_data.floors[0].totals.s_inner_walls = s_inner_walls;
        export_data.floors[0].totals.s_inner_walls_without_openings = s_inner_walls_without_openings;

        export_data.floors[0].totals.p_outer_contur = p_outer_contur;
        export_data.floors[0].totals.s_outer_walls = s_outer_walls;
        export_data.floors[0].totals.s_outer_walls_without_opnening = s_outer_walls_without_opnening;
        export_data.floors[0].totals.p_otkos = p_otkos;
        export_data.floors[0].totals.outer_lintel_length = outer_lintel_length;
        export_data.floors[0].totals.p_outer_openings = p_outer_openings;
        export_data.floors[0].totals.s_outer_openings = s_outer_openings;
        export_data.floors[0].totals.p_otkos_door = p_otkos_door;
        export_data.floors[0].totals.outer_angle90_length = outer_angle90_length;
        export_data.floors[0].totals.outer_angle_N90_length = outer_angle_N90_length;

        export_data.floors[0].totals.num_out_doors = obj.getNumberEntryDoors();//Количество дверей входных
        export_data.floors[0].totals.num_doors = obj.getNumberInterroomDoors();//Количество межкомнатных дверей
        export_data.floors[0].totals.num_windows = obj.getNumberWindows();//Количество окон

        if( selectMode ){
          export_data.floors[0].selected = {
            rooms:{
              s_room_without_openings: s_room_without_openings,
              p_room: p_room,
              n_outer_angle90_room: n_outer_angle90_room,
              n_outer_angle_N90_room: n_outer_angle_N90_room
            },
            walls:{
              wall_length: wall_length,
              h_wall: h_wall,
              p_wall: p_wall,
              s_wall_without_openings: s_wall_without_openings
            },
            doors: selectMode.doorwayParams.doors,
            windows: selectMode.doorwayParams.windows,
            niches: selectMode.doorwayParams.niches
          };
        }

        callback( JSON.stringify(export_data) );
    });


  };

//    window.console.timeEnd('t');

  obj.removeRooms = function(){

    if( obj.rooms )
    obj.rooms.forEach(function( room ){

      room.clear();

    });

  obj.rooms = [];

  };
  obj.showRoomsArea = function(){

    if( obj.rooms )
    obj.rooms.forEach(function( room ){

      room.showAreaNotification();

    });

  };

  obj.getRooms = function(){

//    window.console.time('t');
    obj.removeRooms();

    var rooms = [];
    var nodes =  obj.getNodes(obj.walls);
    var pathes = obj.getPathes(obj.walls);
    var chains = obj.getChains(nodes, pathes);


    //=================

    chains.forEach( function( chain ){

      var countur = [];

      if( chain ){

        var isClockWise = ! THREE.ShapeUtils.isClockWise( countur ) ;
        var isExternal = obj.isExternalChain( nodes, chain );

        var  room = new Room( {
                                nodes: nodes,
                                chain: chain,
                                isClockWise: !isClockWise,
                                external: isExternal
                              });
        rooms.push( room );

      }

    });

//    window.console.timeEnd('t');
    obj.rooms = rooms;
    return rooms;

  };
  obj.getNodes = function( walls ){

    var nodes = {};

    walls.forEach(function( item ){

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
  obj.getPathes = function( walls ){

    var pathes = [];

    walls.forEach(function( item ){

      pathes.push({
                    id: item.uuid + '_11',
                    wall_uuid:item.uuid,
                    source: { id: item.node11.id },
                    target: { id: item.node21.id },
                    wall_id: item.id
                  });

      //из исключения толстая тонкая
      if(item._e_path11){

        pathes.push(item._e_path11);

      };
      if(item._e_path12){

        pathes.push(item._e_path12);

      };

      pathes.push({
                    id: item.uuid + '_12',
                    wall_uuid:item.uuid,
                    source: { id: item.node12.id },
                    target: { id: item.node22.id },
                    wall_id: item.id
                  });

      //из исключения толстая тонкая
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
                    wall_id: item.id
                  });
      }

      if( item.mover.v2_neighbors.length == 0){
        pathes.push({
                    id: item.uuid + '_02',
                    wall_uuid:item.uuid,
                    source: { id: item.node21.id },
                    target: { id: item.node22.id },
                    wall_id: item.id
                  });
      }


    });

    return pathes;

  };
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

  };
  obj.getChain = function( pathes, search_id, unit ){

    pathes.forEach(function( path, index ){

      if( path.source.id == search_id ){
        unit.push( path );
        pathes.splice( index, 1 );
        obj.getChain( pathes, path.target.id, unit );
        return;
      }
      if( path.target.id == search_id ){
        unit.push( path );
        pathes.splice( index, 1 );
        obj.getChain( pathes, path.source.id, unit );
        return;
      }

    });

  };
  obj.isExternalChain = function( nodes, chain ){

      var wall_uuid = chain[0].wall_uuid;
      var wall = scene.getObjectByProperty ( 'uuid', wall_uuid );

      if( wall ){
        if ( obj.isWallInRoom( nodes, wall, chain ) )
        return true;
      }

      return false;

  };


  obj.isWallInRoom = function( nodes, wall, chain ){

    //массив диний для проверки пересечения
    var objects = [];
    chain.forEach(function(item){

      var geometry = new THREE.Geometry();

      if(nodes[item.source.id] && nodes[item.target.id]){
        geometry.vertices.push( nodes[item.source.id].position, nodes[item.target.id].position );

        var line = new THREE.Line(geometry);
        objects.push( line );
      }

    });

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
  obj.isPointInCountur2 = function(chain, point, nodes){

    var result = false;
    point = point.clone().floor();
    result = chain.some( function(item){

    if( point.equals(nodes[item.source.id].position.clone().floor()) || point.equals(nodes[item.target.id].position.clone().floor()) ){
      return true;
    }

    });

    return result;

  };
  obj.isPointInCountur = function(countur, point){
    var objects = [];
    // countur - массив wall uuid в комнате
    countur.forEach(function(wall_uuid){

      var wall = scene.getObjectByProperty ( 'uuid', wall_uuid );

      var geometry = new THREE.Geometry();

        geometry.vertices.push( wall.v1, wall.v2 );

        var material = new THREE.LineBasicMaterial({ color: 'green' });
        var line = new THREE.Line(geometry, material);
        objects.push( line );

    });



    //==========
      obj.raycaster.ray.origin = point.clone();
      obj.raycaster.far = 100000;

      //=====================
      //пересечение
      var intersectObjects = [];
      obj.raycaster.ray.direction.copy( new THREE.Vector3(0.65, 0, 1) );
      var intersectObjects = obj.raycaster.intersectObjects(objects);


//      if(objects.length == 5){
//
//        objects.forEach(function(item){
//          scene.add(item);
//
//        })
//
//       }


      if(objects.length == 5  && (intersectObjects.length % 2) != 0 ){
        var geometry = new THREE.Geometry();
        geometry.vertices.push( obj.raycaster.ray.origin.clone(), obj.raycaster.ray.origin.clone().add( obj.raycaster.ray.direction.clone().multiplyScalar(10000) ) );
        var material = new THREE.LineBasicMaterial({ color: 'red' });
        var line2 = new THREE.Line(geometry, material);
        scene.add(line2);
      }







      if( (intersectObjects.length % 2) != 0  ){
        return true;
      }

      return false;
  };
  obj.getArea = function( countur ){

    var result = {};
    result.nativeArea = THREE.ShapeUtils.area( countur );
    result.area = Math.abs( result.nativeArea );

    var area_coord = new THREE.Vector3();
    var max_area = 0;
    var triangles = THREE.ShapeUtils.triangulate( countur );

    if(triangles)
    triangles.forEach(function( item2 ){

      var triangle = new THREE.Triangle(
                                    new THREE.Vector3(item2[0].x, 0, item2[0].y),
                                    new THREE.Vector3(item2[1].x, 0, item2[1].y),
                                    new THREE.Vector3(item2[2].x, 0, item2[2].y)
                                    );


      var current_area = triangle.area();
      if( current_area > max_area ){
        max_area = current_area;
        area_coord = triangle.midpoint();
      }

    });


    result.coord = area_coord;


    return  result ;
  };

  obj.defineExternalWall = function( rooms ){

    var walls = [];

    rooms.forEach(function( room, room_index ){

      room.walls.forEach(function( uuid ){

        if( walls[uuid] ){
          walls[uuid] += 1;
        } else {
          walls[uuid] = 1;
        }

      });

    });


    rooms.forEach(function( room, room_index ){

      room.walls.forEach(function( uuid ){

        var item = scene.getObjectByProperty( 'uuid', uuid );

        if( walls[uuid] > 1 || (uuid in room.external_walls) ){

          item.external_wall = false;

        } else {

          item.external_wall = true;

        }

      });

    });

  };
  obj.nextNeighborsCount = function ( neighbors, room_walls ){

    var neighbors = neighbors || [];
    var room_walls = room_walls || [];
    var result = 0;

    neighbors.forEach( function( neighbor ){

      if( room_walls.indexOf( neighbor.wall.uuid ) != -1 ){

        result += 1;

      }

    });
    return result;

  };
  obj.setRoomWallNumbers = function( rooms ){

    //очистка нумерации
    obj.walls.forEach(function(item){
      item.number = {};
    });

    //нумерация, если в цепочке есть стены с проемом
    rooms.forEach(function( room, room_index ){

      for ( var y = 0; y < room.walls.length; y++) {

        var wall = scene.getObjectByProperty( 'uuid', room.walls[ y ] );

       //стена с проемом
        if( obj.isWallHasDoor( wall ) ){

          var current_number = 1;


          //после y
          for ( var index = y; index < room.walls.length; index++) {

              var wall = scene.getObjectByProperty( 'uuid', room.walls[ index ] );

              if( ! wall.number[room_index] || wall.number[room_index] == ''){

                wall.number[room_index] = current_number;
                current_number++;

              }

              for (var i = 0; i < room.walls.length; i++) {

                if( index != i ){

                  var search_wall = scene.getObjectByProperty( 'uuid', room.walls[ i ] );

                  if( wall && wall.isCollinear( search_wall )  ){
                    switch (wall.isNeighbor( search_wall )) {
                      case 'v1':
                        if( obj.nextNeighborsCount (wall.mover.v1_neighbors, room.walls) == 1 )
                        if( ! search_wall.number[room_index] ) {
                          search_wall.number[room_index] = wall.number[room_index];
                        } else {
                          wall.number[room_index] = search_wall.number[room_index] ;
                        }
                        break;
                      case 'v2':
                        if( obj.nextNeighborsCount (wall.mover.v2_neighbors, room.walls) == 1 )
                        if( ! search_wall.number[room_index] ) {
                          search_wall.number[room_index] = wall.number[room_index];
                        } else {
                          wall.number[room_index] = search_wall.number[room_index] ;
                        }
                        break;

                    }
                  }

                }
              }


          }


          //до y
          for ( var index = 0; index < y; index++) {

              var wall = scene.getObjectByProperty( 'uuid', room.walls[ index ] );

              if( ! wall.number[room_index] || wall.number[room_index] == ''){

                wall.number[room_index] = current_number;
                current_number++;

              }

              for (var i = 0; i < room.walls.length; i++) {

                if( index != i ){

                  var search_wall = scene.getObjectByProperty( 'uuid', room.walls[ i ] );

                  if( wall && wall.isCollinear( search_wall ) ){

                    switch (wall.isNeighbor( search_wall )) {
                      case 'v1':

                        if( obj.nextNeighborsCount (wall.mover.v1_neighbors, room.walls) == 1 )
                        if( ! search_wall.number[room_index] ) {
                          search_wall.number[room_index] = wall.number[room_index];
                        } else {
                          wall.number[room_index] = search_wall.number[room_index] ;
                        }
                        break;
                      case 'v2':
                        if( obj.nextNeighborsCount (wall.mover.v2_neighbors, room.walls) == 1 )
                        if( ! search_wall.number[room_index] ) {
                          search_wall.number[room_index] = wall.number[room_index];
                        } else {
                          wall.number[room_index] = search_wall.number[room_index] ;
                        }
                        break;

                    }

                  }

                }
              }


          }

          return;
        }
        else{

        }
      }

    });

    //нумерация, если в цепочке нет стен с проемом
    rooms.forEach(function( room, room_index ){

      var current_number = 1;

      for ( var index = 0; index < room.walls.length; index++) {

        var wall = scene.getObjectByProperty( 'uuid', room.walls[ index ] );

        if( ! wall.number[room_index] || wall.number[room_index] == ''){

          wall.number[room_index] = current_number;
          current_number++;

        }

        for (var i = 0; i < room.walls.length; i++) {

          if( index != i ){

            var search_wall = scene.getObjectByProperty( 'uuid', room.walls[ i ] );

            if( wall && wall.isCollinear( search_wall ) ){

              switch (wall.isNeighbor( search_wall )) {
                case 'v1':
                  if( obj.nextNeighborsCount (wall.mover.v1_neighbors, room.walls) == 1 )
                  if( ! search_wall.number[room_index] ) {
                    search_wall.number[room_index] = wall.number[room_index];
                  } else {
                    wall.number[room_index] = search_wall.number[room_index] ;
                  }

                  break;
                case 'v2':
                  if( obj.nextNeighborsCount (wall.mover.v2_neighbors, room.walls) == 1 )
                  if( ! search_wall.number[room_index] ) {
                    search_wall.number[room_index] = wall.number[room_index];
                  } else {
                    wall.number[room_index] = search_wall.number[room_index] ;
                  }
                  break;

              }

            }

          }
        }


      }

    });

  };
  obj.isWallHasDoor = function( wall ){

    var i = wall.doors.length;

    while(i--){

      if( wall.doors[i].name == 'doorway' || wall.doors[i].name == 'singleDoor' || wall.doors[i].name == 'doubleDoor'){
        return true;
      }

    }

    return false;

  };
  obj.defineFreeRoom = function( rooms ){

    var walls = obj.walls.slice();

    //step1
    rooms.forEach(function(room){
      room.walls.forEach(function ( uuid ) {

        var wall = scene.getObjectByProperty( 'uuid', uuid );

        var index = walls.indexOf(wall);
        if(index != -1){
          walls.splice( index, 1 );
        }

      });

    });


    //step2
    var nodes =  obj.getNodes(walls);
    var pathes = obj.getPathes(walls);
    var chains = obj.getChains(nodes, pathes);

    chains.forEach(function( chain ){

      var walls = [];

      if( chain ){

          //=================

          chain.forEach(function( item ){

            if( walls.indexOf( item.wall_uuid ) == -1 ){
              walls.push( item.wall_uuid );
            }

          });


          var  room = new Room({
                                nodes: nodes,
                                chain: chain,
                                isClockWise: 0,
                                _type: 'freeRoom'
                              });
          rooms.push( room );


      }

    });

  };
  obj.resetOuterWallNumber = function(){
    obj.walls.forEach(function (item, index, arr) {
      item.outer_wall_num = 0;
    });
  };
  obj.setOuterWallNumbers = function( rooms ){

    //step1
    var outer_walls = [];
    var outer_walls_uuids = [];

    obj.walls.forEach(function ( wall, index, arr ) {

      if( wall.external_wall ){
        outer_walls.push( wall );
        outer_walls_uuids.push( wall.uuid );
      }

    });

    //step2
    var outer_wall_num = 1;
    outer_walls.forEach(function (wall) {

      var current_wall = wall;
      if( ! current_wall.outer_wall_num ){

        current_wall.outer_wall_num = outer_wall_num;
        outer_wall_num++;

      }

      outer_walls.forEach(function (item, index, arr) {

        if( Math.abs(current_wall.isCollinear(item)) > 0.999  ) {
          switch (current_wall.isNeighbor(item)) {
            case 'v1':
              if( obj.nextNeighborsCount (current_wall.mover.v1_neighbors, outer_walls_uuids) == 1 )
              if( ! item.outer_wall_num ) {
                item.outer_wall_num = current_wall.outer_wall_num;
              } else {
                current_wall.outer_wall_num = item.outer_wall_num ;
              }

              break;
            case 'v2':
              if( obj.nextNeighborsCount (current_wall.mover.v2_neighbors, outer_walls_uuids) == 1 )
              if( ! item.outer_wall_num ) {
                item.outer_wall_num = current_wall.outer_wall_num;
              } else {
                current_wall.outer_wall_num = item.outer_wall_num ;
              }

              break;

          }

        }

      });

    });

  };

  obj.getNumberEntryDoors = function(){

    var result = 0;
    obj.walls.forEach(function ( wall, index, arr ) {

      wall.doors.forEach(function (door, index, arr) {

        if( door.isEntryDoor ){
          result += 1;
        }

      });

    });

    return result;
  };
  obj.getNumberInterroomDoors = function(){

    var result = 0;
    obj.walls.forEach(function ( wall, index, arr ) {

      wall.doors.forEach(function (door, index, arr) {

        if( door.type == 'DoorBlock' ||
            door.type == 'DoorBlockFloor' ||
            door.type == 'DoubleDoorBlock' ||
            door.type == 'DoubleDoorBlockFloor' )
        if( ! door.isEntryDoor ){
          result += 1;
        }

      });

    });

    return result;
  };
  obj.getNumberWindows = function(){

    var result = 0;
    obj.walls.forEach(function ( wall, index, arr ) {

      wall.doors.forEach(function (door, index, arr) {

        if( door.type == 'WindowBlock'){
          result += 1;
        }

      });

    });

    return result;
  };

  obj.getMainDoorwayParams = function( doorway ){

    var element = doorway;
    var params = {
        width: element.hasOwnProperty("width") ? element["width"] : $Editor.default_params[ element.type ].width || 900,
        height: element.hasOwnProperty("height") ? element["height"] : $Editor.default_params[ element.type ].height || 2000,
        thickness: element.hasOwnProperty("thickness") ? element["thickness"] : $Editor.default_params[ element.type ].thickness || 100,
        elevation: element.hasOwnProperty("elevation") ? element["elevation"] : $Editor.default_params[ element.type ].elevation || 0,
        offset: element.hasOwnProperty("offset") ? element["offset"] : $Editor.default_params[ element.type ].offset || 0,
        depObject_thickness: element.hasOwnProperty("depObject_thickness") ? element["depObject_thickness"] : $Editor.default_params[ element.type ].depObject_thickness || '',
        slope: element.hasOwnProperty("slope") ? element["slope"] : $Editor.default_params[ element.type ].slope || 0,
        location: element.hasOwnProperty("location") ? element["location"] : $Editor.default_params[ element.type ].location || 1
      };

      return params;
  };

  //===========

  /*===================*/
  obj.activate = function(){
//    document.addEventListener( 'mousedown', onDocumentMouseDownWallEditor, false );
//    document.addEventListener( 'mousemove', onDocumentMouseMoveWallEditor, false );
    document.addEventListener( 'keydown', onKeyDownWallEditor, false );
    document.addEventListener( 'keyup', onKeyUpWallEditor, false );

//    document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  };
  obj.deactivate = function(){
//    document.removeEventListener( 'mousedown', onDocumentMouseDownWallEditor, false );
//    document.removeEventListener( 'mousemove', onDocumentMouseMoveWallEditor, false );
    document.removeEventListener( 'keydown', onKeyDownWallEditor, false );
    document.removeEventListener( 'keyup', onKeyUpWallEditor, false );

//    document.removeEventListener( 'wheel', onDocumentMouseWheel, false );
  };

  function onDocumentMouseDownWallEditor( event ){

    if (!obj.enabled)
      return false;
//    event.preventDefault();

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
  };
  function onDocumentMouseMoveWallEditor(event){
    obj.currentWall = null;//стена над которой находится поинтер

    if ( !obj.enabled )
      return false;
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


  };
  function onKeyDownWallEditor ( event ){

    if (!obj.enabled)
      return false;
//    event.preventDefault();

    switch( event.keyCode ) {
      case 46: /*del*/
        obj.deleteSelected();
      case 27: /*esc*/
        obj.unselect();
        break;
      case 17://ctrl
      obj.multySelectMode = true;
      break;
    }

//    if( event.ctrlKey){
//      obj.multySelectMode = true;
//    }

  };
  function onKeyUpWallEditor ( event ){

    switch( event.keyCode ) {
      case 17://ctrl
      obj.multySelectMode = false;
      break;
    }

   }

  function onDocumentMouseWheel ( event ){

//            camera.fov += event.deltaY * 0.05;
//            camera.updateProjectionMatrix();

//    var element = $( '.EditableField' );
//    var field = element.find('input');
//
//    element.css('left', 0);
//    element.css('top', 0);
//    var coord = getScreenCoord(self.position.clone(), camera);
//    element.offset({left: coord.x - field.width()/2 , top: coord.y - field.height()/2 });
  };

  //считываем координаты элементов меню
  obj.getWallMenuCoord();
  obj.getSwitcherCoord('FourStateSwitcher', obj.doorblockSwitcherCoord);
  obj.getSwitcherCoord('TwoStateSwitcher', obj.windowblockSwitcherCoord);
  obj.getDoorwayMenu();
  obj.getControlPointMenu();

  /**
	 * удаление стены
	 */
  $('.ActiveElementMenu').on('click', function(){

    $(this).css('display', 'none');

  });
	$('.ActiveElementMenu').on('click', '[action = remove]', function(){

		obj.selected.remove();
    obj.unselect();

	});
  $('.ActiveElementMenu').on('click', '[action = addCopy]', function(){

		if( obj.lastDoorway.doorway ){

      var element = scene.getObjectByProperty('uuid', obj.lastDoorway.doorway);
      var params = obj.getMainDoorwayParams( element );

      obj.selected.addDoorway( obj.lastDoorway.type, params );

    }

	});
  $('.ActiveElementMenu').on('click', '[action = addDoorway]', function(){

		var uuid = obj.selected.addDoorway( $(this).data('type') );
    obj.lastDoorway.type = $(this).data('type');
    obj.lastDoorway.doorway = uuid;

	});
  $('.ActiveElementMenu').on('click', '[action = addDoorBlockFloor]', function(){

		var uuid = obj.selected.addDoorway( $(this).data('type') );
    obj.lastDoorway.type = $(this).data('type');
    obj.lastDoorway.doorway = uuid;

	});
  $('.ActiveElementMenu').on('click', '[action = addDoubleDoorBlockFloor]', function(){

		var uuid = obj.selected.addDoorway( $(this).data('type') );
    obj.lastDoorway.type = $(this).data('type');
    obj.lastDoorway.doorway = uuid;

	});
  $('.ActiveElementMenu').on('click', '[action = addWindow]', function(){

		var uuid = obj.selected.addDoorway( $(this).data('type') );
    obj.lastDoorway.type = $(this).data('type');
    obj.lastDoorway.doorway = uuid;

	});
  $('.ActiveElementMenu').on('click', '[action = addNiche]', function(){

		var uuid = obj.selected.addDoorway( $(this).data('type') );
    obj.lastDoorway.type = $(this).data('type');
    obj.lastDoorway.doorway = obj.selected.uuid;

	});
  $('.ActiveElementMenu').on('click', '[action = scaleFloor]', function(event){

		obj.selected.setFloorScale(event);

	});
  $('.ActiveElementMenu').on('click', '[action = changeWidth]', function(event){

		obj.selected.changeWidth(event);

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
    obj.unselect();

    obj.activateSelectControls();

	});
  $('.ControlPointMenu').on('click', '[action = remove]', function(){

		obj.selected.remove();
    obj.unselect();

	});


  $('.footer').on('keydown','[action = floorHeight]',function(event){

  if(event.keyCode == 13){

    var elem = $(this);
    $wallEditor.walls.forEach(function( wall ){
      wall.height =  + elem.val()/current_unit.c;
      wall.update();
    });

    $(this).trigger( "blur" );

  }

});
  $('.footer').on('change','[param][type = checkbox]',function(event){

    var param = $(this).attr('param');
    var val = $(this).prop('checked');
    if( obj.selected ){
//      obj.selected[ param ] = val;
      obj.selected.set(param, val);
    }

  });

  $('[name = walls_type_radio]').on('click',function(){

    var self = this;

    obj.selectedArray.forEach(function (item, index, arr) {

      var changingObject = scene.getObjectByProperty('uuid', item);

      if( changingObject ){

        changingObject.changeBearingType( $(self).attr('id') );
        $(self).prop('checked', 'checked' );

      }

    });

	});
  $('[name = wall_action]').on('click',function(){

    var self = this;

    obj.selectedArray.forEach(function (item, index, arr) {

      var changingObject = scene.getObjectByProperty('uuid', item);

      if( changingObject ){

        changingObject.changeAction( $(self).attr('id') );
        $(self).prop('checked', 'checked' );

      }

    });

    $projection.hideObjParams();

	});
//  $('.footer').on('keydown','[param]',function(event){
//
//    //фиксируем изменяемый объект для использовании в событии по change
//    obj.changingObject  = obj.selected;
//
//  });

  $('.footer').on('change','[param]',function(event){

    var self = this;

    obj.selectedArray.forEach(function (item, index, arr) {

      var changingObject = scene.getObjectByProperty('uuid', item);

      var param = $(self).attr('param');

      if( changingObject && $(self).val() != '' ){

        var val = +$(self).val()/current_unit.c;

        switch (param) {
          case 'depObject_thickness':

            changingObject.setDepObjectThickness( val );

            break;
          case 'width':

            if ( changingObject.type == 'Wall' ){

              changingObject.setWidth( val );

            } else {

              changingObject[ param ] = val;

            }

            break;
          default:

            changingObject[ param ] = val;

            break;
        }

        changingObject.wall ? changingObject.wall.update() : changingObject.update();
        $wallCreator.updateWalls();

      }

      changingObject = null;

    });

  });
  $('.footer').on('click','[param]',function(event){
    $(this).focus();
    $(this).select();
  });

}
$wallEditor = {};
Object.setPrototypeOf($wallEditor, $wallCreator);
initWallEditor($wallEditor);



// FUNCTIONS
function toggleMode( mode ){

  switch ( mode ) {
    case '2D':

      if( ! $projection.enabled){

        $projection.on('top');

        $('.mode2D').show();
        $('.footer').find('[action = mode]').text('3D');

      }

      break;
    case '3D':

      if($projection.enabled){

        $projection.off();

        $('.mode2D').hide();
        $('.footer').find('[action = mode]').text('2D');

      }

      break;
  }
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
function setFloorPlan(form) {
	var thisObj = this;
	var send = new FormData(form);

	// через прокси апи не получится так просто послать файл...
	//var send_url = "proxy_api.php" + "?url=http://local.online.cableproject.net:8083/" + "&route=/drawing/php/req_controller.php";
	// сделаем через .htaccess и кросс доменность
	//var send_url = "http://local.online.cableproject.net:8083/drawing/php/req_controller.php";
	var send_url = "http://online.cad5d.com/test_cad/php/req_controller.php";
	$.ajax({
		url: send_url,
		type: "POST",
		data: send,
		processData: false,
		contentType: false,
		dataType: "json",
		success: function success(data, textStatus, jqXHR) {
			$('input[name="image_file"]').val('');
			console.log(data);
			if (data.pages && data.pages > 1) {
				if (!data.error) {
					if (data.uploadall) {
						//setFloorTexture('http://local.online.cableproject.net:8083/drawing/user_images/' + data.uploadall + '-0.jpg');
						$Editor.setFloorTexture('http://online.cad5d.com/test_cad/user_images/' + data.uploadall + '-0.jpg');
					}
				}
			} else
			{
				if (!data.error) {
					if (data.upload) {
						//setFloorTexture('http://local.online.cableproject.net:8083/drawing/user_images/' + data.upload);
						$Editor.setFloorTexture('http://online.cad5d.com/test_cad/user_images/' + data.upload);
					}
				}
			}
		},
		error: function error(jqXHR, textStatus, errorThrown) {
			$('input[name="image_file"]').val('');
			alert('File to big');
		}
	});
	return false;
}

$('input[name="image_file"]').change(function() {
	$('form[name="floor_plan_form"]').submit();
});








