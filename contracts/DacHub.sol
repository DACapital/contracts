pragma solidity ^0.4.11;
import "./zeppelin/ownership/Ownable.sol";

// This Hub contract is just a holder on the blockchain that other contracs can reference to know
// what addresses other contracts on the platform are currently using.  This will allow for upgrades
// as time goes by and new versions of the contracts are rolled out.  This is the source of truth for
// the platform.
contract DacHub is Ownable{

    event ContractUpdated(string key, address platformContract);
    event ContractRetrieved(string key, address platformContract);

    // Key/Value pairs of all the contracts on the platform
    mapping (string => address) platformContracts;

    // Initialize the hub
    function DacHub(){
    }

    // Get one of the platform addresses
    function getPlatformContract(string key) constant returns (address platformContract) {

        // Do some sanity checks on the key
        if( bytes(key).length == 0 ) {
            throw;
        }

        // Get the address
        address value = platformContracts[key];

        // Do some sanity checks on the value
        if ( value == 0){
            throw;
        }

        ContractRetrieved(key, value);

        return value;
    }

    // Update one of the platform addresses in the system
    function updatePlatformContract(string key, address value) onlyOwner {

        // Do some sanity checks on the key
        if( bytes(key).length == 0 ) {
            throw;
        }

        // Do some sanity checks on the value
        if ( value == 0){
            throw;
        }

        ContractUpdated(key, value);

        // Update the contract
        platformContracts[key] = value;
    }
    
}   