pragma solidity ^0.4.8;
import "./zeppelin/token/StandardToken.sol";
import './ITransferRegulator.sol';
import "./DacHub.sol";
import './DacHubClient.sol';

// The DAC Token is a standard ERC20 token with 21 million units and 18 decimal places.
contract DacToken is StandardToken, DacHubClient {
    // Public variables
    string constant public name = "DA.Capital"; 
    string constant public symbol = "DAC";
    uint constant public decimals = 18;
    
    // Constants for creating 21 Million tokens of initial supply
    uint constant MILLION = 10 ** 6;
    uint constant BASE_UNITS = 10 ** decimals;    
    uint constant INITIAL_SUPPLY = 21 * MILLION * BASE_UNITS;

    function DacToken(DacHub _dacHub) {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;

        // Save off the hub
        dacHub = _dacHub;
    }

    // Override the base transfer call to make sure the address can transfer token.
    function transfer(address _to, uint _value){
        // Get the transfer regulator contract from the hub
        ITransferRegulator transferRegulator = ITransferRegulator(getHubContractAddress(DAC_TRANSFER_REGULATOR));

        // Check to make sure the transfer is allowed
        if(!transferRegulator.allowTransfer(msg.sender)){
            throw;
        }

        super.transfer(_to, _value);
    }

    // Override the base transferFrom call to make sure the address can transfer token.
    function transferFrom(address from, address to, uint value){
        // Get the transfer regulator contract from the hub
        ITransferRegulator transferRegulator = ITransferRegulator(getHubContractAddress(DAC_TRANSFER_REGULATOR));
        
        // Check to make sure the transfer is allowed
        if(!transferRegulator.allowTransfer(from)){
            throw;
        }

        super.transferFrom(from, to, value);
    }


}
