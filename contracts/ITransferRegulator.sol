pragma solidity ^0.4.8;

/*
 * Transfer regulator interface.
 * This interface will be implemented for logic that blocks/allows transfers from the token contract.
 */
contract ITransferRegulator{
  function allowTransfer(address owner) returns (bool);
}