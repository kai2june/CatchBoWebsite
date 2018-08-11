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
            contractInstance.payBill({from: contractInstance.buyer(), value: contractInstance.fee()});
            contractInstance.drawdown({from: contractInstance.seller()});

            res.send(`fee:${contractInstance.fee()}, seller:${contractInstance.seller()}, buyer:${contractInstance.buyer()}, contractAddress:${contractInstance.address}, thisTransactionHash:${contractInstance.transactionHash}`);
        })

    return walletForCatchBoRouter;
};
module.exports = router;