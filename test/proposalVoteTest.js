var DacToken = artifacts.require("./DacToken.sol");
var ProposalVote = artifacts.require("./ProposalVote.sol");


// Recursively mine blocks
function mineBlock(until){
    return new Promise(function(resolve,reject){
        
        let currentBlock = web3.eth.blockNumber;
        console.log("Mining next block", currentBlock);

        if(currentBlock >= until){
            return resolve(currentBlock);
        }

        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: 12345
        }, (error, result) => {
            if(error !== null) return reject(error);

            return mineBlock(until).then((block) => {
                resolve(block); 
            });
        });    
    });
}

contract('ProposalVote', function(accounts) {    

    // Validate getting and setting values
    it("should track voting yes", () => {
        console.log("Setting up");
        let proposalContract = null;
        let tokenContract = null;

        let startBlock = web3.eth.blockNumber;
        let endBlock = startBlock + 10;
        console.log("startBlock", startBlock);

        // Start by deploying the token
        return DacToken.deployed().then( (instance) => {
            // Save off the token contract instance
            tokenContract = instance;            

            console.log("Deploying proposal");
            console.log(tokenContract.address);
            console.log(web3.eth.blockNumber);
            console.log("endBlock", endBlock);

            // Create the new proposal that will end voting in 100 blocks and requires at least 50 votes
            return ProposalVote.new(tokenContract.address, endBlock, 50);
        }).then((instance) => {
            // Save off the vending machine contract
            proposalContract = instance;

            console.log("Casting vote");
            // vote yes with all the tokens in account 0
            return proposalContract.CastVote(true);
        }).then((result) => {

            // Make the block increment
            console.log("mining");
            return mineBlock(endBlock + 1);
        }).then((blockNum) => {
            console.log("Get outcome");
            return proposalContract.GetOutcome.call()                    
        }).then((result) => {
            assert.equal(result.valueOf(), true, "Vote should be true");
        }) 
    })
})