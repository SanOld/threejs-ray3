//Проем
function Doorway( wall, parameters ){

  THREE.Mesh.call( this, new THREE.Geometry());

  var parameters = parameters || {};
  var self = this;

  this.type = 'Doorway';
  this.name = 'doorway';

  this.json_type = 'floorDoor';
  this.json_systype = 'doorway';

  this.wall = wall;

  this.lkmMenu = '';
  this.rkmMenu = '.DoorwayMenu';

  this.raycaster = new THREE.Raycaster();
  this.top_offset = 2; //отступ от верха стены

  this.width = parameters.hasOwnProperty("width") ? parameters["width"] : 900;
  this.height = parameters.hasOwnProperty("height") ? parameters["height"] : 2100;
  this.thickness = parameters.hasOwnProperty("thickness") ? parameters["thickness"] : this.wall.width;
  this.elevation = parameters.hasOwnProperty("elevation") ? parameters["elevation"] : 0;
  this.offset = parameters.hasOwnProperty("offset") ? parameters["offset"] : this.wall.axisLength / 2;
  this.depObject_thickness = 0;


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
  ];

  this.geometry = new THREE.BoxBufferGeometry( this.width, this.thickness+1, 1 );
  this.material = new THREE.MeshBasicMaterial( {
    color: $Editor.default_params.Doorway.main_color,
    side: THREE.DoubleSide
  });;

  //тело проема
  var geometry = new THREE.BoxGeometry();
  this.doorwayBody = new THREE.Mesh( geometry, doorwayBodyMaterial );
  this.doorwayBody.name = 'doorwayBody';
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
  });


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
//    self.hideMenuLKM();

    var position = event.object.position.clone().projectOnVector (
                                          self.wall.worldToLocal ( self.wall.v2.clone() )
                                          .sub( self.wall.worldToLocal( self.wall.v1.clone() ) )

                                          );


    event.object.position.copy(position.sub(self.direction_offset));


    //вычисление смещения
    var vec = event.object.getWorldPosition().clone().sub(self.wall.v1.clone()).projectOnVector(self.wall.direction.clone());

    if( self.offset != vec.length() ) self.hideMenuLKM();

    self.offset = vec.length();
    var dot = vec.dot ( self.wall.direction.clone() );

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

    self.setActiveMode( true );

  };
  this.unselect =           function ( event ) {
//    alert('unselect дверного проема');
    if(event)
    self.hideMenuLKM(event.screenCoord);

    self.setActiveMode( false );
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

  var parent_toJson = this.toJSON;

  this.toJSON = function ( meta ) {

    this.userData.width = this.width;
    this.userData.height = this.height;
    this.userData.thickness = this.thickness;
    this.userData.elevation = this.elevation;
    this.userData.offset = this.offset;
    this.userData.location = this.location;

    return parent_toJson.call(this);

  };

}
Doorway.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{

  constructor: Doorway,

  rebuildGeometry: function() {

    this.geometry = new THREE.BoxBufferGeometry( this.width, this.thickness+1, 1 );
    this.doorwayBody.geometry = new THREE.BoxGeometry( this.width, this.height, this.wall.width + 1 );
  },

  getCalculatedPosition: function(){

    var result = new THREE.Vector3();

    if ( this.wall.axisLength - this.width/2 < this.offset  ){
      this.offset = this.wall.axisLength - this.width/2;
    } else if( this.offset < this.width/2 ){
      this.offset = this.width/2;
    }

    result.copy( this.wall.worldToLocal(  this.wall.v1.clone().add( this.wall.direction.clone().multiplyScalar( this.offset ) ) ) );
    result.add( new THREE.Vector3(0,0,-(this.wall.height + this.top_offset)) );

    return result;

  },
  setStartPosition: function(){

    this.position.copy( this.getCalculatedPosition() );

    //поворот по стене

//    var cross = this.localToWorld ( new THREE.Vector3(1,0,0) ).cross ( this.wall.direction.clone() );
//    var angle = this.localToWorld ( new THREE.Vector3(1,0,0) ).angleTo ( this.wall.direction.clone() );

    var cross =  ( new THREE.Vector3(1,0,0) ).cross ( this.wall.direction.clone() );
    var angle = ( new THREE.Vector3(1,0,0) ).angleTo ( this.wall.direction.clone() );

    if( cross.y > 0 ){
      angle *= -1;
    }

    this.rotateZ ( this.rotation.z * (-1) );
    this.rotateZ ( angle );

  },

  setDoorwayBodyPosition: function(){

    this.doorwayBody.position.copy( this.wall.localToWorld(this.position.clone()) );
    this.doorwayBody.rotation.y = - this.rotation.z;
    this.doorwayBody.position.y = this.doorwayBody.position.y  - this.wall.height - this.top_offset + this.height/2 + this.elevation;

  },

  hideMenu: function() {
    $(this.rkmMenu).css('display','none');
    $('.doors_all_block_1').css({'display':'none'});
  },
  showMenu: function( center ){

    this.hideMenuLKM();

    var self = this;

    var elements =  $( this.rkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    });

    //отображаем меню
    // $( self.rkmMenu ).css('display','block');
    $( self.rkmMenu ).offset({top:center.y, left:center.x});

    //отображаем пункты меню
    setTimeout(function(){
      elements.each( function( i, item ){
        item.style.left = $wallEditor.doorwayMenu[i].left;
        item.style.top = $wallEditor.doorwayMenu[i].top;
      });

    }, 50);

  },

  hideMenuLKM: function() {
    $( this.lkmMenu ).css('display','none');
    $('.doors_all_block_1').css({'display':'none'});
  },
  showMenuLKM: function( center ){

    this.hideMenu();

  },

  setLocation: function( location ){
    this.location = location || 1;
  },


  update: function(){

    this.thickness = this.wall.width;

    this.rebuildGeometry();

    this.setStartPosition();

    this.setDoorwayBodyPosition();

    this.updateDimensions();

  },
  remove: function( object ){

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

//    $wallEditor.deactivateSelectControls();
//    $wallEditor.activateSelectControls();
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
      });


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

  reverseWindingOrder: function( object3D ) {

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

    var params = {direction: this.wall.direction90, offset_direction: 800, editable: true};

    this.dimensions.push( new Dimension( this.p11,   this.p_11, $projection.plane, params ) );
    this.dimensions.push( new Dimension( this.p_21,  this.p21, $projection.plane, params ) );
    this.dimensions.push( new Dimension( this.p_11,  this.p_21, $projection.plane, params ) );

    params.direction = this.wall.direction90.clone().negate();
    this.dimensions.push( new Dimension( this.p12,   this.p_12, $projection.plane, params ) );
    this.dimensions.push( new Dimension( this.p_22,  this.p22, $projection.plane, params ) );

    this.dimensions.forEach(function(item){
      scene.add( item );
    });


    $wallEditor.deactivateSelectControls();
    $wallEditor.activateSelectControls();

  },
  calcDimensionsPoints: function(){

    //масштабируем для однозначного попадания луча
    var scaleY = this.scale.y;
    this.scale.setY(5);

    var Y = this.getWorldPosition().y;

    this.p11.copy( this.wall.v11.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p21.copy( this.wall.v21.clone().add(new THREE.Vector3( 0, Y, 0)) );

    this.raycaster.ray.origin = this.p11.clone();
    this.raycaster.ray.direction = this.wall.direction.clone();
    var intersects = [];
    intersects = this.raycaster.intersectObject( this );
    if(intersects.length > 0){
      this.p_11.copy( intersects[0].point );
    }

    this.raycaster.ray.origin = this.p21.clone();
    this.raycaster.ray.direction = this.wall.direction.clone().negate();
    var intersects = [];
    intersects = this.raycaster.intersectObject( this );
    if(intersects.length > 0){
      this.p_21.copy( intersects[0].point );
    }

    this.p12.copy( this.wall.v12.clone().add(new THREE.Vector3( 0, Y, 0)) );
    this.p22.copy( this.wall.v22.clone().add(new THREE.Vector3( 0, Y, 0)) );

    this.raycaster.ray.origin = this.p12.clone();
    this.raycaster.ray.direction = this.wall.direction.clone();
    var intersects = [];
    intersects = this.raycaster.intersectObject( this );
    if(intersects.length > 0){
      this.p_12.copy( intersects[0].point );
    }

    this.raycaster.ray.origin = this.p22.clone();
    this.raycaster.ray.direction = this.wall.direction.clone().negate();
    var intersects = [];
    intersects = this.raycaster.intersectObject( this );
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


    //возвращаем значение масштаба
    this.scale.setY( scaleY );

  },
  updateDimensions: function(){
    //перерасчет размеров
    this.calcDimensionsPoints();
    this.dimensions.forEach(function(item){
      item.update();
    });
  },
  showDimensions: function(){
    var self = this;
    this.dimensions.forEach(function(item){
      item.show();
      item.addEventListener( 'edit', self.changeDoorwayDim );
    });

  },
  hideDimensions: function(){
    this.dimensions.forEach(function(item){
      item.hide();
    });

  },
  removeDimensions: function(){
    this.dimensions.forEach(function( item, index ){
      item.removeEventListener( 'edit', self.changeDoorwayDim );
      scene.remove( item );
    });
  },

  getSlope: function(){
    return Math.abs( this.thickness - this.depObject_thickness );
  },

  getPerimeter4: function(){
    return  2 * this.width + 2 * this.height;
  },
  getPerimeter3: function(){
    return  this.width + 2 * this.height;
  },
  getArea: function(){
    return  this.width * this.height;
  },
  getSlope3Area: function(){
    return this.getPerimeter3() * this.getSlope();
  },
  getSlope4Area: function(){
    return this.getPerimeter4() * this.getSlope();
  },
  getVolume: function(){

    return  this.width * this.height * this.thickness;

  },

  setActiveMode: function( state ){

    if( state){

      this.material.color = new THREE.Color( $Editor.default_params.Doorway.active_color );

    } else {

//    if( $wallEditor.selectedArray.indexOf( self.wall.uuid ) == -1 && ($wallEditor.selected && $wallEditor.selected.uuid != self.wall.uuid ) )
      this.material.color = new THREE.Color( $Editor.default_params.Doorway.main_color );

    }

  }



});
//Ниша
function Niche( wall, parameters ){

  //свойство положения
  this.start_location = parameters.hasOwnProperty("location") ? parameters["location"] : 1;
  this.location = 1;

  Doorway.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'Niche';
  this.name = 'niche';

  this.json_type = 'niche';
  this.json_systype = 'niche';


  this.lkmMenu = '.TwoStateSwitcher';
  this.rkmMenu = '.DoorwayMenu';

  this.thickness = parameters.hasOwnProperty("thickness") ? parameters["thickness"] : this.wall.width/2;


  this.dragControls = null;

  this.update();


}
Niche.prototype = Object.assign( Object.create( Doorway.prototype ),{
  constructor: Niche,

  rebuildGeometry: function() {

    this.geometry = new THREE.BoxBufferGeometry( this.width, this.thickness+1, 1 );
    this.doorwayBody.geometry = new THREE.BoxGeometry( this.width, this.height, this.thickness );
  },
  getCalculatedPosition: function(){

    switch (this.location) {
      case 1:
        var offset90 = this.wall.direction90.clone().multiplyScalar( this.wall.width/2 + 1 - this.thickness/2 );
        break;

      case 3:
        var offset90 = this.wall.direction90.clone().multiplyScalar( -(this.wall.width/2 + 1) + this.thickness/2 );
        break;
    }

    var result = new THREE.Vector3();
    result.copy( this.wall.worldToLocal(  this.wall.v1.clone().add( this.wall.direction.clone().multiplyScalar( this.offset ) ).add( offset90 ) ) );
    result.add( new THREE.Vector3(0,0,-(this.wall.height + this.top_offset)) );

    return result;

  },

  showMenuLKM: function(center){
    this.hideMenu();

    var elements =  $( this.lkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    });

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

  setLocation: function(location){
    this.location = location || 1;
  },



  setDoorwayBodyPosition: function(){

    this.doorwayBody.position.copy( this.wall.localToWorld(this.position.clone()) );
    this.doorwayBody.rotation.y = - this.rotation.z;
    this.doorwayBody.position.y = this.doorwayBody.position.y  - this.wall.height - this.top_offset + this.height/2 + this.elevation;

  },

  update: function(){

    this.rebuildGeometry();

    this.setStartPosition();

    this.setDoorwayBodyPosition();

    this.updateDimensions();

  }

});
//Дверной блок входной
function DoorBlock( wall, parameters ){

  Doorway.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'DoorBlock';
  this.name = 'singleDoor';

  this.json_type = 'floorDoor';
  this.json_systype = 'floorDoor';


  this.lkmMenu = '.FourStateSwitcher';
  this.rkmMenu = '.DoorwayMenu';

  this.isEntryDoor = false;

  this.depObject_thickness = parameters.hasOwnProperty("door_thickness") ? parameters["door_thickness"] : 100;
  this.slope = parameters.hasOwnProperty("slope") ? parameters["slope"] : this.getSlope();

  //свойство положения
  this.start_location = parameters.hasOwnProperty("location") ? parameters["location"] : 1;
  this.location = 1;

  //условное графическое изображение
  this.CGI = {};
  this.CGI_door_thickness = 40;
  this.addCGI();

  this.dragControls = null;

  //зависимый объект
  this.depObject = null;
  this.loadObject();

}
DoorBlock.prototype = Object.assign( Object.create( Doorway.prototype ),{

  constructor: DoorBlock,

  set: function( prop, val ){

    switch (prop) {
      case 'isEntryDoor':
        this[ prop ] = val;

        if(val){

          this.json_type = 'entry_door';
          this.json_systype = 'entry_door';

        } else {

          this.json_type = 'floorDoor';
          this.json_systype = 'floorDoor';

        }

        break;

      default:
        this[ prop ] = val;
        break;
    }

  },

  addCGI: function(){
    //УГО двери
    this.CGI.door = new THREE.Mesh( this.getCGIDoorGeometry(), projectionWallMaterial_black );
    this.CGI.door.material.copy( projectionWallMaterial_black.clone() );
    this.CGI.door.lookAt(new THREE.Vector3(0, 0, -1));
    //хелпер для выбора
    this.CGI.selectedHelper = new THREE.Mesh( new THREE.PlaneBufferGeometry( this.width, this.width ), doorBlockHelperMaterial );
    this.CGI.selectedHelper.material.copy( doorBlockHelperMaterial.clone() );
    this.CGI.selectedHelper.lookAt(new THREE.Vector3(0, 0, -1));
    this.CGI.selectedHelper.name = 'doorSelectedHelper';
    this.CGI.selectedHelper.door = this;

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
    this.CGI.selectedHelper.rotateZ( Math.PI/2 );
    this.CGI.arc = this.getArc();

    this.add( this.CGI.door, this.CGI.arc, this.CGI.selectedHelper);

  },
  setCGILocation: function(){

    switch (this.location) {
      case 1:

        this.CGI.door.position.x = this.width/2 - this.CGI_door_thickness/2;
        this.CGI.door.position.y = this.width/2 + this.thickness/2 + 1;

        this.CGI.selectedHelper.position.y = this.width/2;

        //параметры дуги
        this.CGI.ax = this.CGI.door.position.x + this.CGI_door_thickness/2;
        this.CGI.ay = this.thickness/2;
        this.CGI.xRadius = this.CGI.yRadius = this.width - 2;
        this.CGI.aStartAngle = Math.PI/2;
        this.CGI.aEndAngle = Math.PI ;

        break;
      case 2:
        this.CGI.door.position.x = - this.width/2 + this.CGI_door_thickness/2;
        this.CGI.door.position.y = this.width/2 + this.thickness/2 + 1;

        this.CGI.selectedHelper.position.y = this.width/2;

        //параметры дуги
        this.CGI.ax = this.CGI.door.position.x - this.CGI_door_thickness/2;
        this.CGI.ay = this.thickness/2;
        this.CGI.xRadius = this.CGI.yRadius = this.width - 2;
        this.CGI.aStartAngle = 0;
        this.CGI.aEndAngle = Math.PI/2 ;

        break;
      case 3:
        this.CGI.door.position.x = this.width/2 - this.CGI_door_thickness/2;
        this.CGI.door.position.y = -this.width/2 - this.thickness/2 + 1;

        this.CGI.selectedHelper.position.y = -this.width/2;

        //параметры дуги
        this.CGI.ax = this.CGI.door.position.x + this.CGI_door_thickness/2;
        this.CGI.ay = -this.thickness/2;
        this.CGI.xRadius = this.CGI.yRadius = this.width - 2;
        this.CGI.aStartAngle = Math.PI;
        this.CGI.aEndAngle = Math.PI + Math.PI/2 ;

        break;
      case 4:
        this.CGI.door.position.x = - this.width/2 + this.CGI_door_thickness/2;
        this.CGI.door.position.y = - this.width/2 - this.thickness/2 + 1;

        this.CGI.selectedHelper.position.y = -this.width/2;

        //параметры дуги
        this.CGI.ax = this.CGI.door.position.x - this.CGI_door_thickness/2;
        this.CGI.ay = -this.thickness/2;
        this.CGI.xRadius = this.CGI.yRadius = this.width - 2;
        this.CGI.aStartAngle = Math.PI + Math.PI/2 ;
        this.CGI.aEndAngle =  0;

        break;
    }

  },
  getCGIDoorGeometry: function(){
    return new THREE.PlaneBufferGeometry( this.width, this.CGI_door_thickness );
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

    loadJSON('sc/door.json','door', function( item ){
      if( item ){
        self.depObject = item;
        self.setDepObjectPosition();
        self.setDepObjectSize();
        self.depObject.visible = false;

        self.setLocation(self.start_location);

      }
    });
  },
  setDepObjectPosition: function(){

    this.depObject.position.copy( this.wall.localToWorld(this.position.clone()) );
    this.depObject.position.add( this.wall.direction90.clone().multiplyScalar( this.wall.width/2 - this.slope ) );//смещение по откосу

    this.depObject.rotation.y =  Math.PI - this.rotation.z;
    this.depObject.position.y = this.depObject.position.y  - this.wall.height - this.top_offset  + this.elevation;


  },
  setDepObjectSize: function(){

    if( this.depObject.children[0].scale.x  != 1 ){
      this.depObject.children[0].scale.set(1,1,1);
    }
    this.depObject.updateMatrix();

    this.depObject.children[0].geometry.computeBoundingBox();
    var box = this.depObject.children[0].geometry.boundingBox;

    var height = Math.abs( box.max.y - box.min.y );
    var width = Math.abs( box.max.x - box.min.x );

    var koef_height = height * this.depObject.children[0].scale.y / (this.height);
    var koef_width = width * this.depObject.children[0].scale.x / (this.width);

    var X = this.depObject.children[0].scale.x / koef_width ;
    var Y = this.depObject.children[0].scale.y / koef_height ;

    this.depObject.children[0].scale.set( X, Y, X < Y ? X : Y );

  },
  setDepObjectThickness: function(w){
    if( w <= this.wall.width){
      this.depObject_thickness = w;
    }

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
    if(this.depObject)
    this.depObject.visible = true;
  },
  hideDepObject: function(){
    if(this.depObject)
    this.depObject.visible = false;
  },
  removeDepObject: function(){
    if(this.depObject)
    scene.remove( this.depObject );
  },

  setLocation: function(location){

    this.setDepObjectLocation(location);

    this.location = location;

    this.setCGILocation();

  },

  hideMenu: function() {
    $( this.rkmMenu  ).css('display','none');
    $('.doors_all_block_1').css({'display':'none'});
  },
  showMenu: function(center){

    this.hideMenuLKM();

    var elements =  $( this.rkmMenu  ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    });

    //отображаем меню
    $( this.rkmMenu  ).css('display','block');
    $( this.rkmMenu  ).offset({top:center.y, left:center.x});

    //отображаем пункты меню
    setTimeout(function(){
      elements.each( function( i, item ){
        item.style.left = $wallEditor.doorwayMenu[i].left;
        item.style.top = $wallEditor.doorwayMenu[i].top;
      });

    }, 50);

  },

  hideMenuLKM: function() {
    $( this.lkmMenu ).css('display','none');
    $('.doors_all_block_1').css({'display':'none'});
  },
  showMenuLKM: function(center){

    this.hideMenu();

    var elements =  $( this.lkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    });

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

//    this.position.copy( this.getCalculatedPosition() );
//
//    this.setDoorwayBodyPosition();
//
//    this.updateDimensions();

    Doorway.prototype.update.call(this);

    this.remove(this.CGI.arc);
    this.CGI.door.geometry = this.getCGIDoorGeometry();
    this.setCGILocation();//здесь необходим при изм размеров
    this.CGI.arc = this.getArc();

    this.add(this.CGI.arc);

    if(this.depObject){
      this.setDepObjectSize();
      this.slope = this.getSlope();
      this.setDepObjectLocation(this.location);//здесь необходим при изм размеров
      this.setDepObjectPosition();
    }

  },
  remove: function(object){
    if(object){

      Doorway.prototype.remove.call(this, object);

    } else {

      this.removeDepObject();
      Doorway.prototype.remove.call(this);

    }
  }

});
//Дверной блок межкомнатный
function DoorBlockFloor( wall, parameters ){

  DoorBlock.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'DoorBlockFloor';
  this.name = 'singleDoor';

  this.json_type = 'floorDoor';
  this.json_systype = 'floorDoor';


  this.lkmMenu = '.FourStateSwitcher';
  this.rkmMenu = '.DoorwayMenu';

  this.isEntryDoor = true;

}
DoorBlockFloor.prototype = Object.assign( Object.create( DoorBlock.prototype ),{
  constructor: DoorBlockFloor
});
//Окно
function WindowBlock( wall, parameters ){

  DoorBlock.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'WindowBlock';
  this.name = 'windowblock';

  this.json_type = 'floorWindow';
  this.json_systype = 'floorWindow';

  this.lkmMenu = '.TwoStateSwitcher';
  this.rkmMenu = '.DoorwayMenu';

  this.depObject_thickness = parameters.hasOwnProperty("window_thickness") ? parameters["window_thickness"] : 60;
  this.slope = parameters.hasOwnProperty("slope") ? parameters["slope"] : this.getSlope();

}
WindowBlock.prototype = Object.assign( Object.create( DoorBlock.prototype ),{

  constructor: WindowBlock,

  addCGI: function(){

    this.CGI.window_line = new THREE.LineSegments( this.getCGIGeometry(), projectionWallMaterial_black.clone());

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

    if( this.depObject.children[0].scale.x != 1 ){
      this.depObject.children[0].scale.set(1,1,1);
    }

    this.depObject.children[0].geometry.computeBoundingBox();
    var box = this.depObject.children[0].geometry.boundingBox;


    var height = Math.abs( box.max.y - box.min.y );
    var width = Math.abs( box.max.x - box.min.x );


    if( ! this.depObject.children[0].scale.x){
      this.depObject.children[0].scale.set(1,1,1);
    }
    var koef_height = height * this.depObject.children[0].scale.y / (+this.height );
    var koef_width = width * this.depObject.children[0].scale.x / (+this.width );

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

    this.hideMenu();

    var elements =  $( this.lkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    });

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

    if(this.depObject){
      this.setDepObjectSize();
      this.slope = this.getSlope();
      this.setDepObjectLocation( this.location );//здесь необходим при изм размеров
      this.setDepObjectPosition();
    }

  }

});
//Двойная дверь входная
function DoubleDoorBlock( wall, parameters ){

  DoorBlock.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'DoubleDoorBlock';
  this.name = 'doubleDoor';

  this.json_type = 'entry_door';
  this.json_systype = 'doublewingdoor';

  this.lkmMenu = '.TwoStateSwitcher';
  this.rkmMenu = '.DoorwayMenu';

  this.depObject_thickness = parameters.hasOwnProperty("door_thickness") ? parameters["door_thickness"] : 100;
  this.slope = parameters.hasOwnProperty("slope") ? parameters["slope"] : this.getSlope();

}
DoubleDoorBlock.prototype = Object.assign( Object.create( DoorBlock.prototype ),{

  constructor: DoubleDoorBlock,

  addCGI: function(){
      //УГО двери
    this.CGI.door = new THREE.Mesh( this.getCGIDoorGeometry(), projectionWallMaterial_black );
    this.CGI.door.material.copy( projectionWallMaterial_black.clone() );
    this.CGI.door.lookAt(new THREE.Vector3(0, 0, -1));

    //хелпер для выбора
    this.CGI.selectedHelper = new THREE.Mesh( new THREE.PlaneBufferGeometry( this.width/2, this.width ), doorBlockHelperMaterial );
    this.CGI.selectedHelper.material.copy( doorBlockHelperMaterial.clone() );
    this.CGI.selectedHelper.lookAt(new THREE.Vector3(0, 0, -1));
    this.CGI.selectedHelper.name = 'doorSelectedHelper';
    this.CGI.selectedHelper.door = this;

    this.CGI.door2 = this.CGI.door.clone();

    //параметры дуги//

    this.CGI.prop_arc = {};
    this.CGI.prop_arc2 = {};
    //позиционирование дополнительных объектов двери и дуги
    this.setCGILocation();

    this.CGI.door.rotateZ( Math.PI/2 );
    this.CGI.door2.rotateZ( Math.PI/2 );
    this.CGI.selectedHelper.rotateZ( Math.PI/2 );
    this.CGI.arc = this.getArc( this.CGI.prop_arc );
    this.CGI.arc2 = this.getArc( this.CGI.prop_arc2 );

    this.add( this.CGI.door, this.CGI.arc, this.CGI.door2, this.CGI.arc2, this.CGI.selectedHelper);

  },
  setCGILocation: function(){

    this.CGI.prop_arc.aClockwise = this.CGI.prop_arc2.aClockwise = 0;
    this.CGI.prop_arc.aRotation = this.CGI.prop_arc2.aRotation = 0;

    switch (this.location) {
      case 1:

        this.CGI.door.position.x = this.width/2 - this.CGI_door_thickness/2;
        this.CGI.door.position.y = this.width/4 + this.thickness/2 + 1;

        this.CGI.door2.position.x = - this.width/2 + this.CGI_door_thickness/2;
        this.CGI.door2.position.y = this.width/4 + this.thickness/2 + 1;

        //параметры дуги
        this.CGI.prop_arc.ax = this.CGI.door.position.x + this.CGI_door_thickness/2;;
        this.CGI.prop_arc.ay = this.thickness/2;
        this.CGI.prop_arc.xRadius = this.CGI.prop_arc.yRadius = this.width/2 - 2;
        this.CGI.prop_arc.aStartAngle = Math.PI/2;
        this.CGI.prop_arc.aEndAngle = Math.PI ;

        //параметры дуги
        this.CGI.prop_arc2.ax = this.CGI.door2.position.x - this.CGI_door_thickness/2;;
        this.CGI.prop_arc2.ay = this.thickness/2;
        this.CGI.prop_arc2.xRadius = this.CGI.prop_arc2.yRadius = this.width/2 - 2;
        this.CGI.prop_arc2.aStartAngle = 0;
        this.CGI.prop_arc2.aEndAngle = Math.PI/2 ;

        //хелпер выбора
        this.CGI.selectedHelper.position.y = this.width/4;

        break;
      case 2:


        break;
      case 3:
        this.CGI.door.position.x = this.width/2 - this.CGI_door_thickness/2;
        this.CGI.door.position.y = -this.width/4 - this.thickness/2 + 1;

        this.CGI.door2.position.x = - this.width/2 + this.CGI_door_thickness/2;
        this.CGI.door2.position.y = - this.width/4 - this.thickness/2 + 1;

        //параметры дуги
        this.CGI.prop_arc.ax = this.CGI.door.position.x + this.CGI_door_thickness/2;;
        this.CGI.prop_arc.ay = -this.thickness/2;
        this.CGI.prop_arc.xRadius = this.CGI.prop_arc.yRadius = this.width/2 - 2;
        this.CGI.prop_arc.aStartAngle = Math.PI;
        this.CGI.prop_arc.aEndAngle = Math.PI + Math.PI/2 ;

        //параметры дуги
        this.CGI.prop_arc2.ax = this.CGI.door2.position.x - this.CGI_door_thickness/2;;
        this.CGI.prop_arc2.ay = -this.thickness/2;
        this.CGI.prop_arc2.xRadius = this.CGI.prop_arc2.yRadius = this.width/2 - 2;
        this.CGI.prop_arc2.aStartAngle = Math.PI + Math.PI/2 ;
        this.CGI.prop_arc2.aEndAngle =  0;

        //хелпер выбора
        this.CGI.selectedHelper.position.y = -this.width/4;

        break;
      case 4:


        break;
    }

  },
  getCGIDoorGeometry: function(){
    return new THREE.PlaneBufferGeometry( this.width/2, this.CGI_door_thickness );
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

    var height = Math.abs( box.max.y - box.min.y );
    var width = Math.abs( box.max.x - box.min.x );


    if( ! this.depObject.children[0].scale.x){
      this.depObject.children[0].scale.set(1,1,1);
    }
    var koef_height = height * this.depObject.children[0].scale.y / (this.height );
    var koef_width = width * this.depObject.children[0].scale.x / (this.width );

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

    this.hideMenu();

    var elements =  $( this.lkmMenu ).find('.ActiveElementMenuAnimated');

    //сбрасываем в ноль координаты для анимации
    elements.each( function( i, item ){
      item.style.left = 0;
      item.style.top = 0;
    });

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

//    this.position.copy( this.getCalculatedPosition() );

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
    if(this.depObject){
      this.setDepObjectSize();
      this.slope = this.getSlope();
      this.setDepObjectLocation(this.location);//здесь необходим при изм размеров
      this.setDepObjectPosition();
    }

  }

});

function DoubleDoorBlockFloor( wall, parameters ){

  DoubleDoorBlock.apply( this, [wall, parameters] );

  var parameters = parameters || {};
  var self = this;

  this.type = 'DoubleDoorBlockFloor';
  this.name = 'DoubleDoorBlockFloor';

  this.json_type = 'floorDoor';
  this.json_systype = 'doublewingdoor';

  this.lkmMenu = '.TwoStateSwitcher';
  this.rkmMenu = '.DoorwayMenu';

}
DoubleDoorBlockFloor.prototype = Object.assign( Object.create( DoubleDoorBlock.prototype ),{
  constructor: DoubleDoorBlockFloor
});

