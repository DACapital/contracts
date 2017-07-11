pragma solidity ^0.4.10;
import "./zeppelin/ownership/Ownable.sol";

contract StandaloneFund is Ownable{    
    
    // Flag indicating if this fund is for sale - user will need to manually set this to true to allow a sale
    bool public isForSale = false; 

    // Sale price of the fund in Wei
    uint public salePrice = 0;

    // Initialize the Fund
    function StandaloneFund(){
    }

    // Update the flag indicating if this fund is currently for sale or not - only the current owner can do this
    function SetForSale(bool _isForSale) onlyOwner {
        isForSale = _isForSale;
    }

    // Update the price of this fund - only the current owner can do this
    function SetSalePrice(uint newPrice) onlyOwner {
        salePrice = newPrice;
    }

    // Allow someone to purchase the fund.  Send current owner the ETH and assign ownership
    function Purchase() payable {
        // Ensure this fund is currently for sale
        require(forSale);

        // Ensure the value sent in is greater or equal to the required price
        require(msg.value >= salePrice);
    
        // Forward ETH
        require(owner.send(msg.value));

        // Clear sale flags
        salePrice = 0;
        isForSale = false;

        // Assign ownership
        owner = msg.sender;
    }

    // Allow the owner to withdraw any tokens that are held in this fund
    function WithdrawTokens(ERC20 token, uint amount) onlyOwner {
        token.transfer(owner, amount);
    }
}