pragma solidity ^0.4.8;
import "./zeppelin/ownership/Ownable.sol";

// This Hub contract is just a holder on the blockchain that other contracs can reference to know
// what addresses other contracts on the platform are currently using.  This will allow for upgrades
// as time goes by and new versions of the contracts are rolled out.  This is the source of truth for
// the platform.
contract DacHub is Ownable{

    // Key/Value pairs of all the contracts on the platform
    mapping (string => address) public platformContracts;

    // Initialize the hub
    function DacHub(){
    }

    // Update one of the platform addresses in the system
    function UpdatePlatformContract(string key, address value) onlyOwner {
        
        // Do some sanity checks on the key
        if( !key ) {
            throw;
        }

        // Do some sanity checks on the value
        if ( value == 0){
            throw;
        }

        // Update the contract
        platformContracts[key] = value;
    }


}   