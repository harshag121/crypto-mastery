// Module 8: Frontend Integration - Complete dApp Frontend
// This module demonstrates building a modern Web3 frontend with React, wallet integration, and Ethereum interactions

const { ethers } = require('ethers');

console.log('=== Ethereum Frontend Integration Mastery ===\n');

// 8.1 Wallet Integration Patterns
class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.chainId = null;
    }

    // Connect to MetaMask or other injected wallet
    async connectWallet() {
        try {
            if (typeof window !== 'undefined' && window.ethereum) {
                // Request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                this.provider = new ethers.BrowserProvider(window.ethereum);
                this.signer = await this.provider.getSigner();
                this.account = await this.signer.getAddress();
                this.chainId = await this.provider.getNetwork().then(n => n.chainId);

                console.log('✅ Wallet connected:');
                console.log(`   Account: ${this.account}`);
                console.log(`   Chain ID: ${this.chainId}`);

                // Listen for account changes
                window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
                window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));

                return { account: this.account, chainId: this.chainId };
            } else {
                throw new Error('No Ethereum wallet found');
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error.message);
            throw error;
        }
    }

    // Handle account changes
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            console.log('Wallet disconnected');
            this.disconnect();
        } else {
            this.account = accounts[0];
            console.log(`Account changed to: ${this.account}`);
        }
    }

    // Handle chain changes
    handleChainChanged(chainId) {
        this.chainId = parseInt(chainId, 16);
        console.log(`Chain changed to: ${this.chainId}`);
        // Reload the page as recommended by MetaMask
        window.location.reload();
    }

    // Disconnect wallet
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.chainId = null;
        console.log('Wallet disconnected');
    }

    // Check if wallet is connected
    isConnected() {
        return this.account !== null;
    }
}

// 8.2 React Hook Patterns for Web3 (Conceptual implementation)
const Web3Hooks = {
    // useWallet hook pattern
    useWallet: () => {
        // In real React app, this would use useState and useEffect
        const mockWalletState = {
            account: '0x742d35Cc6634C0532925a3b8D9C9f077E9a8AF1b',
            isConnecting: false,
            isConnected: true,
            chainId: 1,
            balance: '1.5'
        };

        const connect = async () => {
            console.log('Connecting wallet...');
            // Implementation would call WalletManager.connectWallet()
        };

        const disconnect = () => {
            console.log('Disconnecting wallet...');
        };

        return {
            ...mockWalletState,
            connect,
            disconnect
        };
    },

    // useContract hook pattern
    useContract: (address, abi) => {
        // Mock contract instance
        const contract = {
            address,
            read: async (method, ...args) => {
                console.log(`Reading ${method} from contract ${address}`);
                return 'mock-result';
            },
            write: async (method, args, options) => {
                console.log(`Writing ${method} to contract ${address}`);
                return { hash: '0x123...', wait: () => Promise.resolve() };
            }
        };

        return contract;
    }
};

// 8.3 Transaction Management System
class TransactionManager {
    constructor(signer) {
        this.signer = signer;
        this.pendingTxs = new Map();
    }

    // Execute transaction with proper error handling
    async executeTransaction(contractMethod, options = {}) {
        try {
            console.log('\n📝 Preparing transaction...');
            
            // Estimate gas
            const estimatedGas = await contractMethod.estimateGas();
            const gasLimit = estimatedGas * 120n / 100n; // Add 20% buffer
            
            console.log(`   Estimated gas: ${estimatedGas.toString()}`);
            console.log(`   Gas limit: ${gasLimit.toString()}`);

            // Get current gas price
            const feeData = await this.signer.provider.getFeeData();
            console.log(`   Max fee per gas: ${ethers.formatUnits(feeData.maxFeePerGas || 0, 'gwei')} gwei`);

            // Send transaction
            const tx = await contractMethod({
                gasLimit,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                ...options
            });

            console.log(`🚀 Transaction sent: ${tx.hash}`);
            this.pendingTxs.set(tx.hash, tx);

            // Wait for confirmation
            console.log('⏳ Waiting for confirmation...');
            const receipt = await tx.wait();
            
            console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
            console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
            
            this.pendingTxs.delete(tx.hash);
            return receipt;

        } catch (error) {
            console.error('❌ Transaction failed:', this.parseError(error));
            throw error;
        }
    }

