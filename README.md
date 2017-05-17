DACapital Contracts
=======
Contracts running the DACapital Platform.

# Requirements
You'll need at least Node 6.9.1 to run this project. Check the documentation for ethereum rpc and truffle to make sure what the latest requirements are.

# Setup
Make sure you have truffle setup and ethereum testrpc:

```
npm i -g truffle
npm i -g ethereumjs-testrpc
```

# Testing
Tests can be run with:
```
npm run test
```

# Development
- If you use vim as an editor, install the [vim-solidity plugin](https://github.com/tomlion/vim-solidity)

# Contracts

#### Note that the DA.Capital platform is a work in progress.  All docs/code is in flux until TBD.

The DA.Capital platform is modeled after a "Hub and Spoke" design, where the hub contract is the source of truth for references to all other contracts.  Any time a contract needs to interact with another contract or library, it will pull the reference address from the Hub.  This should allow the platform to evolve over time with contracts being updated and the addresses stored in the hub updated to the new versions.

<p align="center">
  <img src="https://github.com/DACapital/contracts/blob/master/doc/DAC_Contracts.png?raw=true" alt="DA Capital Contracts"/>
</p>

### Hub Contract
The Hub is a simple key/value pair storage contract of Strings/Addresses that is only updatable by its owner.  It will hold a reference to all contracts in the platform and allow any other contract to reference it and pull addresses for the other contracts.  

For example, if the token contract needs to know if an account is allowed to transfer tokens, it could pull the address of a "Transfer Allowed" contract and ask it if the account is allowed to make the transfer.  This will allow the logic to determine if transfers are allowed to be updated over time.  It may need to block transfers during certain windows of time, like during voting periods or other future scenarios when we would like to manage transfers.

Initially this contract may be owned by our multi-sig wallet which would allow us to directly update it, but once voting through proposals is enabled, it should only be allowed to get updated through accepted proposals to update the addresses.

### DAC Token Contract
The Token Contract is an ERC20 compliant contract based on the OpenZeppelin library.  This contract will track the address ownership of DAC tokens that power the platform.  Voting and other future use cases will rely on this for token balance queries and automated transfers of tokens through the other platform contracts.

DAC Tokens will be required to interact with the platform.  The tokens will be used for creating voting proposals, making auction bids, and voting on the outcomes of proposals to update the platform or funds.

The total number of tokens created will be a fixed 21 million tokens.  The tokens will be configured as standard ERC tokens with 18 decimal places for base units, therefore there will be "21m * 10**18" base units.

20% of the DAC Tokens will be allocated to the creators and maintainers of the platform with the rest being sold through the Vending Machine.

### Vending Machine Contract
The Vending Machine Contract will be used to dispense DAC Tokens to anyone who would like to aquire them to use on the platform.  It is set up to dispense 80% of all DAC Tokens.  To aquire tokens any user can send ETH to the specified function in the contract and automatically recieve a calculated amount of DAC in return.  DAC tokens will be transferred to the originating address of the transaction, so no ETH should be sent directly from exchanges, but instead it should be sent from a wallet that is owned by the user.

The Vending Machine is set up to dispense the tokens in a series of 10 Generations.  Each generation will have a price that is double the preceding generation, with the initial price starting at 2,000 DAC Tokens per ETH.  Each generation will dispense 1.68 million DAC Tokens, totaling 16.8 million DAC Tokens which is 80% of all the available supply of 21 million tokens.

<p align="center">
  <img src="https://github.com/DACapital/contracts/blob/master/doc/vending_machine.png?raw=true" alt="DA Capital Contracts"/>
</p>

### Proposal Manager Contract
TBD

### Proposal Contract
TBD

### Fee Tracker Contract
TBD

### Fund Contract
TBD

### Auction Contract
TBD