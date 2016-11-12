$('document').ready(function(){
  // request permission for notifications on page load
  document.addEventListener('DOMContentLoaded', function () {
    if (Notification.permission !== "granted")
      Notification.requestPermission();
  });

  function notify(name, deadline) {
    if (!Notification) {
      alert('Desktop notifications not available in your browser. Try Chromium.');
      return;
    }

    if (Notification.permission !== "granted")
      Notification.requestPermission();
    else {
      var audio = new Audio('sound/pop.mp3');
      audio.play();
      var notification = new Notification('New Task Created', {
        icon: 'img/newtask.png',
        body: "Your task "+name+" is due on "+deadline+". We will send you notifications now and again. You can change these in your settings."
      });

      notification.onclick = function () {
        //display task on notffication click
      };
    }
  }
  //check if user has been loggen in already
  //if the key doesn't exist it will return null
  if(localStorage.getItem('username') !== null)
  {
    createStation();
  }
  //enable jQuery datepicker on tne new task modal
  $("#taskDeadline").datepicker({ dateFormat: 'yy-mm-dd' });

  /* login submit */
  $(document).on('click','#btn-login', function(){
    var emailInput = $('#emailInput').val();
    var passwordInput = $('#passwordInput').val();
    var thelink = 'db/login.php?email='+emailInput+'&password='+passwordInput;

    $.getJSON(thelink,function(data)
    {
      if(data.response == "true"){
        $('#login').modal('hide'); //close the modal
        localStorage.setItem("username",data.username);
        createStation();
        $('#login-form')[0].reset(); //clear the form
     }
     else{
      $("#error").fadeIn(1000, function(){
        $("#error").html('<div class="alert alert-danger"> <span class="glyphicon glyphicon-info-sign"></span> &nbsp; '+data.response+' !</div>');
         });
     }
    });
  });

    /* register submit */
    $(document).on('submit','#register-form', function(){
      $.ajax({
        type: "POST",
        url: "db/register.php",
        data: $('#register-form').serialize(),
        success: function(data){
          if(data == "true"){
            //close modal and show login
            $('#register').modal('hide');
            $('#login').modal('show');
         }
         else{
          $("#error").fadeIn(1000, function(){
            $("#error").html('<div class="alert alert-danger"> <span class="glyphicon glyphicon-info-sign"></span> &nbsp; '+data+' !</div>');
             });
         }
       }
      });
    $('#register-form')[0].reset(); //clear form
    return false;
    });

//logout
$(document).on('click','#btn-logout', function(){
  $.ajax({
    type : 'POST',
    url  : 'db/logout.php',
     success: function(data) {
       $('#index').css("display", "block");
       $('#mainContent').css("display", "none");
      localStorage.clear(); //delete everything in local storage
     }
  });
});

//load the stations in divs
function createStation(){
  $('#index').css("display", "none");
  $('#mainContent').css("display", "block");
  $(".welcome").html("Logged in as "+localStorage.getItem("username"));

  $.getJSON('db/createStation.php',function(data){
    var txt = "";
    var selectOptions = "";
    var icons = ['forders', 'studies','group','personal', 'work'];
    var iconName;

    for(var i in data)
       {
         var name = data[i].name;
         //check if there's an icon for the folder name
         //otherwise display default icon - folders
        if($.inArray(name, icons) >= 0)
        {
          iconName = name;
        }
        else{
          iconName = 'folders';
        }
         txt += '<div class="col-md-2 col-sm-3 col-sm-offset-2 col-xs-4 col-xs-offset-2 station text-center" id="station-'+name+'"><img  data-toggle="tooltip" data-placement="bottom" title="'+name+'" src="img/'+iconName+'.png"></img><p>'+name+'</p></div>';
         //while at it, might as well populate the select element in the modal for creating new task
         selectOptions += '<option value="'+name+'">'+name+'</option>';
       }
    $('#stationsDiv').html(txt);
    $('#stationSelect').html(selectOptions);

    //enable bootstrap tooltip
    $('[data-toggle="tooltip"]').tooltip();

   });

}

$(document).on('click','#btn-newStation', function(){
  //create new station on click
  var stationName = $('#stationName').val();
  var linkWithName = 'db/newStation.php?name='+stationName;
  $.getJSON(linkWithName,function(jData){

    if(jData.status == "true")
    {
      $('#newStation').modal('hide');
      createStation();
    }
    else{
      $("#error").fadeIn(1000, function(){
        $("#error").html('<div class="alert alert-danger"> <span class="glyphicon glyphicon-info-sign"></span> &nbsp; '+jData.status+' !</div>');
         });
        }
   });
   $('#newStation-form')[0].reset(); //clear the form
});

$(document).on('click','#btn-newTask', function(){
  //when creating a new task
  //connect to the database
  var taskName = $('#taskName').val();
  var deadline = $('#taskDeadline').val();
  var station = $('#stationSelect option:selected').text();
  var smsNotif = +$('#smsNotif').is(':checked');
  var desktopNotif = +$('#desktopNotif').is(':checked'); //returns 1 or 0 if checked
  var notes = $('#taskNotes').val();
  var newTaskLink = 'db/newTask.php?taskName='+taskName+'&deadline='+deadline+'&station='+station+'&smsNotif='+smsNotif+
  '&desktopNotif='+desktopNotif+'&notes='+notes;

  $.getJSON(newTaskLink, function(jData){
    if(jData.response == "true"){
      if(jData.sms_notif == 1){
        //send sms that new task has been created if sms has been checked
        sendSMS(jData.mobile, jData.task_name, jData.deadline);
      }
      $('#newTask').modal('hide');
      displayTasks(localStorage.getItem('currentStation'));
      //send notification of the new task created only if it has been checked
      if(jData.desktop_notif == 1)
      {
        notify(jData.task_name, jData.deadline);
      }
   }
   else{
    $("#error").fadeIn(1000, function(){
      $("#error").html('<div class="alert alert-danger"> <span class="glyphicon glyphicon-info-sign"></span> &nbsp; '+jData.response+' !</div>');
       });
   }
   $('#newTask-form')[0].reset(); //clear the form
 });

});

//when clicked on a station div, display all relevant tasks
$(document).on('click','.station', function(){
  //select the id and strip the string after the dash -, returns the station name
  var stationName = $(this).attr("id").split("-").pop();
  localStorage.setItem('currentStation', stationName);
  displayTasks(stationName);
  //check the current station and set the corresponding select as default selected
  $('#stationSelect option[value="'+localStorage.getItem('currentStation')+'"]').attr("selected",true);
});

function displayTasks(name) {
  //get the name of the station
  //take and pass parameter to php
  var taskLink = 'db/createTasks.php?station='+name;
  //hide stations div
  $('#stationsDiv').css("display", "none");
  $('#tasksDiv-wrapper').css("display", "block");
  $('#tasksDiv-wrapper h1').text(localStorage.getItem('currentStation'));
  //get json data and append to tasksDiv
  $.getJSON(taskLink,function(data){
    var elements = "";

    //if no tasks are found, display a message
    if(data == "")
    {
      $('#tasksDiv').html('<h3 class="text-center" style="text-transform:uppercase;opacity: 0.3;">the station is empty.</h3>');
    }
    else { //otherwise display the tasks
      for(var i in data)
         {
           //set the icon for desktop and sms notification
           //ok check if true, remove icon if false
           function getIcon(notification)
           {
             if(notification != "0")
             {
               return 'glyphicon glyphicon-ok';
             }
             else {
               return 'glyphicon glyphicon-remove';
             }
           }
           elements += '<div class="task col-md-3 col-sm-6 col-xs-10 col-xs-offset-1 text-center" id="task-'+data[i]. task_id+'"><h2>'+data[i].task_name+
           '</h2><span class="glyphicon glyphicon-calendar"><span class="task-txt">'+data[i].deadline+
           '</span></span><span class="'+getIcon(data[i].sms_notif)+'"><span class="task-txt">SMS</span></span><span class="'+getIcon(data[i].desktop_notif)+
           '"><span class="task-txt">Desktop</span></span><p>'+data[i].notes+
           '</p><button data-toggle="tooltip" data-placement="bottom" title="delete" id="delete-task"><span class="glyphicon glyphicon-remove"></span></button><button data-toggle="tooltip" data-placement="bottom" title="edit" id="edit-task"><span class="glyphicon glyphicon-pencil"></span></button></div>';
         }
      $('#tasksDiv').html(elements);
    }
    //enable bootstrap tooltip
    $('[data-toggle="tooltip"]').tooltip();
   });
} //end of display tasks

$(document).on('click', '#delete-task', function(){
  //get the id from the parent div
  var taskId = $(this).parent().attr('id').split('-').pop();

  var actionLink = 'db/deleteTask.php?taskId='+taskId;

  $.getJSON(actionLink,function(data){
    displayTasks(localStorage.getItem('currentStation'));
   });
});

$(document).on('click', '#edit-task', function(){
  //open modal
  //get if from the selected task
  var taskId = $(this).parent().attr('id').split('-').pop();
  localStorage.setItem('currentTaskId', taskId);
  var populateModal = 'db/getTaskInfo.php?taskId='+taskId;

  $.getJSON(populateModal,function(jData){
    $('.form-updateTask #taskName').val(jData[3]);
    $('.form-updateTask #taskDeadline').val(jData[4]);
    $('.form-updateTask #taskNotes').val(jData[5]);
    if(jData[6] == 1)
    {
      $('.form-updateTask #smsNotif').prop('checked', true);
    }
    else if(jData[7] == 1){
      $('.form-updateTask #desktopNotif').prop('checked', true);
    }
   });
   $('#updateTask').modal('show');

});


$(document).on('click', '#btn-updateTask', function(){

  var url = "db/updateTask.php?taskId="+localStorage.getItem('currentTaskId');
  var data = $('#updateTask-form').serialize();

  $.getJSON(url, data, function(result){
      console.log(result);
  });

  $('#updateTask').modal('hide');
  displayTasks(localStorage.getItem('currentStation'));

});

$(document).on('click','#btn-goBack', function(){
  //go back from task view to station view
  $('#tasksDiv-wrapper').css("display", "none");
  $('#stationsDiv').css("display", "block");
});


function sendSMS(mobile,name,deadline){
  var message = 'Created task "'+name+'" with due date on '+deadline;
  var linktoSMS ='http://www.ecuanota.com/api-send-sms?key=NzI2-YmMy-YjI2-NTk3-Nzcw-MWE5-Nzc5-M2E0-YWQ3-MTQ4-N2Y6&mobile='+
  mobile+'&message='+message;

  $.getJSON(linktoSMS, function(jData){
  });
}
}); //document ready close
