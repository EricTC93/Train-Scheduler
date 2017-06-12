// Initialize Firebase
var config = {
    apiKey: "AIzaSyDPAkRq2y-F_EbAhKtvraZ64gzrzRczBcg",
    authDomain: "train-scheduler-firebase.firebaseapp.com",
    databaseURL: "https://train-scheduler-firebase.firebaseio.com",
    projectId: "train-scheduler-firebase",
    storageBucket: "train-scheduler-firebase.appspot.com",
    messagingSenderId: "106759238231"
  };
firebase.initializeApp(config);

var database = firebase.database();

// Declaring Variables
var date = new Date();
var currentHr = date.getHours();
var currentMin = date.getMinutes();

// Beginning Date
var startDay = "9";
var startMonth = "June";
var startYear = "2017";

// Adds train when user presses the submit button
$("#submit").on("click",function(event) {
	event.preventDefault();

	// Rejects submit if a form is left blank
	if ($("#trainName").val() === "" || 
		$("#destination").val() === "" || 
		$("#firstTrainHours").val() === "" || 
		$("#firstTrainMinutes").val() === "" || 
		$("#frequency").val() === "" ) {

		$("#error").html("All fields are required");
		$("#error").show();
		return;
	}

	var firstTrainHr = parseInt($("#firstTrainHours").val().trim());
	var firstTrainMin = parseInt($("#firstTrainMinutes").val().trim());
	var trainFreq = parseInt($("#frequency").val().trim());

	var startTimeString = firstTrainHr + ":" + firstTrainMin;

	// Time validation
	if (moment(startTimeString,"HH:mm").isValid() === false) {
		$("#error").html("Start time is invalid");
		$("#error").show();
		return;
	}

	// Frequency validation
	if (trainFreq <= 0 || Number.isInteger(trainFreq) === false) {
		$("#error").html("Frequency is invalid");
		$("#error").show();
		return;
	}

	$("#error").hide();
	updateTimes();

	// Pushes Train into the database
	database.ref().push({
		name: $("#trainName").val().trim(),
		destination: $("#destination").val().trim(),
		firstTrain: { 
			hours: firstTrainHr, 
			minutes: firstTrainMin
		},
		frequency: trainFreq
	});

	$("#trainName").val("");  
	$("#destination").val("");  
	$("#firstTrainMinutes").val("");  
	$("#firstTrainHours").val("");  
	$("#frequency").val(""); 

});

// Updates the time when the update button has been clicked
$("#update").on("click",function(event) {
	event.preventDefault();
	updateTimes();
});

// Displays all the trains in the train array
database.ref().on("child_added", function(childSnapshot) {

	var minAway = minutesAway(childSnapshot.val().firstTrain.hours,
			childSnapshot.val().firstTrain.minutes,
			childSnapshot.val().frequency);

	var nextArivl = arrivalTime(minAway);

	if (minAway === childSnapshot.val().frequency || minAway === 0) {
		minAway = "Now";
	}

	// append new row
	var newTableRow = $("<tr>").attr("id",childSnapshot.key);
	newTableRow.append($("<td>").html(childSnapshot.val().name))
		.append($("<td>").html(childSnapshot.val().destination))
		.append($("<td>").html(childSnapshot.val().frequency))
		.append($("<td>").html(nextArivl))
		.append($("<td>").html(minAway));
	$("#trainTable").append(newTableRow);

}, function(errorObject) {
	console.log("There was an error: " + errorObject.code);
});

// Calculates the minutes away from the next train
// Note: Train starts running on a seperate date in the past
function minutesAway(hr,min,freq) {

	var startTime = moment().year(startYear)
		.month(startMonth)
		.date(startDay)
		.hour(hr)
		.minutes(min);
	var currentTime = moment();
	var diff = currentTime.diff(startTime,"minutes");

	var remainder = diff%freq;

	return (freq - remainder)%freq;
}

// Displays the arival time of the train based on the min away from the current time
function arrivalTime(min) {
	var hrDisplay = currentHr;
	var minDisplay = currentMin + min;

	return moment().add(min,"minutes").format("hh:mm A");
}

// Updates the times
function updateTimes() {
	database.ref().once("value").then(function(snap) {
		var trainsObj = snap.val();

		for (var key in trainsObj) {
			var minAway = minutesAway(trainsObj[key].firstTrain.hours,
				trainsObj[key].firstTrain.minutes,
				trainsObj[key].frequency);

			var nextArivl = arrivalTime(minAway);

			if (minAway === trainsObj[key].frequency || minAway === 0) {
				minAway = "Now";
			}

			var nextArivlData = $("#" + key).children()[3];
			$(nextArivlData).html(nextArivl);

			var minAwayData = $("#" + key).children()[4];
			$(minAwayData).html(minAway);
		} 
	});
}