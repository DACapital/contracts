var DacToken = artifacts.require("./DacToken.sol");

// We are relying on zeppelin contracts for most of the token logic, so they are expected to work correctly.
// These will be mostly basic sanity tests to ensure it works as expected.
contract('DacToken', function(accounts) {    

    // Validate intitial set values in the constructor of the contract
    it("should have constant values defined", function() {
        let tokenContract = null;

        return DacToken.deployed().then(function(instance) {
            tokenContract = instance;

            // Get the total supply number
            return tokenContract.totalSupply.call();
        }).then(function(supply) {
            // Validate total supply
            assert.equal(supply.valueOf(), 21000000 * 10**18, "21 million tokens should be created");

            // Get the name
            return tokenContract.name.call();            
        }).then(function(name) {
            // Validate the name
            assert.equal(name.valueOf(), "DA.Capital", "Name should be DA.Capital");

            // Get the symbol
            return tokenContract.symbol.call();            
        }).then(function(symbol) {
            // Validate the symbol
            assert.equal(symbol.valueOf(), "DAC", "Symbol should be DAC");

            // Get the decimals
            return tokenContract.decimals.call();            
        }).then(function(decimals) {
            // Validate the symbol
            assert.equal(decimals.valueOf(), 18, "Should have 18 decimals");
        })
    });

    // Validate owner is account is credited with all tokens
    it("should put 21m Tokens in the first account", function() {
        return DacToken.deployed().then(function(instance) {
            return instance.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 21000000 * 10**18, "21 million tokens weren't in the first account");
        });
    });

    // Validate simple transfers
    it("should perform simple transfers correctly", function() {
        let tokenContract = null;
        let originalOwnerBalance = null;    

        return DacToken.deployed().then(function(instance) {
            // Get the contract instance and check balance of account 0
            tokenContract = instance;
            return tokenContract.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            // Verify the balance
            assert.equal(balance.valueOf(), 21000000 * 10**18, "21 million tokens weren't in the first account");

            // Initiate a transfer to account 1
            return tokenContract.transfer(accounts[1], 1 * 10**18, {from: accounts[0]});
        }).then(function(result) {
            // Get the balance of account 0
            return tokenContract.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            // Verify the from balance of account 0
            assert.equal(balance.valueOf(), 20999999 * 10**18, "1 token should have been transferred from the account");

            // Get the balance of account 1
            return tokenContract.balanceOf.call(accounts[1]);
        }).then(function(balance) {
            // Verify the balance of account 1
            assert.equal(balance.valueOf(), 1 * 10**18, "1 token should have been transferred to the account");
        });
    });
});
