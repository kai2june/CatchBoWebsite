const express = require('express');
const sellRecordRouter = express.Router();

const router = function (nav) {

    sellRecordRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            next();
        }
    });
    sellRecordRouter.route('/')
        .get( (req, res) => {
        res.send('This is sell record.');
})

    return sellRecordRouter;
};
module.exports = router;