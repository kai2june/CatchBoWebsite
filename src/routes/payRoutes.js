const express = require('express');
const {MongoClient} = require('mongodb');
const objectId = require('mongodb').ObjectID;

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
            res.render('unlockLocker', {
                nav: nav
            });
        })
        .post('/', (req,res) => {
            const id = new objectId(req.body.orderId);
            (async function moneyPaid(){
                const url = 'mongodb://localhost:27017';
                const dbName = 'libraryApp';
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('orders');
                    const results_findSingleOrder = await coll.findOne({
                        _id: id
                    });
                    if(!results_findSingleOrder){
                        //const hint = `This is not a valid order _id\n or\n You chose wrong locker, your merchandise was placed in other locker, go to buyRecord to check.`;
                        const hint = `This is not a valid order _id\n`;
                        res.render('paySuccess', {
                            nav: nav,
                            hint: hint
                        });
                    }
                    else if (results_findSingleOrder.moneyPaid == false){
                        const hint = `You have not paid ether.\nAfter paying money, press f5 to refresh then click 解鎖!!!`;
                        res.render('paySuccess', {
                            nav: nav,
                            hint: hint    
                        });
                    }
                    else{
                        res.render('../../server/index', {
                            nav: nav
                        });
                    }
                }catch(err){
                    console.log(err);
                }
            }());
        });


    return payRouter;
};
module.exports = router;