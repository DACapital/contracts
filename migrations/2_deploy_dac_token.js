var DacToken = artifacts.require("./DacToken.sol");

module.exports = function(deployer) {  
  deployer.deploy(DacToken);
};
