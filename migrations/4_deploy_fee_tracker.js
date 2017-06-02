var FeeTracker = artifacts.require("./FeeTracker.sol");

module.exports = function(deployer) {
  return deployer.deploy(FeeTracker);
};
