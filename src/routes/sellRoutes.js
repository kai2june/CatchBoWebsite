const express = require('express');
const sellRouter = express.Router();
const {MongoClient} = require('mongodb');

const router = function (nav) {

    sellRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            console.log(req.user);
            next();
        }
    });
    sellRouter.route('/')
        .get(function (req, res) {
            res.render('sell', {
                title: 'CatchBo Store',
                nav: nav
            });
        });
    sellRouter.route('/submit')
        .post(function (req, res) {
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';

            (async function sellMerchandise(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('books');
                    const merchandise = {
                        user: req.user.username,
                        name: req.body.name,
                        description: req.body.description,
                        inventory: req.body.inventory,
                        price: req.body.price,
                        sellerCoinbase: req.body.sellerCoinbase
                    };
                    const results = await coll.insertOne(merchandise);
                    res.render('sellSuccess',{
                        nav:nav,
                        merchandise: results.ops[0]
                    });
                    db.close();
                }catch(err){
                    console.log(err);
                };
            }());
        });


    return sellRouter;
};
module.exports = router;