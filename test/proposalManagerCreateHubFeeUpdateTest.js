var DacToken = artifacts.require("./DacToken.sol");
var AlwaysTransfer = artifacts.require("./AlwaysTransfer.sol");
var DacHub = artifacts.require("./DacHub.sol");
var ProposalManager = artifacts.require("./ProposalManager.sol");
var FeeTracker = artifacts.require("./FeeTracker.sol");

contract('ProposalManagerInit', (accounts) => {    
    let vmContract = null;
    let alwaysTransferContract = null;
    let hubContract = null;
    let tokenContract = null;
    let proposalManager = null;
    let feeTracker = null;

    // Validate intitial properties set on contract    
    it("should fail without allowing transfer of fee for proposal", (done) => {        
        
        // Start by deploying the token
        AlwaysTransfer.new()
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
            return ProposalManager.new(hubContract.address, 10, 2, 2);
        }).then((manager) => {
            proposalManager = manager;  
            // Create a proposal with a dummy account
            return proposalManager.createHubFeeUpdateProposal(accounts[0])
        }).then((result) => {
            done("Should not succeed")
        }).catch(() => {
            done()
        })
    })

    it("should succeed", () => {        
        
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
            return ProposalManager.new(hubContract.address, 10, 2, 2);
        }).then((manager) => {
            proposalManager = manager;  
            return tokenContract.approve(proposalManager.address, 100 * 10**18);
            
        }).then((result) => {
            // Create a proposal with a dummy account
            return proposalManager.createHubFeeUpdateProposal(accounts[0])
        })
    })

    it("should fail when trying to overwrite existing proposal", (done) => {        
        
        // Start by deploying the token
        AlwaysTransfer.new()
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
            return ProposalManager.new(hubContract.address, 10, 2, 2);
        }).then((manager) => {
            proposalManager = manager;  
            return tokenContract.approve(proposalManager.address, 100 * 10**18);
            
        }).then((result) => {
            // Create a proposal with a dummy account
            return proposalManager.createHubFeeUpdateProposal(accounts[0])
        }).then((result) => {
            // Fail
            return proposalManager.createHubFeeUpdateProposal(accounts[0])
        }).then((res) => {
            done("SHould fail");
        }).catch(() => {
            done();
        })
    })
})
