const express = require('express');
const payRouter = express.Router();

const router = function(nav){

    payRouter.get('/', (req,res) => {
        res.render('../../server/index');
    });

    return payRouter;
};
module.exports = router;