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

  //this.planeNormal;

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
  //if(this.enabled);
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

  this.select = this.note.select =             function ( event ) {

    self.showMenuLKM(event.screenCoord);
    self.edit( {object: self.note} );
    self.note.visible = false;

  };
  this.unselect = this.note.unselect =           function ( event ) {

    self.noteState == 'show' ? self.note.visible = true : self.note.visible = false;

    $( '.EditableField' ).offset( {left: 0 , top: 0} );
    $( '.EditableField' ).css('display', 'none');
    if(event)
		self.hideMenuLKM();

  };
  this.select_contextmenu = function ( event ) {
    self.showMenu(event.screenCoord);
  };

  this.edit =             function ( event ) {

    var obj = event.object;

    var element = self.editableFieldWrapper;
    var coord = getScreenCoord(obj.position.clone(), camera);

    element.css('left', 0);
    element.css('top', 0);
    element.offset({left: coord.x - self.editableField.width()/2 , top: coord.y - self.editableField.height()/2 });
    element.css('display', 'block');

    self.editableField.val( ( current_unit.c * self.dimLine.distance() ).toFixed( accuracy_measurements ) );
    self.editableField.focus();
    self.editableField.select();

    if( self.arrow ){

      if( Math.abs(self.point1.x - self.point2.x) < 0.01 ){

        self.leftArrow.find('span').removeClass().addClass('fa fa-arrow-up');
        self.rightArrow.find('span').removeClass().addClass('fa fa-arrow-down');

      } else {

       self.leftArrow.find('span').removeClass().addClass('fa fa-arrow-left');
       self.rightArrow.find('span').removeClass().addClass('fa fa-arrow-right');

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
        this.value = eval(this.value);
        self.dispatchEvent( { type: 'edit', object: obj, value: + this.value /current_unit.c } );
//        self.editableField.off('change');
      });


    self.editableField.off('keydown');
    self.editableField.on('keydown', function( event ){

      if(event.ctrlKey || event.altKey) {
        event.preventDefault();
        return;
      }

      //валидация введенных символов
      var allowedKeys = [8, 46, 13, 27];
      var letters=' 1234567890.,+-*/';
      var operators = '+-*/';
      var key = event.keyCode;

      var cond1 =  $.inArray(key, allowedKeys) > -1 || letters.indexOf(event.key) != -1;
      var cond2 = operators.indexOf(this.value.slice(-1)) != -1 && operators.indexOf(event.key) != -1 ? false : true;

      if( cond1 && cond2 )  {

      } else {
//          alert('Недопустимый символ');
//          this.value = this.value.slice(0, -1);
          return false;
      }


      self.dispatchEvent( { type: 'keydown', object: obj, keyCode: event.keyCode } );

      if( event.keyCode == 13 && ! self.arrow){

        self.unselect();

      } else if( event.keyCode == 27 ){

        self.dispatchEvent( { type: 'esc', object: obj } );
      }

    });

    self.editableField.off('click');
    self.editableField.on('click', function( event ){
      this.selectionStart = this.value.length;
    });


    self.leftArrow.off('click');
    self.leftArrow.on('click', function(){


      self.leftArrowActivated = true;
      self.rightArrowActivated = false;

      self.editableField.trigger('change');
//      self.editableField.off('change');
      self.unselect();

    });
    self.rightArrow.off('click');
    self.rightArrow.on('click', function(){

      self.leftArrowActivated = false;
      self.rightArrowActivated = true;

      self.editableField.trigger('change');
//      self.editableField.off('change');
      self.unselect();

    });

  };
  this.editableModeOn = function(){

    this.edit( {object: this.note} );

  };

  this.onkeydown = function ( event ){
    if (!self.enabled)
      return false;
//    event.preventDefault();

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

  };

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

//      this.selectControls.addEventListener( 'select', this.edit );

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

      this.dragControls.deactivate();

    }
    document.removeEventListener( 'keydown', this.onkeydown, false );

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

  val: function(){
    var result = this.dimLine.distance();
    return result;
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
    var dist1 = 0;
    var dist2 = 0;

    if( this.offset_direction ){
      dist1 = dist2 = this.offset_direction;
      var point_var1 = new THREE.Vector3().addVectors(p1_start, n.clone().multiplyScalar( dist1 ));
      p1_end = point_var1.clone();

      var point_var1 = new THREE.Vector3().addVectors(p2_start, n.clone().multiplyScalar( dist2 ));
      p2_end = point_var1.clone();

    } else {
      dist1 = l_m.distanceTo ( l1 );
      dist2 = l_m.distanceTo ( l2 );

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
    });

    //отображаем меню
    $( self.rkmMenu ).css('display','block');
    $( self.rkmMenu ).offset({top:center.y, left:center.x});

    //отображаем пункты меню
    setTimeout(function(){
      elements.each( function( i, item ){
        item.style.left = $dimensionEditorMode.dimensionMenu[i].left;
        item.style.top = $dimensionEditorMode.dimensionMenu[i].top;
      });

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



