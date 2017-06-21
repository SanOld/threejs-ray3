//Режим выбора
function initSelectMode( obj ){

  obj.enabled = false;
  obj.rooms = [];
  obj.doorways = [];
  obj.selected = null;
  obj.hovered = null;
  obj.arraySelected = [];

  obj.on = function(){

    obj.enabled = true;
    obj.activate();

    obj.calculateRooms();
    obj.showRoomsFloor();
    obj.showRoomsSurfaces();

    obj.showSelectAllWallsTool();

    obj.calculateDoorways();
    obj.showDoorways();

    obj.deactivateSelectControls();
    obj.activateSelectControls();

  };
  obj.off = function(){

    obj.enabled = false;
    obj.unselectAll();

    obj.hideRoomsFloor();
    obj.hideRoomsSurfaces();
    obj.hideDoorways();

    obj.hideSelectAllWallsTool();

    obj.deactivateSelectControls();

    obj.deactivate();

  };

  obj.activate = function(){
//    document.addEventListener( 'mousedown', onDocumentMouseDownWallEditor, false );
//    document.addEventListener( 'mousemove', onDocumentMouseMoveWallEditor, false );
    document.addEventListener( 'keydown', onKeyDownSelectMode );

//    document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  };
  obj.deactivate = function(){
//    document.removeEventListener( 'mousedown', onDocumentMouseDownWallEditor, false );
//    document.removeEventListener( 'mousemove', onDocumentMouseMoveWallEditor, false );
    document.removeEventListener( 'keydown', onKeyDownSelectMode, false );

//    document.removeEventListener( 'wheel', onDocumentMouseWheel, false );
  };

  obj.activateSelectControls = function(){

    var objects = [];

    obj.rooms.forEach(function( room ){

      objects = objects.concat( room.surfaces );

      if( !room.external ){
        objects = objects.concat( room.floor );
        objects = objects.concat( room.selectAllWallsTool );
      }

    });

    objects = objects.concat( obj.doorways );


    if( obj.selectControls ){

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

    if( obj.selectControls ){

      obj.selectControls.removeEventListener( 'select', obj.select, false );
  //    obj.dragControls.removeEventListener( 'end', obj.dragend, false );
      obj.selectControls.removeEventListener( 'hoveron', obj.hoveron, false );
      obj.selectControls.removeEventListener( 'hoveroff', obj.hoveroff, false );
      obj.selectControls.removeEventListener( 'select_contextmenu', obj.select_contextmenu, false );

      obj.selectControls.deactivate();
      obj.selectControls = null;
    }

  };

  obj.select = function( event ){
    window.console.log(event.object.type);

    if( event.object.type == 'Sprite'){

      if ( obj.arraySelected.length > 0 && obj.arraySelected[0].type != 'RoomSurface' ){

        $Editor.msg({
          type: 'confirm',
          text: 'Вы выбираете объект другого типа. \n Выбранные объекты будут сброшены. \n Продолжить?',
          response: function(response){
            if(response){

              obj.unselectAll();

              if( 'select' in event.object )
              event.object.select(event);//вызываем select на выбранном объекте

            } else {
              return;
            }
          }

        });

      } else {

        if( 'select' in event.object )
        event.object.select(event);//вызываем select на выбранном объекте

      }

      return;
    }

    //фиксируем выбранный объект
    obj.selected = event.object;

    if ( obj.arraySelected.length > 0 && obj.arraySelected[0].type != obj.selected.type ){

      $Editor.msg({
        type: 'confirm',
        text: 'Вы выбираете объект другого типа. \n Выбранные объекты будут сброшены. \n Продолжить?',
        response: function(response){
          if(response){

            obj.unselectAll();

            obj.arraySelected.push( obj.selected );
            obj.sendData();

            if( 'select' in event.object )
            event.object.select(event);//вызываем select на выбранном объекте

          }
        }

      });

    } else if( obj.arraySelected.indexOf( obj.selected ) != -1){

      obj.arraySelected.splice( obj.arraySelected.indexOf( obj.selected ), 1);
      obj.sendData();

      obj.selected.unselect();
      obj.selected = null;

    } else {

      obj.arraySelected.push( obj.selected );
      obj.sendData();

      if( 'select' in event.object )
      event.object.select(event);//взываем select на выбранном объекте

    }


  };
  obj.select_contextmenu = function(event){
//    obj.hideAllMenu();
    if('select_contextmenu' in event.object){
    event.object.select_contextmenu(event);
    obj.selected = event.object;
    }

  };

  obj.selectAllDoors = function(){

    obj.doorways.forEach(function ( item, index, arr ) {

      if(item.type == 'Room_Doorway')
      obj.select( { object: item } );

    });

  };
  obj.selectAllWindows = function(){

    obj.doorways.forEach(function ( item, index, arr ) {

      if(item.type == 'Room_WindowBlock')
      obj.select( { object: item } );

    });

  };
  obj.selectAllFloors = function(){

    obj.rooms.forEach(function ( item, index, arr ) {

      if( ! item.external )
      obj.select( { object: item.floor } );

    });

  };
  obj.selectAllOuterSurfaces = function(){

    obj.rooms.forEach(function ( item, index, arr ) {

      if( item.external ){

        item.surfaces.forEach(function ( surface, index, arr ) {

          surface.select( { object: surface } );

        });

      }

    });

  };
  obj.selectAllInnerSurfaces = function(){

    obj.rooms.forEach(function ( item, index, arr ) {

      if( ! item.external ){

        item.surfaces.forEach(function ( surface, index, arr ) {

          surface.select( { object: surface } );

        });

      }

    });

  };

  obj.unselect = function( event ){

//    if( obj.selected && ('unselect' in obj.selected) )
//    obj.selected.unselect(event);


    obj.selected = null;

  };
  obj.hoveron = function( event ){
    if( 'hoveron' in event.object && obj.hovered != event.object){
      event.object.hoveron( event );
      obj.hovered = event.object;
    }

  };
  obj.hoveroff = function( event ){
    if( 'hoveroff' in event.object )
    event.object.hoveroff(event);
    obj.hovered = null;
  };

  obj.calculateRooms = function(){
//    $wallEditor.on();
    obj.rooms = $wallEditor.getRooms();
//    $wallEditor.off();
  };
  obj.showRoomsFloor = function(){

    obj.rooms.forEach(function( room ){

      room.showFloor();

    });

  };
  obj.hideRoomsFloor = function(){

    obj.rooms.forEach(function( room ){

      room.hideFloor();

    });

  };
  obj.showRoomsSurfaces = function(){

    obj.rooms.forEach(function( room ){

      room.showSurfaces();

    });

  };
  obj.hideRoomsSurfaces = function(){

    obj.rooms.forEach(function( room ){

      room.hideSurfaces();

    });

  };
  obj.showSelectAllWallsTool = function(){

    obj.rooms.forEach(function( room ){

      room.showSelectAllWallsTool();

    });

  };
  obj.hideSelectAllWallsTool = function(){

    obj.rooms.forEach(function( room ){

      room.hideSelectAllWallsTool();

    });

  };
  obj.unselectAll = function(){

    obj.arraySelected.forEach( function( item ){
      if(('unselect' in item))
      item.unselect();
    });
    obj.arraySelected.length = 0;

  };
  obj.getDoorwaySelectedParams = function(){

    var result = {
        doors:{
          p_otkos_door:0,
          s_otkos_door:0,
          door_lintel_length:0,
          p_door:0
        },
        windows:{
          p_otkos_window:0,
          s_otkos_window:0,
          window_lintel_length:0,
          p_window:0
        },
        niches:{
          p_niche:0,
          s_niche_wall:0,
          depth_niche:0,
          s_side_niche:0
        }
      };

    obj.arraySelected.forEach( function( item ){

      if( item.type == 'Room_Doorway'){

        result.doors.p_otkos_door += +( item.doorsParams.p_otkos_door * current_unit.c ).toFixed( accuracy_measurements );
        result.doors.s_otkos_door += +( item.doorsParams.s_otkos_door * area_unit.c ).toFixed( area_accuracy_measurements );
        result.doors.door_lintel_length += +( item.doorsParams.door_lintel_length * current_unit.c ).toFixed( accuracy_measurements );
        result.doors.p_door += +(item.doorsParams.p_door * current_unit.c ).toFixed( accuracy_measurements );

      } else if( item.type == 'Room_WindowBlock'){

        result.windows.p_otkos_window += +( item.windowsParams.p_otkos_window * current_unit.c ).toFixed( accuracy_measurements );
        result.windows.s_otkos_window += +( item.windowsParams.s_otkos_window * area_unit.c ).toFixed( area_accuracy_measurements );;
        result.windows.window_lintel_length += +( item.windowsParams.window_lintel_length * current_unit.c ).toFixed( accuracy_measurements );
        result.windows.p_window += +( item.windowsParams.p_window * current_unit.c ).toFixed( accuracy_measurements );

      } else if( item.type == 'Room_Niche' ){

        result.niches.p_niche += +( item.nichesParams.p_niche * current_unit.c ).toFixed( accuracy_measurements );
        result.niches.s_niche_wall += +( item.nichesParams.s_niche_wall * area_unit.c ).toFixed( area_accuracy_measurements );;
        result.niches.depth_niche += +( item.nichesParams.depth_niche * current_unit.c ).toFixed( accuracy_measurements );
        result.niches.s_side_niche += +( item.nichesParams.s_side_niche * area_unit.c ).toFixed( area_accuracy_measurements );;

      }

    });

    return result;
  };

  obj.calculateDoorways = function(){

    $wallEditor.walls.forEach(function ( wall, index, arr ) {
      wall.doors.forEach(function ( door, index, arr ) {
        var el = new RoomDoorway( door );
        scene.add( el );
        obj.doorways.push( el );
      });
    });

  };
  obj.removeDoorways = function(){

    obj.doorways.forEach(function ( doorway, index, arr ) {

      scene.remove( doorway );

    });

  };
  obj.showDoorways = function(){

    obj.doorways.forEach(function ( item, index, arr ) {

      item.visible = true;

    });

  };
  obj.hideDoorways = function(){

    obj.doorways.forEach(function ( item, index, arr ) {

      item.visible = false;

    });

  };


  obj.sendData = function(){

    //определение параметров дверных блоков вне комнат
    var doorwayParams = obj.getDoorwaySelectedParams();

    $wallEditor.getJSON(function(result){
      //window.console.log( result );
      post_ok(result);

    }, {rooms: obj.rooms, doorwayParams: doorwayParams} ) ;
  };

  function onKeyDownSelectMode ( event ){

    if (!obj.enabled)
      return false;
//     event.preventDefault();
//    event.stopPropagation();

    switch( event.keyCode ) {
      case 46: /*del*/
      case 27: /*esc*/
        obj.unselectAll();
        break;
    }
  };
}
$selectMode = {};
Object.setPrototypeOf($selectMode, $projection);
initSelectMode($selectMode);

