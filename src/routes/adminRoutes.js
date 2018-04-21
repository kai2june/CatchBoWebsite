var express = require('express');
var adminRouter = express.Router();
var mongodb = require('mongodb').MongoClient;

// var books = [
//     {
//         title: 'Chance to win',
//         author: 'eason',
//         genre: 'action',
//         inventory: 3,
//         read: false
//     },
//     {
//         title: 'My first love',
//         author: 'dick',
//         genre: 'sorrow',
//         inventory: 3,
//         read: false
//     },
//     {
//         title: 'Good night',
//         author: 'hacker',
//         genre: 'action',
//         inventory: 3,
//         read: false
//     },
//     {
//         title: 'Heterosexual',
//         author: 'iverson',
//         genre: 'sex',
//         inventory: 3,
//         read: false
//     },
//     {
//         title: 'Jack the reaper',
//         author: 'iverson',
//         genre: 'sorrow',
//         inventory: 3,
//         read: false
//     },
//     {
//         title: 'Bad boy',
//         author: 'dick',
//         genre: 'fiction',
//         inventory: 3,
//         read: true
//     },
//     {
//         title: 'King of the world',
//         author: 'candy',
//         genre: 'fiction',
//         inventory: 3,
//         read: false
//     },
//     {
//         title: 'A good day',
//         author: 'iverson',
//         genre: 'comedy',
//         inventory: 3,
//         read: false
//     }
// ];

var router = function (nav) {

    var lockers = [
        {num: 1, state: 'empty'},
        {num: 2, state: 'empty'},
        {num: 3, state: 'empty'},
        {num: 4, state: 'empty'},
        {num: 5, state: 'empty'},
        {num: 6, state: 'empty'},
        {num: 7, state: 'empty'},
        {num: 8, state: 'empty'}
    ];
    adminRouter.route('/resetLockers')
        .all(function(req,res,next){
            if(!req.user)
                res.redirect('/');
            else
                next();
        })
        .get(function (req, res) {
            var url = 'mongodb://localhost:27017/libraryApp';
            mongodb.connect(url, function (err, db) {
                var collection = db.collection('lockers');
                collection.remove({});
                collection.insertMany(lockers, function(err,results){
                    res.send(results);
                });
                db.close();
            });
        });

    return adminRouter;
};
module.exports = router;