pragma solidity ^0.4.8;
import "./zeppelin/token/ERC20.sol";
import './DacHubClient.sol';
import './FeeTracker.sol';

/*
 * Transfer regulator that always returns false
 */
contract ProposalManager is DacHubClient {

    // Block variables
    uint public startBlock = 0;
    uint public proposalPeriodBlockLength;
    uint public commitPeriodBlockLength;
    uint public revealPeriodBlockLength;

    struct Proposal {
        address proposedAddress;
    }

    // Mapping of proposal period to proposed addresses to Proposal structs
    mapping(uint => mapping(address => Proposal)) proposals;
    
    // Initialize the contract
    function ProposalManager(DacHub _dacHub, uint _proposalPeriodBlockLength, uint _commitPeriodBlockLength, uint _revealPeriodBlockLength){

        // Save off the hub
        dacHub = _dacHub;  
        
        // Save off the current block
        startBlock = block.number;

        // Save off block lengths
        proposalPeriodBlockLength = _proposalPeriodBlockLength;
        commitPeriodBlockLength = _commitPeriodBlockLength;
        revealPeriodBlockLength = _revealPeriodBlockLength;
    }

    // Figure out what proposal period we are currently in.
    // A proposal period is every X blocks starting from when the contract was initialized.
    function getProposalPeriodNumber() returns (uint) {
        return (block.number - startBlock) / proposalPeriodBlockLength;
    }

    // This proposal will update the Fee Address in the plarform once it is accepted.
    function createHubFeeUpdateProposal(address proposedNewAddress){

        // Next, get the proposal fee
        FeeTracker feeTracker = FeeTracker(getHubContractAddress(DAC_FEE_TRACKER));
        // TODO: Figure out how to reference this from the other contract instead of hard coding a string here.    
        uint proposalFee = feeTracker.getPlatformFee("CREATE_PROPOSAL_FEE");

        // Next, transfer the fee in DAC tokens into this contract
        ERC20 token = ERC20(getHubContractAddress(DAC_TOKEN));
        token.transferFrom(msg.sender, this, proposalFee);

        // If the transfer went through, figure out what proposal period we are in
        uint proposalPeriod = getProposalPeriodNumber();

        // See if there is already a proposal for this period
        // TODO: See if there is a better way to check if the struct exists or not
        Proposal existing = proposals[proposalPeriod][proposedNewAddress];
        if(existing.proposedAddress != 0){
            throw;
        }

        // Save off the new proposal
        proposals[proposalPeriod][proposedNewAddress] = Proposal(proposedNewAddress);
    }
}