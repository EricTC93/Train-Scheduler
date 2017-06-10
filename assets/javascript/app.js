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

var firstDay = "9";
var firstMonth = "June";
var firstYear = "2017";

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
		$("#hours").val() === "" || 
		$("#minutes").val() === "" || 
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

});

// Displays all the trains in the train array
database.ref().on("child_added", function(childSnapshot) {

	// console.log(childSnapshot);

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


// // Uses hours and minutes to display in 12hr clock format
// function displayTime(hr,min) {
// 	var hrDisplay = parseInt(hr);
// 	var minDisplay = parseInt(min);
// 	var period = "AM";

// 	while (minDisplay >= 60) {
// 		minDisplay-=60;
// 		hrDisplay++;
// 	}

// 	if (hrDisplay > 24 || hrDisplay < 0 ) {
// 		hrDisplay = hrDisplay%24;
// 	}

// 	if (hrDisplay === 0 || hrDisplay === 24) {
// 		hrDisplay = 12;
// 	}

// 	else if (hrDisplay === 12) {
// 		period = "PM";
// 	}

// 	else if (hrDisplay > 12) {
// 		hrDisplay-=12;
// 		period = "PM";
// 	}

// 	if (minDisplay < 10) {
// 		minDisplay = "0" + minDisplay;
// 	}

// 	return hrDisplay + ":" + minDisplay + " " + period;
// }

// Calculates the minutes away from the next train
// Note: If train start time is after the current time
// it will treat it a if the train started the day before
function minutesAway(hr,min,freq) {

	// var startTimeString = hr + ":" + min;

	// console.log(startTimeString);

	// var diff = moment().diff(startTimeString,"minutes");

	// console.log(diff);

	var startTime = moment().year(firstYear)
		.month(firstMonth)
		.date(firstDay)
		.hour(hr)
		.minutes(min);
	var currentTime = moment();
	var diff = currentTime.diff(startTime,"minutes");

	// if (diff < 0) {
	// 	startTime = startTime.subtract(1,"days");
	// 	var diff = currentTime.diff(startTime,"minutes");
	// }
	console.log(startTime.format());
	console.log(diff);

	var rem = diff%freq;


	// var startTimeMin = hr*60 + min;
	// var currentTimeMin = currentHr*60 + currentMin;

	// var newMin;

	// if (startTimeMin-currentTimeMin > freq) {
	// 	startTimeMin = startTimeMin - 1440;
	// }

	// if (startTimeMin-currentTimeMin <= freq && startTimeMin-currentTimeMin >= 0) {
	// 	return (startTimeMin-currentTimeMin);
	// }

	// else if (startTimeMin-currentTimeMin < 0) {
	// 	newMin = min + freq;
	// 	return minutesAway(hr,newMin,freq);
	// }

	// else {
	// 	return (startTimeMin-currentTimeMin);
	// }

	return (freq - rem);
}

// Displays the arival time of the train based on the min away from the current time
function arrivalTime(min) {
	var hrDisplay = currentHr;
	var minDisplay = currentMin + min;

	// return displayTime(hrDisplay,minDisplay);
	return moment().add(min,"minutes").format("hh:mm A");
}