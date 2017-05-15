pragma solidity ^0.4.8;
import "./zeppelin/token/ERC20.sol";

// TODO: This contract assumes the balances at the ERC20 contract cannot be transferred while voting is active.
// Need to investigate.

// This contract will keep track of voting for proposals.
// Owners of an ERC20 token will be allowed to vote according to their ownership stake.  
// The balance of tokens in addresses are locked in at contract creation time.
// At the end of the voting period, a tally can be called to finalize the votes.
// A minimum number of votes (threshold) must be made in order for the vote to finalize to a "true" outcome.
contract ProposalVote {
    
    event Debug(uint debugText);

    // The token contract to determine how much each vote weighs
    ERC20 public tokenContract;

    // Flag to indicate if the address has already voted.
    mapping(address => bool) alreadyVoted;

    // Track yes/no votes
	uint public yesVotes;
	uint public noVotes;
	uint public threshold;	

    // Time voting is active
 	uint public votingStarts;
	uint public votingEnds;

	// The contract will be created with an initial list of addresses and balances from an ERC20 token.
	// Voting will only be valid for a period of time from when this contract is created.
	function ProposalVote(ERC20 _tokenContract, uint _votingEnds, uint _threshold) {
        Debug(block.number);

		// Save off the token
		tokenContract = _tokenContract;

		// Save off the start time of the voting for information only.
		votingStarts = block.number;

		// Calculate when the vote period ends
		votingEnds = _votingEnds;

        // Sanity check to make sure the end date is in the future
        if(votingEnds <= votingStarts){
            throw;
        }

		// Save off the threshold
		threshold = _threshold;
	}

	// Allow a caller to vote yes or no on the current proposal.
	// The voting window must be valid and the user must have a balance from the token.
	function CastVote(bool votingYes){
        
		// Ensure we are in a valid voting window
		if( block.number >= votingEnds ){
			throw;
		}

        // Ensure they have not already voted
        if(alreadyVoted[msg.sender]){
            throw;
        }

		// Get the weight of the current voter based on number of tokens they own
		uint weight = tokenContract.balanceOf(msg.sender);

		// Check to make sure they have a balance to vote with
		if(weight == 0){
			throw;
		}

		// Update the flag to show they have already voted
		alreadyVoted[msg.sender] = true;

		// Add the vote weights
		if(votingYes) {
			yesVotes += weight;
		} else {
			noVotes += weight;
		}
	}


	function GetOutcome() returns (bool) {
        Debug(block.number);

		// Ensure the voting period has ended
		if ( block.number <= votingEnds ){
			throw;
		}

		// Ensure a quorum was reached by having a minimum number of votes over the threshold
		if( yesVotes + noVotes < threshold){

			// Not enough votes were cast to allow this to be finalized to "true"
			return false;
		}

		// Determine whether the outcome was decided yes or no
		return yesVotes > noVotes;
	}	
}
