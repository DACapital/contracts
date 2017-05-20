var DacToken = artifacts.require("./DacToken.sol");
var AlwaysTransfer = artifacts.require("./AlwaysTransfer.sol");

module.exports = function(deployer) {  

  deployer.deploy(AlwaysTransfer).then(function() {
    return deployer.deploy(DacToken, AlwaysTransfer.address);
  });

};
