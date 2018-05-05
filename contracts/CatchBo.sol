pragma solidity ^0.4.19;

contract CatchBo {
    uint public fee;
    address public seller;
    address public buyer;

    event ReturnValue(address indexed _from, uint _value);
    event drawdownReturnValue(address indexed _from, uint _value);
    function CatchBo(address _buyer,uint _fee) public {
        fee = _fee;
        seller = msg.sender;
        buyer = _buyer;
    }

    function payBill() public payable returns(uint){
        ReturnValue(msg.sender, msg.value);
        return msg.value;
    }

    function drawdown() public payable returns(uint){
        seller.transfer(this.balance);
        drawdownReturnValue(msg.sender, this.balance);
        return this.balance;
    }

    function getBalance() public constant returns(uint){
        return this.balance;
    }

    //if buyer take out the stuff and then call this function, it makes no sense.
    function killMe() public {
        selfdestruct(buyer);
    }
}
