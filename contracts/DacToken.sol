pragma solidity ^0.4.4;
import "./zeppelin/token/StandardToken.sol";

// The DAC Token is a standard ERC20 token with 21 million units and 18 decimal places.
contract DacToken is StandardToken {
    // Public variables
    string constant public name = "DA.Capital"; 
    string constant public symbol = "DAC";
    uint constant public decimals = 18;
    
    // Constants for creating 21 Million tokens of initial supply
    uint constant MILLION = 10 ** 6;
    uint constant BASE_UNITS = 10 ** decimals;    
    uint constant INITIAL_SUPPLY = 21 * MILLION * BASE_UNITS;

    function DacToken() {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}
