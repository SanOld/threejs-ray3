<!DOCTYPE html>
<html lang="en">
<head>
<?php include('hash.php'); ?>  
<?php include('head.php'); ?>

<?php
  if( isset( $_GET['mode'] ) ){
    $mode = $_GET['mode'];
  } else {
    $mode = 'creation';
  }
?>
<script type="text/javascript">
  var MODE = '<?php echo $mode; ?>';
</script>  
</head>

<body id="bd">
  
<nav class="navbar navbar-default navbar-fixed-bottom footer" role="navigation">
  <div class="container-fluid">
    
    <div class="row">

      <div class="col-lg-6">
<!-- left panel -->

        <div class="row">

          <div class="col-lg-3  pull-left " style="display: none">
            <div class="btn dropup wall_type">

              <div class="left_panel_custom_nemu">

  <div class="left_panel_type">
                  <div class="lp_radio_div">
                   <!-- <div  class="wall_type" ><span class="wall_len_custom">Толщина стены</span ><input type="text"></div> -->
                  <div class="left_panel_type"><b >Тип:</b></div>
                  <div style="margin-right:5px">
                  <div  class="wall_type" data-type = "bear_wall">
                    <span class="menu_text_custom hover_label_custom" >
                      <input id="bear_wall" type="radio" name="walls_type_radio" >
                      <label for="bear_wall" class="label_lp_custom">Несущая</label>
                    </span >
                  </div>
                  <div  class="wall_type" data-type = "pillar">
                    <span class="menu_text_custom hover_label_custom" >
                      <input id="pillar" type="radio" name="walls_type_radio">
                      <label for="pillar" class="label_lp_custom">Колонна</label>
                    </span >
                  </div>
                  <div class="wall_type">
                    <span  class="menu_text_custom hover_label_custom" data-type = "stairs">
                      <input id="stairs" type="radio" name="walls_type_radio">
                      <label for="stairs" class="label_lp_custom"> Лестница</label>
                    </span>
                  </div>
                  <!-- <div class="border_custom"></div> -->
                  <div class="wall_type"><span  class="menu_text_custom hover_label_custom">
                      <input id="partition_wall" type="radio" name="walls_type_radio">
                      <label for="partition_wall" class="label_lp_custom">Перегородка</label>
                    </span>
                  </div>
                  </div>

                  </div>

                  <div class="border_custom"></div>
                  <!-- <span class="menu_text_custom">:</span> -->
                  <div class="lp_radio_div">
                    <div class="left_panel_type"><b class="lp-label">Треб. действия:</b></div>
                    <div class="radio_menu_custom">

                          <span data-type = "notChangable">
                                <div class="radio">
                                  <label>
                                      <input type="radio" name="wall_action" id="notChangable" >
                                      <span class="menu_label_position_custom label_lp_custom">Без изменений</span>
                                    </label>
                                </div>
                              </span>
                            <span data-type = "installation">
                                <div class="radio">
                                  <label>
                                      <input type="radio" name="wall_action" id="installation" >
                                      <span class="menu_label_position_custom label_lp_custom">Монтаж</span>
                                    </label>
                                </div>
                              </span>
                              <span data-type = "deinstallation">
                                <div class="radio">
                                  <label>
                                      <input type="radio" name="wall_action" id="deinstallation" >
                                      <span class="menu_label_position_custom label_lp_custom">Демонтаж</span>
                                    </label>
                                </div>
                              </span>

                        </div>
                      </div>

              </div>
</div>

