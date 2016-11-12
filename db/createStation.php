<?php
  session_start();

  $user_id = $_SESSION['id'];
  //configure and connect to database
   $db_host = "localhost";
   $db_name = "final_db";
   $db_user = "root";
   $db_pass = "";

  $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
  //is the userid on a station is null, it applies to all users
  $query = "SELECT * FROM stations WHERE user_id='$user_id' OR user_id IS NULL ORDER BY stations.name";

  $result = $conn->query($query);
  $rows = $result->num_rows;

  if($query)
  {
    $info = array();
    for($j = 0; $j < $rows; $j++)
    {
      $result->data_seek($j);
      $row = $result->fetch_array(MYSQLI_ASSOC);
      array_push($info, $row);
    }
    echo json_encode($info);
  }

  $conn->close();
?>
