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
    payRouter
        .get('/', (req,res) => {
            res.render('unlockLocker');
        })
        .post('/', (req,res) => {
            (async function moneyPaid(){
                const url = 'mongodb://localhost:27017';
                const dbName = 'libraryApp';

                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('orders');
                    const results_findSingleOrder = await coll.findOne({
                        buyerName: req.user.username, 
                        locker: req.body.locker
                    });
                    if(!results_findSingleOrder)
                        res.send(`You have not placed an order.\n or\n You chose wrong locker, your merchandise was placed in other locker, go to buyRecord to check.`);
                    else if (results_findSingleOrder.moneyPaid == false)
                        res.send(`You have not paid ether.\nAfter paying money, press f5 to refresh then click 解鎖!!!`);
                    else
                        res.render('../../server/index');
                }catch(err){
                    console.log(err);
                }
            }());
        });


    return payRouter;
};
module.exports = router;