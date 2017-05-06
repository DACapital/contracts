pragma solidity ^0.4.4;
import "./zeppelin/token/StandardToken.sol";

// The DAC Token is a standard ERC20 token with 21 million units and 18 decimal places.
contract DacToken is StandardToken {
    string constant public name = "DA.Capital"; 
    string constant public symbol = "DAC";
    uint constant public decimals = 18;
    uint constant INITIAL_SUPPLY = 21000000 * 10**18;

    function DacToken() {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}
