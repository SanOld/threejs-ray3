<!DOCTYPE html>
<html lang="en">
<head>
<?php include('hash.php'); ?>  
<?php include('head.php'); ?>
<?php include('params.php'); ?>
</head>

<script>
  var clear = "<?php echo $clear; ?>"
</script>

<body id="bd">
  
<nav class="navbar navbar-default navbar-fixed-bottom footer" role="navigation">
  <div class="container-fluid">
    
    <div class="row">
        <div class="col-lg-6">
          <div class="row">
            <div class="col-lg-1">
                <button type="button" class="btn btn-default" action="mode" title="Переключение режима отображения">2D</button>
            </div> <!-- /.col-lg-1 -->

            

<!--            <div class="col-lg-2 mode2D">
                <button type="button" class="btn btn-default" action="hideWalls">Cтены <i class="fa fa-eye" aria-hidden="true"></i></span></button>
                <img class = "localImage" style="display: none">
            </div>-->

            <div class="col-lg-4  mode2D">
                
                <button type="button" class="btn btn-default" action="hideWalls">Cтены <i class="fa fa-eye" aria-hidden="true"></i></span></button>
                <img class = "localImage" style="display: none">
                
                <div class="btn-group dropup wall_dim_type">
                  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Размер по осевой <span class="caret"></span></button>
                    <ul class="dropdown-menu">
                      <li class="without" data-type = "without"><a>Размер скрыть</a></li>
                      <li class="center" data-type = "center"><a>Размер по осевой</a></li>
                      <li class="inner" data-type = "inner"><a>Размер внутри</a></li>
                      <li class="outer" data-type = "outer"><a>Размер снаружи</a></li>
                    </ul>
                </div><!-- /btn-group -->
            </div><!-- /.col-lg-4 -->

            <div class="col-lg-1 mode2D pull-right">
              <div class="btn-group">
                <button style=" display: none;" type="button" class="btn btn-default" action="modeE" title="Режим - редактирование">E</button>
                <!--<button type="button" class="btn btn-default" action="modeD" title="Режим - размеры">Размеры <span class="fa fa-expand"></span></button>-->
                <button type="button" class="btn btn-default" action="modeC" title="Режим - создание стен">Стена <span class="fa fa-pencil"></span></button>
              </div>
            </div> <!-- /.col-lg-1 -->
            
          </div>
        </div> <!-- /.col-lg-6 -->

        <div class="col-lg-6">
          
	       <form name="floor_plan_form" onsubmit="return setFloorPlan(this);">
            <div class="col-lg-2">
                <button type="button" class="btn btn-default" action="loadFloor">Подложка <i class="fa fa-file-image-o" aria-hidden="true"></i></span></button>
                <input type ="file" name="image_file" class = "floorLoader" style="display: none">
                <input type="hidden" name="user_id" value="userID">
                <img class = "localImage" style="display: none">
            </div><!-- /.col-lg-2 -->
	       </form>
            <div class="col-lg-4">
              <div class="input-group">
                <span class="input-group-addon" >Высота стен:</span>
                <input type="dim" class="form-control floorHeight" pattern="^[0-9]+$" action="floorHeight">
                <span class="input-group-addon measure_unit" >мм</span>
              </div>
            </div><!-- /.col-lg-4 -->


            

        </div> <!-- /.col-lg-6 -->
      </div>


    <div class="row">

      <div class="col-lg-3 objParams" style="display: none">
        <div class="btn-group dropup wall_type">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Несущая <span class="caret"></span></button>
            <ul class="dropdown-menu">
              <li  data-type = "main"><a>Несущая</a></li>
              <li  data-type = "partition"><a>Перегородка</a></li>
              <li  data-type = "divider"><a>Разделитель зон</a></li>
            </ul>
        </div>

        <div class="btn-group dropup wall_action">
          <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Не менять стену <span class="caret"></span></button>
          <ul class="dropdown-menu">
            <li data-type = "notChangable"><a>Не менять стену</a></li>
            <li data-type = "installation"><a>Монтаж</a></li>
            <li data-type = "deinstallation"><a>Демонтаж</a></li>
          </ul>
        </div>
      </div><!-- /.col-lg-3 -->
      
      <div class="col-lg-2 input-group objParams" style="display: none">
        <span class="input-group-addon  height" >Высота:</span>
        <input type="dim" class="form-control height" pattern="^[0-9]+$" param="height" title="Высота">
        <span class="input-group-addon width" >Ширина:</span>
        <input type="dim" class="form-control  width" pattern="^[0-9]+$" param="width" title="Ширина">
        <span class="input-group-addon length" >Длина:</span>
        <input type="dim" class="form-control length" pattern="^[0-9]+$" param="length" title="Длина">
        <span class="input-group-addon depObject_thickness" >Толщина:</span>
        <input type="dim" class="form-control depObject_thickness" pattern="^[0-9]+$" param="depObject_thickness" title="Толщина">
        <span class="input-group-addon elevation" >От пола:</span>
        <input type="dim" class="form-control elevation" pattern="^[0-9]+$" param="elevation" title="Высота от пола">
        <span class="input-group-addon slope" >Ширина откоса:</span>
        <input type="dim" class="form-control slope" pattern="^[0-9]+$" param="slope" title="Откос" disabled>
      </div><!-- /.col-lg-4 -->

      <div class="col-lg-2 pull-right">
          <button type="button" class="btn btn-default pull-right" action="cancel">Отмена</button>
          <button type="button" class="btn btn-default pull-right" action="exportJSON">Ок</button>
      </div><!-- /.col-lg-2 -->

    </div>
  </div>

