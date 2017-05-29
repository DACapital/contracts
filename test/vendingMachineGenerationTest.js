var VendingMachine = artifacts.require("./VendingMachine.sol");
var DacToken = artifacts.require("./DacToken.sol");
var AlwaysTransfer = artifacts.require("./AlwaysTransfer.sol");
var DacHub = artifacts.require("./DacHub.sol");

function createToken(accounts){
    let tokenContract = null;
    let hubContract = null;
    let alwaysTransferContract = null;

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
        tokenContract = instance;
        
        return hubContract.updatePlatformContract('DAC_TOKEN', tokenContract.address, {from: accounts[0]});        
    }).then((result) => {
        return hubContract.updatePlatformContract('DAC_OWNER', accounts[1], {from: accounts[0]});        
    }).then((result) => {
        return tokenContract;
    })
}

function createVendingMachine(accounts){
    let hubContract = null;

    return DacHub.deployed()
    .then((instance) => {
        return VendingMachine.new(instance.address, 0, {from: accounts[1]});
    })
}

contract('FullGen1', function(accounts) {    
    let vmContract = null;    
    let tokenContract = null;

    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {           
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
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

contract('PartialGen8', function(accounts) {    
    let vmContract = null;    
    let tokenContract = null;


    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 100 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 100 ETH purchased
            assert.equal(balance.valueOf(), 200000 * 10**18 , "Gen1  Tokens should have been transferred out");
            
            // Purchase from another account
            return vmContract.purchaseTokens({from: accounts[4], value: 106680 * 10**18 })
        }).then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[4]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 115615625 * 10**17 , "Gen1 acct 4 Tokens should have been transferred out");

            return true;
        });
    });
});


contract('FullGen10 - 1', function(accounts) {    
    let vmContract = null;    
    let tokenContract = null;


    // Validate intitial properties set on contract    
    it("Buy a the generation of coins", function() {        
        
        // Start by deploying the token
        return createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 859319 * 10**18 })
        }) .then(function(result) {            
            // Get the balance of account 3
            return tokenContract.balanceOf.call(accounts[3]);
        }).then(function(balance) {
            // Verify 1 ETH purchased the the next 1k tokens
            assert.equal(balance.valueOf(), 1679999609375 * 10**13 , "Gen10 Tokens should have been transferred out");
            return true;
        })
    })
});


contract('FullGen10 + 1', function(accounts) {    
    let vmContract = null;    
    let tokenContract = null;


    // Validate intitial properties set on contract    
    it("Should fail buying over limit", function(done) {        
        
        // Start by deploying the token
        createToken(accounts)
        .then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            
            
            return createVendingMachine(accounts)            
        }).then((instance) => {     
            vmContract = instance;
            return tokenContract.transfer(vmContract.address, 16800000 * 10**18, {from: accounts[0]})
        }) .then(function(result) {                        
            return vmContract.purchaseTokens({from: accounts[3], value: 859321 * 10**18 })
        }) .then(function(result) {            
            done("Should have thrown error");
        }).catch(function(error){
            done();
        });
    })
});
