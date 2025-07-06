# Module 2: Solidity Fundamentals

## 🎯 Learning Objectives
- Master Solidity syntax and programming concepts
- Understand smart contract structure and components
- Learn about data types, functions, and modifiers
- Explore inheritance, interfaces, and libraries
- Practice with events, error handling, and gas optimization
- Deploy and interact with smart contracts

## 📚 Core Concepts

### What is Solidity?
- High-level programming language for smart contracts
- Statically typed, contract-oriented language
- Compiled to EVM bytecode
- Influenced by C++, Python, and JavaScript

### Smart Contract Anatomy
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    // State variables
    // Constructor
    // Functions
    // Modifiers
    // Events
}
```

### Data Types
1. **Value Types**
   - `bool`, `int`, `uint`, `address`
   - `bytes1` to `bytes32`, `string`
   - `enum`, fixed-point numbers

2. **Reference Types**
   - `arrays`, `structs`, `mappings`
   - `memory`, `storage`, `calldata` locations

### Functions
- **Visibility**: `public`, `private`, `internal`, `external`
- **State Mutability**: `pure`, `view`, `payable`
- **Modifiers**: Custom access control and validation

### Inheritance and Interfaces
- Multiple inheritance support
- Abstract contracts and interfaces
- Function overriding and virtual functions

## 🔧 Practical Implementation

### Prerequisites
```bash
npm install ethers hardhat @nomiclabs/hardhat-ethers
npx hardhat init
```

### Smart Contracts We'll Build
1. **BasicContract** - Simple storage and arithmetic
2. **TokenContract** - ERC20-like token implementation
3. **VotingContract** - Decentralized voting system
4. **LibraryDemo** - Using libraries for reusable code
5. **InheritanceDemo** - Contract inheritance patterns

### Key Solidity Features Demonstrated
- State variables and functions
- Events and error handling
- Modifiers and access control
- Mappings and arrays
- Structs and enums
- Inheritance and interfaces

## 🚀 Running the Code

```bash
cd 2-SolidityFundamentals
npm install
npx hardhat compile
npx hardhat test
node main.js
```

## 🔍 What You'll Learn
- Solidity syntax and best practices
- Smart contract design patterns
- Gas optimization techniques
- Security considerations
- Testing and deployment strategies
- Interaction with contracts using ethers.js

## 📖 Additional Resources
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity by Example](https://solidity-by-example.org/)

## 🔗 Next Steps
After mastering Solidity fundamentals, proceed to **Module 3: Smart Contract Development** for advanced patterns and real-world applications.
