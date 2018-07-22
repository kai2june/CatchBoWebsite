const express = require('express');
const mailerRouter = express.Router();
const {MongoClient} = require('mongodb');

const router = function(nav){
    
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
            res.render('mailer', {
                nav: nav
            });
        });
    mailerRouter.route('/success')
        .post( (req,res) => {
            res.render( 'mailerSuccess', {
                nav: nav,
                locker: req.body.locker
            });
            const {locker} = req.body;
            console.log(locker);
            
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
    
            (async function mailerLocker(){
                try{
                    const client = await MongoClient.connect(url);
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
                                merchandiseArriveLocker: true,
                                moneyPaid: rlt.moneyPaid
                            });
                        }
                    }
                    db.close();
                }catch(err){
                    console.log(err);
                }
            }());
        });
    
    return mailerRouter;
};
module.exports = router;