var DacToken = artifacts.require("./DacToken.sol");
var DacHub = artifacts.require("./DacHub.sol");

module.exports = function(deployer) {  
  return DacHub.deployed().then(function(hub) {  
    return deployer.deploy(DacToken, hub.address);
  });

};
