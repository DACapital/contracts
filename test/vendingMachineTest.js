var VendingMachine = artifacts.require("./VendingMachine.sol");
var DacToken = artifacts.require("./DacToken.sol");


contract('VendingMachineInit', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("should have constant values defined", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            // Save off the vending machine contract
            vmContract = instance;

            // Get the token
            return vmContract.token.call();     
        }).then(function(token) {
            assert.equal(token, tokenContract.address, "Token contract should be set");

            // Get the current amount sold
            return vmContract.amountSold.call();
        }).then(function(amountSold) {
            assert.equal(amountSold.valueOf(), 0, "Should start out with 0 sold");

            // Get the AMOUNT_TO_SELL
            return vmContract.AMOUNT_TO_SELL.call();
        }).then(function(amount) {
            assert.equal(amount.valueOf(), 21000000 * 10**18, "Should be selling 21 million");

            // Get the INITIAL_PRICE_PER_ETH
            return vmContract.INITIAL_PRICE_PER_ETH.call();
        }).then(function(amount) {
            assert.equal(amount.valueOf(), 1000000, "Should be start at 1 million tokens per eth");

            // Get the TOKENS_PER_GENERATION
            return vmContract.TOKENS_PER_GENERATION.call();
        }).then(function(amount) {
            assert.equal(amount.valueOf(), 1200000 * 10**18, "Should be 1.2 million tokens per generation");

            // Success
            return true;
        })
    });

    // Validate intitial setup and token transfer to Vending Machine
    it("should have ownership transfer succeed", function() {
        // Now move all the tokens from account 0 to the vending machine
        return tokenContract.transfer(vmContract.address, 21000000 * 10**18, {from: accounts[0]})
        .then(function(result) {            
            // Get the balance of the vending machine
            return tokenContract.balanceOf.call(vmContract.address);
        }).then(function(balance) {
            // Verify the vm owns it all
            assert.equal(balance.valueOf(), 21000000 * 10**18, "Tokens should have been transferred to the vm");

            // Get the balance of account 0
            return tokenContract.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            // Verify the original token owner doesn't own anything
            assert.equal(balance.valueOf(), 0, "Tokens should have been transferred out");

            // Success
            return true;
        });
    });

    // Validate the purchase API requires ETH to be sent
    it("should fail if no ETH is used in purchase call", function(done) {        
        vmContract.purchaseTokens({from: accounts[0], value: 0})
        .then(function(result) {
            done("Should have thrown error");
        }).catch(function(error){
            done();
        });
    });

    // Validate simple eth send
    it("should purchase tokens with eth", function(done) {
        
        // Purchase 1 ether     
        vmContract.purchaseTokens({from: accounts[0], value: 1 * 10**18 })
        .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            console.log(balance.valueOf());
            // Verify 1 ETH purchased the first 1m tokens
            assert.equal(balance.valueOf(), 1000000 * 10**18, "Tokens should have been transferred out");

            // Success
            done();

        }).catch(function(error){
            console.log(error);
            done(error);
        });
    });

    // Send 1 ETH
    // Send Gen1-1 eth
    // Send Gen1 eth
    // Send Gen1+1 eth

});





    // Send 2 gen worth
    // Send 3 gen worth
    // Send 4 gen worth

    // Send 100 then 2 gen worth
    // Send 100 then 3 gen worth
    // Send 100 then 4 gen worth
    
    // Send 21m -1
    // Send 21m
    // Send 21m + 1
    
    // Send 21m -1 then send 1
    // Send 21m -1 then send 2

    // Send 10 generations worth to make sure fraction of tokens works

    // Iterate over values from spreadsheet for -1, 0, +1


    // Try to withdraw 0
    // Try to withdraw 10
    // Try to withdraw more than is in the contract
    // Try to withdraw from invalid account

