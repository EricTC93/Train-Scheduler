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
	firstTrain: { hours: "12", minutes: "00" },
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


$("#submit").on("click",function() {
	event.preventDefault();

	// if (parseInt($("#firstTrainHours").val()) != NaN) {}

	// 	console.log(parseInt($("#firstTrainHours").val()));

		trainList.push({
			name: $("#trainName").val(),
			destination: $("#destination").val(),
			firstTrain: { 
				hours: $("#firstTrainHours").val(), 
				minutes: $("#firstTrainMinutes").val()
			},
			frequency: $("#frequency").val()
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
		var newTableRow = $("<tr>");
		newTableRow.append($("<td>").html(trainList[i].name))
			.append($("<td>").html(trainList[i].destination))
			.append($("<td>").html(trainList[i].frequency))
			.append($("<td>").html(""))
			.append($("<td>").html(""));
		$("#trainTable").append(newTableRow);
	}
}

function displayTime(hr,min) {
	var hrDisplay = parseInt(hr);
	var minDisplay = parseInt(min);
	var period = "AM";

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

	else if (hrDisplay > 24 || hrDisplay < 0 ) {
		hrDisplay = 12;
	}

	return hrDisplay + ":" + minDisplay + " " + period;
}

function nextArrival(hr,min,freq) {
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

	// 	return nextArrival(newHr,newMin,freq); 
	// }

}

// console.log(displayTime(23,30));

// displayTrains();