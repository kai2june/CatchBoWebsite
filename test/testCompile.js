const ContractManager = require('../scm');
const fs = require('fs');
const chai = require('chai'), should = chai.should();
const mocha = require('mocha'), suite = mocha.suite, test = mocha.test;

suite('ContractManager (compile)', () => {
    context('when the input is a string', () => {

        test('should provide error messages if there are errors', () => {
            ContractManager.compile('xxx', function (err, result) {
                should.exist(err);
                should.exist(result);
            });
        });

        test('should not provide error if there is no error', () => {
            ContractManager.compile(fs.readFileSync('./contracts/MyData.sol').toString(), function (err, result) {
                should.not.exist(err);
                should.exist(result);
            });
        });
    });

    context('when the input is a file', () => {
        test('should generate abi and bin and should not provide err if there is no error', () => {
            ContractManager.compileFile('./contracts/MyData.sol', function (err, result) {
                //TODO: not complete, and need to be revised. Need to generate the sol file before the test
                should.not.exist(err);
                should.exist(result);
            });
        });
    });
});
