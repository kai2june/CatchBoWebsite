var express = require('express');
var bookRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var web3 = require('web3');
var compiler = require('solc');
var fs = require('fs');

var router = function (nav, contractManager) {

    bookRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            next();
        }
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
                var collection = db.collection('lockers');
                collection.findOne({state: 'empty'},
                    function (err, results) {
                        if (!results) {
                            res.send('There is no locker available');
                        }
                        else {
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
                        }
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
                        }
                        else
                            res.send('Failed due to inventory equals 0');
                    });
            });
        });
    bookRouter.route('/:id/orderForm/success')
        .post(function (req, res) {
            var id = new objectId(req.params.id);
            var url = 'mongodb://localhost:27017/libraryApp';
            var locker;

            mongodb.connect(url, function (err, db) {
                var collection = db.collection('lockers');
                collection.findOne({state: 'empty'},
                    function (err, results) {
                        collection.updateOne({_id: results._id}, {
                            num: results.num,
                            state: 'Non-empty'
                        });
                        locker = results.num;
                    });
            });
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('books');
                collection.findOne({_id: id},
                    function (err, results) {
                        collection.updateOne({_id: id}, {
                            user: results.user,
                            name: results.name,
                            description: results.description,
                            inventory: results.inventory - 1,
                            price: results.price,
                            sellerCoinbase: results.sellerCoinbase
                        });
                        contractManager.deploy(results.sellerCoinbase, req.body.buyerCoinbase, results.price,
                            function (contract) {
                                console.log('In bookRoutes.js contract.address: ' + contract.address);
                            });
                    });

            });
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('orders');
                collection.insertOne({
                    userName: req.user.username,
                    buyerCoinbase: req.body.buyerCoinbase
                }, function (err, results) {
                    if (err)
                        console.log("WTF");
                    else
                        res.send('SUCCESS ' + 'You are ' + req.user.username + ' buyerCoinbase:' + req.body.buyerCoinbase + ' Your locker:' + locker);
                });
                db.close();
            });

        });


    return bookRouter;
};
module.exports = router;