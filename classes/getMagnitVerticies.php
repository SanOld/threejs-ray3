<?php
include('Vector3.php');

$response = array (new Vector3(), new Vector3());

if( isset($_GET["data"]) ){

  $data = json_decode ( $_GET["data"] );

  $v1 = new Vector3((float)$data->v1->x, (float)$data->v1->y, (float)$data->v1->z);
  $v2 = new Vector3((float)$data->v2->x, (float)$data->v2->y, (float)$data->v2->z);

  $response[0] = $v1->_clone()->projectOnPlane ( new Vector3(0,1,0) );
  $response[1] = $v2->_clone()->projectOnPlane ( new Vector3(0,1,0) );

}

echo json_encode( $response );

