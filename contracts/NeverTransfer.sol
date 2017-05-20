pragma solidity ^0.4.8;

import './ITransferRegulator.sol';

/*
 * Transfer regulator that always returns true
 */
contract NeverTransfer is ITransferRegulator {
  function allowTransfer(address owner) returns (bool){
      if(owner <= 0)
        return false;
        
      return true;
  }
}