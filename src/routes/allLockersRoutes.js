const express = require('express');
const allLockersRouter = express.Router();
const {MongoClient} = require('mongodb');

const router = function (nav) {

    allLockersRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            console.log(req.user);
            next();
        }
    });
    allLockersRouter.route('/')
        .get(function (req, res) {
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';

            (async function findLockersStates(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('lockers');
                    const results = await coll.find().toArray();
                    res.render('allLockers', {
                        nav: nav,
                        locker: results
                    })
                    db.close();
                }catch(err){
                    console.log(err);
                };
            }());
        });


    return allLockersRouter;
};
module.exports = router;