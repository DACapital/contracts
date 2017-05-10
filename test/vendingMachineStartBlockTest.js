var VendingMachine = artifacts.require("./VendingMachine.sol");
var DacToken = artifacts.require("./DacToken.sol");


// Contract inherits from Ownable, so just verify expected functionality.
contract('Block Start', function(accounts) {    
    let vmContract = null;
    let tokenContract = null;

    it("should fail if not started yet", function(done) {                
        // Start by deploying the token
        DacToken.deployed().then(function(instance) {
            // Save off the token contract instance
            tokenContract = instance;            
            // Create the new vending machine contract with the token contract in constructor - start at a later block
            return VendingMachine.new(tokenContract.address, 99999999, {from: accounts[1]});
        }).then(function(instance) {
            vmContract = instance;        
            return vmContract.purchaseTokens({from: accounts[1], value: 1000})
        }).then(function(result) {                        
            done("Should have thrown error");
        }).catch(function(error){       
            done();
        });
    });
});