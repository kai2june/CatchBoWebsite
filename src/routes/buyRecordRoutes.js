const express = require('express');
const buyRecordRouter = express.Router();
const {MongoClient} = require('mongodb');

const router = function(nav){

    buyRecordRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            console.log(`1 ${req.user.username}`);
            next();
        }
    });
    buyRecordRouter.route('/')
        .get( (req,res) => {
            const { username, password } = req.user;
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';

            (async function findOrder(){
                let client;
                try{
                    client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('orders');
                    const user = {
                        username
                    };
                    const rlt = await coll.find({buyerName: username}).toArray();
                    console.log(`2 ${req.user.username}`);
                    res.send(rlt);
                }catch(err){
                    console.log(err);
                }
            }());
    });

    return buyRecordRouter;
};
module.exports = router;