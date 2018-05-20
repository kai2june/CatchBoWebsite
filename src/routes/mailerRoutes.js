const express = require('express');
const mailerRouter = express.Router();
const {MongoClient} = require('mongodb');

const router = function(){
    
    mailerRouter.use(function (req, res, next) {
        if (!req.user || (req.user.username != 'mailer') ) {
            res.redirect('/');
        }
        else {
            next();
        }
    });
    mailerRouter.route('/')
        .get( (req,res) => {
            res.render('mailer');
        });
    mailerRouter.route('/success')
        .post( (req,res) => {
            res.send(req.body);
            const {locker} = req.body;
            console.log(locker);
            
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
    
            (async function mailerLocker(){
                let client;
                try{
                    client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('orders');
                    for(let j in locker){
                        let rlt = await coll.findOne({locker: locker[j]});
                        if(rlt){
                            coll.updateOne({locker: rlt.locker}, {
                                merchandiseName: rlt.merchandiseName,
                                description: rlt.description,
                                price: rlt.price,
                                sellerName: rlt.sellerName,
                                sellerCoinbase: rlt.sellerCoinbase,
                                buyerName: rlt.buyerName,
                                buyerCoinbase: rlt.buyerCoinbase,
                                locker: rlt.locker,
                                merchandiseArriveLocker: true
                            });
                        }
                    }
                }catch(err){
                    console.log(err);
                }
            }());
        });
    
    return mailerRouter;
};
module.exports = router;