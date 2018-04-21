pragma solidity ^0.4.19;

contract CatchBo {
    uint public fee;
    address public seller;
    address public buyer;
    mapping(uint => bool) public unlock;
    function CatchBo(address _buyer,uint _fee) public {
        fee = _fee;
        seller = msg.sender;
        buyer = _buyer;
    }

    function setFee(uint _fee) public {
        fee = _fee;
    }

    function setSeller(address _seller) public {
        seller = _seller;
    }

    function setBuyer(address _buyer) public {
        buyer = _buyer;
    }

    function payBill(uint locker) public payable {
        if( msg.value != fee ){
            unlock[locker] = false;
        }
        else{
            unlock[locker] = true;
        }
    }

    function drawdown() public {
        seller.transfer(this.balance);
    }

    function getBalance() public constant returns(uint){
        return this.balance;
    }

    //if buyer take out the stuff and then call this function, it makes no sense.
    function killMe() public {
        selfdestruct(buyer);
    }
}
