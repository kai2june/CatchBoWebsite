const express = require('express');
const bookRouter = express.Router();
const {MongoClient} = require('mongodb');
const objectId = require('mongodb').ObjectID;
const web3 = require('web3');
const compiler = require('solc');
const fs = require('fs');
const client = require('socket.io');

const url = 'mongodb://localhost:27017';
const dbName = 'libraryApp';

const router = function (nav, contractManager) {

    bookRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            next();
        }
    });
    bookRouter.route('/')
        .get(function (req, res) {
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
            (async function findAllBook(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('books');
                    const results = await coll.find({}).toArray();
                    res.render('bookListView', {
                        title: 'Merchandise',
                        nav: nav,
                        books: results
                    });
                    db.close();
                }catch(error){
                    if(error)
                        console.log(error);
                }
            }());
        });
    bookRouter.route('/:id')
        .get(function (req, res) {
            const id = new objectId(req.params.id);
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
            (async function findSingleBook(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('lockers');
                    const results = await coll.findOne({state: 'can_be_assigned'});
                    db.close();
                    if(!results){
                        res.render('noLockerAvailable', {
                            nav: nav
                        });
                    }else{
                        const client = await MongoClient.connect(url);
                        const db = client.db(dbName);
                        const coll = db.collection('books');
                        const results = await coll.findOne({_id: id});
                        res.render('bookView', {
                            title: 'Merchandise',
                            nav: nav,
                            book: results
                        });
                        db.close();
                    }
                }catch(err){
                    console.log(err);
                }
            }());
        });
    bookRouter.route('/:id/orderForm')
        .get(function (req, res) {
            const id = new objectId(req.params.id);
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
            (async function buyForm(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('books');
                    const results = await coll.findOne({_id: id});
                    if(results.inventory > 0){
                        res.render('orderForm', {
                            title: 'Merchandise',
                            nav: nav,
                            book: results
                        });
                    }else{
                        res.render('noInventory', {
                            nav: nav
                        });
                    }
                    db.close();
                }catch(err){
                    console.log(err);
                }
            }());
        });
    bookRouter.route('/:id/orderForm/success')
        .post(function (req, res) {
            const id = new objectId(req.params.id);


            (async function placeOrder(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll_lockers = db.collection('lockers');
                    const results_findEmptyLocker = await coll_lockers.findOne({state: 'can_be_assigned'});
                    // if(!results_findEmptyLocker)
                    //     console.log('No emptyyyyyyyyyyy locker');
                    const results_updateSingleLocker = await coll_lockers.updateOne({_id: results_findEmptyLocker._id},{
                        num: results_findEmptyLocker.num,
                        state: 'already_assigned',
                        lockedORunlocked: results_findEmptyLocker.lockedORunlocked
                    });
                    // db.close();
                    const coll_books = db.collection('books');
                    const results_findSingleBook = await coll_books.findOne({_id: id}); 
                    const results_updateSingleBook = await coll_books.updateOne({_id: id}, {
                        user: results_findSingleBook.user,
                        name: results_findSingleBook.name,
                        description: results_findSingleBook.description,
                        inventory: results_findSingleBook.inventory - 1,
                        price: results_findSingleBook.price,
                        sellerCoinbase: results_findSingleBook.sellerCoinbase
                    });
                    // db.close();
                    const coll_orders = db.collection('orders');
                    const rlt_insertOneOrder = await coll_orders.insertOne({
                        merchandiseName: results_findSingleBook.name,
                        description: results_findSingleBook.description,
                        price: results_findSingleBook.price,
                        sellerName: results_findSingleBook.user,
                        sellerCoinbase: results_findSingleBook.sellerCoinbase,
                        buyerName: req.user.username,
                        buyerCoinbase: req.body.buyerCoinbase,
                        smartContractAddress: null,
                        locker: results_findEmptyLocker.num,
                        merchandiseArriveLocker: false,
                        moneyPaid: false,
                        buyerHasEverUnlockedLocker: false
                    });
                    //console.log(rlt_insertOneOrder.ops[0]._id.toString());
                    //db.close();

                    contractManager.deploy(rlt_insertOneOrder.ops[0]._id.toString(), results_findSingleBook.name, results_findSingleBook.description, results_findSingleBook.price, results_findSingleBook.user, results_findSingleBook.sellerCoinbase, req.user.username, req.body.buyerCoinbase, results_findEmptyLocker.num,
                        function (address, abi, rlt_web3) {
                            // console.log(`In bookRoutes.js contract.address=${address}`);
                            console.log(`Order information:
                            _id: ${rlt_insertOneOrder.ops[0]._id},
                            merchandiseName: ${results_findSingleBook.name},
                            description: ${results_findSingleBook.description},
                            price: ${results_findSingleBook.price},
                            sellerName: ${results_findSingleBook.user},
                            sellerCoinbase: ${results_findSingleBook.sellerCoinbase},
                            buyerName: ${req.user.username},
                            buyerCoinbase: ${req.body.buyerCoinbase},
                            smartContractAddress: ${address},
                            locker: ${results_findEmptyLocker.num},
                            merchandiseArriveLocker: false,
                            moneyPaid: false,
                            buyerHasEverUnlockedLocker: false`);

                            (async function patchSmartContractAddress(){
                                const client = await MongoClient.connect(url);
                                const db = client.db(dbName);
                                const coll_orders = db.collection('orders');       
                                const results_insertSingleOrder = await coll_orders.updateOne({_id: rlt_insertOneOrder.ops[0]._id}, {
                                    merchandiseName: rlt_insertOneOrder.ops[0].merchandiseName,
                                    description: rlt_insertOneOrder.ops[0].description,
                                    price: rlt_insertOneOrder.ops[0].price,
                                    sellerName: rlt_insertOneOrder.ops[0].sellerName,
                                    sellerCoinbase: rlt_insertOneOrder.ops[0].sellerCoinbase,
                                    buyerName: rlt_insertOneOrder.ops[0].buyerName,
                                    buyerCoinbase: rlt_insertOneOrder.ops[0].buyerCoinbase,
                                    smartContractAddress: address,
                                    locker: rlt_insertOneOrder.ops[0].locker,
                                    merchandiseArriveLocker: rlt_insertOneOrder.ops[0].merchandiseArriveLocker,
                                    moneyPaid: rlt_insertOneOrder.ops[0].moneyPaid,
                                    buyerHasEverUnlockedLocker: rlt_insertOneOrder.ops[0].buyerHasEverUnlockedLocker
                                });
                            }());

                            const passwordDefault = "nccutest";
                            const contractInstance = rlt_web3.eth.contract(abi).at(address);
                            console.log('==============================Deployed!!===============================');
                            console.log(`Smart contract address: ${address}`);
                            console.log('Merchandise price: ' + rlt_web3.fromWei(contractInstance.price(), "ether") + ' eth');
                            console.log('=============================================');
                            console.log('Before buyer payBill():');
                            console.log('Contract balance is now: ' + rlt_web3.fromWei(contractInstance.getBalance(), "ether") + ' eth');
                            console.log('Buyer coinbase is now: ' + rlt_web3.fromWei(rlt_web3.eth.getBalance(rlt_insertOneOrder.ops[0].buyerCoinbase), "ether") + ' eth');
                            console.log('Seller coinbase is now: ' + rlt_web3.fromWei(rlt_web3.eth.getBalance(rlt_insertOneOrder.ops[0].sellerCoinbase), "ether") + ' eth');
                            // console.log('Seller\'s coinbase: ' + contractInstance.sellerCoinbase());
                            // console.log('Buyer\'s coinbase: ' + contractInstance.buyerCoinbase());
                            const payBillEvent = contractInstance.ReturnValue({_from: req.body.buyerCoinbase});
                            const drawdownEvent = contractInstance.drawdownReturnValue({_from: req.body.sellerCoinbase});
                            res.redirect('/walletForCatchBo');
                            
                            payBillEvent.watch(function(err, result) {
                                if (err) {
                                    // console.log(`payBillWatch error: ${err}`);
                                } else {
                                    // (async function moneyPaid(){
                                    //     const url = 'mongodb://localhost:27017';
                                    //     const dbName = 'libraryApp';
                                    //     try{
                                    //         console.log(`${req.user.username} has paid ether.`)
                                    //     }catch(err){
                                    //         console.log(err);
                                    //     }
                                    // }());

                                    console.log('=============================================');
                                    // console.log(`Smart contract address: ${address}`);
                                    console.log('BUYER paid: ' + rlt_web3.fromWei(result.args._value, "ether") + ' eth');
                                    console.log('=============================================');
                                    console.log('After buyer payBill(), Before seller drawdown():');
                                    // console.log(`Smart contract address: ${address}`);
                                    console.log('Contract balance is now: ' + rlt_web3.fromWei(contractInstance.getBalance(), "ether") + ' eth');
                                    console.log('Buyer coinbase is now: ' + rlt_web3.fromWei(rlt_web3.eth.getBalance(rlt_insertOneOrder.ops[0].buyerCoinbase), "ether") + ' eth');
                                    console.log('Seller coinbase is now: ' + rlt_web3.fromWei(rlt_web3.eth.getBalance(rlt_insertOneOrder.ops[0].sellerCoinbase), "ether") + ' eth');
                                    payBillEvent.stopWatching();
                                }
                            });
                            drawdownEvent.watch(function(e, rlt){
                                if(e){
                                    // console.log(`drawdownWatch error: ${e}`);
                                }else{
                                    console.log('=============================================');
                                    console.log('After seller drawdown():');
                                    // console.log(`Smart contract address: ${address}`);
                                    // console.log('Contract balance is now (getBalance()): ' + rlt_web3.fromWei(contractInstance.getBalance(), "ether") + ' eth');
                                    // console.log('Contract balance is now (event): ' + rlt_web3.fromWei(rlt.args._value, "ether") + ' eth')
                                    console.log('Contract balance is now: ' + rlt_web3.fromWei(rlt.args._value, "ether") + ' eth')
                                    console.log('Buyer coinbase is now: ' + rlt_web3.fromWei(rlt_web3.eth.getBalance(rlt_insertOneOrder.ops[0].buyerCoinbase), "ether") + ' eth');
                                    console.log('Seller coinbase is now: ' + rlt_web3.fromWei(rlt_web3.eth.getBalance(rlt_insertOneOrder.ops[0].sellerCoinbase), "ether") + ' eth');
                                    console.log('================================Done!!=================================');
                                    drawdownEvent.stopWatching();
                                }
                            });

                            // contractInstance.payBill({from: req.body.buyerCoinbase, value: rlt_web3.toWei(results_findSingleBook.price, "ether")});
                            // contractInstance.drawdown({from: results_findSingleBook.sellerCoinbase});
                        });

                }catch(err){
                    if(err)
                        console.log(err);
                };
            }());
        });


    return bookRouter;
};
module.exports = router;