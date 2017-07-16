/* global artifacts */
var DacHub = artifacts.require('./DacHub.sol')
var VendingMachine = artifacts.require('./VendingMachine.sol')

module.exports = function (deployer) {
  var VENDING_MACHINE_START_BLOCK = process.env.VENDING_MACHINE_START_BLOCK

  if (!VENDING_MACHINE_START_BLOCK || parseInt(VENDING_MACHINE_START_BLOCK) === 0) {
    console.log(VENDING_MACHINE_START_BLOCK)
    throw new Error('VENDING_MACHINE_START_BLOCK env variable not set for vending machine.')
  }

  deployer.then(() => {
    return DacHub.deployed()
  })
  .then((hub) => {
    return deployer.deploy(VendingMachine, hub.address, VENDING_MACHINE_START_BLOCK)
  })
}
