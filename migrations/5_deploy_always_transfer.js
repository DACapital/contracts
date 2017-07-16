/* global artifacts, web3 */
var AlwaysTransfer = artifacts.require('./AlwaysTransfer.sol')
var DacHub = artifacts.require('./DacHub.sol')
var DacToken = artifacts.require('./DacToken.sol')
var VendingMachine = artifacts.require('./VendingMachine.sol')

module.exports = function (deployer) {
  var tokenContract

  deployer.deploy(AlwaysTransfer).then(() => {
    return DacHub.deployed()
  })
  .then((hub) => {
    console.log('Updating hub with DAC_TRANSFER_REGULATOR: ' + AlwaysTransfer.address)
    return hub.updatePlatformContract('DAC_TRANSFER_REGULATOR', AlwaysTransfer.address)
  })
  .then(() => {
    return DacToken.deployed()
  })
  .then((token) => {
    tokenContract = token
    return VendingMachine.deployed()
  })
  .then((vm) => {
    console.log('Sending 18 million DAC tokens into the Vending Machine.')
    tokenContract.transfer(vm.address, web3.toWei('18000000', 'ether'))
  })
}
