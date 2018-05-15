const express = require('express');
const buyRecordRouter = express.Router();

const router = function(nav){

    buyRecordRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            next();
        }
    });
    buyRecordRouter.route('/')
        .get( (req,res) => {
            res.send('This is buy record.');
    })

    return buyRecordRouter;
};
module.exports = router;