<!--               <button type="button" class="btn  dropdown-toggle wall_type btn_default_custom" data-toggle="dropdown">Несущая <span class="caret" ></span></button>
              <ul class="dropdown-menu multi-level ul_drop_menu_custom">
                <li  class="wall_type" data-type = "bear_wall"><a>Несущая</a></li>
                <li  class="dropdown-submenu wall_type wall_action dropdown-toggle " data-type = "partition_wall" data-toggle="dropdown"> -->
                  <!--<div class=" wall_action">-->
                 <!--    <a  data-toggle="dropdown">Перегородка</a>
                    <ul class="dropdown-menu ul_drop_menu_custom" style="height:107px;">
                      <li data-type = "notChangable">
                        <div class="radio">
                          <label>
                              <input type="radio" name="wall_action" id="notChangable" >
                              <span class="menu_label_position_custom">Не менять</span>
                            </label>
                        </div>
                      </li>
                      <li data-type = "installation">
                        <div class="radio">
                          <label>
                              <input type="radio" name="wall_action" id="installation" >
                              <span class="menu_label_position_custom">Монтаж</span>
                            </label>
                        </div>
                      </li>
                      <li data-type = "deinstallation">
                        <div class="radio">
                          <label>
                              <input type="radio" name="wall_action" id="deinstallation" >
                              <span class="menu_label_position_custom">Демонтаж</span>
                            </label>
                        </div>
                      </li>
                    </ul> -->
                  <!--</div>-->
                <!-- </li> -->
                <!-- <li  class="wall_type" data-type = "pillar"><a>Колонна</a></li> -->
                <!-- <li  class="wall_type" data-type = "stairs"><a>Лестница</a></li> -->
                <!--<li  data-type = "divider"><a>Разделитель зон</a></li>-->
              <!-- </ul> -->

            </div>

          </div> 

          <div class="col-lg-6 input-group objParams pull-left left_panel_custom" style="display: none">
            <div >
            <p></p>
              <span class="label_custom  height" >Высота:</span>
              <input type="dim" class="height lp_input_custom" pattern="^[0-9]+$" param="height" title="Высота"><span class="height_ed_izm">мм</span>
            </div>
            
            <!-- <p class="div_labels_custom"> -->
            <p></p>
              <span class="label_custom width" >Ширина:</span>
              <input type="dim" class="width lp_input_custom" pattern="^[0-9]+$" param="width" title="Ширина"><span class="width_ed_izm">мм</span>
            <!-- </p> -->

            <p></p>
              <span class="label_custom radius" >Радиус:</span>
              <input type="dim" class="radius lp_input_custom" pattern="^[0-9]+$" param="radius" title="Радиус"><span class="radius_ed_izm">мм</span>

            <!-- <p class="div_labels_custom"> -->
            <!-- <span class='rwetret'></span> -->
            <p></p>
              <span class="label_custom length" >Длина:</span>
              <input type="dim" class="length" pattern="^[0-9]+$" param="length" title="Длина">
            <!-- </p> -->
            <!-- <div class='rwetret111'></div> -->

            <!-- <p class="div_labels_custom"> -->
            <p></p>
              <span class="label_custom depObject_thickness">Толщина:</span>
              <input type="dim" class="depObject_thickness" pattern="^[0-9]+$" param="depObject_thickness" title="Толщина"><span class="dep_th_ed_izm">мм</span>
            <!-- </p> -->

            <!-- <p class="div_labels_custom"> -->
            <p></p>
              <span class="label_custom thickness">Толщина:</span>
              <input type="dim" class=" thickness" pattern="^[0-9]+$" param="thickness" title="Толщина"><span class="th_ed_izm">мм</span>
            <!-- </p> -->

            <!-- <p class="div_labels_custom"> -->
            <p></p>
              <span class="label_custom elevation" >От пола:</span>
              <input type="dim" class="elevation" pattern="^[0-9]+$" param="elevation" title="Высота от пола"><span class="elevation_ed_izm">мм</span>
            <!-- </p> -->
            
            <!-- <p class="div_labels_custom"> -->
            <p></p>
              <span class="label_custom slope" >Ширина откоса:</span>
              <input type="dim" class="slope" pattern="^[0-9]+$" param="slope" title="Откос" disabled><span class="slope_ed_izm">мм</span>
            <!-- </p> -->
          </div><!-- /.col-lg-4 -->

          <div class="col-lg-1 input-group  doors_all_block_1" style="display: none">
              <!-- <div id="border-div" style="display:block!important; height:2px; width:248px; background:black;"></div> -->
              <!-- <input type="checkbox" class="isEntryDoor"  param="isEntryDoor" title="Входная дверь" value=""> -->
                <div class="doors_all_block doors_cls_custom">
                  <div class="doors_all_block doors_label_">
                    <span>Дверь</span>
                  </div>
                  <div class="objParams door_div_custom">
                    <input type="radio" name="doors_radio" class="isEntryDoor" param="isEntryDoor" value="0" checked> <span class="notEntryDoor"></span>
                    <input type="radio" name="doors_radio" class="isEntryDoor" param="isEntryDoor" value="1" > <span class="entryDoor"></span>
                  </div>
                </div>

              <!-- <span class="label_custom isEntryDoor " ></span> -->
          </div>
        </div>
      </div>

