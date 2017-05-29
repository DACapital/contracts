var VendingMachine = artifacts.require("./VendingMachine.sol");
var DacToken = artifacts.require("./DacToken.sol");
var AlwaysTransfer = artifacts.require("./AlwaysTransfer.sol");
var DacHub = artifacts.require("./DacHub.sol");


contract('VendingMachineInit', function(accounts) {    
    let vmContract = null;
    let alwaysTransferContract = null;
    let hubContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("should have constant values defined", function() {        
        
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
            // Create the new vending machine contract with the hub contract in constructor
            return VendingMachine.new(hubContract.address, 0, {from: accounts[1]});
        }).then(function(instance) {
            // Save off the vending machine contract
            vmContract = instance;

            // Get the current amount sold
            return vmContract.amountSold.call();
        }).then(function(amountSold) {
            assert.equal(amountSold.valueOf(), 0, "Should start out with 0 sold");

            // Get the AMOUNT_TO_SELL
            return vmContract.AMOUNT_TO_SELL.call();
        }).then(function(amount) {
            assert.equal(amount.valueOf(), 16800000 * 10**18, "Should be selling 16.8 million");

            // Get the INITIAL_PRICE_PER_ETH
            return vmContract.INITIAL_PRICE_PER_ETH.call();
        }).then(function(amount) {
            assert.equal(amount.valueOf(), 2000, "Should be start at 2 thousand tokens per eth");

            // Get the TOKENS_PER_GENERATION
            return vmContract.TOKENS_PER_GENERATION.call();
        }).then(function(amount) {
            assert.equal(amount.valueOf(), 1680000 * 10**18, "Should be 1.68 million tokens per generation");

            // Success
            return true;
        })
    });

    // Validate intitial setup and token transfer to Vending Machine
    it("should have ownership transfer succeed", function() {
        // Now move all the tokens from account 0 to the vending machine
        return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        .then(function(result) {            
            // Get the balance of the vending machine
            return tokenContract.balanceOf.call(vmContract.address);
        }).then(function(balance) {
            // Verify the vm owns it all
            assert.equal(balance.valueOf(), 16800000 * 10**18, "Tokens should have been transferred to the vm");

            // Get the balance of account 0
            return tokenContract.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            // Verify the original token owner has 4.2m
            assert.equal(balance.valueOf(), 4200000 * 10**18, "Tokens should have been transferred out");

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

    // Validate simple 1 eth send
    it("should purchase tokens with eth", function() {        
        // Purchase 1 ether     
        return vmContract.purchaseTokens({from: accounts[3], value: 1 * 10**18 })
        .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the first 2k tokens
            assert.equal(balance.valueOf(), 2000 * 10**18, "2000 Tokens should have been transferred out");

            return true;
        })
    });


    // Validate Generation_1 - 1 eth is calculated correctly
    it("should purchase up to gen - 1 eth tokens", function() {        
        // 1 ether has already been purchased, now purchase the next 838
        return vmContract.purchaseTokens({from: accounts[3], value: 838 * 10**18 })
        .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {            
            // Verify 838 ETH purchased an additional 838 * 2k tokens
            assert.equal(balance.valueOf(), 839 * 2000 * 10**18, "Tokens should have been transferred out");

            return true;
        })
    });

    it("should purchase all gen 1 tokens with eth", function() {        
        // Purchase 1 ether     
        return vmContract.purchaseTokens({from: accounts[3], value: 1 * 10**18 })
        .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the first 2k tokens
            assert.equal(balance.valueOf(), 840 * 2000 * 10**18, "2000 Tokens should have been transferred out");

            return true;
        })
    });

    it("should purchase 1 gen 2 token with eth", function() {        
        // Purchase 1 ether     
        return vmContract.purchaseTokens({from: accounts[3], value: 1 * 10**18 })
        .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(),( 1000 * 10**18 ) + ( 840 * 2000 * 10**18 ), "2000 Tokens should have been transferred out");

            return true;
        })
    });
});

