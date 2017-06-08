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

var trainName = "Test";
var destination = "test";
var firstTrain = "00:00";
var frequency = 10;

var trainList = [];

// var ref = new Firebase(URL_TO_DATA);
// var newChildRef = ref.push();
// newChildRef.set({
// 	trainName: trainName
// });

$("#submit").on("click",function() {
	event.preventDefault();

	trainList.push({
		name: $("#trainName").text(),
		destination: $("#destination").text(),
		firstTrain: $("#firstTrain").text(),
		frequency: $("#frequency").text()
	});

	console.log(trainList);

	database.ref().set({
		trainStorage: trainList
	});
});