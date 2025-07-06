const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');

const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  burn,
  getMint,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} = require('@solana/spl-token');

console.log('=== SPL Token Operations Demo ===\n');

// Create connection to devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Generate test accounts
const payer = Keypair.generate();
const mintAuthority = Keypair.generate();
const freezeAuthority = Keypair.generate();
const user1 = Keypair.generate();
const user2 = Keypair.generate();

console.log('👥 Generated Test Accounts:');
console.log('Payer (funds transactions):', payer.publicKey.toBase58());
console.log('Mint Authority (can create tokens):', mintAuthority.publicKey.toBase58());
console.log('Freeze Authority (can freeze accounts):', freezeAuthority.publicKey.toBase58());
console.log('User 1:', user1.publicKey.toBase58());
console.log('User 2:', user2.publicKey.toBase58());
console.log();

// --- Part 1: Setup (Airdrop SOL for fees) ---
console.log('🪂 Part 1: Setup - Getting SOL for transaction fees\n');

async function setupAccounts() {
  try {
    console.log('Requesting airdrop for transaction fees...');
    
    // Request SOL for transaction fees
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    
    await connection.confirmTransaction(airdropSignature);
    
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Payer balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    console.log('✅ Setup complete\n');
    
    return true;
  } catch (error) {
    console.log('❌ Setup failed:', error.message);
    console.log('Continuing with demo (some operations may fail)\n');
    return false;
  }
}

// --- Part 2: Create a New Token Mint ---
console.log('🏭 Part 2: Creating a New Token Mint\n');

async function createTokenMint() {
  try {
    console.log('Creating new token mint...');
    console.log('Token details:');
    console.log('  Name: Learning Coin (LRN)');
    console.log('  Decimals: 6 (like USDC)');
    console.log('  Mint Authority:', mintAuthority.publicKey.toBase58());
    console.log('  Freeze Authority:', freezeAuthority.publicKey.toBase58());
    
    // Create the mint
    const mint = await createMint(
      connection,
      payer,              // Account that pays for the transaction
      mintAuthority.publicKey,  // Mint authority
      freezeAuthority.publicKey, // Freeze authority (optional)
      6                   // Decimals (6 means 1 token = 1,000,000 base units)
    );
    
    console.log('✅ Token mint created!');
    console.log('Mint address:', mint.toBase58());
    
    // Get mint information
    const mintInfo = await getMint(connection, mint);
    console.log('\nMint Information:');
    console.log('  Supply:', mintInfo.supply.toString());
    console.log('  Decimals:', mintInfo.decimals);
    console.log('  Is Initialized:', mintInfo.isInitialized);
    console.log('  Mint Authority:', mintInfo.mintAuthority?.toBase58() || 'None');
    console.log('  Freeze Authority:', mintInfo.freezeAuthority?.toBase58() || 'None');
    console.log();
    
    return mint;
  } catch (error) {
    console.log('❌ Failed to create mint:', error.message);
    return null;
  }
}

// --- Part 3: Create Token Accounts ---
console.log('💳 Part 3: Creating Token Accounts\n');

async function createTokenAccounts(mint) {
  if (!mint) return null;
  
  try {
    console.log('Creating token accounts for users...');
    
    // Create associated token accounts (ATAs) for users
    // ATAs are deterministic addresses based on user + mint
    const user1TokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      user1.publicKey
    );
    
    const user2TokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      user2.publicKey
    );
    
    console.log('✅ Token accounts created!');
    console.log('User 1 token account:', user1TokenAccount.address.toBase58());
    console.log('User 2 token account:', user2TokenAccount.address.toBase58());
    
    // Get account information
    console.log('\nToken Account Information:');
    console.log('User 1:');
    console.log('  Address:', user1TokenAccount.address.toBase58());
    console.log('  Owner:', user1TokenAccount.owner.toBase58());
    console.log('  Mint:', user1TokenAccount.mint.toBase58());
    console.log('  Amount:', user1TokenAccount.amount.toString());
    
    console.log();
    
    return {
      user1TokenAccount: user1TokenAccount.address,
      user2TokenAccount: user2TokenAccount.address
    };
  } catch (error) {
    console.log('❌ Failed to create token accounts:', error.message);
    return null;
  }
}

// --- Part 4: Mint Tokens ---
console.log('🔨 Part 4: Minting Tokens\n');

async function mintTokens(mint, tokenAccounts) {
  if (!mint || !tokenAccounts) return;
  
  try {
    console.log('Minting tokens to User 1...');
    
    const amountToMint = 1000 * (10 ** 6); // 1000 tokens (with 6 decimals)
    
    // Mint tokens to User 1's account
    const mintSignature = await mintTo(
      connection,
      payer,                    // Payer of transaction fees
      mint,                     // Mint address
      tokenAccounts.user1TokenAccount, // Destination token account
      mintAuthority,            // Mint authority
      amountToMint             // Amount (in base units)
    );
    
    console.log('✅ Tokens minted!');
    console.log('Signature:', mintSignature);
    console.log('Amount minted: 1000 LRN tokens');
    
    // Check balance
    const user1Account = await getAccount(connection, tokenAccounts.user1TokenAccount);
    console.log('User 1 token balance:', (Number(user1Account.amount) / (10 ** 6)).toFixed(6), 'LRN');
    
    console.log();
    
  } catch (error) {
    console.log('❌ Failed to mint tokens:', error.message);
  }
}

