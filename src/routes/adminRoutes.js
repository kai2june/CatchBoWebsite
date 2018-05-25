const express = require('express');
const adminRouter = express.Router();
const {MongoClient} = require('mongodb');

const router = function (nav) {

    const lockers = [
        {num: '1', state: 'empty'},
        {num: '2', state: 'empty'},
        {num: '3', state: 'empty'},
        {num: '4', state: 'empty'},
        {num: '5', state: 'empty'},
        {num: '6', state: 'empty'},
        {num: '7', state: 'empty'},
        {num: '8', state: 'empty'}
    ];
    adminRouter.route('/resetLockers')
        .all(function(req,res,next){
            if(!req.user)
                res.redirect('/');
            else
                next();
        })
        .get(function (req, res) {
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
            
            (async function resetLockers(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('lockers');
                    const results = await coll.remove({});
                    const results2 = await coll.insertMany(lockers);
                    res.send(results2);
                    db.close();
                }catch(err){
                    console.log(err);
                }
            }());
        });

    return adminRouter;
};
module.exports = router;