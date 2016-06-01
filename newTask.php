<?php
  session_start();
  //configure and connect to database
   $db_host = "localhost";
   $db_name = "final_db";
   $db_user = "root";
   $db_pass = "";
   $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

   //get user id from session
  $user_id = $_SESSION['id'];
  //get values from form
  //use isset to avoid undefined index error
  $task_name =$_GET['taskName'];
  $deadline =$_GET['deadline'];
  $notes = $_GET['notes'];
  $station_name = $_GET['station'];
  $sms_notif = $_GET['smsNotif'];
  $desktop_notif = $_GET['desktopNotif'];

  //get station id
  $getStationId = "SELECT * FROM  stations WHERE name='$station_name'";
  $stationIdQuery=mysqli_query($conn,$getStationId);
  $station=mysqli_fetch_array($stationIdQuery,MYSQLI_ASSOC);
  $station_id = $station['id'];
  //insert new task
  $sql = "INSERT INTO tasks(user_id, station_id, task_name, deadline,notes,sms_notif, desktop_notif)
    VALUES ('$user_id','$station_id','$task_name','$deadline','$notes','$sms_notif','$desktop_notif')";
  $result=mysqli_query($conn,$sql);

  if ($result) {
    //get the user's mobile number
    $query = "SELECT * FROM users WHERE id='$user_id'";
    $res=mysqli_query($conn,$query);
    $row=mysqli_fetch_array($res,MYSQLI_ASSOC);
    $mobile = $row['phone'];
    //add all needed data in an array
    $jData = array("response" => "true","mobile" => $mobile, "task_name" => $task_name, "deadline" => $deadline,"sms_notif" => $sms_notif,"desktop_notif" => $desktop_notif);
    $output = json_encode($jData);
    echo $output;
  	}
  else {
    // echo "There has been an error";
    $jData = array("response" => "There has been an error.");
    $output = json_encode($jData);
    echo $output;
  }


?>
