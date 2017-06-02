var DacToken = artifacts.require("./DacToken.sol");
var AlwaysTransfer = artifacts.require("./AlwaysTransfer.sol");
var DacHub = artifacts.require("./DacHub.sol");
var ProposalManager = artifacts.require("./ProposalManager.sol");

var mineBlock = require('./miner.js').mineBlock;

contract('ProposalManagerPeriod', (accounts) => {    
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
        }).then((blockNum) => {
            return proposalManager.getProposalPeriodNumber.call(10, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 1, "Should be in 1st a proposal period");
            return proposalManager.getProposalPeriodNumber.call(11, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 1, "Should be in 1st b proposal period");
            return proposalManager.getProposalPeriodNumber.call(14, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 1, "Should be in 1st c proposal period");
            return proposalManager.getProposalPeriodNumber.call(15, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 2, "Should be in 2nd a proposal period");
            return proposalManager.getProposalPeriodNumber.call(16, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 2, "Should be in 2nd b proposal period");
            return proposalManager.getProposalPeriodNumber.call(19, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 2, "Should be in 2nd v proposal period");
            return proposalManager.getProposalPeriodNumber.call(20, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 3, "Should be in 3rd proposal period");
        })
    })

     it("should calculate commit periods", () => {        
        
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
            return proposalManager.getCommitPeriodNumber.call(11, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be in before commit period");
            return proposalManager.getCommitPeriodNumber.call(14, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be in before a commit period");
            return proposalManager.getCommitPeriodNumber.call(15, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 1, "Should be in 1st a commit period");
            return proposalManager.getCommitPeriodNumber.call(16, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 1, "Should be in 1st b commit period");
            return proposalManager.getCommitPeriodNumber.call(17, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be in after a commit period");
            return proposalManager.getCommitPeriodNumber.call(20, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 2, "Should be in 2nd a commit period");
            return proposalManager.getCommitPeriodNumber.call(21, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 2, "Should be in 2nd b commit period");
            return proposalManager.getCommitPeriodNumber.call(22, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be after 2nd commit period");
        })
    })

    it("should calculate reveal periods", () => {        
        
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
            return proposalManager.getRevealPeriodNumber.call(11, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be before reveal period");
            return proposalManager.getRevealPeriodNumber.call(16, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be before reveal period");
            return proposalManager.getRevealPeriodNumber.call(17, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 1, "Should be in 1st a reveal period");
            return proposalManager.getRevealPeriodNumber.call(18, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 1, "Should be in 1st b reveal period");
            return proposalManager.getRevealPeriodNumber.call(19, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be after 1st reveal period");
            return proposalManager.getRevealPeriodNumber.call(20, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be after 1st reveal period");
            return proposalManager.getRevealPeriodNumber.call(22, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 2, "Should be in 2nd reveal period");
            return proposalManager.getRevealPeriodNumber.call(23, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 2, "Should be in 2nd b reveal period");
            return proposalManager.getRevealPeriodNumber.call(24, 10)
        }).then((result) => {
            assert.equal(result.valueOf(), 0, "Should be after 2nd reveal period");
        })
    })
})