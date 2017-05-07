var DacToken = artifacts.require("./DacToken.sol");
var VendingMachine = artifacts.require("./VendingMachine.sol");

module.exports = function(deployer) {  
    return DacToken.deployed().then(function(token) {
        return deployer.deploy(VendingMachine, token.address);      
    });  
};
