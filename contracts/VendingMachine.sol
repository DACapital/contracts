pragma solidity ^0.4.4;
import "./zeppelin/ownership/Ownable.sol";
import "./zeppelin/token/ERC20.sol";

// Vending machine to sell X number of tokens for approx Y number of ETH.
// As purchases are made, the owned ERC20 tokens will be assigned over to purchaser.
// Purchases will be priced based on the purchase "Generation" the vending machine is in.
// As more purchases are made the Generation gets incremented.
// Each generation will sell the tokens for twice as much as the previous generation.
contract VendingMachine is Ownable {

    // For debugging in dev
    event DebugString(string message);
    event DebugUint(uint value);

    // The contract where the tokens are held by this contract until they are sold.
    ERC20 public token;

    // Base units of the token
    uint constant BASE_UNITS = 10 ** 18;    
        
    // Total Amount of tokens to sell to purchasers
    // Selling 16.8 million tokens,
    uint constant public AMOUNT_TO_SELL = 16800000 * BASE_UNITS;

    // Total amount of tokens that have been sold so far.  Starts at 0.
    uint public amountSold = 0;

    // Initial price that each ETH sent in will get back in tokens.
    // Start at 2 thousand tokens per ETH
    uint constant public INITIAL_PRICE_PER_ETH = 2000 ;

    // Amount of tokens to sell per generation
    // 1.68 Million Tokens per generation
    uint constant public TOKENS_PER_GENERATION = 1680000 * BASE_UNITS;

    // Constructor initalized with the token contract that it will be selling.
    function VendingMachine(ERC20 tokenContract){
        token = tokenContract;
    }

    // This function will calculate how many tokens they will get with the amount of ETH they are sending in
    function calculateSaleAmount(uint amountSoldStart, uint ethAmount) returns (uint) {
        DebugString("Calculating amount.");
        DebugString("amountSoldStart: ");
        DebugUint(amountSoldStart);
        DebugString("ethAmount: ");
        DebugUint(ethAmount);

        

        // Keep track of the amount to sell in this transaction
        uint currentAmountToSell = 0;

        // First get the amount of tokens sold from the beginning of this generation and the amount left.
        uint currentGeneration = amountSoldStart / TOKENS_PER_GENERATION;
        DebugString("currentGeneration: ");
        DebugUint(currentGeneration);
        uint amountLeftInCurrentGeneration = TOKENS_PER_GENERATION - (amountSoldStart % TOKENS_PER_GENERATION);
        DebugString("amountLeftInCurrentGeneration: ");
        DebugUint(amountLeftInCurrentGeneration);
        // Calculate the price per ETH of the current generation
        uint salePrice = INITIAL_PRICE_PER_ETH / 2 ** currentGeneration;        
        DebugString("salePrice: ");
        DebugUint(salePrice);
        // Calculate how mant tokens they are trying to buy
        currentAmountToSell = salePrice * ethAmount;
        DebugString("currentAmountToSell: ");
        DebugUint(currentAmountToSell);
                

        // If they are buying past the current generation, then figure out how much they purchase in the next generation.
        if (currentAmountToSell > amountLeftInCurrentGeneration){

            // Calculate how much ETH would be used from the current generation
            uint ethFromCurrentGen = salePrice * amountLeftInCurrentGeneration;
            DebugString("ethFromCurrentGen: ");
            DebugUint(ethFromCurrentGen);

            // Recursively call this function with the starting amount being the next gen and remaining ETH
            uint nextGenStart = (currentGeneration + 1) * TOKENS_PER_GENERATION;
            DebugString("nextGenStart: ");
            DebugUint(nextGenStart);
            
            uint leftOverEth = ethAmount - ethFromCurrentGen;
            DebugString("leftOverEth: ");
            DebugUint(leftOverEth);

            uint nextGen = calculateSaleAmount(nextGenStart, leftOverEth);
            DebugString("nextGen: ");
            DebugUint(nextGen);

            return (ethFromCurrentGen * salePrice) + nextGen;
        }
        
        // Return the amount to sell
        return currentAmountToSell;
    }    

    // When this function is called, it will send the originator X tokens.  
    // X is determined by the price calculated based on the current generation of sales.
    function purchaseTokens() payable{
        DebugString("Test.");

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

        // Send the tokens to the buyers's account
        if(!token.transfer(msg.sender, amountPurchased)){
            throw;
        }
    }

    // This function allows the owner to withdraw any ETH that was sent in via purchases.
    function withdrawEth(uint amount) onlyOwner {
        // Send out what they are requesting to withdraw and trigger the send
        if(!msg.sender.send(amount)){
            throw;
        }
    }
}
