var DacToken = artifacts.require("./DacToken.sol");
var AlwaysTransfer = artifacts.require("./AlwaysTransfer.sol");
var DacHub = artifacts.require("./DacHub.sol");
var ProposalManager = artifacts.require("./ProposalManager.sol");

// Recursively mine blocks
function mineBlock(until){
    return new Promise(function(resolve,reject){
        
        let currentBlock = web3.eth.blockNumber;
        //console.log("Mining next block", currentBlock);

        if(currentBlock >= until){
            return resolve(currentBlock);
        }

        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: 12345
        }, (error, result) => {
            if(error !== null) return reject(error);

            console.log("Mining a block...");
            return mineBlock(until).then((block) => {
                resolve(block); 
            });
        });    
    });
}

contract('ProposalManagerInit', (accounts) => {    
    let vmContract = null;
    let alwaysTransferContract = null;
    let hubContract = null;
    let tokenContract = null;
    let proposalManager = null;
    let startBlock = 0;

    // Validate intitial properties set on contract    
    it("should have constant values defined", () => {        
        
        // Start by deploying the token
        return AlwaysTransfer.new()
        .then((alwaysTransfer) => {
            alwaysTransferContract = alwaysTransfer;

            return DacHub.deployed();
        }).then((instance) => {
            hubContract = instance;

            return hubContract.updatePlatformContract('DAC_TRANSFER_REGULATOR', alwaysTransferContract.address, {from: accounts[0]});        
        }).then((result) => {
            return DacToken.deployed();
        }).then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return hubContract.updatePlatformContract('DAC_TOKEN', tokenContract.address, {from: accounts[0]});        
        }).then((result) => {
            return hubContract.updatePlatformContract('DAC_OWNER', accounts[0], {from: accounts[0]});        
        }).then((result) => {
            return ProposalManager.new(hubContract.address, 5, 2, 2);
        }).then((manager) => {
            proposalManager = manager;
            startBlock = web3.eth.blockNumber;
            return mineBlock(startBlock + 1);
        }).then((blockNum) => {
            return proposalManager.getProposalPeriodNumber.call()
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be in 0th proposal period");

            // mine until the start of the next window
            return mineBlock(startBlock + 5);
        }).then((blockNum) => {
            return proposalManager.getProposalPeriodNumber.call()
        }).then((result) => {
            assert.equal(result.valueOf(), 1, "Should be in first proposal period");

            // mine until the start of the next window
            return mineBlock(startBlock + 10);
        }).then((blockNum) => {
            return proposalManager.getProposalPeriodNumber.call()
        }).then((result) => {
            assert.equal(result.valueOf(), 2, "Should be in second proposal period");

            // mine until the start of the next window
            return mineBlock(startBlock + 5);
        })
    })
})