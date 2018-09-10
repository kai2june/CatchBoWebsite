pragma solidity ^0.4.23;

contract CatchBo {

    string public merchandiseName;
    string public description;
    uint public price;
    string public sellerName;
    address public sellerCoinbase;
    string public buyerName;
    address public buyerCoinbase;
    string public locker;

    event ReturnValue(address indexed _from, uint _value);
    event drawdownReturnValue(address indexed _from, uint _value);
    constructor(string _merchandiseName, string _description, uint _price, string _sellerName, address _sellerCoinbase, string _buyerName, address _buyerCoinbase, string _locker) public {
        merchandiseName = _merchandiseName;
        description = _description;
        price = _price;
        sellerName = _sellerName;
        sellerCoinbase = _sellerCoinbase;
        buyerName = _buyerName;
        buyerCoinbase = _buyerCoinbase;
        locker = _locker;
    }

    function payBill() public payable returns(uint){
        emit ReturnValue(msg.sender, msg.value);
        return msg.value;
    }

    function drawdown() public payable returns(uint){
        sellerCoinbase.transfer(address(this).balance);
        emit drawdownReturnValue(msg.sender, address(this).balance);
        return address(this).balance;
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    //if buyerCoinbase take out the stuff and then call this function, it makes no sense.
    function killMe() public {
        selfdestruct(buyerCoinbase);
    }
}

/* pragma solidity ^0.4.19;

contract CatchBo {
    uint public price;
    address public sellerCoinbase;
    address public buyerCoinbase;

    event ReturnValue(address indexed _from, uint _value);
    event drawdownReturnValue(address indexed _from, uint _value);
    function CatchBo(address _buyer,uint _fee) public {
        price = _fee;
        sellerCoinbase = msg.sender;
        buyerCoinbase = _buyer;
    }

    function payBill() public payable returns(uint){
        ReturnValue(msg.sender, msg.value);
        return msg.value;
    }

    function drawdown() public payable returns(uint){
        sellerCoinbase.transfer(this.balance);
        drawdownReturnValue(msg.sender, this.balance);
        return this.balance;
    }

    function getBalance() public view returns(uint){
        return this.balance;
    }

    //if buyerCoinbase take out the stuff and then call this function, it makes no sense.
    function killMe() public {
        selfdestruct(buyerCoinbase);
    }
} */
