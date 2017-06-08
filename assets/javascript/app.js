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

database.ref().on("value",function(snap) {

	if (snap.child("trainStorage").exists()) {
		console.log(snap.val().trainStorage);
		trainList = snap.val().trainStorage;
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

	displayTrain();
});

function displayTrain() {
	$("#trainTable").empty();
} 