    // Parse and format errors for user display
    parseError(error) {
        if (error.code === 'ACTION_REJECTED') {
            return 'Transaction was rejected by user';
        } else if (error.code === 'INSUFFICIENT_FUNDS') {
            return 'Insufficient funds for transaction';
        } else if (error.reason) {
            return error.reason;
        } else if (error.data?.message) {
            return error.data.message;
        } else {
            return error.message || 'Unknown error occurred';
        }
    }

    // Get pending transactions
    getPendingTransactions() {
        return Array.from(this.pendingTxs.values());
    }
}

// 8.4 Event Listening and Real-time Updates
class EventManager {
    constructor(provider) {
        this.provider = provider;
        this.listeners = new Map();
    }

    // Listen to contract events
    async listenToContractEvents(contract, eventName, callback) {
        try {
            console.log(`\n👂 Listening to ${eventName} events...`);
            
            const filter = contract.filters[eventName]();
            const listener = (...args) => {
                const event = args[args.length - 1]; // Last argument is the event object
                console.log(`📢 ${eventName} event received:`, {
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash,
                    args: args.slice(0, -1)
                });
                callback(...args);
            };

            contract.on(filter, listener);
            this.listeners.set(eventName, { contract, filter, listener });

            return () => {
                contract.off(filter, listener);
                this.listeners.delete(eventName);
                console.log(`🔇 Stopped listening to ${eventName} events`);
            };

        } catch (error) {
            console.error(`Failed to listen to ${eventName} events:`, error.message);
        }
    }

    // Listen to new blocks
    async listenToBlocks(callback) {
        console.log('\n🎯 Listening to new blocks...');
        
        this.provider.on('block', (blockNumber) => {
            console.log(`📦 New block: ${blockNumber}`);
            callback(blockNumber);
        });

        return () => {
            this.provider.off('block');
            console.log('🔇 Stopped listening to blocks');
        };
    }

    // Cleanup all listeners
    cleanup() {
        for (const [eventName, { contract, filter, listener }] of this.listeners) {
            contract.off(filter, listener);
        }
        this.listeners.clear();
        this.provider.removeAllListeners();
        console.log('🧹 All event listeners cleaned up');
    }
}

// 8.5 Complete dApp Component Architecture (Conceptual)
const DAppComponents = {
    // Main App component structure
    App: {
        structure: `
        <WalletProvider>
          <Router>
            <Header />
            <Routes>
              <Route path="/" component={Dashboard} />
              <Route path="/swap" component={TokenSwap} />
              <Route path="/pool" component={LiquidityPool} />
              <Route path="/stake" component={Staking} />
            </Routes>
            <TransactionToast />
          </Router>
        </WalletProvider>
        `,
        description: 'Main application structure with routing and wallet context'
    },

    // Wallet connection component
    WalletConnect: {
        props: ['onConnect', 'onDisconnect', 'isConnecting'],
        methods: [
            'handleConnect',
            'handleDisconnect',
            'handleChainSwitch'
        ],
        description: 'Handles wallet connection UI and logic'
    },

    // Token swap component
    TokenSwap: {
        state: [
            'fromToken',
            'toToken',
            'fromAmount',
            'toAmount',
            'slippage',
            'isSwapping'
        ],
        methods: [
            'handleTokenSelect',
            'handleAmountChange',
            'executeSwap',
            'calculateOutput'
        ],
        description: 'Complete token swap interface'
    }
};

// 8.6 Performance Optimization Patterns
class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.batchQueue = [];
        this.batchTimeout = null;
    }

    // Cache contract calls
    async cachedContractCall(key, contractCall, ttl = 30000) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < ttl) {
            console.log(`📋 Cache hit for ${key}`);
            return cached.data;
        }

        console.log(`🔄 Fetching ${key}...`);
        const data = await contractCall();
        this.cache.set(key, { data, timestamp: Date.now() });
        return data;
    }

    // Batch multiple calls
    batchCall(call) {
        return new Promise((resolve, reject) => {
            this.batchQueue.push({ call, resolve, reject });
            
            if (this.batchTimeout) {
                clearTimeout(this.batchTimeout);
            }
            
            this.batchTimeout = setTimeout(() => {
                this.executeBatch();
            }, 10); // Batch calls within 10ms
        });
    }

    async executeBatch() {
        if (this.batchQueue.length === 0) return;

        console.log(`🚀 Executing batch of ${this.batchQueue.length} calls`);
        const batch = this.batchQueue.splice(0);
        
        try {
            const results = await Promise.all(batch.map(item => item.call()));
            batch.forEach((item, index) => {
                item.resolve(results[index]);
            });
        } catch (error) {
            batch.forEach(item => {
                item.reject(error);
            });
        }
    }
}

