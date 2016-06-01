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
  $task_id = $_GET['taskId'];
  //get values from form
  $task_name =$_GET['taskName'];
  $deadline =$_GET['deadline'];
  $notes = $_GET['notes'];

  $sql = "UPDATE tasks SET
    task_name='$task_name', deadline='$deadline', notes='$notes'
    WHERE user_id='$user_id' AND task_id='$task_id'";
  $result=mysqli_query($conn,$sql);

  if ($result) {
    //get the user's mobile number
    echo '{"status": "ok"}';
  	}
  else {
    echo '{"status": "error"}';
  }


?>
