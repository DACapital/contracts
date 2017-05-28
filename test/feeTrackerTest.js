var FeeTracker = artifacts.require("./FeeTracker.sol");

contract('FeeTracker', function(accounts) {    

    // Validate getting values
    it("should get expected values", function() {
        let feeContract = null;

        return FeeTracker.deployed().then(function(instance) {
            feeContract = instance;

            // Get the 
            return feeContract.getPlatformFee.call('CREATE_PROPOSAL_FEE');
        }).then(function(fee) {

            // Check the value
            assert.equal(fee, 1 * 10 ** 18, "CREATE_PROPOSAL_FEE should be set to one DAC token");
        })
    })

    it('should fail if trying to get unknown fee', (done) => {
        let feeContract = null;

        FeeTracker.deployed()
        .then(function(instance) {
            feeContract = instance;

            // Get non-existant
            return feeContract.getPlatformFee.call('unknown');
        }).then(function(fee) {           
            done("Should have thrown error");
        }).catch(function(error){
            done();
        });
    })
})