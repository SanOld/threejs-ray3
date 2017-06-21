//Хелпер опорной точки
function WallControlPoint( wall, point ){
  THREE.Mesh.call( this, new THREE.Geometry());

  this.type = 'WallControlPoint';
  this.name = 'wall_point';

  var self = this;

  this.wall = wall;

  this.lkmMenu = '';
  this.rkmMenu = '.ControlPointMenu';

  this.referencePoint = point;

  this.radius = 45;
  this.rebuildGeometry();
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
    },100);

  };
  this.hoveron =    function ( event ) {

    self.material = wallControlPointMaterial_hover;
    self.radius = 100;
    self.rebuildGeometry();

    if( self.wall.mover ){

      self.wall.mover.hoveroff();
      self.wall.mover.deactivate();

    }

  };
  this.hoveroff =   function ( event ) {

    self.material = wallControlPointMaterial;
    self.radius = 45;
    self.rebuildGeometry();

    if(self.wall.mover)
    self.wall.mover.activate();

  };

  this.select_contextmenu = function ( event ) {
    self.showMenu(event.screenCoord);
  };
  this.unselect =           function ( event ) {

    self.hideMenu();

  };

  this.activate();

}
WallControlPoint.prototype = Object.assign( Object.create( THREE.Mesh.prototype ),{
  constructor: WallControlPoint,

  rebuildGeometry: function(){
    this.geometry = new THREE.SphereBufferGeometry( this.radius , 32, 32 );
  },
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

  hideMenu: function() {
    $(this.rkmMenu).css('display','none');
    $('.doors_all_block_1').css({'display':'none'});
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
        item.style.left = $wallEditor.ControlPointMenu[i].left;
        item.style.top = $wallEditor.ControlPointMenu[i].top;
      });

    }, 50);

  },

  remove: function(){

    var self = this;

    this.hideMenu();

    var worldPosition = this.position.clone().multiply( new THREE.Vector3(1,0,1) );

    //по точке v1
    if(worldPosition.equals(this.wall.v1) && (this.wall.mover.v1_neighbors.length == 1 || !this.wall.mover) ){

//      var dot = this.wall.direction.clone().dot ( this.wall.mover.v1_neighbors[0].wall.direction.clone() );

//      if(Math.abs(dot) == 1){

        var vertices = [this.wall.v2.clone(), this.wall.mover.v1_neighbors[0].opposite_point.clone()];

        var wall = $wallCreator.addWall( vertices,
                          {
                            width: this.wall.width,
                            auto_building: true
                          });

//        $wallCreator.walls[ $wallCreator.walls.length -1 ].mover.activate();

//      }


        self.wall.mover.v1_neighbors[0].wall.remove();
        self.wall.remove();




    }

    //по точке v2
    if(worldPosition.equals(this.wall.v2) && (this.wall.mover.v2_neighbors.length == 1 || !this.wall.mover)){

//      var dot = this.wall.direction.clone().dot ( this.wall.mover.v2_neighbors[0].wall.direction.clone() );

//      if(Math.abs(dot) == 1){

        var vertices = [this.wall.v1.clone(), this.wall.mover.v2_neighbors[0].opposite_point.clone()];

        var wall = $wallCreator.addWall( vertices,
                          {
                            width: this.wall.width,
                            auto_building: true
                          });


//        $wallCreator.walls[ $wallCreator.walls.length -1 ].mover.activate();






          self.wall.mover.v2_neighbors[0].wall.remove();
          self.wall.remove();




//      }
    }



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

	}

});



