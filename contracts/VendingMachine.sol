pragma solidity ^0.4.8;
import "./zeppelin/token/ERC20.sol";
import "./DacHub.sol";
import './DacHubClient.sol';

// Vending machine to sell X number of tokens for Y number of ETH.
// As purchases are made, the owned ERC20 tokens will be assigned over to purchaser.
// Purchases will be priced based on the purchase "Generation" the vending machine is in.
// As more purchases are made the Generation gets incremented.
// Each generation will sell the tokens for twice as much as the previous generation.
contract VendingMachine is DacHubClient {
    
    // Total amount of tokens that have been sold so far.  Starts at 0.
    uint public amountSold = 0;

    // Block to start selling tokens
    uint public startBlock;

    // Base units of the token
    uint constant BASE_UNITS = 10 ** 18;        
        
    // Total Amount of tokens to sell to purchasers
    // Selling 16.8 million tokens,
    uint constant public AMOUNT_TO_SELL = 16800000 * BASE_UNITS;    

    // Initial price that each ETH sent in will get back in tokens.
    // Start at 2 thousand tokens per ETH
    uint constant public INITIAL_PRICE_PER_ETH = 2000 ;

    // Amount of tokens to sell per generation
    // 1.68 Million Tokens per generation
    uint constant public TOKENS_PER_GENERATION = 1680000 * BASE_UNITS;

    // Constructor initalized with the token contract that it will be selling.
    function VendingMachine(DacHub _dacHub, uint start){
        // Save off the hub
        dacHub = _dacHub;   

        // Save off the start block
        startBlock = start;
    }

    // This function will calculate how many tokens they will get with the amount of ETH they are sending in
    function calculateSaleAmount(uint amountSoldStart, uint ethAmount) returns (uint) {

        // Keep track of the amount to sell in this transaction
        uint currentAmountToSell = 0;

        // First get the amount of tokens sold from the beginning of this generation and the amount left.
        uint currentGeneration = amountSoldStart / TOKENS_PER_GENERATION;        
        uint amountLeftInCurrentGeneration = TOKENS_PER_GENERATION - (amountSoldStart % TOKENS_PER_GENERATION);

        // NOTE: The salePrice = (INITIAL_PRICE_PER_ETH / 2 ** currentGeneration).  Anywhere you see weird math related to this,
        // assume that it is being done to deal with the fact that later generations have a fractional price (which solidity can't handle yet).
        // When/If this is added, this can be simplified.  Until then you will see the salePrice deconstructed in the calculations.

        // Calculate how mant tokens they are trying to buy        
        currentAmountToSell = (ethAmount * INITIAL_PRICE_PER_ETH) / 2 ** currentGeneration; // => ethAmount * salePrice

        // If they are buying past the current generation, then figure out how much they purchase in the next generation.
        if (currentAmountToSell > amountLeftInCurrentGeneration){

            // Calculate how much ETH would be used from the current generation
            uint ethFromCurrentGen =  ((2 ** currentGeneration) * amountLeftInCurrentGeneration) / INITIAL_PRICE_PER_ETH; // => amountLeftInCurrentGeneration / salePrice

            // Token number to start with in the next generation
            uint nextGenStart = (currentGeneration + 1) * TOKENS_PER_GENERATION;            

            // Eth available to purchase in the next generation
            uint leftOverEth = ethAmount - ethFromCurrentGen;

            // Recursively call this function with the starting amount being the next gen and remaining ETH
            uint nextGen = calculateSaleAmount(nextGenStart, leftOverEth);

            // Return the current tokens sold in this generation plus any later generations.
            return ((ethFromCurrentGen * INITIAL_PRICE_PER_ETH) / 2 ** currentGeneration) + nextGen; // => (ethFromCurrentGen * salePrice) + nextGen
        }
        
        // Return the amount to sell
        return currentAmountToSell;
    }    

    // When this function is called, it will send the originator X tokens.  
    // X is determined by the price calculated based on the current generation of sales.
    function purchaseTokens() payable{

        // Verify the token sale has started
        if(block.number < startBlock){
            throw;
        }

        // Verify some ETH was sent in
        if(msg.value == 0){
            throw;
        }

        // Figure out how many tokens they are buying
        uint amountPurchased = calculateSaleAmount(amountSold, msg.value);
        
        // Verify the buyer isn't going over the limit of how many this contract is selling
        if( amountSold + amountPurchased > AMOUNT_TO_SELL ){
            throw;
        }

        // Update the total amount sold
        amountSold += amountPurchased;

        // Get the token address from the hub
        ERC20 token = ERC20(getHubContractAddress(DAC_TOKEN));

        // Send the tokens to the buyers's account
        token.transfer(msg.sender, amountPurchased);

    }

    // This function allows the owner to withdraw any ETH that was sent in via purchases.
    function withdrawEth(uint amount) {

        // Get the DAC owner wallet.  This should be the only address that is allowed to withdraw
        address owner = getHubContractAddress(DAC_OWNER);
        if (msg.sender != owner) {
            throw;
        }        

        // Verify they are requesting a valid amount
        if(amount <= 0){
            throw;
        }

        // Send out what they are requesting to withdraw and trigger the send
        if(!msg.sender.send(amount)){
            throw;
        }
    }
}
