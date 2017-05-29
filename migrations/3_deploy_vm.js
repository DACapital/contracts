var DacHub = artifacts.require("./DacHub.sol");
var VendingMachine = artifacts.require("./VendingMachine.sol");

module.exports = function(deployer) {  
    return DacHub.deployed().then(function(hub) {  
        return deployer.deploy(VendingMachine, hub.address);      
    });
};
