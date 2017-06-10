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

var startDay = "9";
var startMonth = "June";
var startYear = "2017";

// Runs when a value has been changed
database.ref().on("value",function(snap) {

}, function(errorObject) {
	console.log("There was an error: " + errorObject.code);
});

// Adds train when user presses the submit button
$("#submit").on("click",function(event) {
	event.preventDefault();

	// Rejects submit if a form is left blank
	if ($("#trainName").val() === "" || 
		$("#destination").val() === "" || 
		$("#firstTrainHours").val() === "" || 
		$("#firstTrainMinutes").val() === "" || 
		$("#frequency").val() === "" ) {

		alert("All fields are required");
		return;
	}

	var firstTrainHr = parseInt($("#firstTrainHours").val().trim());
	var firstTrainMin = parseInt($("#firstTrainMinutes").val().trim());
	var trainFreq = parseInt($("#frequency").val().trim());

	var startTimeString = firstTrainHr + ":" 
	+ firstTrainMin;

	if (moment(startTimeString,"HH:mm").isValid() === false) {
		alert("Start time is invalid");
		return;
	}

	if (trainFreq <= 0 || Number.isInteger(trainFreq) === false) {
		alert("Frequency is invalid");
		return;
	}

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
	$("#firstTrainHours").val("");  
	$("#firstTrainMinutes").val("");  
	$("#frequency").val(""); 

});

// Displays all the trains in the train array
database.ref().on("child_added", function(childSnapshot) {

	var minAway = minutesAway(childSnapshot.val().firstTrain.hours,
			childSnapshot.val().firstTrain.minutes,
			childSnapshot.val().frequency);

	var nextArivl = arrivalTime(minAway);

	if (minAway === 0) {
		minAway = "Now";
	}

	var newTableRow = $("<tr>");
	newTableRow.append($("<td>").html(childSnapshot.val().name))
		.append($("<td>").html(childSnapshot.val().destination))
		.append($("<td>").html(childSnapshot.val().frequency))
		.append($("<td>").html(nextArivl))
		.append($("<td>").html(minAway));
	$("#trainTable").append(newTableRow);

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

	return (freq - remainder);
}

// Displays the arival time of the train based on the min away from the current time
function arrivalTime(min) {
	var hrDisplay = currentHr;
	var minDisplay = currentMin + min;

	return moment().add(min,"minutes").format("hh:mm A");
}