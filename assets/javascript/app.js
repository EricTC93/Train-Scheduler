// Initialize Firebase
var config = {
    apiKey: "AIzaSyDvHZ9KKKnKrVNT64Whxk9bmGQUStN8k5Q",
    authDomain: "testproject-ac6d1.firebaseapp.com",
    databaseURL: "https://testproject-ac6d1.firebaseio.com",
    projectId: "testproject-ac6d1",
    storageBucket: "testproject-ac6d1.appspot.com",
    messagingSenderId: "43415758702"
 };
firebase.initializeApp(config);

var database = firebase.database();

// Declaring Variables
var trainList = [{
	name: "First Train",
	destination: "home",
	firstTrain: { hours: 12, minutes: 0 },
	frequency: 7
}];

var date = new Date();
var currentHr = date.getHours();
var currentMin = date.getMinutes();

// Runs when a value has been changed
database.ref().on("value",function(snap) {

	if (snap.child("trainStorage").exists()) {
		console.log(snap.val().trainStorage);
		trainList = snap.val().trainStorage;
		displayTrains();
	}

	else {

		database.ref().set({
			trainStorage: trainList
		});
	}

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

	// var trainStartHr = parseInt($("#firstTrainHours").val().trim());
	// var trainStartMin = parseInt($("#firstTrainMinutes").val().trim());

	trainList.push({
		name: $("#trainName").val().trim(),
		destination: $("#destination").val().trim(),
		firstTrain: { 
			hours: parseInt($("#firstTrainHours").val().trim()), 
			minutes: parseInt($("#firstTrainMinutes").val().trim())
		},
		frequency: parseInt($("#frequency").val().trim())
	});

	console.log(trainList);

	database.ref().set({
		trainStorage: trainList
	});

	displayTrains();

});

// Displays all the trains in the train array
function displayTrains() {
	// Empties current table
	$("#trainTable").empty();

	// Creates table header
	var tableHead = $("<tr>");
	tableHead.append($("<th>").html("Train Name"))
		.append($("<th>").html("Destination"))
		.append($("<th>").html("Frequency (min)"))
		.append($("<th>").html("Next Arrival"))
		.append($("<th>").html("Minutes Away"));
	$("#trainTable").append(tableHead);

	// Appends table data for each train
	for (var i = 0; i < trainList.length; i++) {

		var minAway = minutesAway(trainList[i].firstTrain.hours,
				trainList[i].firstTrain.minutes,
				trainList[i].frequency);

		var nextArivl = arrivalTime(minAway);

		if (minAway === 0) {
			minAway = "Now";
		}

		var newTableRow = $("<tr>");
		newTableRow.append($("<td>").html(trainList[i].name))
			.append($("<td>").html(trainList[i].destination))
			.append($("<td>").html(trainList[i].frequency))
			.append($("<td>").html(nextArivl))
			.append($("<td>").html(minAway));
		$("#trainTable").append(newTableRow);
	}
}

// Uses hours and minutes to display in 12hr clock format
function displayTime(hr,min) {
	var hrDisplay = parseInt(hr);
	var minDisplay = parseInt(min);
	var period = "AM";

	while (minDisplay >= 60) {
		minDisplay-=60;
		hrDisplay++;
	}

	if (hrDisplay > 24 || hrDisplay < 0 ) {
		hrDisplay = hrDisplay%24;
	}

	if (hrDisplay === 0 || hrDisplay === 24) {
		hrDisplay = 12;
	}

	else if (hrDisplay === 12) {
		period = "PM";
	}

	else if (hrDisplay > 12) {
		hrDisplay-=12;
		period = "PM";
	}

	if (minDisplay < 10) {
		minDisplay = "0" + minDisplay;
	}

	return hrDisplay + ":" + minDisplay + " " + period;
}

// Calculates the minutes away from the next train
// Note: If train start time is after the current time
// it will treat it a if the train started the day before
function minutesAway(hr,min,freq) {

	var startTimeMin = hr*60 + min;
	var currentTimeMin = currentHr*60 + currentMin;

	var newMin;

	if (startTimeMin-currentTimeMin > freq) {
		startTimeMin = startTimeMin - 1440;
	}

	if (startTimeMin-currentTimeMin <= freq && startTimeMin-currentTimeMin >= 0) {
		return (startTimeMin-currentTimeMin);
	}

	else if (startTimeMin-currentTimeMin < 0) {
		newMin = min + freq;
		return minutesAway(hr,newMin,freq);
	}

	else {
		return (startTimeMin-currentTimeMin);
	}
}

// Displays the arival time of the train based on the min away from the current time
function arrivalTime(min) {
	var hrDisplay = currentHr;
	var minDisplay = currentMin + min;

	return displayTime(hrDisplay,minDisplay); 
}