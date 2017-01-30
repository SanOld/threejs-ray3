
$(document).ready(function() {
  include("js/lib/three-master/build/three.js");
  include("js/lib/three-master/examples/js/Detector.js");
  include("js/lib/three-master/examples/js/controls/OrbitControls.js");
//  include("/js/lib/three-master/examples/js/controls/DragControls.js");
  include("js/DragControls.js");
  include("js/lib/three-master/examples/js/controls/PointerLockControls.js");
  include("js/lib/three-master/examples/js/libs/stats.min.js");
  
  include("js/load.js?"+HASH);
  include("js/lib/ThreeCSG.js");

  include("js/ray_module.js?"+HASH);

  include("js/script.js?"+HASH);
  
})

