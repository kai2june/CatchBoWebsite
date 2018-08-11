const express = require('express');
const {MongoClient} = require('mongodb');
const Web3 = require('web3');

const walletForCatchBoRouter = express.Router();


const router = function(nav, contractManager){

    walletForCatchBoRouter.use(function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            next();
        }
    });
    walletForCatchBoRouter.route('/')
        .get( (req,res) => {
            res.render('walletForCatchBo', {
                nav: nav
            })
    });
    walletForCatchBoRouter.route('/success')
        .post( (req, res) => {
            const httpProviderDefault = 'http://localhost:8545';
            this.web3 = new Web3(new Web3.providers.HttpProvider(httpProviderDefault));
            this.web3.personal.unlockAccount(req.body.coinbase, req.body.passphrase);
            const contractInstance = contractManager.contractInstance;
            (async function payBill_drawdown(){
                await contractInstance.payBill({from: contractInstance.buyer(), value: contractInstance.fee()});
                await contractInstance.drawdown({from: contractInstance.seller()});
            }())

            res.render('walletForCatchBoSuccess',{
                    nav: nav,
                    contractInstance: contractInstance
                });
        })

    return walletForCatchBoRouter;
};
module.exports = router;