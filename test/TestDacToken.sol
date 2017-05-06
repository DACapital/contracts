pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DacToken.sol";

contract TestDacToken {

  function testInitialBalanceUsingDeployedContract() {
    DacToken meta = DacToken(DeployedAddresses.DacToken());

    uint expected = 21000000 * 10**18;

    Assert.equal(meta.balanceOf(tx.origin), expected, "Owner should have 21 million tokens initially");
  }
}
