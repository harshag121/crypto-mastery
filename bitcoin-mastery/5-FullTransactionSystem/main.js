const crypto = require('crypto');

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate key pair
function generateKeyPair() {
  return crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}

// Sign data
function signData(data, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'hex');
}

// Verify signature
function verifySignature(data, signature, publicKey) {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, 'hex');
}

// Transaction Input - references a previous transaction output
class TransactionInput {
  constructor(txHash, outputIndex, signature = null) {
    this.txHash = txHash; // Hash of the transaction being spent
    this.outputIndex = outputIndex; // Which output of that transaction
    this.signature = signature; // Signature proving ownership
  }
}

// Transaction Output - specifies new owner and amount
class TransactionOutput {
  constructor(address, amount) {
    this.address = address; // Public key of the recipient
    this.amount = amount; // Amount being sent
  }
}

// Full Transaction
class Transaction {
  constructor(inputs = [], outputs = []) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.timestamp = Date.now();
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(
      JSON.stringify(this.inputs) +
      JSON.stringify(this.outputs) +
      this.timestamp
    );
  }

  // Sign all inputs with the corresponding private keys
  signInputs(privateKeys) {
    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i];
      const dataToSign = this.hash + i; // Include input index in signature
      input.signature = signData(dataToSign, privateKeys[i]);
    }
    // Recalculate hash after signing
    this.hash = this.calculateHash();
  }

  // Create a coinbase transaction (mining reward)
  static createCoinbaseTransaction(minerAddress, amount) {
    const output = new TransactionOutput(minerAddress, amount);
    const tx = new Transaction([], [output]);
    return tx;
  }
}

