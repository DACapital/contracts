pragma solidity ^0.4.8;
import "./zeppelin/token/ERC20.sol";
import "./zeppelin/token/StandardToken.sol";
import './DacHubClient.sol';

// The DAC Token is a standard ERC20 token with 21 million units and 18 decimal places.
contract Fund is StandardToken, DacHubClient {    
    
    // These are the states that a fund can be in
    uint constant public STATE_PENDING = 0;
    uint constant public STATE_ACTIVE = 1;
    uint constant public STATE_CLOSED = 2;

    // Public variables
    string public name = ""; 
    string public symbol = "";
    uint constant public decimals = 18;
    uint public fundState = 0;
    address public fundCreator;

    // Constants for creating 1 Million tokens of initial supply
    uint constant MILLION = 10 ** 6;
    uint constant BASE_UNITS = 10 ** decimals;    
    uint constant INITIAL_SUPPLY = 1 * MILLION * BASE_UNITS;

    // Structure for holding details about an underlying asset token
    struct Asset {
        address tokenContract;
        string symbol;
        uint balance;
    }

    // Mapping of asset token addresses to Asset structs
    mapping(address => Asset) assetTokens;

    // Constructor
    function Fund(DacHub _dacHub, string _name, string _symbol, address _fundCreator) {

        // Set the total supply and the initial balance
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;

        // Save off the values
        dacHub = _dacHub;
        name = _name;
        symbol = _symbol;
        fundCreator = _fundCreator;
    }

    // Override the base transfer call to make sure the address can transfer token.
    function transfer(address _to, uint _value){
        
        // If the fund is not active, do not allow transfers
        if(fundState != STATE_ACTIVE){
            throw;
        }

        super.transfer(_to, _value);
    }

    // Override the base transferFrom call to make sure the address can transfer token.
    function transferFrom(address from, address to, uint value){
        
        // If the fund is not active, do not allow transfers
        if(fundState != STATE_ACTIVE){
            throw;
        }

        super.transferFrom(from, to, value);
    }

    // Allow the fund creator to add an asset token into the fund
    function addAssetToken(address tokenContract, string symbol, uint balance){

        // Restrict this to fund owner
        if(msg.sender != fundCreator){
            throw;
        }

        // Get the existing asset token struct if it exists
        Asset incomingAsset = assetTokens[tokenContract];

        // Check to see if it already exists
        if(incomingAsset.tokenContract == 0){
            // If it doesn't exist, create a new one
            assetTokens[tokenContract] = new Asset(tokenContract, symbol, balance);
        } else {
            // It already exists, so just update the balance
            assetTokens[tokenContract].balance += balance;
        }

        // Transfer in the token
        ERC20 token = ERC20(tokenContract);
        token.transferFrom(msg.sender, this, proposalFee);
    }
}