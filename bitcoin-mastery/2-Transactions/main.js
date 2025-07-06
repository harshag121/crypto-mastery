const crypto = require('crypto');

// Helper function to generate key pairs
function generateKeyPair() {
  return crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}

// Helper function to create a signature
function signData(data, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'hex');
}

// Helper function to verify a signature
function verifySignature(data, signature, publicKey) {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, 'hex');
}

// Transaction class
class Transaction {
  constructor(fromAddress, toAddress, amount, previousTxHash = null) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.previousTxHash = previousTxHash;
    this.timestamp = Date.now();
    this.signature = null;
  }

  // Calculate the hash of this transaction
  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.fromAddress +
        this.toAddress +
        this.amount +
        this.previousTxHash +
        this.timestamp
      )
      .digest('hex');
  }

  // Sign the transaction with the sender's private key
  signTransaction(signingKey) {
    // In real Bitcoin, you would sign the hash of the transaction data
    const hashTx = this.calculateHash();
    this.signature = signData(hashTx, signingKey);
  }

  // Verify that the transaction was signed by the owner of the fromAddress
  isValid() {
    if (this.fromAddress === null) return true; // Genesis transaction

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const hashTx = this.calculateHash();
    return verifySignature(hashTx, this.signature, this.fromAddress);
  }
}

// --- Demonstration ---

console.log('=== Bitcoin Transaction Chain Demo ===\n');

// Create users
const alice = generateKeyPair();
const bob = generateKeyPair();
const charlie = generateKeyPair();

console.log('👥 Users created:');
console.log('Alice (public key):', alice.publicKey.substring(0, 60) + '...');
console.log('Bob (public key):', bob.publicKey.substring(0, 60) + '...');
console.log('Charlie (public key):', charlie.publicKey.substring(0, 60) + '...\n');

// Genesis transaction: Create 100 coins for Alice
const genesisTx = new Transaction(null, alice.publicKey, 100);
console.log('🌱 Genesis Transaction:');
console.log('- Created 100 coins for Alice');
console.log('- Transaction hash:', genesisTx.calculateHash());
console.log('- Valid:', genesisTx.isValid(), '\n');

// Alice sends 30 coins to Bob
const tx1 = new Transaction(alice.publicKey, bob.publicKey, 30, genesisTx.calculateHash());
tx1.signTransaction(alice.privateKey);
console.log('💸 Transaction 1: Alice → Bob (30 coins)');
console.log('- Previous transaction:', tx1.previousTxHash.substring(0, 20) + '...');
console.log('- Transaction hash:', tx1.calculateHash());
console.log('- Signature:', tx1.signature.substring(0, 20) + '...');
console.log('- Valid:', tx1.isValid(), '\n');

// Bob sends 15 coins to Charlie
const tx2 = new Transaction(bob.publicKey, charlie.publicKey, 15, tx1.calculateHash());
tx2.signTransaction(bob.privateKey);
console.log('💸 Transaction 2: Bob → Charlie (15 coins)');
console.log('- Previous transaction:', tx2.previousTxHash.substring(0, 20) + '...');
console.log('- Transaction hash:', tx2.calculateHash());
console.log('- Signature:', tx2.signature.substring(0, 20) + '...');
console.log('- Valid:', tx2.isValid(), '\n');

// Try to create an invalid transaction (Charlie tries to spend Bob's coins)
console.log('🚫 Attempted Invalid Transaction:');
const invalidTx = new Transaction(bob.publicKey, alice.publicKey, 10, tx2.calculateHash());
invalidTx.signTransaction(charlie.privateKey); // Charlie signs with his key, not Bob's!

try {
  console.log('- Charlie tries to spend Bob\'s coins...');
  console.log('- Valid:', invalidTx.isValid());
} catch (error) {
  console.log('- ❌ Transaction rejected:', error.message);
}

console.log('\n📊 Current Balances (theoretical):');
console.log('- Alice: 70 coins (100 - 30)');
console.log('- Bob: 15 coins (30 - 15)');
console.log('- Charlie: 15 coins (0 + 15)');
