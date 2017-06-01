pragma solidity ^0.4.8;
import "./zeppelin/token/ERC20.sol";
import './DacHubClient.sol';
import './FeeTracker.sol';

/*
 * Transfer regulator that always returns false
 */
contract ProposalManager is DacHubClient {
    
    event debug_uint();
    
    // Block variables
    uint public initialBock = 0;
    uint public proposalPeriodBlockLength;
    uint public commitPeriodBlockLength;
    uint public revealPeriodBlockLength;

    // For every proposal, this struct will keep track of the stats for voting, etc.
    struct Proposal {
        address proposedAddress;
        mapping(address => bytes32) commits;
    }

    // Mapping of proposal period to proposed addresses to Proposal structs
    mapping(uint => mapping(address => Proposal)) proposals;
    
    // Initialize the contract
    function ProposalManager(DacHub _dacHub, uint _proposalPeriodBlockLength, uint _commitPeriodBlockLength, uint _revealPeriodBlockLength){

        // Save off the hub
        dacHub = _dacHub;  
        
        // Save off the current block
        initialBock = block.number;

        // Save off block lengths
        proposalPeriodBlockLength = _proposalPeriodBlockLength;
        commitPeriodBlockLength = _commitPeriodBlockLength;
        revealPeriodBlockLength = _revealPeriodBlockLength;

        // Sanity check requirements on period lengths
        if(proposalPeriodBlockLength <= (commitPeriodBlockLength + revealPeriodBlockLength)){
            throw;
        }
    }

    // Figure out what proposal period we are currently in.
    // A proposal period is every X blocks starting from when the contract was initialized.
    // Add 1 so that all period calculations can use 0 as an error case.
    function getProposalPeriodNumber(uint currentBlock, uint startBlock) returns (uint) {
        return 1 + ((currentBlock - startBlock) / proposalPeriodBlockLength);
    }

    // Figure out what commit period we are currently in.
    // A commit period immediately follows the end of a proposal period.
    // If the current block is not contained in a commit period, this will return 0.
    function getCommitPeriodNumber(uint currentBlock, uint startBlock) returns (uint) {
        
        // First, get the proposal period we are in.
        uint currentProposalPeriod = getProposalPeriodNumber(currentBlock, startBlock);        

        // The commit period begins when the current proposal period starts.
        uint currentProposalPeriodStart = (startBlock) + ((currentProposalPeriod -1 ) * proposalPeriodBlockLength);

        // If we are outside the commitPeriodBlockLength from the beginning of this proposal period, then return 0 as error signal.
        if(currentBlock < currentProposalPeriodStart  || currentBlock >= currentProposalPeriodStart + commitPeriodBlockLength){
            return 0;
        }

        // We are in the commit period for the last proposal period.
        return currentProposalPeriod -1;
    }

    // Figure out what reveal period we are currently in.
    // A reveal period immediately follows the end of a commit period.
    // If the current block is not contained in a reveal period, this will return 0.
    function getRevealPeriodNumber(uint currentBlock, uint startBlock) returns (uint) {
        
        // First, get the proposal period we are in.
        uint currentProposalPeriod = getProposalPeriodNumber(currentBlock, startBlock);

        // The reveal period begins when the current commit period ends.
        uint currentRevealPeriodStart = (startBlock) + ((currentProposalPeriod -1 ) * proposalPeriodBlockLength) + commitPeriodBlockLength ;

        // If we are outside the commitPeriodBlockLength from the beginning of this proposal period, then return 0 as error signal.
        if(currentBlock < currentRevealPeriodStart  || currentBlock >= currentRevealPeriodStart + revealPeriodBlockLength){
            return 0;
        }

        // We are in the commit period for the last proposal period.
        return currentProposalPeriod -1;
    }

    // This proposal will update the Fee Address in the plarform once it is accepted.
    // The user needs to allow this contract to withdraw the DAC Fee from their balance.
    // If it passes checks, a proposal will be created in this proposal period that can be voted on once the next commit period starts.
    function createHubFeeUpdateProposal(address proposedNewAddress){

        // Next, get the proposal fee
        FeeTracker feeTracker = FeeTracker(getHubContractAddress(DAC_FEE_TRACKER));
        // TODO: Figure out how to reference this from the other contract instead of hard coding a string here.    
        uint proposalFee = feeTracker.getPlatformFee("CREATE_PROPOSAL_FEE");

        // Next, transfer the fee in DAC tokens into this contract
        ERC20 token = ERC20(getHubContractAddress(DAC_TOKEN));
        token.transferFrom(msg.sender, this, proposalFee);

        // If the transfer went through, figure out what proposal period we are in
        uint proposalPeriod = getProposalPeriodNumber(block.number, initialBock);

        // See if there is already a proposal for this period
        // TODO: See if there is a better way to check if the struct exists or not
        Proposal existing = proposals[proposalPeriod][proposedNewAddress];
        if(existing.proposedAddress != 0){
            throw;
        }

        // Save off the new proposal
        proposals[proposalPeriod][proposedNewAddress] = Proposal(proposedNewAddress);
    }

    // Commit a vote against a proposal using a secret hash during a "commit" period.
    // The secret value will be a uint hashed with sha256.  Only the hash is passed in.
    // A "even" number that was hashed is an "accept" vote and an "odd" number is "reject".
    // The vote will be revealed later during the "reveal" period.
    function commitVote(address proposedNewAddress, bytes32 commitHash){        

        // Ensure the user has DAC tokens
        ERC20 token = ERC20(getHubContractAddress(DAC_TOKEN));
        uint balance = token.balanceOf(msg.sender);
        if(balance == 0){
            throw;
        }

        // Get the commit period that is currently underway and validate we are in a good time window
        uint commitPeriod = getCommitPeriodNumber(block.number, initialBock); 
        if(commitPeriod == 0){
            throw;
        }

        // Get the proposal that the user wants to commit against and verify it exists
        Proposal commitProposal = proposals[commitPeriod][proposedNewAddress];
        if(commitProposal.proposedAddress == 0){
            throw;
        }

        // Next, make sure they do not already have a commit against it
        bytes32 existingCommit = commitProposal.commits[msg.sender];
        if(existingCommit != 0){
            throw;
        }

        // Save off the commit
        commitProposal.commits[msg.sender] = commitHash;
    }
}