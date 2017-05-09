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


contract('FullGen1', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 840 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 1680000 * 10**18 , "Gen1  Tokens should have been transferred out");
            return true;
        })
    })
});

contract('FullGen2', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {        
            return vmContract.purchaseTokens({from: accounts[3], value: 2520 * 10**18 })
        }) .then(function(result) {        
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 3360000 * 10**18 , "Gen2  Tokens should have been transferred out");
            return true;
        })
    })
});


contract('FullGen3', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 5880 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 5040000 * 10**18 , "Gen3  Tokens should have been transferred out");
            return true;
        })
    })
});



contract('FullGen4', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 12600 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 6720000 * 10**18 , "Gen4  Tokens should have been transferred out");
            return true;
        })
    })
});


contract('FullGen5', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 26040 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 8400000 * 10**18 , "Gen5 Tokens should have been transferred out");
            return true;
        })
    })
});


contract('FullGen6', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 52920 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 10080000 * 10**18 , "Gen6 Tokens should have been transferred out");
            return true;
        })
    })
});


contract('FullGen7', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 106680 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 11760000 * 10**18 , "Gen7 Tokens should have been transferred out");
            return true;
        })
    })
});


contract('FullGen8', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 214200 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 13440000 * 10**18 , "Gen8 Tokens should have been transferred out");
            return true;
        })
    })
});


contract('FullGen9', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 429240 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 15120000 * 10**18 , "Gen9 Tokens should have been transferred out");
            return true;
        })
    })
});


contract('FullGen10', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 859320 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 16800000 * 10**18 , "Gen10 Tokens should have been transferred out");
            return true;
        })
    })
});

contract('PartialGen1', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 100 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 200000 * 10**18 , "Gen1  Tokens should have been transferred out");
            
            // Purchase from another account
            return vmContract.purchaseTokens({from: accounts[4], value: 500 * 10**18 })
        }).then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[4]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 1000000 * 10**18 , "Gen1 acct 4 Tokens should have been transferred out");

            return true;
        });
    });
});
/*
contract('PartialGen8', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 100 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 200000 * 10**18 , "Gen1  Tokens should have been transferred out");
            
            // Purchase from another account - all gen 7 + 12345 into gen 8            
            return vmContract.purchaseTokens({from: accounts[4], value: 11883456 * 10**18 })
        }).then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[4]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 13489000 * 10**18 , "Gen1 acct 4 Tokens should have been transferred out");

            return true;
        });
    });
});
*/


    // Send 100 then 2 gen worth
    // Send 100 then 3 gen worth
    // Send 100 then 4 gen worth
    
    // Send MAX -1
    // Send MAX
    // Send MAX + 1
    
    // Send MAX -1 then send 1
    // Send MAX -1 then send 2

    // Try to withdraw 0
    // Try to withdraw 10
    // Try to withdraw more than is in the contract
    // Try to withdraw from invalid account

