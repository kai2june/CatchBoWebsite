const fs = require('fs');
const chai = require('chai'), should = chai.should();
const mocha = require('mocha'), suite = mocha.suite, test = mocha.test;

suite('ContractManager (deploy and findAt)', function () {

    let abi = fs.readFileSync('contracts/MyData.sol.abi');
    let bin = fs.readFileSync('contracts/MyData.sol.bin');
    let ContractManager = require('../scm/index');
    let contractManager = new ContractManager(abi, bin, '123');

    test('findAt (get)', () => {
        // TODO: not self contained
        let contract = contractManager.findAt('0x0bfbc4b5c2d20d6dcae96ad5d3cd661397c0b85b');
        should.exist(contract.get());
    });

    test('deploy', () => {
        contractManager.deploy(function (contract) {
            should.exist(contract.address);
        });
    });
});

//
// function testFindAtSet() {
//     let contract = contractManager.findAt('0x0bfbc4b5c2d20d6dcae96ad5d3cd661397c0b85b');
//     console.log(contract.set(2019));
// }
//


