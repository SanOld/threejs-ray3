<?php
include('Vector3.php');

$response = array (new Vector3(), new Vector3());

if( isset($_GET["data"]) ){

  $data = json_decode ( $_GET["data"] );

  $response = new Vector3((float)$data->x, (float)$data->y, (float)$data->z);

}

echo json_encode( $response );

