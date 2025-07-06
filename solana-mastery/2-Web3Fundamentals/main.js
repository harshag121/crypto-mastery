const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  sendAndConfirmTransaction
} = require('@solana/web3.js');

console.log('=== Web3.js Fundamentals Demo ===\n');

// Create connection to devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Generate test keypairs
const payer = Keypair.generate();
const recipient = Keypair.generate();

console.log('👥 Generated Test Accounts:');
console.log('Payer:', payer.publicKey.toBase58());
console.log('Recipient:', recipient.publicKey.toBase58());
console.log();

// --- Part 1: Basic RPC Calls ---
console.log('🌐 Part 1: Basic RPC Calls\n');

async function demonstrateRPCCalls() {
  try {
    // Get cluster info
    const version = await connection.getVersion();
    console.log('Solana Version:', version);
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    console.log('Recent Blockhash:', blockhash);
    
    // Get slot info
    const slot = await connection.getSlot();
    console.log('Current Slot:', slot);
    
    // Get epoch info
    const epochInfo = await connection.getEpochInfo();
    console.log('Epoch Info:', {
      epoch: epochInfo.epoch,
      slotIndex: epochInfo.slotIndex,
      slotsInEpoch: epochInfo.slotsInEpoch
    });
    
    console.log();
    
  } catch (error) {
    console.log('RPC Error:', error.message);
    console.log('(This is normal if offline)\n');
  }
}

// --- Part 2: Account Information ---
console.log('📊 Part 2: Account Information\n');

async function demonstrateAccountInfo() {
  try {
    // Check balances
    const payerBalance = await connection.getBalance(payer.publicKey);
    const recipientBalance = await connection.getBalance(recipient.publicKey);
    
    console.log('Account Balances:');
    console.log(`Payer: ${payerBalance} lamports (${payerBalance / LAMPORTS_PER_SOL} SOL)`);
    console.log(`Recipient: ${recipientBalance} lamports (${recipientBalance / LAMPORTS_PER_SOL} SOL)`);
    
    // Get account info
    const payerInfo = await connection.getAccountInfo(payer.publicKey);
    console.log('\nPayer Account Info:');
    if (payerInfo) {
      console.log('  Exists: Yes');
      console.log('  Owner:', payerInfo.owner.toBase58());
      console.log('  Executable:', payerInfo.executable);
      console.log('  Rent Epoch:', payerInfo.rentEpoch);
    } else {
      console.log('  Exists: No (zero balance)');
    }
    
    console.log();
    
  } catch (error) {
    console.log('Account Info Error:', error.message);
    console.log();
  }
}

// --- Part 3: Creating Transactions ---
console.log('💸 Part 3: Creating Transactions\n');

function demonstrateTransactionCreation() {
  console.log('Building a SOL transfer transaction...');
  
  // Create a transaction
  const transaction = new Transaction();
  
  // Add an instruction to transfer SOL
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient.publicKey,
    lamports: 0.1 * LAMPORTS_PER_SOL // 0.1 SOL
  });
  
  transaction.add(transferInstruction);
  
  console.log('Transaction created with instruction:');
  console.log('  Type: SOL Transfer');
  console.log('  From:', payer.publicKey.toBase58());
  console.log('  To:', recipient.publicKey.toBase58());
  console.log('  Amount: 0.1 SOL');
  console.log('  Instructions count:', transaction.instructions.length);
  console.log();
  
  return transaction;
}

// --- Part 4: Transaction Simulation ---
console.log('🧪 Part 4: Transaction Simulation\n');

async function demonstrateSimulation() {
  try {
    const transaction = demonstrateTransactionCreation();
    
    // Add recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;
    
    // Sign the transaction
    transaction.sign(payer);
    
    console.log('Simulating transaction...');
    
    // Simulate the transaction (doesn't actually send it)
    const simulation = await connection.simulateTransaction(transaction);
    
    console.log('Simulation Result:');
    console.log('  Success:', !simulation.value.err);
    if (simulation.value.err) {
      console.log('  Error:', simulation.value.err);
    } else {
      console.log('  Logs:', simulation.value.logs?.slice(0, 3).join(', ') + '...');
    }
    
    console.log();
    
  } catch (error) {
    console.log('Simulation Error:', error.message);
    console.log();
  }
}

