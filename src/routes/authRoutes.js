const express = require('express');
const authRouter = express.Router();
const {MongoClient} = require('mongodb');
const passport = require('passport');

const router = function (nav) {
    authRouter.route('/signUp')
        .post(function (req, res) {
            console.log(req.body);
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
            
            (async function signUp(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('users');
                    const user = {
                        username: req.body.userName,
                        password: req.body.password
                    };
                    const results = await coll.insertOne(user);
                    req.login( results.ops[0], () => {
                        res.redirect('/auth/profile');
                    });
                    db.close();
                }catch(err){
                    console.log(err);
                };
            }());
        });
    authRouter.route('/signIn')
        .post(passport.authenticate('local', {
            failureRedirect: '/'
        }), function (req, res) {
            res.redirect('/auth/profile');
        });
    authRouter.route('/profile')
        .all(function(req,res,next){
            if(!req.user){
                res.redirect('/');
            }
            next();
        })
        .get(function (req, res) {
            res.json(req.user);
        });
    return authRouter;
};
module.exports = router;