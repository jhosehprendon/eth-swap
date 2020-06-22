pragma solidity ^0.5.0;
import './Token.sol';

contract EthSwap {
		string public name = 'EthSwap Instant Exchange';
    Token public token;
    uint public rate = 100;
    
    event TokenPurchased(
      address account,
      address token,
      uint amount,
      uint rate
    );

    constructor(Token _token) public {
      token = _token;

    }

    function buyTokens() public payable {
      uint tokenAmount = msg.value * rate;

      require(token.balanceOf(address(this)) >= tokenAmount, 'There is enough balance in the exchange to excecute the purchase');

      // Transfers tokens to the user
      token.transfer(msg.sender, tokenAmount);

      // Emit an event
      emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }
}