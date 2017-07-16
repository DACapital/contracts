/* global artifacts */
var DacToken = artifacts.require('./DacToken.sol')
var DacHub = artifacts.require('./DacHub.sol')

module.exports = function (deployer, network, accounts) {
  let deployedHub

  deployer.deploy(DacHub).then(function () {
    return deployer.deploy(DacToken, DacHub.address)
  })
  .then(() => {
    return DacHub.deployed()
  })
  .then((hub) => {
    console.log('Updating hub with DAC_TOKEN: ' + DacToken.address)
    deployedHub = hub
    return deployedHub.updatePlatformContract('DAC_TOKEN', DacToken.address)
  })
  .then((hub) => {
    console.log('Updating hub with DAC_OWNER: ' + accounts[0])
    return deployedHub.updatePlatformContract('DAC_OWNER', accounts[0])
  })
}
