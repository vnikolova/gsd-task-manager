<?php
  session_start();
  //configure and connect to database
   $db_host = "localhost";
   $db_name = "final_db";
   $db_user = "root";
   $db_pass = "";
   $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

   $station = $_GET['station']; //get station name from the url
   $user_id = $_SESSION['id'];
   $query = "   SELECT *
   FROM tasks
   LEFT JOIN stations
   ON tasks.station_id=stations.id
   WHERE tasks.user_id='$user_id' AND stations.name='$station' ";

   $result = $conn->query($query);
   $rows = $result->num_rows;

  if($query)
  {
    $info = array();
    for($j = 0; $j < $rows; $j++) //all found rows
    {
      $result->data_seek($j); //find the data
      $row = $result->fetch_array(MYSQLI_ASSOC);
      array_push($info, $row);//push data into array
    }
    echo json_encode($info); //return JSON object
  }

  $conn->close();
?>
