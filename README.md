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
The Proposal Manager Contract will be responsible for handling any new proposal creations and executing the logic when a proposal vote is completed.

### Proposal Contract
The Proposal Contract will be used to track voting for any proposals that are submitted on the system.  The voting logic and tracking will be held inside of proposals and will follow a strategy similar to the [Colony](https://blog.colony.io/towards-better-ethereum-voting-protocols-7e54cb5a0119) proposal to have a 2 phase voting system.

In the first phase of a vote, the "Commit" phase, a user will submit a hashed vote to the proposal during the voting period.  It will be a hash of their vote of accept or reject the proposal and a random nonce.

This vote will then be tracked for their account.  While any active votes are tracked via a commit for an account, the tokens in their account are non-transferrable and are considered "locked".  During the active commit phase, a user can withraw their votes to unlock their tokens to be able to transfer to another account.

Once the commit phase has ended, a reveal phase will be started.  During this phase, the account's tokens are locked until they reveal their vote.  To reveal their vote, they send in the original vote that matches to their hash they sent in.  If the hash matches the original commit vote, then the votes are added to the tally and the account is unlocked to allow transfers of tokens to other accounts.

If a user loses their original vote and is unable to reveal their commit vote, they will not be able to transfer tokens until the reveal phase has ended.

All votes will be weighted to the amount of DAC tokens that are held by that account.

### Fee Tracker Contract
The Fee Tracker Contract will be used to hold the list of fees required to interact on the platform.  It will be a simple key/value pair record for fee lookups from other contracts.

The fee list can be updated through an "Update Fee Proposal".

### Fund Contract
The Fund Contract will be responsible for holding all assets tokens in an individual fund.  Once a Fund Proposal has been created, a fund contract will be created.  Each fund will act as a separate ERC20 token with 1 million tracking tokens for that fund.  The fund creator who creates the fund proposal will be the initial owner of all tracking tokens.

When a fund is in a pending state, the tracking tokens will not be transferrable.  Once the fund moves into an active state, the tracking tokens will become transferrable and the fund owner can sell/trade the tracking tokens.  Once the fund is moved into the closed state, the tracking tokens will not be transferrable and can be redeemed for a share of the underlying asset tokens.

### Auction Contract
The Auction Contract will be responsible for rebalancing the tokens held within a fund.  Once a rebalance proposal is created and approved, this contract will have the ability to start an auction to sell tokens from a fund in exchange for a bidder sending in another type of asset token.  The auction will allow market makers to compete to provide liquidity to the funds.