# Module 4: Circom and Practical Circuit Development

## 🎯 Learning Objectives

By the end of this module, you will:
- Master Circom language syntax and semantics
- Build complex circuits using templates and components
- Integrate circuits with JavaScript applications
- Optimize circuits for efficiency and security
- Debug and test zk-SNARK circuits effectively
- Deploy production-ready zero-knowledge applications

## 📚 Prerequisites

- Completion of Modules 1-3 (ZK Fundamentals, SNARKs, STARKs)
- Basic JavaScript/Node.js knowledge
- Understanding of R1CS and constraint systems
- Familiarity with npm and package management

## 🏗️ Module Structure

### Part 1: Circom Language Fundamentals
- **Syntax and semantics**: Variables, signals, and constraints
- **Template system**: Reusable circuit components
- **Control flow**: Conditional logic and loops
- **Built-in functions**: Mathematical operations and utilities

### Part 2: Circuit Design Patterns
- **Component composition**: Building complex circuits from simple parts
- **Signal propagation**: Understanding data flow
- **Constraint optimization**: Minimizing gate count
- **Security patterns**: Avoiding common vulnerabilities

### Part 3: JavaScript Integration
- **snarkjs library**: Proof generation and verification
- **Witness calculation**: Computing circuit inputs
- **Web integration**: Browser-based applications
- **Node.js backend**: Server-side proof systems

### Part 4: Testing and Debugging
- **Unit testing**: Individual component verification
- **Integration testing**: Full circuit validation
- **Debugging tools**: Finding constraint violations
- **Performance profiling**: Optimizing critical paths

### Part 5: Advanced Techniques
- **Lookup tables**: Efficient range proofs
- **Bit manipulation**: Binary operations
- **Hash functions**: SHA-256, Poseidon implementations
- **Merkle trees**: Membership and inclusion proofs

## 🛠️ Development Environment Setup

### Required Tools
```bash
# Install Node.js and npm
npm install -g circom
npm install -g snarkjs

# Install additional dependencies
npm install circomlib
npm install ffjavascript
```

### Project Structure
```
project/
├── circuits/
│   ├── main.circom
│   ├── components/
│   └── tests/
├── src/
│   ├── prove.js
│   ├── verify.js
│   └── witness.js
├── build/
├── keys/
└── package.json
```

## 📖 Circom Language Guide

### Basic Syntax

#### Signals and Variables
```circom
pragma circom 2.0.0;

template Example() {
    // Input signals
    signal input a;
    signal input b;
    
    // Output signals  
    signal output c;
    
    // Intermediate signals
    signal intermediate;
    
    // Variables (not part of the circuit)
    var temp;
    
    // Constraints
    intermediate <== a * b;
    c <== intermediate + a;
}

component main = Example();
```

#### Templates and Components
```circom
template Multiplier(n) {
    signal input in[n];
    signal output out;
    
    component mult[n-1];
    
    mult[0] = Multiply2();
    mult[0].a <== in[0];
    mult[0].b <== in[1];
    
    for (var i = 1; i < n-1; i++) {
        mult[i] = Multiply2();
        mult[i].a <== mult[i-1].out;
        mult[i].b <== in[i+1];
    }
    
    out <== mult[n-2].out;
}

template Multiply2() {
    signal input a;
    signal input b;
    signal output out;
    
    out <== a * b;
}
```

#### Control Flow
```circom
template Conditional() {
    signal input selector;
    signal input in[2];
    signal output out;
    
    // selector must be 0 or 1
    selector * (selector - 1) === 0;
    
    out <== selector * in[1] + (1 - selector) * in[0];
}

template LoopExample(n) {
    signal input in[n];
    signal output sum;
    
    var total = 0;
    for (var i = 0; i < n; i++) {
        total += in[i];
    }
    
    sum <== total;
}
```

### Advanced Patterns

#### Range Proofs
```circom
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    
    var lc = 0;
    var e2 = 1;
    
    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc += out[i] * e2;
        e2 = e2 + e2;
    }
    
    lc === in;
}

template LessThan(n) {
    signal input in[2];
    signal output out;
    
    component lt = Num2Bits(n+1);
    lt.in <== in[0] + (1<<n) - in[1];
    out <== 1 - lt.out[n];
}
```

#### Hash Functions
```circom
include "circomlib/circuits/poseidon.circom";

template HashChain(n) {
    signal input in[n];
    signal output out;
    
    component hasher[n-1];
    
    hasher[0] = Poseidon(2);
    hasher[0].inputs[0] <== in[0];
    hasher[0].inputs[1] <== in[1];
    
    for (var i = 1; i < n-1; i++) {
        hasher[i] = Poseidon(2);
        hasher[i].inputs[0] <== hasher[i-1].out;
        hasher[i].inputs[1] <== in[i+1];
    }
    
    out <== hasher[n-2].out;
}
```

## 🔧 Development Workflow

### 1. Circuit Compilation
```bash
# Compile circuit
circom circuit.circom --r1cs --wasm --sym

# Generated files:
# circuit.r1cs - constraint system
# circuit.wasm - witness calculator
# circuit.sym - symbol map
```

### 2. Trusted Setup
```bash
# Powers of Tau ceremony
snarkjs powersoftau new bn128 12 pot12_0000.ptau
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau

# Circuit-specific setup
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey
```