// --- Part 5: Transfer Tokens ---
console.log('📤 Part 5: Transferring Tokens\n');

async function transferTokens(mint, tokenAccounts) {
  if (!mint || !tokenAccounts) return;
  
  try {
    console.log('Transferring tokens from User 1 to User 2...');
    
    const transferAmount = 250 * (10 ** 6); // 250 tokens
    
    // Transfer tokens
    const transferSignature = await transfer(
      connection,
      payer,                           // Payer of transaction fees
      tokenAccounts.user1TokenAccount, // Source token account
      tokenAccounts.user2TokenAccount, // Destination token account
      user1,                           // Owner of source account
      transferAmount                   // Amount in base units
    );
    
    console.log('✅ Transfer complete!');
    console.log('Signature:', transferSignature);
    console.log('Amount transferred: 250 LRN tokens');
    
    // Check balances
    const user1Account = await getAccount(connection, tokenAccounts.user1TokenAccount);
    const user2Account = await getAccount(connection, tokenAccounts.user2TokenAccount);
    
    console.log('Updated Balances:');
    console.log('User 1:', (Number(user1Account.amount) / (10 ** 6)).toFixed(6), 'LRN');
    console.log('User 2:', (Number(user2Account.amount) / (10 ** 6)).toFixed(6), 'LRN');
    
    console.log();
    
  } catch (error) {
    console.log('❌ Failed to transfer tokens:', error.message);
  }
}

// --- Part 6: Burn Tokens ---
console.log('🔥 Part 6: Burning Tokens\n');

async function burnTokens(mint, tokenAccounts) {
  if (!mint || !tokenAccounts) return;
  
  try {
    console.log('Burning tokens from User 2...');
    
    const burnAmount = 50 * (10 ** 6); // 50 tokens
    
    // Burn tokens
    const burnSignature = await burn(
      connection,
      payer,                           // Payer of transaction fees
      tokenAccounts.user2TokenAccount, // Token account to burn from
      mint,                            // Mint address
      user2,                           // Owner of token account
      burnAmount                       // Amount to burn
    );
    
    console.log('✅ Tokens burned!');
    console.log('Signature:', burnSignature);
    console.log('Amount burned: 50 LRN tokens');
    
    // Check final balances
    const user1Account = await getAccount(connection, tokenAccounts.user1TokenAccount);
    const user2Account = await getAccount(connection, tokenAccounts.user2TokenAccount);
    const mintInfo = await getMint(connection, mint);
    
    console.log('Final Balances:');
    console.log('User 1:', (Number(user1Account.amount) / (10 ** 6)).toFixed(6), 'LRN');
    console.log('User 2:', (Number(user2Account.amount) / (10 ** 6)).toFixed(6), 'LRN');
    console.log('Total Supply:', (Number(mintInfo.supply) / (10 ** 6)).toFixed(6), 'LRN');
    
    console.log();
    
  } catch (error) {
    console.log('❌ Failed to burn tokens:', error.message);
  }
}

// --- Part 7: Token Program Information ---
console.log('ℹ️  Part 7: Token Program Information\n');

function displayTokenProgramInfo() {
  console.log('Solana Token Program Details:');
  console.log('Token Program ID:', TOKEN_PROGRAM_ID.toBase58());
  console.log('Associated Token Program ID:', ASSOCIATED_TOKEN_PROGRAM_ID.toBase58());
  
  console.log('\nKey Concepts:');
  console.log('• Mint: Defines token type, supply, and authorities');
  console.log('• Token Account: Holds tokens for a specific user + mint');
  console.log('• Associated Token Account: Deterministic token account address');
  console.log('• Mint Authority: Can create new tokens');
  console.log('• Freeze Authority: Can freeze/unfreeze token accounts');
  console.log('• Decimals: Number of decimal places (6 = micro-tokens)');
  
  console.log('\nCommon Token Standards:');
  console.log('• USDC: 6 decimals');
  console.log('• SOL: 9 decimals (lamports)');
  console.log('• Most tokens: 6-9 decimals');
  
  console.log();
}

// --- Main Execution ---
async function runDemo() {
  displayTokenProgramInfo();
  
  const setupSuccess = await setupAccounts();
  if (!setupSuccess) {
    console.log('⚠️  Demo will continue but some operations may fail due to insufficient SOL');
  }
  
  const mint = await createTokenMint();
  const tokenAccounts = await createTokenAccounts(mint);
  await mintTokens(mint, tokenAccounts);
  await transferTokens(mint, tokenAccounts);
  await burnTokens(mint, tokenAccounts);
  
  console.log('🎓 Module 3 Complete!');
  console.log('\n💡 Key Concepts Learned:');
  console.log('✅ Creating token mints with authorities');
  console.log('✅ Creating Associated Token Accounts (ATAs)');
  console.log('✅ Minting new tokens');
  console.log('✅ Transferring tokens between accounts');
  console.log('✅ Burning tokens to reduce supply');
  console.log('✅ Understanding token decimals and base units');
  console.log('✅ Token program architecture');
  console.log('\nNext: Learn about Smart Contracts (Programs)!');
}

// Run the demonstration
runDemo().catch(console.error);
