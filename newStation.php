<?php
  session_start();
  //configure and connect to database
   $db_host = "localhost";
   $db_name = "final_db";
   $db_user = "root";
   $db_pass = "";
   $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

   $user_id = $_SESSION['id'];
  //get name from url
  $station_name = $_GET['name'];
  //check if it exists in database
  $query = "SELECT * FROM stations WHERE user_id=$user_id AND name =$station_name";
  $exists = mysqli_query($conn,$query);
  $data = mysqli_fetch_array($exists, MYSQLI_NUM);

  if($station_name != null && $station_name != "" && $data[0] < 1)
  {
    $sql = 'INSERT INTO stations(user_id, name)
      VALUES ("'.$user_id.'","'.$station_name.'")';
    $result=mysqli_query($conn,$sql);
  }


  if ($result) {
    echo '{"status": "true"}';
  	}
  else {
    echo '{"status": "Error"}';
  }


?>
