var DacToken = artifacts.require("./DacToken.sol");
var NeverTransfer = artifacts.require("./NeverTransfer.sol");
var DacHub = artifacts.require("./DacHub.sol");

// We are relying on zeppelin contracts for most of the token logic, so they are expected to work correctly.
// These will be mostly basic sanity tests to ensure it works as expected.
contract('NeverTransfer', function(accounts) {    

    // Validate intitial set values in the constructor of the contract
    it("should block transfer", function(done) {
        let neverTransferContract = null;
        let hubContract = null;
        let tokenContract = null;
        

        NeverTransfer.new()
        .then((neverTransfer) => {
            neverTransferContract = neverTransfer;

            return DacHub.deployed();
        }).then((instance) => {
            hubContract = instance;

            return hubContract.updatePlatformContract('DAC_TRANSFER_REGULATOR', neverTransferContract.address, {from: accounts[0]});        
        }).then((result) => {
            return DacToken.deployed();
        }).then((instance) => {
            tokenContract = instance;

            return tokenContract.transfer(accounts[1], 1 * 10**18, {from: accounts[0]});
        }).then(function(result) {
            done("Should have thrown error");
        }).catch(function(error){
            done();
        });
    })
})