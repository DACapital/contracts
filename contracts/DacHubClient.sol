pragma solidity ^0.4.8;
import "./DacHub.sol";

// This Hub Client contract will allow inheriting contracts to get addresses for 
// contracts stored in the hub.
contract DacHubClient{
    DacHub public dacHub;

    // This address is the owner wallet for DAC
    string constant DAC_OWNER = "DAC_OWNER";

    // This contract is where the DAC tokens are managed in an ERC20 compliant contract
    string constant DAC_TOKEN = "DAC_TOKEN";

    // This contract is responsible for allowing/disallowing DAC tokens to be transferred.
    string constant DAC_TRANSFER_REGULATOR = "DAC_TRANSFER_REGULATOR";

    // This address is the contract that holds the fee list for the DAC platform
    string constant DAC_FEE_TRACKER = "DAC_FEE_TRACKER";

    function getHubContractAddress(string key) internal returns (address platformContract){
        return dacHub.getPlatformContract(key);
    }

    function updatePlatformContract(string key, address platformContract) internal {
        return dacHub.updatePlatformContract(key, platformContract);
    }
}