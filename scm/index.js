const fs = require('fs');
const Web3 = require('web3');
const compiler = require('solc');
const passwordDefault = 'nccutest';
const httpProviderDefault = 'http://localhost:8545';

let SolCompiler = {
    compile: function (code, callback) {
        let result = compiler.compile(code, 1);

        if (callback)
            callback(result.errors, result);
    },
    compileFile: function (sourcePath, callback) {

        this.compile(fs.readFileSync(sourcePath).toString(), function (err, result) {

            for (let contractName in result.contracts) {
                fs.writeFileSync(sourcePath + '.abi', result.contracts[contractName].interface);
                fs.writeFileSync(sourcePath + '.bin', result.contracts[contractName].bytecode);
            }
            if (callback)
                callback(result.errors, result);
        });
    }
};

class ContractManager {

    constructor(abi, bytecode, accountPassword) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(httpProviderDefault));
        let password = accountPassword;
        if (!password) password = passwordDefault;
        this.account = this.web3.eth.accounts[0];
        this.web3.personal.unlockAccount(this.account, password);
        this.abi = JSON.parse(abi);
        this.bytecode = bytecode;
    }

    deploy(sellerCoinbase, buyerCoinbase, fee, callback) {
        let c = this.web3.eth.contract(this.abi);
        let that = this;
        this.web3.personal.unlockAccount(sellerCoinbase, "nccutest");
        c.new(buyerCoinbase, this.web3.toWei(fee, "ether"),
            {
                from: sellerCoinbase,
                data: '0x' + this.bytecode,
                gas: '4700000'
            }, function (e, contract) {
                if (e) throw e;
                if (contract)
                    console.log("Contract transaction send: Transaction Hash: " + contract.transactionHash+" waiting to be mined...");
                if (contract && contract.address) {
                    console.log('Contract mined... that.account: '+ that.account + ' contract.address: '+ contract.address + ' contract: ' + contract);
                    callback(new Contract(that.account, contract.address, contract));
                }
            });
    }

    findAt(address) {
        let c = this.web3.eth.contract(this.abi);
        return new Contract(this.account, address, c.at(address));
    }

    static compile(code, callback) {
        let result = compiler.compile(code, 1);

        if (callback)
            callback(result.errors, result);
    }

    static compileFile(sourcePath, callback) {

        this.compile(fs.readFileSync(sourcePath).toString(), function (err, result) {

            for (let contractName in result.contracts) {
                fs.writeFileSync(sourcePath + '.abi', result.contracts[contractName].interface);
                fs.writeFileSync(sourcePath + '.bin', result.contracts[contractName].bytecode);
            }
            if (callback)
                callback(result.errors, result);
        });
    }
}

class Contract {
    constructor(account, address, contractInfo) {
        this.contractInfo = contractInfo;
        this.address = address;
        this.account = account;
        for (let key in contractInfo) {
            if (typeof contractInfo[key] === 'function') {
                this[key] = function (...args) {
                    return this.call(key, args);
                }
            }
        }
    }

    getContractInfo() {
        return this.contractInfo;
    }

    call(name, args, gas) {
        if (!args) args = [];
        if (!gas) gas = 123123;
        args.push({from: this.account, gas: gas});
        return this.contractInfo[name].apply(this.contractInfo, args);
    }
}

module.exports = ContractManager;


