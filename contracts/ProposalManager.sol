pragma solidity ^0.4.8;
import "./zeppelin/token/ERC20.sol";
import './DacHubClient.sol';
import './FeeTracker.sol';
import './ITransferRegulator.sol';

/*
 * 
 */
contract ProposalManager is DacHubClient, ITransferRegulator {
    
    // Block variables
    uint public initialBock = 0;
    uint public proposalPeriodBlockLength;
    uint public commitPeriodBlockLength;
    uint public revealPeriodBlockLength;

    // For every proposal, this struct will keep track of the stats for voting, etc.
    struct Proposal {
        address proposedAddress;
        uint totalVotes;
        uint acceptVotes;
        uint rejectVotes;
        bool finalized;
        bool accepted;
        mapping(address => bytes32) commits;       
        mapping(address => uint) acceptVoteWeights;
        mapping(address => uint) rejectVoteWeights;
    }    

    // Mapping of proposal period to proposed addresses to Proposal structs
    mapping(uint => mapping(address => Proposal)) proposals;

    // For every proposal period, this struct will keep track of the counts of proposals and the winning proposal
    struct ProposalPeriod {
        uint totalProposals;
        uint finalizedProposals;        
        address winningProposal;
        uint winningProposalAcceptVotes;
        bool activated;
    }

    // Mapping of proposal period id to ProposalPeriod Structs
    mapping(uint => ProposalPeriod) proposalPeriods;

    // Mapping of commits in each period for each address
    mapping(uint => mapping(address => uint)) commitCounts;
    
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

    // Figure out what is the latest period can be finalized.
    // A proposal period that can be finalized is one that has ended and the associated commit/reveal periods have also ended.
    function getLatestFinalizePeriod(uint currentBlock, uint startBlock) returns (uint) {

        // First, get the proposal period we are in.
        uint currentProposalPeriod = getProposalPeriodNumber(currentBlock, startBlock);

        // Get the block where the current period started
        uint currentProposalPeriodStart = (startBlock) + ((currentProposalPeriod -1 ) * proposalPeriodBlockLength);

        // Get the end block of the current proposal period voting (after commit and reveals)
        uint currentVotingEnds = currentProposalPeriodStart + commitPeriodBlockLength + revealPeriodBlockLength;

        // If we are after the current proposal period voting, then we can finalize this period
        if(currentBlock > currentVotingEnds){
            return currentProposalPeriod;
        }

        // We are not after the current proposal voting period, so we can finalize the previous period
        return currentProposalPeriod - 1;

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
        proposals[proposalPeriod][proposedNewAddress] = Proposal(proposedNewAddress, 0, 0, 0, false, false);

        // Update the proposal period number of proposals
        proposalPeriods[proposalPeriod].totalProposals += 1;
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

        // Update the commit count for this address
        commitCounts[commitPeriod][msg.sender] += 1;
    }

    // If a user has a previous commit, they can cancel it as long as the commit period has not ended
    function cancelCommit(address proposedNewAddress){

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

        // Next, make sure they have a commit against the proposal
        bytes32 existingCommit = commitProposal.commits[msg.sender];
        if(existingCommit == 0){
            throw;
        }

        // Wipe out the commit
        commitProposal.commits[msg.sender] = 0;

        // Update the commit count for this address
        commitCounts[commitPeriod][msg.sender] -= 1;
    }

    // Reveal a vote against a previous commitment during a commit phase.
    // The revealed vote will need to hash via sha256 to the commit in order to be counted.
    // Even revealed votes will count as "accept" votes and odd will count as "reject"
    function revealVote(address proposedNewAddress, uint revealedVote){ 
        // Ensure the user has DAC tokens
        ERC20 token = ERC20(getHubContractAddress(DAC_TOKEN));
        uint balance = token.balanceOf(msg.sender);
        if(balance == 0){
            throw;
        }
        
        // Get the reveal period that is currently underway and validate we are in a good time window
        uint revealPeriod = getRevealPeriodNumber(block.number, initialBock); 
        if(revealPeriod == 0){
            throw;
        }

       // Get the proposal that the user wants to reveal against and verify it exists
        Proposal revealProposal = proposals[revealPeriod][proposedNewAddress];
        if(revealProposal.proposedAddress == 0){
            throw;
        }
        
        // Get the commitment and verify it exists
        bytes32 commitHash = revealProposal.commits[msg.sender];
        if(commitHash == 0){
            throw;
        }

        
        // Verify the vote matches the hash
        if(sha256(revealedVote) != commitHash){
            throw;
        }
        
        // Wipe the existing commit
        revealProposal.commits[msg.sender] = 0;

        // Count up the vote weight according to balance
        revealProposal.totalVotes += balance;
        if(revealedVote % 2 == 0){
            // Add to the votes accepting the proposal
            revealProposal.acceptVotes += balance;

            // Save off the vote for this user so they can withdraw any reward later
            revealProposal.acceptVoteWeights[msg.sender] = balance;
        } else {
            // Add to the votes rejecting the proposal
            revealProposal.rejectVotes += balance;

            // Save off the vote for this user so they can withdraw any reward later
            revealProposal.rejectVoteWeights[msg.sender] = balance;
        }

        // Update the commit count for this address
        commitCounts[revealPeriod][msg.sender] -= 1;
    }

    // A proposal can be accepted if it has more than 20% of the DAC supply voting and a majority have voted "accept".    
    function isProposalAccepted(Proposal proposal) internal returns (bool){

        // Check total vote count
        if(proposal.totalVotes < 4200000 * 10**18){
            return false;
        }

        // Check for majority
        if(proposal.acceptVotes < proposal.rejectVotes){
            return false;
        }

        // Accepted
        return true;
    }

    // This function will finalize a proposal to accept or reject.
    // For a proposal to finalize to accept, it must have more than 20% of all DAC tokens voting and a majority accept vote.
    // The action to take for a finalized accept vote is done in a later step "activate proposal" once all proposals are finalized for a voting period.
    // Any proposals can be finalized that are from a previous proposal period where commit/reveal periods have ended.
    function finalizeProposal(uint period, address proposedNewAddress){

        // Check to make sure the period we are finalizing against is valid
        uint latestFinalizePeriod = getLatestFinalizePeriod(block.number, initialBock);
        if(period > latestFinalizePeriod){
            throw;
        }

        // Get the proposal and check that it exists
        Proposal finalizeProposal = proposals[period][proposedNewAddress];
        if(finalizeProposal.proposedAddress == 0){
            throw;
        }

        // Check to make sure the proposal is not already finalized
        if(finalizeProposal.finalized){
            throw;
        }

        // Update the proposal outcome and mark it as finalized
        finalizeProposal.accepted = isProposalAccepted(finalizeProposal);
        finalizeProposal.finalized = true;        

        // Update the count of proposals that have been finalized for this period
        proposalPeriods[period].finalizedProposals += 1;

        // If this proposal was accepted and it has the highest vote count, then keep track of it in the proposal periods as the winner
        if( finalizeProposal.accepted && finalizeProposal.acceptVotes > proposalPeriods[period].winningProposalAcceptVotes ){
            proposalPeriods[period].winningProposal = proposedNewAddress;
            proposalPeriods[period].winningProposalAcceptVotes = finalizeProposal.acceptVotes;
        }
    }

    // Activate a proposal after all proposals have been finalized
    function activateProposal(uint period){

        // Check to make sure the period we are activating against is valid
        uint latestFinalizePeriod = getLatestFinalizePeriod(block.number, initialBock);
        if(period > latestFinalizePeriod){
            throw;
        }

        // Check to see if this period has already been activated
        if(proposalPeriods[period].activated){
            throw;
        }

        // Check to see if all proposals have been finalized
        if(proposalPeriods[period].finalizedProposals < proposalPeriods[period].totalProposals){
            throw;
        }

        // Mark the current proposal period as activated
        proposalPeriods[period].activated = true;

        // Activate the new address in the hub
        updatePlatformContract(DAC_FEE_TRACKER, proposalPeriods[period].winningProposal);
    }


    // Allow DAC withdraw for voting users of finalized proposals
    // If they voted with the majority, then they should be entitled to the share of the fee
    function withdrawReward(uint period, address proposalAddress){

        // Get the proposal to withrdraw from and verify it has been finalized
        Proposal withdrawProposal = proposals[period][proposalAddress];
        if(!withdrawProposal.finalized){
            throw;
        }

        // Get the amount of votes the current user voted with
        uint votedAmount = 0;
        if(withdrawProposal.accepted){
            // Save off the amount
            votedAmount = withdrawProposal.acceptVoteWeights[msg.sender];

            // Wipe out their balance
            withdrawProposal.acceptVoteWeights[msg.sender] = 0;
        } else {
            // Save off the amount
            votedAmount = withdrawProposal.rejectVoteWeights[msg.sender];
            
            // Wipe out their balance
            withdrawProposal.rejectVoteWeights[msg.sender] = 0;
        }

        // Check to make sure they have a valid value to vote for
        if(votedAmount == 0){
            throw;
        }

        // Process the withdraw
        ERC20 token = ERC20(getHubContractAddress(DAC_TOKEN));
        token.transfer(msg.sender, votedAmount);
    }

    // Block DAC token transfers for addresses that have outstanding commits for a voting period.
    // This should only block transfers during a commit period or a reveal period.
    // If a user is blocked from transferring tokens, they should cancel their commit or reveal their vote 
    // - if they are blocked from revealing (lost vote number?) they will have to wait until the reveal period is over
    function allowTransfer(address owner) returns (bool){
        // First check if we are in a commit period
        uint period = getCommitPeriodNumber(block.number, initialBock); 

        // If we are not in a commit period, see if we are in a reveal period
        if(period == 0){
            period = getRevealPeriodNumber(block.number, initialBock);  
        }

        // If not in a commit period or reveal period, allow the transfer
        if(period == 0){
            return true;
        }

        // Check to see if there is an active commit against this address for the period we are in.
        if(commitCounts[period][owner] > 0){
            // Active commmit found, block the transer
            return false;
        }

        // No commits found, allow the transfer
        return true;
    }
}