const crypto = require('crypto');

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.nonce
    );
  }

  // This is the mining process - finding a hash with the required difficulty
  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0'); // Create string of zeros
    const startTime = Date.now();
    let attempts = 0;

    console.log(`⛏️  Mining block with difficulty ${difficulty}...`);
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
      attempts++;

      // Progress indicator
      if (attempts % 100000 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = attempts / elapsed;
        console.log(`   ${attempts} attempts in ${elapsed.toFixed(1)}s (${rate.toFixed(0)} attempts/s)`);
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Block mined in ${totalTime.toFixed(2)} seconds!`);
    console.log(`   Hash: ${this.hash}`);
    console.log(`   Nonce: ${this.nonce}`);
    console.log(`   Attempts: ${attempts}\n`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Start with 2 leading zeros
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    const genesisBlock = new Block(Date.now(), 'Genesis Block', '0');
    genesisBlock.mineBlock(this.difficulty);
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    // Add mining reward transaction
    this.pendingTransactions.push({
      fromAddress: null,
      toAddress: miningRewardAddress,
      amount: this.miningReward
    });

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    
    block.mineBlock(this.difficulty);
    
    console.log('🎉 Block successfully mined and added to chain!');
    this.chain.push(block);
    this.pendingTransactions = [];
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
    console.log(`📝 Transaction added: ${transaction.fromAddress?.substring(0, 10) || 'System'}... → ${transaction.toAddress.substring(0, 10)}... (${transaction.amount} coins)`);
  }

  getBalance(address) {
    let balance = 0;

    for (const block of this.chain) {
      if (Array.isArray(block.transactions)) {
        for (const trans of block.transactions) {
          if (trans.fromAddress === address) {
            balance -= trans.amount;
          }
          if (trans.toAddress === address) {
            balance += trans.amount;
          }
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      // Check if block was properly mined
      if (currentBlock.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0')) {
        return false;
      }
    }

    return true;
  }
}

// --- Demonstration ---

console.log('=== Proof-of-Work Mining Demo ===\n');

const myCoin = new Blockchain();

// Create some addresses (in real Bitcoin, these would be public keys)
const address1 = 'address1-alice-' + Math.random().toString(36).substring(7);
const address2 = 'address2-bob-' + Math.random().toString(36).substring(7);
const address3 = 'address3-charlie-' + Math.random().toString(36).substring(7);

console.log('👥 Participants:');
console.log('Alice:', address1);
console.log('Bob:', address2);
console.log('Charlie:', address3);
console.log();

// Start mining
console.log('🚀 Starting mining simulation...\n');

// Mine first block (Alice gets the reward)
console.log('=== Mining Block 1 ===');
myCoin.minePendingTransactions(address1);

// Add some transactions
console.log('=== Adding Transactions ===');
myCoin.createTransaction({ fromAddress: address1, toAddress: address2, amount: 30 });
myCoin.createTransaction({ fromAddress: address1, toAddress: address3, amount: 20 });
console.log();

// Mine second block (Bob gets the reward)
console.log('=== Mining Block 2 ===');
myCoin.minePendingTransactions(address2);

// Add more transactions
console.log('=== Adding More Transactions ===');
myCoin.createTransaction({ fromAddress: address2, toAddress: address3, amount: 25 });
myCoin.createTransaction({ fromAddress: address3, toAddress: address1, amount: 15 });
console.log();

// Mine third block (Charlie gets the reward)
console.log('=== Mining Block 3 ===');
myCoin.minePendingTransactions(address3);

// Show final results
console.log('=== Final Results ===');
console.log(`💰 Alice's balance: ${myCoin.getBalance(address1)} coins`);
console.log(`💰 Bob's balance: ${myCoin.getBalance(address2)} coins`);
console.log(`💰 Charlie's balance: ${myCoin.getBalance(address3)} coins`);
console.log();

console.log('⛓️  Blockchain validation:', myCoin.isChainValid() ? '✅ Valid' : '❌ Invalid');
console.log('📊 Total blocks in chain:', myCoin.chain.length);

console.log('\n🔍 Blockchain Structure:');
myCoin.chain.forEach((block, index) => {
  console.log(`Block ${index}:`);
  console.log(`  Hash: ${block.hash}`);
  console.log(`  Previous Hash: ${block.previousHash}`);
  console.log(`  Nonce: ${block.nonce}`);
  console.log(`  Transactions: ${Array.isArray(block.transactions) ? block.transactions.length : 'Genesis'}`);
  console.log();
});

console.log('💡 Key Insights:');
console.log('- Each block required computational work to mine');
console.log('- Miners are rewarded for their work');
console.log('- The chain is cryptographically linked and verifiable');
console.log('- Changing any past block would require re-mining all subsequent blocks');