// --- Part 5: Airdrop (Devnet Only) ---
console.log('🪂 Part 5: Airdrop Demo\n');

async function demonstrateAirdrop() {
  try {
    console.log('Requesting airdrop for testing...');
    console.log('(This only works on devnet/testnet)');
    
    // Request 1 SOL airdrop
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    
    console.log('Airdrop signature:', airdropSignature);
    
    // Wait for confirmation
    console.log('Waiting for confirmation...');
    await connection.confirmTransaction(airdropSignature);
    
    // Check new balance
    const newBalance = await connection.getBalance(payer.publicKey);
    console.log(`New balance: ${newBalance / LAMPORTS_PER_SOL} SOL`);
    
    console.log();
    
  } catch (error) {
    console.log('Airdrop Error:', error.message);
    console.log('(Airdrops have rate limits and may fail)');
    console.log();
  }
}

// --- Part 6: Sending Actual Transaction ---
console.log('📤 Part 6: Sending Transaction\n');

async function demonstrateTransactionSending() {
  try {
    // Check if payer has enough balance
    const balance = await connection.getBalance(payer.publicKey);
    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      console.log('Insufficient balance for transaction demo');
      console.log('(Need airdrop first)');
      return;
    }
    
    console.log('Creating and sending real transaction...');
    
    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipient.publicKey,
        lamports: 0.01 * LAMPORTS_PER_SOL // 0.01 SOL
      })
    );
    
    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    
    console.log('Transaction sent!');
    console.log('Signature:', signature);
    
    // Check balances after transfer
    const payerNewBalance = await connection.getBalance(payer.publicKey);
    const recipientNewBalance = await connection.getBalance(recipient.publicKey);
    
    console.log('Final Balances:');
    console.log(`Payer: ${payerNewBalance / LAMPORTS_PER_SOL} SOL`);
    console.log(`Recipient: ${recipientNewBalance / LAMPORTS_PER_SOL} SOL`);
    
    console.log();
    
  } catch (error) {
    console.log('Transaction Error:', error.message);
    console.log();
  }
}

// --- Part 7: Transaction History ---
console.log('📜 Part 7: Transaction History\n');

async function demonstrateTransactionHistory() {
  try {
    console.log('Fetching transaction signatures...');
    
    // Get recent transaction signatures
    const signatures = await connection.getSignaturesForAddress(
      payer.publicKey,
      { limit: 5 }
    );
    
    console.log(`Found ${signatures.length} recent transactions:`);
    signatures.forEach((sig, index) => {
      console.log(`  ${index + 1}. ${sig.signature}`);
      console.log(`     Slot: ${sig.slot}`);
      console.log(`     Status: ${sig.err ? 'Failed' : 'Success'}`);
    });
    
    // Get details of first transaction
    if (signatures.length > 0) {
      console.log('\nDetailed info for latest transaction:');
      const txDetails = await connection.getTransaction(signatures[0].signature);
      if (txDetails) {
        console.log('  Fee:', txDetails.meta?.fee, 'lamports');
        console.log('  Instructions:', txDetails.transaction.message.instructions.length);
      }
    }
    
    console.log();
    
  } catch (error) {
    console.log('History Error:', error.message);
    console.log();
  }
}

// --- Main Execution ---
async function runDemo() {
  await demonstrateRPCCalls();
  await demonstrateAccountInfo();
  demonstrateTransactionCreation();
  await demonstrateSimulation();
  await demonstrateAirdrop();
  await demonstrateTransactionSending();
  await demonstrateTransactionHistory();
  
  console.log('🎓 Module 2 Complete!');
  console.log('\n💡 Key Concepts Learned:');
  console.log('✅ RPC connections and cluster info');
  console.log('✅ Account balance and info queries');
  console.log('✅ Transaction creation and instructions');
  console.log('✅ Transaction simulation and validation');
  console.log('✅ Airdrop requests (devnet/testnet)');
  console.log('✅ Sending and confirming transactions');
  console.log('✅ Transaction history and signatures');
  console.log('\nNext: Learn about SPL Tokens!');
}

// Run the demonstration
runDemo().catch(console.error);