### 3. Proof Generation
```javascript
const snarkjs = require("snarkjs");
const circomlib = require("circomlib");

async function generateProof(input) {
    // Calculate witness
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "circuit.wasm",
        "circuit_final.zkey"
    );
    
    return { proof, publicSignals };
}

async function verifyProof(proof, publicSignals) {
    const vKey = JSON.parse(fs.readFileSync("verification_key.json"));
    
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    return res;
}
```

### 4. Web Integration
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/snarkjs@latest/build/snarkjs.min.js"></script>
</head>
<body>
    <script>
        async function generateWebProof() {
            const input = { a: 3, b: 11 };
            
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                input,
                "circuit.wasm",
                "circuit.zkey"
            );
            
            console.log("Proof generated:", proof);
            return { proof, publicSignals };
        }
    </script>
</body>
</html>
```

## 🧪 Testing Framework

### Unit Testing
```javascript
const circom_tester = require("circom_tester");
const chai = require("chai");

describe("Multiplier Circuit", function() {
    let circuit;
    
    before(async function() {
        circuit = await circom_tester.wasm(path.join(__dirname, "circuits", "multiplier.circom"));
    });
    
    it("Should multiply correctly", async function() {
        const input = { a: 3, b: 5 };
        const witness = await circuit.calculateWitness(input);
        
        await circuit.checkConstraints(witness);
        await circuit.assertOut(witness, { out: 15 });
    });
    
    it("Should handle edge cases", async function() {
        const input = { a: 0, b: 100 };
        const witness = await circuit.calculateWitness(input);
        
        await circuit.assertOut(witness, { out: 0 });
    });
});
```

### Integration Testing
```javascript
describe("End-to-End Proof System", function() {
    it("Should generate and verify proof", async function() {
        const input = { secret: 12345, salt: 67890 };
        
        // Generate proof
        const { proof, publicSignals } = await generateProof(input);
        
        // Verify proof
        const isValid = await verifyProof(proof, publicSignals);
        
        chai.expect(isValid).to.be.true;
    });
});
```

## 🎯 Practical Examples

The `main.js` file includes complete implementations of:

### 1. Age Verification Circuit
Prove you're over 18 without revealing exact age
```circom
template AgeVerification() {
    signal input age;
    signal input currentYear;
    signal input birthYear;
    signal output isValid;
    
    // age = currentYear - birthYear
    age === currentYear - birthYear;
    
    // age >= 18
    component gte = GreaterEqualThan(8);
    gte.in[0] <== age;
    gte.in[1] <== 18;
    isValid <== gte.out;
}
```

### 2. Merkle Tree Membership
Prove knowledge of a value in a Merkle tree
```circom
template MerkleTreeInclusionProof(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output root;
    
    component hashers[levels];
    component selectors[levels];
    
    for (var i = 0; i < levels; i++) {
        selectors[i] = DualMux();
        hashers[i] = Poseidon(2);
    }
    
    // Implementation details...
}
```

### 3. Sudoku Solver Verification
Prove you know a valid Sudoku solution
```circom
template Sudoku() {
    signal input solution[9][9];
    signal input puzzle[9][9];
    signal output isValid;
    
    // Verify solution matches puzzle constraints
    // Check row, column, and box uniqueness
    // Implementation details...
}
```

## 🚀 Performance Optimization

### Constraint Minimization
- Use efficient bit operations
- Minimize intermediate signals
- Leverage lookup tables for complex functions
- Optimize common subexpressions

### Memory Management
- Reuse components where possible
- Minimize array sizes
- Use streaming for large inputs
- Implement lazy evaluation

### Parallelization
- Independent constraint batching
- Multi-threaded witness calculation
- GPU acceleration for FFTs
- Distributed proof generation

## 🛡️ Security Best Practices

### Circuit Security
- Validate all input constraints
- Prevent underconstraining
- Use safe arithmetic operations
- Implement proper range checks

### Implementation Security
- Secure random number generation
- Proper key management
- Timing attack prevention
- Side-channel resistance

### Deployment Security
- Trusted setup verification
- Circuit auditing procedures
- Monitoring and alerting
- Incident response planning

## 📚 Additional Resources

### Libraries and Tools
- **circomlib**: Standard circuit library
- **snarkjs**: JavaScript SNARK toolkit
- **circom_tester**: Testing framework
- **hardhat-circom**: Hardhat integration

### Learning Resources
- **Circom documentation**: Official language guide
- **0xPARC**: Educational workshops and content
- **ZK-Learning.org**: Academic courses
- **Community forums**: Discord, Telegram groups

### Production Examples
- **Tornado Cash**: Privacy-preserving transactions
- **Semaphore**: Anonymous signaling
- **zkSync**: Layer 2 scaling solution
- **Aztec**: Privacy-focused DeFi

## 🔄 Next Module Preview

**Module 5: zkApps and Practical Applications** will cover:
- Mina Protocol and o1js framework
- Building privacy-preserving applications
- Smart contract integration patterns
- User experience considerations for ZK apps

---

## ⚡ Quick Start

1. Install Circom and snarkjs: `npm install -g circom snarkjs`
2. Run `node main.js` to see practical examples
3. Study the circuit implementations
4. Experiment with different constraint patterns
5. Build your own circuits following the examples

Remember: Good circuit design requires balancing efficiency, security, and maintainability!
