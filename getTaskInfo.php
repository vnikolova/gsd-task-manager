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
  $task_id=$_GET['taskId'];

  $sql = "SELECT * FROM tasks
    WHERE user_id='$user_id' AND task_id='$task_id'";

  $result=mysqli_query($conn,$sql);
  $row = $result->fetch_row();

  if($result)
  {
    echo json_encode($row);
  }

  $conn->close();
?>
