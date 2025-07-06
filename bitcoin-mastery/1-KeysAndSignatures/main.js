const crypto = require('crypto');

// Generate a new EC key pair. 'secp256k1' is the curve used by Bitcoin.
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1',
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

console.log('--- Keys ---');
console.log('Private Key:', privateKey);
console.log('Public Key:', publicKey);

// --- Create and Sign a Message ---

// This represents the data you want to prove ownership of (e.g., a transaction).
const message = 'This is a secret message representing a transaction';

// Create a signature for the message.
const sign = crypto.createSign('SHA256');
sign.update(message);
sign.end();
const signature = sign.sign(privateKey, 'hex');

console.log('\n--- Signature ---');
console.log('Signature:', signature);

// --- Verify the Signature ---

// To verify, you need the original message, the signature, and the public key.
const verify = crypto.createVerify('SHA256');
verify.update(message);
verify.end();
const isVerified = verify.verify(publicKey, signature, 'hex');

console.log('\n--- Verification ---');
console.log('Is the signature valid?', isVerified);

// --- Tamper with the message and try to verify again ---

const tamperedMessage = 'This is a DIFFERENT message';

const verifyTampered = crypto.createVerify('SHA256');
verifyTampered.update(tamperedMessage);
verifyTampered.end();
const isTamperedVerified = verifyTampered.verify(publicKey, signature, 'hex');

console.log('\n--- Tampering Test ---');
console.log('Is the signature valid for a tampered message?', isTamperedVerified);
