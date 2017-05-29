var DacToken = artifacts.require("./DacToken.sol");
var DacHub = artifacts.require("./DacHub.sol");

module.exports = function(deployer) {  
  deployer.deploy(DacHub).then(function() {
    return deployer.deploy(DacToken, DacHub.address);
  });
};
