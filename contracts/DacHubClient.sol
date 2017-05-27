pragma solidity ^0.4.8;
import "./DacHub.sol";

// This Hub Client contract will allow inheriting contracts to get addresses for 
// contracts stored in the hub.
contract DacHubClient{
    DacHub dacHub;

    // This address is the owner wallet for DAC
    string constant public DAC_OWNER = "DAC_OWNER";

    // This contract is where the DAC tokens are managed in an ERC20 compliant contract
    string constant public DAC_TOKEN = "DAC_TOKEN";

    // This contract is responsible for allowing/disallowing DAC tokens to be transferred.
    string constant public DAC_TRANSFER_REGULATOR = "DAC_TRANSFER_REGULATOR";

    function getHubContractAddress(string key) returns (address platformContract){
        return dacHub.getPlatformContract(key);
    }
}