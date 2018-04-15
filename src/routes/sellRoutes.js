var express = require('express');
var sellRouter = express.Router();
var mongodb = require('mongodb').MongoClient;

var router = function (nav) {

    sellRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            console.log(req.user);
            next();
        }
    });
    sellRouter.route('/')
        .get(function (req, res) {
            res.render('sell', {
                title: 'Books',
                nav: nav
            });
        });
    sellRouter.route('/submit')
        .post(function (req, res) {
            var url = 'mongodb://localhost:27017/libraryApp';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('books');
                collection.insertOne({
                        user: req.user.username,
                        name: req.body.name,
                        description: req.body.description,
                        inventory: req.body.inventory,
                        price: req.body.price,
                        sellerCoinbase: req.body.sellerCoinbase
                    },
                    function (err, results) {
                        if (err)
                            res.send('Failed due to ' + err);
                        else
                            res.send('SUCCESS ' + results + ' User:'+ req.user.username + ' Description:' + req.body.description + ' Inventory:' + req.body.inventory + ' Price:' + req.body.price + ' sellerCoinbase:' + req.body.sellerCoinbase);
                    });
                db.close();
            });
        });


    return sellRouter;
};
module.exports = router;