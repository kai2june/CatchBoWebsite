const express = require('express');
const mailerRouter = express.Router();
const {MongoClient} = require('mongodb');
const objectId = require('mongodb').ObjectID;

const router = function(nav){
    
    mailerRouter.use(function (req, res, next) {
        if (!req.user || (req.user.username != 'nccu_delivery_company') ) {
            res.redirect('/');
        }
        else {
            next();
        }
    });
    mailerRouter.route('/')
        .get( (req,res) => {
            res.render('mailer', {
                nav: nav
            });
        });
    mailerRouter.route('/success')
        .post( (req,res) => {
            // res.render( 'mailerSuccess', {
            //     nav: nav,
            //     locker: req.body.locker
            // });
            const {locker} = req.body;
            console.log(typeof(locker));
            
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
    
            (async function mailerLocker(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('orders');
                    
                    let rlt_findManyOrders = [];
                    if( typeof(req.body.locker) == 'string' ){
                        rlt_findManyOrders = await coll.aggregate([ {$match: {locker: req.body.locker} }, { $sort: {_id: -1} }]).toArray();
                        await coll.updateOne({_id: rlt_findManyOrders[0]._id},{
                            merchandiseName: rlt_findManyOrders[0].merchandiseName,
                            description: rlt_findManyOrders[0].description,
                            price: rlt_findManyOrders[0].price,
                            sellerName: rlt_findManyOrders[0].sellerName,
                            sellerCoinbase: rlt_findManyOrders[0].sellerCoinbase,
                            buyerName: rlt_findManyOrders[0].buyerName,
                            buyerCoinbase: rlt_findManyOrders[0].buyerCoinbase,
                            locker: rlt_findManyOrders[0].locker,
                            merchandiseArriveLocker: true,
                            moneyPaid: rlt_findManyOrders[0].moneyPaid
                        })
                    } else{
                        let query_arr = [];
                        for(let i=0; i< req.body.locker.length; i++){
                            let query = {
                                locker: req.body.locker[i]
                            };
                            query_arr[i] = query;
                        }
                        console.log(`query_arr=${query_arr}`);
                        rlt_findManyOrders = await coll.aggregate([ { $match: {$or: query_arr} }, { $sort: {_id: -1} }]).toArray();

                        if(rlt_findManyOrders[0])
                            console.log('5    ' + rlt_findManyOrders[0].merchandiseName);
                        if(rlt_findManyOrders[1])
                            console.log('6    ' + rlt_findManyOrders[1].merchandiseName);

                        let already_find = {"1": false, "2": false, "3": false, "4": false, "5": false, "6": false, "7": false, "8": false};
                        for(let i=0; i < rlt_findManyOrders.length; i++){
                            let locker = rlt_findManyOrders[i].locker;
                            if( already_find[locker] == false ){
                                await coll.updateOne({_id: rlt_findManyOrders[i]._id}, {
                                    merchandiseName: rlt_findManyOrders[i].merchandiseName,
                                    description: rlt_findManyOrders[i].description,
                                    price: rlt_findManyOrders[i].price,
                                    sellerName: rlt_findManyOrders[i].sellerName,
                                    sellerCoinbase: rlt_findManyOrders[i].sellerCoinbase,
                                    buyerName: rlt_findManyOrders[i].buyerName,
                                    buyerCoinbase: rlt_findManyOrders[i].buyerCoinbase,
                                    locker: rlt_findManyOrders[i].locker,
                                    merchandiseArriveLocker: true,
                                    moneyPaid: rlt_findManyOrders[i].moneyPaid
                                });
                            }
                            already_find[locker] = true;
                        }
                    }

                    res.render('mailerSuccess', {
                        nav: nav,
                        locker: req.body.locker,
                        order: rlt_findManyOrders
                    });
                    db.close();
                }catch(err){
                    console.log(err);
                }
            }());
        });
    
    return mailerRouter;
};
module.exports = router;



// let rlt_findManyCourses = [];
// if(typeof(req.body.department) == 'string')
//     rlt_findManyCourses = await coll.find({department: req.body.department, degree: req.body.degree}).toArray();
// else{
//     let query_arr = [];
//     for(let i=0; i< req.body.department.length; i++){
//         let query = {
//             department: req.body.department[i], 
//             degree: req.body.degree[i]
//         };
//         query_arr[i] = query;
//     }
//     console.log(`query_arr=${query_arr}`);
//     rlt_findManyCourses = await coll.find({ $or: query_arr }).toArray();
// }