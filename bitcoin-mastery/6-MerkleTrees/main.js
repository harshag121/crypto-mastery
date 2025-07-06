const crypto = require('crypto');

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Merkle Tree Node
class MerkleNode {
  constructor(data, left = null, right = null) {
    this.left = left;
    this.right = right;
    
    if (left && right) {
      // Internal node: hash of left + right
      this.hash = sha256(left.hash + right.hash);
      this.data = null;
    } else {
      // Leaf node: hash of data
      this.hash = sha256(data);
      this.data = data;
    }
  }
}

// Merkle Tree implementation
class MerkleTree {
  constructor(transactions) {
    this.transactions = transactions;
    this.root = this.buildTree(transactions);
  }

  buildTree(transactions) {
    if (transactions.length === 0) {
      return null;
    }

    // Create leaf nodes
    let nodes = transactions.map(tx => new MerkleNode(tx));

    // Build tree bottom-up
    while (nodes.length > 1) {
      const nextLevel = [];

      for (let i = 0; i < nodes.length; i += 2) {
        const left = nodes[i];
        const right = nodes[i + 1] || nodes[i]; // Duplicate last node if odd number

        nextLevel.push(new MerkleNode(null, left, right));
      }

      nodes = nextLevel;
    }

    return nodes[0];
  }

  // Get the Merkle root hash
  getRootHash() {
    return this.root ? this.root.hash : null;
  }

  // Generate a Merkle proof for a specific transaction
  generateProof(targetTx) {
    const proof = [];
    
    function findPath(node, target, currentProof) {
      if (!node) return false;

      // If this is a leaf node
      if (node.data !== null) {
        return node.data === target;
      }

      // Check left subtree
      if (findPath(node.left, target, currentProof)) {
        if (node.right) {
          currentProof.push({ hash: node.right.hash, position: 'right' });
        }
        return true;
      }

      // Check right subtree
      if (findPath(node.right, target, currentProof)) {
        if (node.left) {
          currentProof.push({ hash: node.left.hash, position: 'left' });
        }
        return true;
      }

      return false;
    }

    findPath(this.root, targetTx, proof);
    return proof.reverse(); // Reverse to get path from leaf to root
  }

  // Verify a Merkle proof
  static verifyProof(transaction, proof, rootHash) {
    let currentHash = sha256(transaction);

    for (const step of proof) {
      if (step.position === 'left') {
        currentHash = sha256(step.hash + currentHash);
      } else {
        currentHash = sha256(currentHash + step.hash);
      }
    }

    return currentHash === rootHash;
  }

  // Visualize the tree structure
  printTree(node = this.root, prefix = '', isLeft = true) {
    if (!node) return;

    console.log(prefix + (isLeft ? '├── ' : '└── ') + 
                (node.data ? `LEAF: ${node.data}` : `NODE: ${node.hash.substring(0, 16)}...`));

    if (node.left || node.right) {
      if (node.left) {
        this.printTree(node.left, prefix + (isLeft ? '│   ' : '    '), true);
      }
      if (node.right) {
        this.printTree(node.right, prefix + (isLeft ? '│   ' : '    '), false);
      }
    }
  }
}

// Block with Merkle Tree
class Block {
  constructor(transactions, previousHash = '') {
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.merkleTree = new MerkleTree(transactions);
    this.merkleRoot = this.merkleTree.getRootHash();
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(
      this.previousHash +
      this.timestamp +
      this.merkleRoot +
      this.nonce
    );
  }

  // Create a proof that a transaction is in this block
  createTransactionProof(transaction) {
    return this.merkleTree.generateProof(transaction);
  }

  // Verify a transaction proof against this block
  verifyTransactionProof(transaction, proof) {
    return MerkleTree.verifyProof(transaction, proof, this.merkleRoot);
  }
}

// Light client that only stores block headers
class LightClient {
  constructor() {
    this.blockHeaders = []; // Only store headers, not full blocks
  }

  addBlockHeader(block) {
    const header = {
      hash: block.hash,
      previousHash: block.previousHash,
      merkleRoot: block.merkleRoot,
      timestamp: block.timestamp
    };
    this.blockHeaders.push(header);
  }