<!-- left panel end -->

      <div class="col-lg-4">
      
       <form name="floor_plan_form" onsubmit="return setFloorPlan(this);">
      
          <div class="btn-group">
            <button type="button" class="btn btn-default btn_default_custom" action="loadFloor"><i class="fa fa-file-image-o btn_icon_custom" aria-hidden="true"></i> Подложка </button>

            <input type ="file" name="image_file" class = "floorLoader" style="display: none">
            <input type="hidden" name="user_id" value="userID">
            <img class = "localImage" style="display: none">
            
            <button style=" display: none;" type="button" class="btn btn-default" action="modeE" title="Режим - редактирование">E</button>
            <button type="button" class="btn btn-default btn_default_custom btn_wall_custom" action="modeC" title="Режим - создание стен"><span class="fa fa-pencil"></span> Стена </button>

            <div class="input-group col-lg-2 ">
              <span class="input-group-addon" >Высота этажа:</span>
              <input type="dim" class="form-control floorHeight" pattern="^[0-9]+$" action="floorHeight">
              <span class="input-group-addon" >мм</span>
            </div>

        </div>

       </form>

      </div>

      <div class=" col-lg-2 ">
        <div class="row btn-group dropup pull-left">
          <span  class="fa fa-cog dropdown-toggle cog_icon_custom" aria-hidden="true"  data-toggle="dropdown"></span>
            <ul class="dropdown-menu multi-level ul_drop_menu_custom">
              <li class="" data-type = "points">
                <a action="points" title="Переключение режима отображения">Radial points</a>
              </li>
              <li class="" data-type = "without">
                <a action="mode" title="Переключение режима отображения">2D</a>
              </li>
              <li class="" data-type = "center">
                <!--<button type="button" class="btn btn-default" action="hideWalls">Cтены <i class="fa fa-eye" aria-hidden="true"></i></span></button>-->
                <a  action="changeGridVisible">Сетка <i class="fa fa-eye" aria-hidden=""></i></span></a>
                <img class = "" style="display: none">
              </li>
              <li class="" data-type = "center">
                <!--<button type="button" class="btn btn-default" action="hideWalls">Cтены <i class="fa fa-eye" aria-hidden="true"></i></span></button>-->
                <a  action="changeFloorVisible">Подложка <i class="fa fa-eye" aria-hidden=""></i></span></a>
                <img class = "" style="display: none">
              </li>
              <li class="" data-type = "center">
                <!--<button type="button" class="btn btn-default" action="hideWalls">Cтены <i class="fa fa-eye" aria-hidden="true"></i></span></button>-->
                <a  action="hideWalls">Cтены <i class="fa fa-eye" aria-hidden="true"></i></span></a>
                <img class = "localImage" style="display: none">
              </li>
              <li class="dropdown-submenu  wall_dim_type" data-type = "inner">
                <!--<div class="btn-group dropup wall_dim_type">-->
                  <!--<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Размер по осевой <span class="caret"></span></button>-->
                  <a  data-toggle="dropdown">Размер по осевой </a>
                  <!--<a id="dLabel" role="button" data-toggle="dropdown" class="btn btn-primary" data-target="#" href="#">-->
