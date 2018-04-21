var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');

var app = express();
var port = process.env.PORT || 5000;
var nav = [{Link: '/Books', Text: 'Buy Things'}, {Link: '/Sell', Text: 'Sell Things'}];
var ContractManager = require('./scm');
var fs = require('fs');
// ContractManager.compileFile('./CatchBo.sol', function (err, result) {
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

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'library'}));

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

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Hello from render',
        nav: [{Link: '/Books', Text: 'Buy Things'},
            {Link: '/Sell', Text: 'Sell Things'}]
    });
});

app.get('/books', function (req, res) {
    res.send('Hello books');
});

app.listen(port, function (err) {
    console.log('running server on port ' + port);
});