  // Verify a transaction using SPV
  verifyTransaction(transaction, blockIndex, proof) {
    const header = this.blockHeaders[blockIndex];
    if (!header) {
      console.log('❌ Block header not found');
      return false;
    }

    return MerkleTree.verifyProof(transaction, proof, header.merkleRoot);
  }
}

// --- Demonstration ---

console.log('=== Merkle Trees & SPV Demo ===\n');

// Create some sample transactions
const transactions = [
  'Alice → Bob: 10 BTC',
  'Bob → Charlie: 5 BTC',
  'Charlie → Dave: 3 BTC',
  'Dave → Eve: 2 BTC',
  'Eve → Frank: 1 BTC',
  'Frank → Alice: 0.5 BTC',
  'Alice → Charlie: 7 BTC',
  'Bob → Dave: 4 BTC'
];

console.log('📝 Sample Transactions:');
transactions.forEach((tx, i) => {
  console.log(`${i + 1}. ${tx}`);
});
console.log();

// Create Merkle tree
console.log('🌳 Building Merkle Tree...');
const merkleTree = new MerkleTree(transactions);
console.log('✅ Merkle tree built successfully');
console.log('🔗 Merkle Root:', merkleTree.getRootHash());
console.log();

// Visualize the tree
console.log('🌲 Tree Structure:');
merkleTree.printTree();
console.log();

// Create a block with these transactions
const block = new Block(transactions, 'previous_block_hash');
console.log('📦 Block created with Merkle root:', block.merkleRoot);
console.log();

// Test Merkle proofs
console.log('=== Merkle Proof Demo ===');
const targetTransaction = 'Charlie → Dave: 3 BTC';
console.log(`🎯 Proving transaction: "${targetTransaction}"`);

const proof = block.createTransactionProof(targetTransaction);
console.log('📄 Merkle Proof:');
proof.forEach((step, i) => {
  console.log(`  ${i + 1}. Hash: ${step.hash.substring(0, 16)}... (${step.position})`);
});
console.log();

// Verify the proof
const isValid = block.verifyTransactionProof(targetTransaction, proof);
console.log('✅ Proof verification:', isValid ? 'VALID' : 'INVALID');
console.log();

// Test with invalid transaction
console.log('=== Invalid Transaction Test ===');
const fakeTransaction = 'Hacker → Victim: 1000 BTC';
const fakeProof = block.createTransactionProof(fakeTransaction);
const fakeIsValid = block.verifyTransactionProof(fakeTransaction, fakeProof);
console.log(`🎯 Testing fake transaction: "${fakeTransaction}"`);
console.log('✅ Proof verification:', fakeIsValid ? 'VALID' : 'INVALID');
console.log();

// SPV (Simplified Payment Verification) Demo
console.log('=== SPV Light Client Demo ===');
const lightClient = new LightClient();

// Light client only downloads block header
lightClient.addBlockHeader(block);
console.log('📱 Light client downloaded block header (not full block)');
console.log('💾 Storage saved: ~99.9% (only header vs full block with all transactions)');
console.log();

// Someone sends the light client a proof
console.log('🔍 Light client verifying transaction with just header + proof...');
const spvResult = lightClient.verifyTransaction(targetTransaction, 0, proof);
console.log('✅ SPV verification:', spvResult ? 'VALID' : 'INVALID');
console.log();

// Show efficiency comparison
console.log('=== Efficiency Comparison ===');
const fullBlockSize = JSON.stringify(transactions).length;
const headerSize = JSON.stringify({
  hash: block.hash,
  merkleRoot: block.merkleRoot,
  timestamp: block.timestamp
}).length;
const proofSize = JSON.stringify(proof).length;

console.log(`📊 Full block size: ${fullBlockSize} bytes`);
console.log(`📊 Header + proof size: ${headerSize + proofSize} bytes`);
console.log(`📊 Space savings: ${(((fullBlockSize - headerSize - proofSize) / fullBlockSize) * 100).toFixed(1)}%`);
console.log();

console.log('💡 Key Benefits of Merkle Trees:');
console.log('✅ Efficient transaction verification without downloading full blocks');
console.log('✅ Tamper-evident: any change in transactions changes the root');
console.log('✅ Logarithmic proof size: O(log n) vs O(n) for n transactions');
console.log('✅ Enables lightweight SPV clients (mobile wallets)');
console.log('✅ Scalability: massive blocks with tiny proofs');
