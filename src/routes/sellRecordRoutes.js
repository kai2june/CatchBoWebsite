const express = require('express');
const sellRecordRouter = express.Router();
const {MongoClient} = require('mongodb');

const router = function(nav){

    sellRecordRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            console.log(`3 ${req.user.username}`);
            next();
        }
    });
    sellRecordRouter.route('/')
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
                    const rlt = await coll.find({sellerName: username}).toArray();
                    console.log(`4 ${req.user.username}`);
                    res.send(rlt);
                    db.close();
                }catch(err){
                    console.log(err);
                }
            }());
    });

    return sellRecordRouter;
};
module.exports = router;