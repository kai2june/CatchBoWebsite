var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var app = express();
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

// server.listen(process.env.PORT || 1336, function(){
// 	console.log('listening on *:1336');
// });

// app.get('/', function (req, res) {
// 	res.sendfile(__dirname + '/index.html');
// });
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





//==================================================Above are wrote by Ruby===============================================================//
//==================================================Below are wrote by me=================================================================//
var port = process.env.PORT || 5000;
var nav = [{Link: '/Books', Text: 'Buy Things'}, {Link: '/Sell', Text: 'Sell Things'}, {Link: '/buyRecord', Text: 'Buy Record'}, {Link: '/sellRecord', Text: 'Sell Record'}, {Link: '/mailer', Text: 'Mailman'}];
var ContractManager = require('./scm');
var fs = require('fs');
// ContractManager.compileFile('./contracts/CatchBo.sol', function (err, result) {
//     if (err) throw err;
//     console.log(result);
// });
var abi = fs.readFileSync('./contracts/CatchBo.sol.abi');
var bin = fs.readFileSync('./contracts/CatchBo.sol.bin');
var contractManager = new ContractManager(abi, bin);

var bookRouter = require('./src/routes/bookRoutes')(nav, contractManager);
var sellRouter = require('./src/routes/sellRoutes')(nav);
var adminRouter = require('./src/routes/adminRoutes')(nav);
var authRouter = require('./src/routes/authRoutes')(nav);
const buyRecordRouter = require('./src/routes/buyRecordRoutes')(nav);
const sellRecordRouter = require('./src/routes/sellRecordRoutes')(nav);
const mailerRouter = require('./src/routes/mailerRoutes')(nav);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'library', resave: true, saveUninitialized: true }));

require('./src/config/passport')(app);

app.set('views', './src/views');
// app.set('view engine', 'jade');
// var handlebars = require('express-handlebars');
// app.engine('.hbs', handlebars({extname: '.hbs'}));
app.set('view engine', 'ejs');

app.use('/Books', bookRouter);
app.use('/Sell', sellRouter);
app.use('/Admin', adminRouter);
app.use('/Auth', authRouter);
app.use('/buyRecord', buyRecordRouter);
app.use('/sellRecord', sellRecordRouter);
app.use('/mailer', mailerRouter);

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Hello from render',
        nav: nav
    });
});

app.get('/books', function (req, res) {
    res.send('Hello books');
});

app.listen(port, function (err) {
    console.log('running server on port ' + port);
});