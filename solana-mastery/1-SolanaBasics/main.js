const { 
  Connection, 
  PublicKey, 
  Keypair, 
  LAMPORTS_PER_SOL,
  clusterApiUrl 
} = require('@solana/web3.js');

console.log('=== Solana Basics Demo ===\n');

// --- Part 1: Understanding Solana's Architecture ---
console.log('🏗️  Part 1: Solana Architecture\n');

console.log('Key Concepts:');
console.log('• Account: Everything in Solana (users, programs, data)');
console.log('• Program: Smart contract that processes instructions');
console.log('• Transaction: Contains instructions to execute');
console.log('• Lamports: Smallest unit of SOL (1 SOL = 1,000,000,000 lamports)');
console.log('• Slot: ~400ms time period (vs Bitcoin\'s ~10 min blocks)');
console.log();

// --- Part 2: Creating Keypairs ---
console.log('🔑 Part 2: Keypairs & Addresses\n');

// Generate a new keypair (like Bitcoin's private/public key)
const keypair1 = Keypair.generate();
const keypair2 = Keypair.generate();

console.log('Generated Keypairs:');
console.log('Keypair 1:');
console.log('  Public Key:', keypair1.publicKey.toBase58());
console.log('  Private Key:', Array.from(keypair1.secretKey).slice(0, 8).join(',') + '...');

console.log('Keypair 2:');
console.log('  Public Key:', keypair2.publicKey.toBase58());
console.log('  Private Key:', Array.from(keypair2.secretKey).slice(0, 8).join(',') + '...');
console.log();

// --- Part 3: Understanding Lamports ---
console.log('💰 Part 3: SOL & Lamports\n');

console.log('Conversion Examples:');
console.log(`1 SOL = ${LAMPORTS_PER_SOL.toLocaleString()} lamports`);
console.log(`0.5 SOL = ${(0.5 * LAMPORTS_PER_SOL).toLocaleString()} lamports`);
console.log(`1000 lamports = ${1000 / LAMPORTS_PER_SOL} SOL`);
console.log();

// --- Part 4: Network Connections ---
console.log('🌐 Part 4: Network Connections\n');

// Different Solana networks
const networks = {
  'Devnet': clusterApiUrl('devnet'),
  'Testnet': clusterApiUrl('testnet'),
  'Mainnet': clusterApiUrl('mainnet-beta')
};

console.log('Solana Networks:');
Object.entries(networks).forEach(([name, url]) => {
  console.log(`  ${name}: ${url}`);
});
console.log();

// Connect to devnet (safe for testing)
console.log('🔌 Connecting to Devnet...');
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// --- Part 5: Account Information ---
console.log('📊 Part 5: Account Information\n');

async function demonstrateAccounts() {
  try {
    // Check if accounts exist and their balance
    console.log('Checking account balances...');
    
    const balance1 = await connection.getBalance(keypair1.publicKey);
    const balance2 = await connection.getBalance(keypair2.publicKey);
    
    console.log(`Account 1 balance: ${balance1} lamports (${balance1 / LAMPORTS_PER_SOL} SOL)`);
    console.log(`Account 2 balance: ${balance2} lamports (${balance2 / LAMPORTS_PER_SOL} SOL)`);
    
    // Get account info
    const accountInfo1 = await connection.getAccountInfo(keypair1.publicKey);
    const accountInfo2 = await connection.getAccountInfo(keypair2.publicKey);
    
    console.log();
    console.log('Account 1 Info:');
    if (accountInfo1) {
      console.log(`  Lamports: ${accountInfo1.lamports}`);
      console.log(`  Owner: ${accountInfo1.owner.toBase58()}`);
      console.log(`  Executable: ${accountInfo1.executable}`);
    } else {
      console.log('  Account does not exist (balance = 0)');
    }
    
    console.log('Account 2 Info:');
    if (accountInfo2) {
      console.log(`  Lamports: ${accountInfo2.lamports}`);
      console.log(`  Owner: ${accountInfo2.owner.toBase58()}`);
      console.log(`  Executable: ${accountInfo2.executable}`);
    } else {
      console.log('  Account does not exist (balance = 0)');
    }
    
  } catch (error) {
    console.log('Error connecting to network:', error.message);
    console.log('(This is normal if offline or network is slow)');
  }
}

// --- Part 6: Special Accounts ---
console.log('🎯 Part 6: Special Accounts\n');

// System Program - manages account creation and SOL transfers
const systemProgramId = new PublicKey('11111111111111111111111111111111');
console.log('System Program ID:', systemProgramId.toBase58());

// Token Program - manages SPL tokens
const tokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
console.log('Token Program ID:', tokenProgramId.toBase58());

console.log();
console.log('💡 Key Insights:');
console.log('• Every account has an owner (usually a program)');
console.log('• User accounts are owned by System Program');
console.log('• Token accounts are owned by Token Program');
console.log('• Programs are accounts marked as "executable"');
console.log('• Account addresses are 32-byte public keys');
console.log();

// --- Part 7: Address Validation ---
console.log('✅ Part 7: Address Validation\n');

function validateSolanaAddress(address) {
  try {
    const publicKey = new PublicKey(address);
    return {
      valid: true,
      publicKey: publicKey,
      base58: publicKey.toBase58()
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

// Test some addresses
const testAddresses = [
  keypair1.publicKey.toBase58(),
  '11111111111111111111111111111111', // System Program
  'invalid-address',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' // Token Program
];

console.log('Address Validation Tests:');
testAddresses.forEach(address => {
  const result = validateSolanaAddress(address);
  console.log(`  ${address.substring(0, 20)}...`);
  console.log(`    Valid: ${result.valid}`);
  if (!result.valid) {
    console.log(`    Error: ${result.error}`);
  }
});

console.log();

// Run the async demo
demonstrateAccounts().then(() => {
  console.log('🎓 Module 1 Complete!');
  console.log('Next: Learn how to interact with the network using Web3.js');
});
