var DacToken = artifacts.require("./DacToken.sol");
var AlwaysTransfer = artifacts.require("./AlwaysTransfer.sol");
var DacHub = artifacts.require("./DacHub.sol");
var ProposalManager = artifacts.require("./ProposalManager.sol");   
var FeeTracker = artifacts.require("./FeeTracker.sol");
var crypto = require('crypto');

var mineBlock = require('./miner.js').mineBlock;

contract('ProposalManagerCommit', (accounts) => {    
    let vmContract = null;
    let alwaysTransferContract = null;
    let hubContract = null;
    let tokenContract = null;
    let proposalManager = null;

    // Validate intitial properties set on contract    
    it("should succeed", () => {        

        let startblock = 0;        
        
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
            return FeeTracker.deployed();
        }).then((instance) => {
            feeTracker = instance;
            return hubContract.updatePlatformContract('DAC_FEE_TRACKER', feeTracker.address, {from: accounts[0]});        
        }).then((result) => {
            startblock = web3.eth.blockNumber;
            console.log(startblock)
            return ProposalManager.new(hubContract.address, 20, 4, 4);
        }).then((manager) => {
            proposalManager = manager;  
            return tokenContract.approve(proposalManager.address, 100 * 10**18);
            
        }).then((result) => {
            // Create a proposal with a dummy account
            return proposalManager.createHubFeeUpdateProposal(accounts[2])
        }).then((result) => {
            return mineBlock(startblock + 21);
        }).then((result) => {            
            // create a buffer that represents a uint (32 bytes)
            const buf = Buffer.alloc(32);
            buf[31] = 0x02;
            let cr = crypto.createHash('sha256');
            let update = cr.update(buf)
            let hash = update.digest();
            let num = web3.toBigNumber( '0x' + hash.toString('hex'));
            return proposalManager.commitVote(accounts[2], num );
        }).then((result) => {
            return mineBlock(startblock + 25);            
        }).then((result) => {          
            // This "2" will get converted to a 32 byte uint
            return proposalManager.revealVote(accounts[2], 2);
        }).then((result) => {
            return mineBlock(startblock + 29);            
        })
    })

})