</nav>
</body>

<div class="ActiveElementMenu" style="top: 187px; left: 500px; display: none;">
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -80.8112px; top: 40.8112px; background-position: left -120px; opacity: 1; width: 40px; height: 40px;" action="addSingleEntryDoorblock" title="Дверь входная">
  </div>
  
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -103.07px; top: 5px; background-position: left -160px; opacity: 1; width: 40px; height: 40px;" action="addDoubleEntryDoorblock" title="Двойная входная дверь">
  </div>

  <div target="_blank" ee="11" class="ActiveElementMenuAnimated" style="left: -103.07px; top: -42.2584px; background-position: left 0px; opacity: 1; width: 40px; height: 40px;" action="scaleFloor" title="Масштабировать чертеж">
  </div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -80.8112px; top: -80.8112px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="addWindow" title="Окно">
  </div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -42.2584px; top: -103.07px; background-position: left -120px; opacity: 1; width: 40px; height: 40px;" action="addSingleDoorblock" title="Дверь межкомнатная">
  </div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 2.25844px; top: -103.07px; background-position: left -160px; opacity: 1; width: 40px; height: 40px;" action="addDoubleDoorblock"title="Двойная межкомнатная дверь">
  </div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40.8112px; top: -80.8112px; background-position: left -200px; opacity: 1; width: 40px; height: 40px;" action="addDoorway" title="Дверной проем (портал)">
  </div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 63.0696px; top: -42.2584px; background-position: left -80px; opacity: 1; width: 40px; height: 40px;" action="remove" title="Удалить">
  </div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 63.0696px; top: 5px; background-position: left -120px; opacity: 1; width: 40px; height: 40px;" action="changeWidth" title="Толщина">
  </div>


</div>

<div class="WallMenuLMB" style=" display: none;">
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40px;  top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_1" title="Несущая"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 90px; top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_2" title="Перегородка"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40px;  top: 10px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_3" title="Положение-3"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 90px; top: 10px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_4" title="Положение-4"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 140px; top: 10px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_4" title="Положение-4"></div>
</div>

<div class="FourStateSwitcher" style=" display: none;">
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40px;  top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_1" title="Положение-1"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 90px; top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_2" title="Положение-2"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40px;  top: 10px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_3" title="Положение-3"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 90px; top: 10px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_4" title="Положение-4"></div>
</div>

<div class="DoorwayMenu" style=" display: none;">
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40px;  top: -40px; background-position: left -80px; opacity: 1; width: 40px; height: 40px;" action="remove"  title="Удалить"></div>
  <div target="_blank" style=" display: none;" class="ActiveElementMenuAnimated" style="left: 90px; top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="action_2"></div>
  <div target="_blank" style=" display: none;" class="ActiveElementMenuAnimated" style="left: 140px;  top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="action_3"></div>
  <div target="_blank" style=" display: none;" class="ActiveElementMenuAnimated" style="left: 190px; top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="action_4"></div>
</div>

<div class="ControlPointMenu" style=" display: none;">
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40px;  top: -40px; background-position: left -80px; opacity: 1; width: 40px; height: 40px;" action="remove"  title="Удалить"></div>
</div>

<div class="TwoStateSwitcher" style=" display: none;" >
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40px;  top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_1" title="Положение-1"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 90px; top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="location_3" title="Положение-2"></div>
</div>

<div class="DimensionMenu" style="top: 187px; left: 500px; display: none;">
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40px;  top: -40px; background-position: left -80px; opacity: 1; width: 40px; height: 40px;" action="remove"  title="Удалить"></div>
  <div target="_blank" style=" display: none;" class="ActiveElementMenuAnimated" style="left: 90px; top: -40px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="action_n"></div>
</div>

<div class="EditableField btn-group" oncontextmenu="return false;" style=" display: none;">
  <button type="button" class="btn btn-default dim-arrow left" style=" display: none;"><span class="fa fa-arrow-left" aria-hidden="true"></span></button>
  <input type="text" class="btn btn-default" name="dimfield" value ="" >
  <button type="button" class="btn btn-default dim-arrow right" style=" display: none;"><span class="fa fa-arrow-right" aria-hidden="true"></span></button>
</div>

<div id="dimToolTip" title="Внимание" style="display: none;">
  <p>Выберите направление изменения длины стены</p>
</div>
</html>
