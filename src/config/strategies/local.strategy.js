const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    {MongoClient} = require('mongodb');

module.exports = function () {
    passport.use(new LocalStrategy({
            usernameField: 'userName',
            passwordField: 'password'
        },
        function (username, password, done) {
            const url = 'mongodb://localhost:27017';
            const dbName = 'libraryApp';
            
            (async function loginUser(){
                try{
                    const client = await MongoClient.connect(url);
                    const db = client.db(dbName);
                    const coll = db.collection('users');
                    const results = await coll.findOne({username: username});
                    if(!results){
                        console.log('No this user');
                        done(null, false, {message: 'No this user'});
                    }else if(results.password === password){
                        done(null, results);
                    }else{
                        done(null, false, {message: 'Bad password'});
                    }
                    db.close();
                }catch(err){
                    console.log(err);
                };
            }());
        }));
};