<?php
include('Vector3.php');

class Response{
  public $v11;
  public $v12;
  public $v21;
  public $v22;

  public function __construct() {
    $this->v11 = new Vector3();
    $this->v12 = new Vector3();
    $this->v21 = new Vector3();
    $this->v22 = new Vector3();
  }

}

$response = new Response();

if( isset($_GET["data"]) ){

  $data = json_decode ( $_GET["data"] );

  $v1 = new Vector3((float)$data->v1->x, (float)$data->v1->y, (float)$data->v1->z);
  $v2 = new Vector3((float)$data->v2->x, (float)$data->v2->y, (float)$data->v2->z);
  $direction90 = new Vector3((float)$data->direction90->x, (float)$data->direction90->y, (float)$data->direction90->z);

  $response->v11 = $v1->_clone()->add( $direction90->_clone()->multiplyScalar((float)$data->width/2) );
  $response->v12 = $v1->_clone()->add( $direction90->_clone()->negate()->multiplyScalar((float)$data->width/2) );
  $response->v21 = $v2->_clone()->add( $direction90->_clone()->multiplyScalar((float)$data->width/2) );
  $response->v22 = $v2->_clone()->add( $direction90->_clone()->negate()->multiplyScalar((float)$data->width/2) );

}

echo json_encode( $response );


