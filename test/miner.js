
function mineBlock(until){
    return new Promise(function(resolve,reject){
            
            let currentBlock = web3.eth.blockNumber;
            //console.log("Mining next block", currentBlock);

            if(currentBlock >= until){
                return resolve(currentBlock);
            }

            web3.currentProvider.sendAsync({
                jsonrpc: "2.0",
                method: "evm_mine",
                id: 12345
            }, (error, result) => {
                if(error !== null) return reject(error);

                console.log("Mining a block...");
                return mineBlock(until).then((block) => {
                    resolve(block); 
                });
            });    
        });
}

module.exports = {
    // Recursively mine blocks
    mineBlock: function (until) {
        return mineBlock(until);
    }
};


