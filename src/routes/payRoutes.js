const express = require('express');
const {MongoClient} = require('mongodb');
const objectId = require('mongodb').ObjectID;
const Web3 = require('web3');

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
            (async function findAllUserOrders(){
                try{
                    const url = 'mongodb://localhost:27017';
                    const dbName = 'libraryApp';

                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('orders');
                    const currentUserOrders = await coll.find({buyerName: req.user.username, moneyPaid: true, buyerHasEverUnlockedLocker: false}).toArray();
                    res.render('unlockLocker', {
                        nav: nav,
                        currentUserOrders: currentUserOrders
                    });
                } catch(err) {
                    console.log(err);
                }
            }());
        })
        .post('/', (req,res) => {
            const id = new objectId(req.body.orderId);
            console.log(`orderId: ${req.body.orderId}`);
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
                        const rlt_updateBuyerHasEverUnlockedLocker = await coll.updateOne({_id: id}, {
                            merchandiseName: results_findSingleOrder.merchandiseName,
                            description: results_findSingleOrder.description,
                            price: results_findSingleOrder.price,
                            sellerName: results_findSingleOrder.sellerName,
                            sellerCoinbase: results_findSingleOrder.sellerCoinbase,
                            buyerName: results_findSingleOrder.buyerName,
                            buyerCoinbase: results_findSingleOrder.buyerCoinbase,
                            smartContractAddress: results_findSingleOrder.smartContractAddress,
                            locker: results_findSingleOrder.locker,
                            merchandiseArriveLocker: results_findSingleOrder.merchandiseArriveLocker,
                            moneyPaid: results_findSingleOrder.moneyPaid,
                            buyerHasEverUnlockedLocker: true
                        });
                        res.render('../../server/index', {
                            nav: nav
                        });
                    }
                }catch(err){
                    console.log(err);
                }
            }());
        });
    payRouter.route('/success')
        .post( (req,res) => {
            res.send('succccccccess');
        })
        .get( (req,res) => {
            res.render('../../server/index', {
                nav: nav
            });
        })


    return payRouter;
};
module.exports = router;