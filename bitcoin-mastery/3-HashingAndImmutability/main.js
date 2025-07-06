const crypto = require('crypto');

// Helper function to create a SHA-256 hash
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Simple block structure
class Block {
  constructor(data, previousHash = '') {
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(
      this.previousHash + 
      this.timestamp + 
      JSON.stringify(this.data)
    );
  }
}

// Simple blockchain
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block('Genesis Block', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if current block's hash is valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Check if current block points to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

console.log('=== Hashing & Immutability Demo ===\n');

// --- Part 1: Understanding Hash Properties ---
console.log('🔗 Part 1: Hash Properties\n');

const message1 = 'Hello, Bitcoin!';
const message2 = 'Hello, Bitcoin.'; // Just added a period
const message3 = 'Hello, Bitcoin!'; // Exact same as message1

console.log('Original message:', message1);
console.log('Hash:', sha256(message1));
console.log();

console.log('Slightly modified message:', message2);
console.log('Hash:', sha256(message2));
console.log();

console.log('Same message again:', message3);
console.log('Hash:', sha256(message3));
console.log();

console.log('📝 Observations:');
console.log('- Same input always produces same hash (deterministic)');
console.log('- Tiny change produces completely different hash (avalanche effect)');
console.log('- Hash is fixed length regardless of input size\n');

// --- Part 2: Creating a Simple Blockchain ---
console.log('⛓️  Part 2: Building a Blockchain\n');

const myBlockchain = new Blockchain();

console.log('Creating blockchain with genesis block...');
console.log('Genesis Block Hash:', myBlockchain.chain[0].hash);
console.log();

// Add some blocks
myBlockchain.addBlock(new Block({ transaction: 'Alice sends 10 coins to Bob' }));
myBlockchain.addBlock(new Block({ transaction: 'Bob sends 5 coins to Charlie' }));
myBlockchain.addBlock(new Block({ transaction: 'Charlie sends 3 coins to Dave' }));

console.log('📦 Blockchain Contents:');
myBlockchain.chain.forEach((block, index) => {
  console.log(`Block ${index}:`);
  console.log(`  Data: ${JSON.stringify(block.data)}`);
  console.log(`  Hash: ${block.hash}`);
  console.log(`  Previous Hash: ${block.previousHash}`);
  console.log(`  Timestamp: ${new Date(block.timestamp).toLocaleString()}`);
  console.log();
});

console.log('✅ Is blockchain valid?', myBlockchain.isChainValid());
console.log();

// --- Part 3: Attempting to Tamper with the Blockchain ---
console.log('🚨 Part 3: Tampering Attempt\n');

console.log('Attempting to change data in Block 1...');
const originalData = myBlockchain.chain[1].data;
const originalHash = myBlockchain.chain[1].hash;

// Tamper with the data
myBlockchain.chain[1].data = { transaction: 'Alice sends 1000 coins to Bob' }; // Changed amount!

console.log('Original data:', JSON.stringify(originalData));
console.log('Tampered data:', JSON.stringify(myBlockchain.chain[1].data));
console.log('Original hash:', originalHash);
console.log('Current hash (unchanged):', myBlockchain.chain[1].hash);
console.log();

console.log('✅ Is blockchain still valid?', myBlockchain.isChainValid());
console.log();

console.log('🔧 What would an attacker need to do?');
console.log('1. Recalculate hash for the tampered block');
console.log('2. Update all subsequent blocks to point to new hash');
console.log('3. Recalculate hashes for ALL subsequent blocks');
console.log('4. Do this faster than the honest network (in real Bitcoin)');
console.log();

// Show what recalculating would look like
myBlockchain.chain[1].hash = myBlockchain.chain[1].calculateHash();
console.log('After recalculating Block 1 hash:', myBlockchain.chain[1].hash);
console.log('✅ Is blockchain valid now?', myBlockchain.isChainValid());
console.log('❌ Still invalid! Block 2 still points to old hash.');

console.log('\n💡 Key Insight:');
console.log('The chain of hashes makes tampering detectable and expensive!');
