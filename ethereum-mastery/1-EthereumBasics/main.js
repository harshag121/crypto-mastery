require('dotenv').config();
const { ethers } = require('ethers');

class EthereumBasics {
    constructor() {
        // Initialize providers for different networks
        this.providers = {
            mainnet: new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo'),
            sepolia: new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/demo'),
            local: new ethers.JsonRpcProvider('http://localhost:8545') // For local development
        };
        
        this.currentProvider = this.providers.mainnet;
        console.log('🔗 Ethereum Basics Module Initialized');
        console.log('📡 Connected to Ethereum Mainnet');
    }

    // Switch between different networks
    switchNetwork(network) {
        if (this.providers[network]) {
            this.currentProvider = this.providers[network];
            console.log(`\n🔄 Switched to ${network.toUpperCase()} network`);
        } else {
            console.log(`❌ Network ${network} not supported`);
        }
    }

    // Get basic network information
    async getNetworkInfo() {
        try {
            const network = await this.currentProvider.getNetwork();
            const blockNumber = await this.currentProvider.getBlockNumber();
            
            console.log('\n📊 Network Information:');
            console.log(`   Name: ${network.name}`);
            console.log(`   Chain ID: ${network.chainId}`);
            console.log(`   Latest Block: ${blockNumber}`);
            
            return { network, blockNumber };
        } catch (error) {
            console.error('❌ Error getting network info:', error.message);
        }
    }

    // Explore Ethereum addresses and account types
    async exploreAccounts() {
        console.log('\n🏦 Account Types and Addresses');
        
        // Example addresses
        const addresses = {
            'Vitalik Buterin (EOA)': '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
            'Uniswap V3 Router (Contract)': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            'USDC Token Contract': '0xA0b86a33E6441FA9B89E0CCFb2EB69cb3F99cB77'
        };

        for (const [name, address] of Object.entries(addresses)) {
            await this.analyzeAccount(address, name);
        }
    }

    // Analyze a specific account
    async analyzeAccount(address, name = '') {
        try {
            const balance = await this.currentProvider.getBalance(address);
            const transactionCount = await this.currentProvider.getTransactionCount(address);
            const code = await this.currentProvider.getCode(address);
            
            const isContract = code !== '0x';
            const balanceInEth = ethers.formatEther(balance);
            
            console.log(`\n📋 Account Analysis${name ? ` - ${name}` : ''}:`);
            console.log(`   Address: ${address}`);
            console.log(`   Type: ${isContract ? 'Contract Account' : 'Externally Owned Account (EOA)'}`);
            console.log(`   Balance: ${balanceInEth} ETH`);
            console.log(`   Transaction Count: ${transactionCount}`);
            
            if (isContract) {
                console.log(`   Contract Code Size: ${(code.length - 2) / 2} bytes`);
            }
            
            return {
                address,
                isContract,
                balance: balanceInEth,
                transactionCount,
                codeSize: isContract ? (code.length - 2) / 2 : 0
            };
        } catch (error) {
            console.error(`❌ Error analyzing account ${address}:`, error.message);
        }
    }

    // Explore blocks and transactions
    async exploreBlocks() {
        try {
            console.log('\n🧱 Block and Transaction Exploration');
            
            const latestBlockNumber = await this.currentProvider.getBlockNumber();
            const block = await this.currentProvider.getBlock(latestBlockNumber);
            
            console.log(`\n📦 Latest Block #${latestBlockNumber}:`);
            console.log(`   Hash: ${block.hash}`);
            console.log(`   Timestamp: ${new Date(block.timestamp * 1000).toISOString()}`);
            console.log(`   Transactions: ${block.transactions.length}`);
            console.log(`   Gas Used: ${block.gasUsed.toString()}`);
            console.log(`   Gas Limit: ${block.gasLimit.toString()}`);
            console.log(`   Base Fee: ${block.baseFeePerGas ? ethers.formatUnits(block.baseFeePerGas, 'gwei') : 'N/A'} gwei`);
            
            // Analyze first transaction in the block
            if (block.transactions.length > 0) {
                await this.analyzeTransaction(block.transactions[0]);
            }
            
            return block;
        } catch (error) {
            console.error('❌ Error exploring blocks:', error.message);
        }
    }

