const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const port = process.env.PORT || 1916;
const nav = [{Link: '/Books', Text: 'Buy Things'}, {Link: '/Sell', Text: 'Sell Things'}, {Link: '/buyRecord', Text: 'Buy Record'}, {Link: '/sellRecord', Text: 'Sell Record'}, {Link: '/mailer', Text: 'Mailman'}];
const ContractManager = require('./scm');
const fs = require('fs');


// ContractManager.compileFile('./contracts/CatchBo.sol', function (err, result) {
//     if (err) throw err;
//     console.log(result);
// });
const abi = fs.readFileSync('./contracts/CatchBo.sol.abi');
const bin = fs.readFileSync('./contracts/CatchBo.sol.bin');
const contractManager = new ContractManager(abi, bin);

const bookRouter = require('./src/routes/bookRoutes')(nav, contractManager);
const sellRouter = require('./src/routes/sellRoutes')(nav);
const adminRouter = require('./src/routes/adminRoutes')(nav);
const authRouter = require('./src/routes/authRoutes')(nav);
const buyRecordRouter = require('./src/routes/buyRecordRoutes')(nav);
const sellRecordRouter = require('./src/routes/sellRecordRoutes')(nav);
const mailerRouter = require('./src/routes/mailerRoutes')(nav);
const payRouter = require('./src/routes/payRoutes')(nav);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'library', resave: true, saveUninitialized: true }));

require('./src/config/passport')(app);

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use('/Books', bookRouter);
app.use('/Sell', sellRouter);
app.use('/Admin', adminRouter);
app.use('/Auth', authRouter);
app.use('/buyRecord', buyRecordRouter);
app.use('/sellRecord', sellRecordRouter);
app.use('/mailer', mailerRouter);
app.use('/pay', payRouter);

// 當有client連上server
io.on('connection', function(socket){
	socket.emit("server connecting",'hello gogoro')

	//監聽：還車
	socket.on('return gogoro', function(data){
		console.log(data);
		socket.emit('server reply','Lock!');
	})
})

app.get('/', function (req, res) {
    res.render('login', {
        title: 'Hello from render',
        nav: nav
    });
});

http.listen(port, function(){
	console.log(`listening on port ${port}`);
});
// app.listen(port, function (err) {
//     console.log('running server on port ' + port);
// });