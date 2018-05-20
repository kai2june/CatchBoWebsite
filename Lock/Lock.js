var app = require('express')();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var five = require("johnny-five");

//windows
var board  = new five.Board({
	port : "COM3"
});
//mac
/*var board  = new five.Board({
	port : "/dev/cu.usbmodem1411",
	repl : false
});*/

var lockLed, unlockLed, engineLed; //鎖定燈, 解鎖燈, 發動燈
var ledObject = {
	lockLedState : "on",
	unlockLedState : "off",
	engineLedState : "off",

};
var engineButton, returnButton;
var engineRelay;
var renter;
var socketForuse;
var isTimeout=true,isReturn;

var status=false;

server.listen(process.env.PORT || 1336, function(){
	console.log('listening on *:1336');
});

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});
board.on("ready", function() {
	console.log ("board ready");

	lockLed = new five.Led(12);
	unlockLed = new five.Led(11);
	lockedButton = new five.Button(10);
	unlockedButton = new five.Button(9);
	engineRelay = new five.Relay(8);
	//engineRelay = new five.Led(8);

	// init
	lockLed.on();
	unlockLed.off();
	engineRelay.on();



	io.on('connection', function (socket) {
		socketForuse = socket;
		socket.emit('news', 'hi');
		socket.on('event_renting', function (data) {
			renter = data["renter"];
			var mSec = data["mSec"];
			console.log(renter)
			console.log(mSec)


			if (!isNaN(mSec)) { //如果mSec是時間(數字)
				socket.emit('news', 'TRUE'); //ACK
				//可以收到時間要做甚麼

				//解鎖
				unlockLed.on();
				ledObject.unlockLedState = "on";
				lockLed.off();
				ledObject.lockLedState = "off";
				engineRelay.off();
				status=true;

				isTimeout = false;
				isReturn = false;

				if (ledObject.unlockLedState === "on") {
					setTimeout(function() {
						//時間到要做甚麼
						console.log("Timeout")

						//鎖定
						unlockLed.off();
						engineRelay.on();
						ledObject.unlockLedState = "off";

						lockLed.on();
						ledObject.lockLedState = "on";

						isTimeout = true;


					}, parseInt(mSec));
				}
			} else {
				socket.emit('news', 'FALSE'); //ACK
			}
		});
	});


	unlockedButton.on("press", function() {
		console.log("Press UnlockButton");

		if ((status==true)&&(!isTimeout)){
				unlockLed.on();
				ledObject.unlockLedState = "on";
				lockLed.off();
				ledObject.lockLedState = "off";
				engineRelay.off();
	}
});





	//提早歸還按鈕
	lockedButton.on("press", function() {
		console.log("Press returnButton");

		if((!isTimeout)||(!isReturn)){
			//鎖定
			unlockLed.off();
			ledObject.unlockLedState = "off";

			lockLed.on();
			engineRelay.on();
			ledObject.lockLedState = "on";

			//歸還
			returnGogoro(socketForuse);
			isReturn = true;
		}
	});

});

// socke.io-client
//還車
function returnGogoro(socket) {

	socket.emit('returnGoGORO', {renter:renter});

	console.log("func_retun");
}
