//объект радиусной стены
function RadialWall( vertices, parameters ){
  Wall.apply( this, [vertices, parameters] );

//  this.type = 'Wall';
  this.name = 'radial_wall';
  this.subtype = 'RadialWall';

  var self = this;

  this.isRadial = true;

  alert('new RadialWall create!')

}
RadialWall.prototype = Object.assign( Object.create( Wall.prototype ),{

  constructor: RadialWall

});

