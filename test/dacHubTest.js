var DacHub = artifacts.require("./DacHub.sol");

contract('DacHub', function(accounts) {    

    // Validate getting and setting values
    it("should get and set values", function() {
        let hubContract = null;

        return DacHub.deployed().then(function(instance) {
            hubContract = instance;

            // Get non-existant
            return hubContract.GetPlatformContract.call('does_not_exist');
        }).then(function(contractAddress) {
            assert.equal(contractAddress, 0, "Should return 0 for unknown address");

            // Set to known account
            return hubContract.UpdatePlatformContract('master', accounts[2], {from: accounts[0]});
        }).then(function(result) {
            // Get the set account
            return hubContract.GetPlatformContract.call('master');
        }).then(function(contractAddress) {
            assert.equal(contractAddress, accounts[2], "Should be set");

            // Update to new account
            return hubContract.UpdatePlatformContract('master', accounts[3], {from: accounts[0]});
        }).then(function(result) {
            // Get the set account
            return hubContract.GetPlatformContract.call('master');
        }).then(function(contractAddress) {
            assert.equal(contractAddress, accounts[3], "Should be updated   ");
        })
    })
})