// 8.7 Error Boundary and User Experience
class ErrorHandler {
    constructor() {
        this.errors = [];
    }

    // Handle and categorize errors
    handleError(error, context) {
        const errorInfo = {
            message: error.message,
            context,
            timestamp: new Date().toISOString(),
            type: this.categorizeError(error)
        };

        this.errors.push(errorInfo);
        console.error(`❌ ${errorInfo.type} error in ${context}:`, errorInfo.message);

        return this.getUserMessage(errorInfo);
    }

    categorizeError(error) {
        if (error.code === 'ACTION_REJECTED') return 'USER_REJECTION';
        if (error.code === 'INSUFFICIENT_FUNDS') return 'INSUFFICIENT_FUNDS';
        if (error.code === 'NETWORK_ERROR') return 'NETWORK_ERROR';
        if (error.reason) return 'CONTRACT_ERROR';
        return 'UNKNOWN_ERROR';
    }

    getUserMessage(errorInfo) {
        const messages = {
            USER_REJECTION: 'Transaction was cancelled. Please try again when ready.',
            INSUFFICIENT_FUNDS: 'Insufficient funds. Please check your balance and try again.',
            NETWORK_ERROR: 'Network connection issue. Please check your internet and try again.',
            CONTRACT_ERROR: `Smart contract error: ${errorInfo.message}`,
            UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support.'
        };

        return messages[errorInfo.type] || messages.UNKNOWN_ERROR;
    }
}

// Demo execution
async function demonstrateFrontendIntegration() {
    console.log('\n=== 8.1 Wallet Integration Demo ===');
    const walletManager = new WalletManager();
    
    // Simulate wallet connection (would be actual in browser)
    console.log('Wallet integration patterns demonstrated');
    console.log('- MetaMask connection flow');
    console.log('- Account and chain change handling');
    console.log('- Connection state management');

    console.log('\n=== 8.2 React Hooks Demo ===');
    const wallet = Web3Hooks.useWallet();
    console.log('Wallet state:', {
        account: wallet.account,
        isConnected: wallet.isConnected,
        chainId: wallet.chainId
    });

    console.log('\n=== 8.3 Transaction Management Demo ===');
    // Simulate transaction management
    console.log('Transaction management features:');
    console.log('- Gas estimation and optimization');
    console.log('- Error parsing and user-friendly messages');
    console.log('- Transaction status tracking');
    console.log('- Retry mechanisms');

    console.log('\n=== 8.4 Event Management Demo ===');
    console.log('Event listening capabilities:');
    console.log('- Real-time contract event monitoring');
    console.log('- Block number updates');
    console.log('- Automatic cleanup and memory management');

    console.log('\n=== 8.5 Component Architecture Demo ===');
    console.log('dApp component structure:');
    Object.entries(DAppComponents).forEach(([name, component]) => {
        console.log(`- ${name}: ${component.description}`);
    });

    console.log('\n=== 8.6 Performance Optimization Demo ===');
    const optimizer = new PerformanceOptimizer();
    console.log('Performance optimization techniques:');
    console.log('- Caching contract calls');
    console.log('- Batching multiple requests');
    console.log('- Lazy loading and code splitting');

    console.log('\n=== 8.7 Error Handling Demo ===');
    const errorHandler = new ErrorHandler();
    const mockError = new Error('Execution reverted: Insufficient balance');
    mockError.reason = 'Insufficient balance';
    const userMessage = errorHandler.handleError(mockError, 'TokenSwap');
    console.log('User-friendly error message:', userMessage);

    console.log('\n🎉 Frontend Integration mastery complete!');
    console.log('\nKey takeaways:');
    console.log('- Modern wallet integration patterns');
    console.log('- React hooks for Web3 development');
    console.log('- Transaction management and UX');
    console.log('- Real-time event handling');
    console.log('- Performance optimization strategies');
    console.log('- Error handling and user experience');
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WalletManager,
        TransactionManager,
        EventManager,
        PerformanceOptimizer,
        ErrorHandler,
        Web3Hooks,
        DAppComponents,
        demonstrateFrontendIntegration
    };
}

// Run demo if called directly
if (require.main === module) {
    demonstrateFrontendIntegration().catch(console.error);
}
