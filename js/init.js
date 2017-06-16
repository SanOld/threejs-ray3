
$(document).ready(function() {
  include("js/lib/three-master/build/three.js");

//  include ("js/lib/three-master/examples/js/loaders/RGBELoader.js");
//  include ("js/lib/three-master/examples/js/loaders/HDRCubeTextureLoader.js");
//  include ("js/lib/three-master/examples/js/shaders/FresnelShader.js");


  include("js/lib/three-master/examples/js/Detector.js");
  include("js/lib/three-master/examples/js/controls/OrbitControls.js");
  include("js/lib/three-master/examples/js/controls/OrthographicTrackballControls.js");
  include("js/lib/three-master/examples/js/controls/TrackballControls.js");

  include("js/lib/three-master/examples/js/loaders/OBJLoader.js");
  include("js/lib/three-master/examples/js/controls/DragControls.js");
  include("js/lib/three-master/examples/js/exporters/OBJExporter.js");

//  include ("js/lib/three-master/examples/js/pmrem/PMREMGenerator.js");
//  include ("js/lib/three-master/examples/js/pmrem/PMREMCubeUVPacker.js");
  include ("js/lib/three-master/examples/js/libs/dat.gui.min.js");

//  include("js/lib/three-master/examples/js/controls/PointerLockControls.js");
//  include("js/lib/three-master/examples/js/libs/stats.min.js");

  include("js/load.js?"+HASH);
  include("js/lib/ThreeCSG.js");

  include("js/lib/threex-rendererstats/threex.rendererstats.js");


  include("data/arc_wall_data.js?"+HASH);

  include("js/ray_module.js?"+HASH);
  include("js/script.js?"+HASH);


  include("js/Room.js?"+HASH);
  include("js/RoomObject.js?"+HASH);
  include("js/RoomFloor.js?"+HASH);
  include("js/RoomSurface.js?"+HASH);
  include("js/RoomDoorway.js?"+HASH);
  include("js/selectMode.js?"+HASH);


});

