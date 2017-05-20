var DacToken = artifacts.require("./DacToken.sol");
var NeverTransfer = artifacts.require("./NeverTransfer.sol");

// We are relying on zeppelin contracts for most of the token logic, so they are expected to work correctly.
// These will be mostly basic sanity tests to ensure it works as expected.
contract('NeverTransfer', function(accounts) {    

    // Validate intitial set values in the constructor of the contract
    it("should block transfer", function(done) {
        let tokenContract = null;

        NeverTransfer.new()
        .then((neverTransfer) => {
            return DacToken.new(neverTransfer)
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