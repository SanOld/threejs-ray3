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
    document.addEventListener( 'keydown', onKeyDownSelectMode, false );

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
            if( 'select' in event.object )
            event.object.select(event);//вызываем select на выбранном объекте

          }
        }

      });

    } else if( obj.arraySelected.indexOf( obj.selected ) != -1){

      obj.arraySelected.splice( obj.arraySelected.indexOf( obj.selected ), 1);
      obj.selected.unselect();
      obj.selected = null;

    } else {

      obj.arraySelected.push( obj.selected );

      if( 'select' in event.object )
      event.object.select(event);//взываем select на выбранном объекте

    }


    //TODO расчет параметров
    obj.calculateSelectedParams();

  };
  obj.select_contextmenu = function(event){
//    obj.hideAllMenu();
    if('select_contextmenu' in event.object){
    event.object.select_contextmenu(event);
    obj.selected = event.object;
    }

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
    obj.rooms = $wallEditor.getRooms();
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
  obj.calculateSelectedParams = function(){

    obj.arraySelected.forEach( function( item ){


      //по типу отображаем свойства
      if( item.type == 'Wall'){


      } else if( item.type == 'WindowBlock'){


      } else if( item.type == 'DoorblockFloor' || item.type == 'DoubleDoorBlockFloor' ){


      } else if( item.type == 'Doorway' || item.type == 'Niche' ){


      }

    });
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

  function onKeyDownSelectMode ( event ){

    if (!obj.enabled)
      return false;
//    event.preventDefault();

    switch( event.keyCode ) {
      case 46: /*del*/
      case 27: /*esc*/
        obj.unselect();
        break;
    }
  };
}
$selectMode = {};
Object.setPrototypeOf($selectMode, $projection);
initSelectMode($selectMode);