    // Analyze a specific transaction
    async analyzeTransaction(txHash) {
        try {
            const tx = await this.currentProvider.getTransaction(txHash);
            const receipt = await this.currentProvider.getTransactionReceipt(txHash);
            
            console.log(`\n📝 Transaction Analysis:`);
            console.log(`   Hash: ${tx.hash}`);
            console.log(`   From: ${tx.from}`);
            console.log(`   To: ${tx.to || 'Contract Creation'}`);
            console.log(`   Value: ${ethers.formatEther(tx.value)} ETH`);
            console.log(`   Gas Limit: ${tx.gasLimit.toString()}`);
            console.log(`   Gas Price: ${ethers.formatUnits(tx.gasPrice, 'gwei')} gwei`);
            
            if (receipt) {
                console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
                console.log(`   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
                console.log(`   Transaction Fee: ${ethers.formatEther(receipt.gasUsed * tx.gasPrice)} ETH`);
            }
            
            return { tx, receipt };
        } catch (error) {
            console.error(`❌ Error analyzing transaction ${txHash}:`, error.message);
        }
    }

    // Demonstrate gas concepts
    async demonstrateGas() {
        console.log('\n⛽ Gas System Demonstration');
        
        try {
            // Get current gas price
            const feeData = await this.currentProvider.getFeeData();
            
            console.log('\n💰 Current Fee Data:');
            if (feeData.gasPrice) {
                console.log(`   Gas Price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
            }
            if (feeData.maxFeePerGas) {
                console.log(`   Max Fee Per Gas: ${ethers.formatUnits(feeData.maxFeePerGas, 'gwei')} gwei`);
                console.log(`   Max Priority Fee: ${ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')} gwei`);
            }
            
            // Estimate gas for different transaction types
            const estimations = await this.estimateGasForCommonOperations();
            
            console.log('\n📊 Gas Estimates for Common Operations:');
            Object.entries(estimations).forEach(([operation, gasEstimate]) => {
                if (gasEstimate) {
                    const costInEth = ethers.formatEther(gasEstimate * (feeData.gasPrice || feeData.maxFeePerGas));
                    console.log(`   ${operation}: ${gasEstimate.toString()} gas (~${costInEth} ETH)`);
                }
            });
            
        } catch (error) {
            console.error('❌ Error demonstrating gas:', error.message);
        }
    }

    // Estimate gas for common operations
    async estimateGasForCommonOperations() {
        const estimations = {};
        
        try {
            // Simple ETH transfer
            estimations['ETH Transfer'] = await this.currentProvider.estimateGas({
                to: '0x0000000000000000000000000000000000000000',
                value: ethers.parseEther('0.1')
            });
        } catch (error) {
            console.log('   Note: Gas estimation requires a funded account');
        }
        
        // Known gas costs for reference
        estimations['ERC20 Transfer'] = BigInt(65000);
        estimations['Uniswap Swap'] = BigInt(150000);
        estimations['NFT Mint'] = BigInt(100000);
        estimations['Contract Deployment'] = BigInt(1000000);
        
        return estimations;
    }

    // Demonstrate state concepts
    async demonstrateState() {
        console.log('\n🌐 Ethereum State Concepts');
        
        // Show how state changes with transactions
        const vitalikAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        
        try {
            const currentBlock = await this.currentProvider.getBlockNumber();
            const pastBlock = currentBlock - 1000; // 1000 blocks ago
            
            const currentBalance = await this.currentProvider.getBalance(vitalikAddress);
            const pastBalance = await this.currentProvider.getBalance(vitalikAddress, pastBlock);
            
            console.log(`\n📈 State Changes Over Time (Vitalik's Address):`);
            console.log(`   Balance 1000 blocks ago: ${ethers.formatEther(pastBalance)} ETH`);
            console.log(`   Current balance: ${ethers.formatEther(currentBalance)} ETH`);
            console.log(`   Change: ${ethers.formatEther(currentBalance - pastBalance)} ETH`);
            
        } catch (error) {
            console.error('❌ Error demonstrating state:', error.message);
        }
    }

    // Educational summary
    printEducationalSummary() {
        console.log('\n🎓 Educational Summary');
        console.log('=====================================');
        console.log('You have learned about:');
        console.log('• Ethereum network architecture');
        console.log('• Account types (EOA vs Contract)');
        console.log('• Block structure and transactions');
        console.log('• Gas system and fee calculation');
        console.log('• State model and historical queries');
        console.log('• How to interact with Ethereum using ethers.js');
        console.log('\n🚀 Ready for Module 2: Solidity Fundamentals!');
    }
}

// Main execution function
async function main() {
    console.log('🚀 Ethereum Mastery - Module 1: Ethereum Basics');
    console.log('================================================\n');
    
    const ethereum = new EthereumBasics();
    
    try {
        // Network information
        await ethereum.getNetworkInfo();
        
        // Account exploration
        await ethereum.exploreAccounts();
        
        // Block and transaction exploration
        await ethereum.exploreBlocks();
        
        // Gas demonstration
        await ethereum.demonstrateGas();
        
        // State demonstration
        await ethereum.demonstrateState();
        
        // Educational summary
        ethereum.printEducationalSummary();
        
    } catch (error) {
        console.error('❌ Main execution error:', error.message);
        console.log('\n💡 Tip: Make sure you have internet connection to access Ethereum mainnet');
    }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error.message);
});

// Run the main function
if (require.main === module) {
    main();
}

module.exports = EthereumBasics;
