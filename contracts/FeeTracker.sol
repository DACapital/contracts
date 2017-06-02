pragma solidity ^0.4.8;

// This contract will keep a list of fees on the platform
contract FeeTracker{

    // Key/Value pairs of the fee values
    mapping (string => uint) feeList;

    // Fees
    // Fee to create a new proposal
    string public constant CREATE_PROPOSAL_FEE = "CREATE_PROPOSAL_FEE";

    // Initialize the fees
    function FeeTracker(){

        // One hundred DAC token required to create a proposal
        feeList[CREATE_PROPOSAL_FEE] = 100 * 10**18;
    }

    // Get one of the platform addresses
    function getPlatformFee(string key) returns (uint feeValue) {

        // Do some sanity checks on the key
        if( bytes(key).length == 0 ) {
            throw;
        }

        // Get the fee
        uint fee = feeList[key];

        // Throw if the fee was not found
        if(fee == 0){
            throw;
        }

        // Return the fee
        return fee;
    }
}   