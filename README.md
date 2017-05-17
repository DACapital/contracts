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
  <img src="https://github.com/DACapital/contracts/blob/master/doc/DAC_Contracts.png?raw=true" alt="Sublime's custom image"/>
</p>