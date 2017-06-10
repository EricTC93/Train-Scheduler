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

// var firstTrain = {
// 	name: "First Train",
// 	destination: "home",
// 	firstTrain: "12:00",
// 	frequency: 7
// };

var trainList = [{
	name: "First Train",
	destination: "home",
	firstTrain: { hours: 12, minutes: 0 },
	frequency: 7
}];

var date = new Date();
var currentHr = date.getHours();
var currentMin = date.getMinutes();


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


$("#submit").on("click",function(event) {
	event.preventDefault();

	// if (parseInt($("#firstTrainHours").val()) != NaN) {}

	// 	console.log(parseInt($("#firstTrainHours").val()));

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

function displayTrains() {
	$("#trainTable").empty();
	var tableHead = $("<tr>");
	tableHead.append($("<th>").html("Train Name"))
		.append($("<th>").html("Destination"))
		.append($("<th>").html("Frequency (min)"))
		.append($("<th>").html("Next Arrival"))
		.append($("<th>").html("Minutes Away"));
	$("#trainTable").append(tableHead);

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

function minutesAway(hr,min,freq) {
	// var a = hr*60 + min;
	// var b = currentHr*60 + currentMin;

	// if (b-a <= freq && b-a >= 0) {
	// 	return b-a;
	// }

	// else {
	// 	var newHr = hr;
	// 	var newMin = min + freq;
	// 	while (newMin >= 60) {
	// 		newMin-=60;
	// 		newHr++
	// 	}
	// 	while (newHr >= 24) {
	// 		newHr-=24;
	// 	}

	// 	return minutesAway(newHr,newMin,freq); 
	// }

	// console.log("hr: " + hr);
	// console.log("min: " + min);
	// console.log("freq: " + freq);

	var a = hr*60 + min;
	var b = currentHr*60 + currentMin;

	// console.log(a);
	// console.log(b);

	// if (a-b > freq) {
	// 	b = currentHr*60*24 + currentMin;
	// }

	var newMin;

	if (a-b > freq) {
		a = a - 1440;
	}

	if (a-b <= freq && a-b >= 0) {
		return (a-b);
	}

	else if (a-b < 0) {
		newMin = min + freq;
		return minutesAway(hr,newMin,freq);
	}

	else {
		return (a-b);
	}
}

// console.log(displayTime(26,65));

// displayTrains();

// console.log(minutesAway(23,17,10));

function arrivalTime(min) {
	var hrDisplay = currentHr;
	var minDisplay = currentMin + min;

	return displayTime(hrDisplay,minDisplay); 
}

// console.log(arrivalTime(minutesAway(19,14,15)));