var express = require('express');
var bookRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;

var router = function (nav) {
    // var books = [
    //     {
    //         title: 'Chance to win',
    //         author: 'eason',
    //         genre: 'action',
    //         read: false
    //     },
    //     {
    //         title: 'My first love',
    //         author: 'dick',
    //         genre: 'sorrow',
    //         read: false
    //     },
    //     {
    //         title: 'Good night',
    //         author: 'hacker',
    //         genre: 'action',
    //         read: false
    //     },
    //     {
    //         title: 'Heterosexual',
    //         author: 'iverson',
    //         genre: 'sex',
    //         read: false
    //     },
    //     {
    //         title: 'Jack the reaper',
    //         author: 'iverson',
    //         genre: 'sorrow',
    //         read: false
    //     },
    //     {
    //         title: 'Bad boy',
    //         author: 'dick',
    //         genre: 'fiction',
    //         read: true
    //     },
    //     {
    //         title: 'King of the world',
    //         author: 'candy',
    //         genre: 'fiction',
    //         read: false
    //     },
    //     {
    //         title: 'A good day',
    //         author: 'iverson',
    //         genre: 'comedy',
    //         read: false
    //     }
    // ];

    bookRouter.use(function (req, res, next) {
        // if (!req.user) {
        //     res.redirect('/');
        // }
        next();
    });
    bookRouter.route('/')
        .get(function (req, res) {
            var url = 'mongodb://localhost:27017/libraryApp';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('books');
                collection.find({}).toArray(
                    function (err, results) {
                        res.render('bookListView', {
                            title: 'Books',
                            nav: nav,
                            books: results
                        });
                    });
            });

        });
    bookRouter.route('/:id')
        .get(function (req, res) {
            var id = new objectId(req.params.id);
            var url = 'mongodb://localhost:27017/libraryApp';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('books');

                collection.findOne({_id: id},
                    function (err, results) {
                        res.render('bookView', {
                            title: 'Books',
                            nav: nav,
                            book: results
                        });
                    });
            });
        });
    bookRouter.route('/:id/orderForm')
        .get(function (req, res) {
            var id = new objectId(req.params.id);
            var url = 'mongodb://localhost:27017/libraryApp';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('books');
                collection.findOne({_id: id},
                    function (err, results) {
                        if (results.inventory > 0) {
                            res.render('orderForm', {
                                title: 'Books',
                                nav: nav,
                                book: results
                            });
                            collection.update({_id: id}, {
                                title: results.title,
                                author: results.author,
                                genre: results.genre,
                                read: results.read,
                                inventory: results.inventory - 1
                            });
                        }
                        else
                            res.send('Failed due to inventory equals 0');
                    });
            });
        });
    bookRouter.route('/:id/orderForm/success')
        .post(function (req, res) {
            var id = req.params.id;
            var userName = req.body.userName;
            var password = req.body.password;
            var publicKey = req.body.publicKey;
            var lockerNumber = req.body.lockerNumber;

            var url = 'mongodb://localhost:27017/libraryApp';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('orders');
                collection.insert({userName: userName, publicKey: publicKey, lockerNumber: lockerNumber},function(err, results){
                    if(err)
                        console.log("WTF");
                    else
                        res.send('SUCCESS ' + '   USER: ' + userName + '   PASSWORD: ' + password + '  PUBLICKEY: ' + publicKey + '   LOCKERNUMBER: ' + lockerNumber);
                    db.close();
                });
            });
        });


    return bookRouter;
};
module.exports = router;