// standard global variables
var mode = 'dev'; //'prod' (в режиме dev загрузка без iframe)
var container, scene, camera, renderer, controls, stats, selection;
//var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var rendererStats;
var maxAnisotropy;

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();


/* global this */

var Dimensions = new THREE.Object3D(0,3000,0); //объект хранилище размеров
Dimensions.name = "Dimensions";
//var Areas = new THREE.Object3D(0,3000,0); //объект хранилище размеров площадей
//Areas.name = "Areas";
//var AreaCounturs = new THREE.Object3D(0,1,0); //объект хранилище размеров площадей
//AreaCounturs.name = "AreaCounturs";

var floorHeight = 3000;


//Материалы
var floorMaterial = new THREE.MeshBasicMaterial( { color: 'white' } );
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
var doorwayMaterial = new THREE.MeshBasicMaterial( {color: 'white', side: THREE.DoubleSide} );
var doorwayBodyMaterial = new THREE.MeshBasicMaterial( {color: 'white', side: THREE.BackSide} );
var doorBlockHelperMaterial = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.01,
      transparent: true,
      depthWrite: false,
      color: 'white'
    });
var projectionWallMaterial_black = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      color: 'black'
    });
var projectionWallMaterial_green = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      color: '#5bbc4a'
    });
var projectionWallMaterial_red = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      color: '#f44b48'
    });
var acsWallMaterial = new THREE.MeshBasicMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      color: '#d5c7ac'//бежевый
    });
var acsWallMaterial2 = new THREE.MeshLambertMaterial({
      wireframe: false,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      color: '#d5c7ac'
    });

var dimGeometry = new THREE.SphereBufferGeometry( 100, 32, 32 );

var measure_unit = {
  'm':  {full_name: 'метр',           short_name: 'м',  c: 0.001 },
  'm2': {full_name: 'квадратный метр',short_name: 'м2', c: 0.000001 },
  'm3': {full_name: 'кубический метр',short_name: 'м3', c: 0.000000001 },
  'cm': {full_name: 'сантиметр',      short_name: 'см', c: 0.1 },
  'mm': {full_name: 'миллиметр',      short_name: 'мм', c: 1 },
  'ft': {full_name: 'фут',            short_name: 'ft', c: 0.003281 },
  'in': {full_name: 'дюйм',           short_name: 'in', c: 0.03937 }
};
var current_unit = measure_unit.mm;
var accuracy_measurements = 0;

var area_unit = measure_unit.m2;
var area_accuracy_measurements = 2;

var volume_unit = measure_unit.m3;
var volume_accuracy_measurements = 2;
