var VendingMachine = artifacts.require("./VendingMachine.sol");
var DacToken = artifacts.require("./DacToken.sol");


contract('Buy and withdraw', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy all the generations of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, 0, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 859319 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify almost all tokens purchased
            assert.equal(balance.valueOf(), 1679999609375 * 10**13 , "Gen10 - 1  Tokens should have been transferred out");
            
            // Purchase from another account
            return vmContract.purchaseTokens({from: accounts[3], value: 1 * 10**18 })
        }).then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify all tokens purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 16800000 * 10**18 , "Gen1 acct all Tokens should have been transferred out");

            return true;
        });
    });

    it("should fail if trying to withdraw 0", function(done) {        
        vmContract.withdrawEth(0, {from: accounts[1]})
        .then(function(result) {
            done("Should have thrown error");
        }).catch(function(error){
            done();
        });
    });

    it("fail withdraw with wrong account", function(done) {        
        vmContract.withdrawEth(1, {from: accounts[0]})
        .then(function(result) {
            done("Should have thrown error");
        }).catch(function(error){
            done();
        });
    });

    it("Allow withdraw", function() {        
        let initialBalance = web3.eth.getBalance(accounts[1]);

        return vmContract.withdrawEth(10 * 10**18, {from: accounts[1]})
        .then(function(result) {
        
            let gasPrice = web3.eth.gasPrice;
            let totalGasCost = 100000000000 * result.receipt.gasUsed;
            let expectedBalance = initialBalance.plus(10 * 10**18).minus(totalGasCost);

            let updatedBalance = web3.eth.getBalance(accounts[1]).valueOf();
            assert.equal(updatedBalance.valueOf(), expectedBalance.valueOf(), 'Should have withdrawn 10');
        });
    });

    it("should fail if it tries to withdraw too much", function(done) {        
        vmContract.withdrawEth(1000000 * 10**18, {from: accounts[0]})
        .then(function(result) {
            done("Should have thrown error");
        }).catch(function(error){
            done();
        });
    });
});

