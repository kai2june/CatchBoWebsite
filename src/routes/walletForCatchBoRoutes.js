const express = require('express');
const {MongoClient} = require('mongodb');
const Web3 = require('web3');

const walletForCatchBoRouter = express.Router();


const router = function(nav, contractManager){

    walletForCatchBoRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            next();
        }
    });
    walletForCatchBoRouter.route('/')
        .get( (req,res) => {
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';

            (async function findAllSmartContractAddress(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('orders');
                    const currentUserOrders = await coll.find({buyerName: req.user.username, moneyPaid: false}).toArray();
                    res.render('walletForCatchBo', {
                        nav: nav,
                        currentUserOrders: currentUserOrders
                    })
                } catch(err){
                    console.log(err);
                }
            }());
    });
    walletForCatchBoRouter.route('/success')
        .post( (req, res) => {
            console.log(`smartContractAddress: ${req.body.smartContractAddress}`)
            const httpProviderDefault = 'http://localhost:8545';
            this.web3 = new Web3(new Web3.providers.HttpProvider(httpProviderDefault));
            this.web3.personal.unlockAccount(req.body.coinbase, req.body.passphrase);
            const contractInstance = contractManager.newContractInstance(req.body.smartContractAddress);
            // console.log(`contractInstance.smartContractAddress = ${contractInstance.smartContractAddress}`);
            (async function payBill_drawdown(){
                await contractInstance.payBill({from: contractInstance.buyerCoinbase(), value: contractInstance.price()});
                await contractInstance.drawdown({from: contractInstance.sellerCoinbase()});

                const url = 'mongodb://localhost:27017';
                const dbName = 'libraryApp';
                const client = await MongoClient.connect(url);
                const db = client.db(dbName);
                const coll = db.collection('orders');
                const rlt_findBySmartContractAddress = await coll.findOne({smartContractAddress: req.body.smartContractAddress});
                const rlt_updateBySmartContractAddress = await coll.updateOne({smartContractAddress: req.body.smartContractAddress}, {
                    merchandiseName: rlt_findBySmartContractAddress.merchandiseName,
                    description: rlt_findBySmartContractAddress.description,
                    price: rlt_findBySmartContractAddress.price,
                    sellerName: rlt_findBySmartContractAddress.sellerName,
                    sellerCoinbase: rlt_findBySmartContractAddress.sellerCoinbase,
                    buyerName: rlt_findBySmartContractAddress.buyerName,
                    buyerCoinbase: rlt_findBySmartContractAddress.buyerCoinbase,
                    smartContractAddress: rlt_findBySmartContractAddress.smartContractAddress,
                    locker: rlt_findBySmartContractAddress.locker,
                    merchandiseArriveLocker: rlt_findBySmartContractAddress.merchandiseArriveLocker,
                    moneyPaid: true,
                    buyerHasEverUnlockedLocker: rlt_findBySmartContractAddress.buyerHasEverUnlockedLocker 
                });
                res.render('walletForCatchBoSuccess',{
                    nav: nav,
                    contractInstance: contractInstance
                });
            }());
        });

    return walletForCatchBoRouter;
};
module.exports = router;