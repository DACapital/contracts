/* global artifacts */
var FeeTracker = artifacts.require('./FeeTracker.sol')
var DacHub = artifacts.require('./DacHub.sol')

module.exports = function (deployer) {
  deployer.deploy(FeeTracker).then(() => {
    return DacHub.deployed()
  })
  .then((hub) => {
    console.log('Updating hub with DAC_FEE_TRACKER: ' + FeeTracker.address)
    return hub.updatePlatformContract('DAC_FEE_TRACKER', FeeTracker.address)
  })
}
