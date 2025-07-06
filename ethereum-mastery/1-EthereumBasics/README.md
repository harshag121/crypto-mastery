# Module 1: Ethereum Basics

## 🎯 Learning Objectives
- Understand Ethereum's architecture and how it differs from Bitcoin
- Learn about the Ethereum Virtual Machine (EVM)
- Explore accounts, addresses, and the state model
- Understand gas, gas prices, and transaction fees
- Connect to Ethereum networks and query blockchain data

## 📚 Core Concepts

### Ethereum vs Bitcoin
- **Bitcoin**: Digital currency focused on peer-to-peer transactions
- **Ethereum**: Programmable blockchain platform for decentralized applications (dApps)
- **Smart Contracts**: Self-executing contracts with terms directly written into code

### Ethereum Virtual Machine (EVM)
- Runtime environment for smart contracts
- Stack-based virtual machine
- Deterministic execution across all nodes
- Gas-based fee model for computation

### Account Types
1. **Externally Owned Accounts (EOAs)**
   - Controlled by private keys
   - Can initiate transactions
   - No associated code

2. **Contract Accounts**
   - Controlled by smart contract code
   - Cannot initiate transactions independently
   - Store code and state

### State Model
- Ethereum maintains a global state
- State transitions occur through transactions
- Each account has: balance, nonce, storage, code

### Gas System
- **Gas**: Unit of computational work
- **Gas Price**: Cost per unit of gas (in wei)
- **Gas Limit**: Maximum gas willing to spend
- **Transaction Fee** = Gas Used × Gas Price

## 🔧 Practical Implementation

### Prerequisites
```bash
npm install ethers dotenv
```

### What We'll Build
1. Connect to Ethereum networks (mainnet, testnets)
2. Query account balances and information
3. Explore blocks and transactions
4. Calculate gas costs
5. Understand state changes

### Key Functions Demonstrated
- `getBalance()` - Check ETH balance
- `getTransactionCount()` - Get account nonce
- `getBlock()` - Retrieve block information
- `getTransaction()` - Get transaction details
- `estimateGas()` - Estimate gas costs

## 🚀 Running the Code

```bash
cd 1-EthereumBasics
node main.js
```

## 🔍 What You'll Learn
- How to connect to Ethereum using ethers.js
- The structure of Ethereum addresses and accounts
- How to read blockchain data
- Understanding gas costs and optimization
- The difference between mainnet and testnets

## 📖 Additional Resources
- [Ethereum Whitepaper](https://ethereum.org/en/whitepaper/)
- [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Ethereum Development Tutorial](https://ethereum.org/en/developers/tutorials/)

## 🔗 Next Steps
After completing this module, proceed to **Module 2: Solidity Fundamentals** to learn smart contract programming.
