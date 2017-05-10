var VendingMachine = artifacts.require("./VendingMachine.sol");
var DacToken = artifacts.require("./DacToken.sol");


// Contract inherits from Ownable, so just verify expected functionality.
contract('Ownership transfer', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    
    it("Should transfer ownership", function() {        
        
        // Start by deploying the token
        return DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, 0, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;
            
            return vmContract.owner.call();
        }).then(function(owner) {                        
            assert.equal(owner, accounts[1], "Should have correct owner set to #1");

            return vmContract.transferOwnership(accounts[2], {from: accounts[1]})
        }).then(function(result) {                        
            return vmContract.owner.call();            
        }).then(function(owner) {                        
            assert.equal(owner, accounts[2], "Should have correct owner set to #2");
        });
    });
});

contract('Ownership transfer fail', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;
    
    it("Should not transfer ownership", function(done) {                
        // Start by deploying the token
        DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            
            // Create the new vending machine contract with the token contract in constructor
            return VendingMachine.new(tokenContract.address, 0, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;        
            return vmContract.transferOwnership(accounts[2], {from: accounts[2]})
        }).then(function(result) {                        
            done("Should have thrown error");
        }).catch(function(error){       
            done();
        });
    });
});