<!--                    Размер по осевой <span class="caret"></span>
                  </a>-->
                  <ul class="dropdown-menu dimension ul_drop_menu_custom" style="height:112px">
                    <li class="without" data-type = "without"><a>Размер скрыть</a></li>
                    <li class="center" data-type = "center"><a>Размер по осевой</a></li>
                    <li class="inner" data-type = "inner"><a>Размер внутри</a></li>
                    <li class="outer" data-type = "outer"><a>Размер снаружи</a></li>
                  </ul>
                <!--</div>-->
              </li>

            </ul>
        </div>

        <div class="pull-right">
          <button type="button"  class="btn btn-default pull-right btn_default_custom" action="cancel"><i class="fa fa-times btn_icon_custom" aria-hidden="true"></i> Отмена </button>
          <button type="button" class="btn btn-default pull-right btn_default_custom" action="exportJSON"><i class="fa fa-check btn_icon_custom" aria-hidden="true"></i> Ок </button>
        </div><!-- /.col-lg-2 -->
      </div> <!-- /.col-lg-6 -->

  </div>


</nav>



<!--Стиля для формы ноходятся в файле "css/main.css"  c 289 строки -->
<!--Форма для списка-->
<div class="list_panel_custom">
    <div style="height:40px"></div>
    <div class="panel panel-default" style="width:300px">
        <div class="panel-heading">Выберите страницу из списка</div>
        <div class="panel-body" style="height:400px;     overflow: auto;">

        </div>
        <div class="panel-footer custom_new_form" style="display:flex;justify-content: flex-end">

<!--            <button type="button" class="btn btn-default">Ok</button>-->
            <button type="button" class="btn btn-default">Отмена</button>
        </div>
    </div>
</div>

<!--Форма/tooltip-->

</body>

<div class="ActiveElementMenu" style="top: 187px; left: 500px; display: none;">
<!--  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -80.8112px; top: 40.8112px; background-position: left -120px; opacity: 1; width: 40px; height: 40px;" action="addSingleEntryDoorBlock" title="Дверь входная">
  </div>
  
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -103.07px; top: 5px; background-position: left -160px; opacity: 1; width: 40px; height: 40px;" action="addDoubleEntryDoorBlock" title="Двойная входная дверь">
  </div>-->
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -20px; top: 55px; background-position: left -120px; opacity: 1; width: 40px; height: 40px;" action="addCopy" title="Установить копию"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -103.07px; top: 5px; background-position: left 0px; opacity: 1; width: 40px; height: 40px;" action="scaleFloor" title="Масштабировать чертеж"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -103.07px; top: -42.2584px; background-position: left -280px; opacity: 1; width: 40px; height: 40px;" action="addNiche" data-type="Niche" title="Ниша"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -80.8112px; top: -80.8112px; background-position: left -40px; opacity: 1; width: 40px; height: 40px;" action="addWindow" data-type="WindowBlock" title="Окно"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: -42.2584px; top: -103.07px; background-position: left -120px; opacity: 1; width: 40px; height: 40px;" action="addDoorBlockFloor" data-type="DoorBlockFloor" title="Дверь межкомнатная"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 2.25844px; top: -103.07px; background-position: left -160px; opacity: 1; width: 40px; height: 40px;" action="addDoubleDoorBlockFloor" data-type="DoubleDoorBlockFloor" title="Двойная межкомнатная дверь"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40.8112px; top: -80.8112px; background-position: left -200px; opacity: 1; width: 40px; height: 40px;" action="addDoorway" data-type="Doorway" title="Дверной проем (портал)"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 63.0696px; top: -42.2584px; background-position: left -80px; opacity: 1; width: 40px; height: 40px;" action="remove" title="Удалить"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 63.0696px; top: 5px; background-position: left -320px; opacity: 1; width: 40px; height: 40px;" action="changeWidth" title="Толщина"></div>
  <div target="_blank" class="ActiveElementMenuAnimated" style="left: 40.8112px; top: 43px; background-position: left -320px; opacity: 1; width: 40px; height: 40px;" action="changeRadial" title="Радиусная стена"></div>
  

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
  <input type="text" class="btn btn-default" name="dimfield" value ="" title="dim">
  <button type="button" class="btn btn-default dim-arrow right" style=" display: none;"><span class="fa fa-arrow-right" aria-hidden="true"></span></button>
</div>

<div id="dimToolTip" title="Внимание" style="display: none;">
  <p>text</p>
</div>
</html>
