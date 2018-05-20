var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
const socket = require('socket.io');
const server = require('http').Server(app);

var app = express();
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

const io = socket(server);
io.on('connection', function(socket){
    console.log('made socket connection', socket.id);
    socket.on('chat', function(data){
        io.sockets.emit('chat', data);
    });
});