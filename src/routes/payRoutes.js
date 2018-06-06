const express = require('express');
const {MongoClient} = require('mongodb');
const payRouter = express.Router();

const router = function(nav){

    payRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            next();
        }
    });
    payRouter.get('/', (req,res) => {
        // (async function moneyPaid(){
        //     const url = 'mongodb://localhost:27017';
        //     const dbName = 'libraryApp';

        //     try{
        //         const client = await MongoClient.connect(url);
        //         const db = client.db(dbName);
        //         const coll = db.collection('orders');
        //         const results = await coll.find({

        //         });
        //     }catch(err){
        //         console.log(err);
        //     }
            
        // }());

        res.render('../../server/index');
    });

    return payRouter;
};
module.exports = router;