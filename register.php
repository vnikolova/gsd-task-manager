<?php
  session_start();
  //configure and connect to database
   $db_host = "localhost";
   $db_name = "final_db";
   $db_user = "root";
   $db_pass = "";

  $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

  //get values from form
  $name = $_POST['name'];
  $email = $_POST['email'];
  $phone = $_POST['phone'];
  $password = $_POST['password'];
  $sql = 'INSERT INTO users (name, email, phone, password)
    VALUES ("'.$name.'","'.$email.'","'.$phone.'","'.$password.'")';
  $result=mysqli_query($conn,$sql);

  //if it finds a user with this email and password it will return 1
  if ($result) {
    echo "true";
  	}
  else {
    echo "There has been an error";
  }


?>