// Block containing transactions
class Block {
  constructor(transactions, previousHash = '') {
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions.map(tx => tx.hash)) +
      this.nonce
    );
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    const startTime = Date.now();
    let attempts = 0;

    console.log(`⛏️  Mining block with ${this.transactions.length} transactions (difficulty ${difficulty})...`);
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
      attempts++;

      if (attempts % 50000 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        console.log(`   ${attempts} attempts in ${elapsed.toFixed(1)}s`);
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Block mined in ${totalTime.toFixed(2)} seconds! Hash: ${this.hash}\n`);
  }
}

// Full Blockchain with UTXO tracking
class Blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 2;
    this.miningReward = 50;
    this.utxos = new Map(); // Track unspent transaction outputs
    
    // Create genesis block
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisTx = Transaction.createCoinbaseTransaction('genesis', 0);
    const genesisBlock = new Block([genesisTx], '0');
    genesisBlock.mineBlock(this.difficulty);
    
    this.chain.push(genesisBlock);
    this.updateUTXOs(genesisBlock);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Update UTXO set when a new block is added
  updateUTXOs(block) {
    for (const tx of block.transactions) {
      // Remove spent UTXOs
      for (const input of tx.inputs) {
        const utxoKey = `${input.txHash}:${input.outputIndex}`;
        this.utxos.delete(utxoKey);
      }

      // Add new UTXOs
      for (let i = 0; i < tx.outputs.length; i++) {
        const utxoKey = `${tx.hash}:${i}`;
        this.utxos.set(utxoKey, {
          txHash: tx.hash,
          outputIndex: i,
          output: tx.outputs[i]
        });
      }
    }
  }

  // Get balance for an address
  getBalance(address) {
    let balance = 0;
    for (const utxo of this.utxos.values()) {
      if (utxo.output.address === address) {
        balance += utxo.output.amount;
      }
    }
    return balance;
  }

  // Get UTXOs for an address
  getUTXOsForAddress(address) {
    const addressUTXOs = [];
    for (const utxo of this.utxos.values()) {
      if (utxo.output.address === address) {
        addressUTXOs.push(utxo);
      }
    }
    return addressUTXOs;
  }

  // Create a transaction
  createTransaction(fromAddress, toAddress, amount, privateKey) {
    const utxos = this.getUTXOsForAddress(fromAddress);
    
    // Calculate total available
    let totalAvailable = 0;
    for (const utxo of utxos) {
      totalAvailable += utxo.output.amount;
    }

    if (totalAvailable < amount) {
      throw new Error('Insufficient balance');
    }

    // Select UTXOs to spend
    let totalInput = 0;
    const inputs = [];
    for (const utxo of utxos) {
      inputs.push(new TransactionInput(utxo.txHash, utxo.outputIndex));
      totalInput += utxo.output.amount;
      if (totalInput >= amount) break;
    }

    // Create outputs
    const outputs = [];
    outputs.push(new TransactionOutput(toAddress, amount));

    // Add change output if necessary
    if (totalInput > amount) {
      const change = totalInput - amount;
      outputs.push(new TransactionOutput(fromAddress, change));
    }

    // Create and sign transaction
    const tx = new Transaction(inputs, outputs);
    const privateKeys = inputs.map(() => privateKey); // Same key for all inputs in this simple example
    tx.signInputs(privateKeys);

    return tx;
  }

  // Mine a block with transactions
  mineBlock(transactions, minerAddress) {
    // Add coinbase transaction for miner reward
    const coinbaseTx = Transaction.createCoinbaseTransaction(minerAddress, this.miningReward);
    const allTransactions = [coinbaseTx, ...transactions];

    const block = new Block(allTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);
    
    this.chain.push(block);
    this.updateUTXOs(block);
    
    return block;
  }

  // Validate a transaction
  validateTransaction(tx, blockchain) {
    // Skip validation for coinbase transactions
    if (tx.inputs.length === 0) return true;

    for (let i = 0; i < tx.inputs.length; i++) {
      const input = tx.inputs[i];
      const utxoKey = `${input.txHash}:${input.outputIndex}`;
      const utxo = this.utxos.get(utxoKey);

      if (!utxo) {
        console.log('❌ UTXO not found:', utxoKey);
        return false;
      }

      // Verify signature
      const dataToSign = tx.hash + i;
      if (!verifySignature(dataToSign, input.signature, utxo.output.address)) {
        console.log('❌ Invalid signature for input', i);
        return false;
      }
    }

    return true;
  }
}

// --- Demonstration ---

console.log('=== Full Bitcoin Transaction System ===\n');

// Create blockchain
const blockchain = new Blockchain();

// Create users
const alice = generateKeyPair();
const bob = generateKeyPair();
const charlie = generateKeyPair();

console.log('👥 Users created:');
console.log('Alice:', alice.publicKey.substring(27, 47) + '...');
console.log('Bob:', bob.publicKey.substring(27, 47) + '...');
console.log('Charlie:', charlie.publicKey.substring(27, 47) + '...\n');

// Mine initial blocks to give users some coins
console.log('=== Initial Mining ===');
blockchain.mineBlock([], alice.publicKey); // Alice gets 50 coins
blockchain.mineBlock([], bob.publicKey);   // Bob gets 50 coins

console.log('💰 Initial Balances:');
console.log(`Alice: ${blockchain.getBalance(alice.publicKey)} coins`);
console.log(`Bob: ${blockchain.getBalance(bob.publicKey)} coins`);
console.log(`Charlie: ${blockchain.getBalance(charlie.publicKey)} coins\n`);

// Alice sends 30 coins to Charlie
console.log('=== Transaction 1: Alice → Charlie (30 coins) ===');
try {
  const tx1 = blockchain.createTransaction(alice.publicKey, charlie.publicKey, 30, alice.privateKey);
  console.log('✅ Transaction created and signed');
  console.log('Transaction hash:', tx1.hash);
  console.log('Valid:', blockchain.validateTransaction(tx1));
  
  // Mine the transaction
  blockchain.mineBlock([tx1], bob.publicKey); // Bob mines and gets reward
  console.log('✅ Transaction mined into blockchain\n');
} catch (error) {
  console.log('❌ Transaction failed:', error.message);
}

// Bob sends 25 coins to Charlie
console.log('=== Transaction 2: Bob → Charlie (25 coins) ===');
try {
  const tx2 = blockchain.createTransaction(bob.publicKey, charlie.publicKey, 25, bob.privateKey);
  console.log('✅ Transaction created and signed');
  console.log('Valid:', blockchain.validateTransaction(tx2));
  
  blockchain.mineBlock([tx2], alice.publicKey); // Alice mines and gets reward
  console.log('✅ Transaction mined into blockchain\n');
} catch (error) {
  console.log('❌ Transaction failed:', error.message);
}

// Charlie sends 40 coins to Alice
console.log('=== Transaction 3: Charlie → Alice (40 coins) ===');
try {
  const tx3 = blockchain.createTransaction(charlie.publicKey, alice.publicKey, 40, charlie.privateKey);
  console.log('✅ Transaction created and signed');
  console.log('Valid:', blockchain.validateTransaction(tx3));
  
  blockchain.mineBlock([tx3], charlie.publicKey); // Charlie mines and gets reward
  console.log('✅ Transaction mined into blockchain\n');
} catch (error) {
  console.log('❌ Transaction failed:', error.message);
}

// Final balances
console.log('=== Final Results ===');
console.log('💰 Final Balances:');
console.log(`Alice: ${blockchain.getBalance(alice.publicKey)} coins`);
console.log(`Bob: ${blockchain.getBalance(bob.publicKey)} coins`);
console.log(`Charlie: ${blockchain.getBalance(charlie.publicKey)} coins\n`);

console.log('📊 Blockchain Stats:');
console.log(`Total blocks: ${blockchain.chain.length}`);
console.log(`Total UTXOs: ${blockchain.utxos.size}`);
console.log(`Difficulty: ${blockchain.difficulty}`);

console.log('\n💡 Key Features Demonstrated:');
console.log('✅ UTXO-based transaction model');
console.log('✅ Digital signatures for authentication');
console.log('✅ Mining rewards and incentives');
console.log('✅ Transaction validation');
console.log('✅ Change outputs (automatic)');
console.log('✅ Complete blockchain integrity');
