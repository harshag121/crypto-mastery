const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  clusterApiUrl,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');

const {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} = require('@solana/spl-token');

console.log('=== Smart Contracts (Programs) Demo ===\n');

// Create connection to devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Generate test accounts
const payer = Keypair.generate();
const programUser = Keypair.generate();

console.log('👥 Generated Test Accounts:');
console.log('Payer:', payer.publicKey.toBase58());
console.log('Program User:', programUser.publicKey.toBase58());
console.log();

// --- Part 1: Understanding Solana Programs ---
console.log('🏗️  Part 1: Understanding Solana Programs\n');

function explainProgramConcepts() {
  console.log('Solana Program Architecture:');
  console.log('• Programs: Executable code (like smart contracts)');
  console.log('• Accounts: Data storage (separate from programs)');
  console.log('• Instructions: Commands with data for programs');
  console.log('• Signers: Accounts that approve the transaction');
  console.log();
  
  console.log('Built-in Programs:');
  console.log('• System Program: Creates accounts, transfers SOL');
  console.log('• Token Program: Manages SPL tokens');
  console.log('• Associated Token Program: Creates token accounts');
  console.log('• BPF Loader: Loads custom programs');
  console.log();
  
  console.log('Program IDs (addresses):');
  console.log('System Program:', SystemProgram.programId.toBase58());
  console.log('Token Program:', TOKEN_PROGRAM_ID.toBase58());
  console.log('Associated Token Program:', ASSOCIATED_TOKEN_PROGRAM_ID.toBase58());
  console.log();
}

// --- Part 2: System Program Examples ---
console.log('🖥️  Part 2: System Program Operations\n');

async function demonstrateSystemProgram() {
  try {
    // Airdrop some SOL first
    console.log('Getting SOL for demonstrations...');
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    console.log('✅ Airdrop complete\n');
    
    // 1. Create Account Instruction
    console.log('Creating a new account with System Program...');
    
    const newAccount = Keypair.generate();
    const lamports = await connection.getMinimumBalanceForRentExemption(0); // Empty account
    
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: lamports,
      space: 0, // 0 bytes of data
      programId: SystemProgram.programId
    });
    
    console.log('Create Account Instruction:');
    console.log('  Program ID:', createAccountInstruction.programId.toBase58());
    console.log('  Keys:', createAccountInstruction.keys.length);
    console.log('  Data length:', createAccountInstruction.data.length, 'bytes');
    
    // Send the transaction
    const createAccountTx = new Transaction().add(createAccountInstruction);
    const createAccountSig = await sendAndConfirmTransaction(
      connection,
      createAccountTx,
      [payer, newAccount]
    );
    
    console.log('✅ Account created!');
    console.log('New account:', newAccount.publicKey.toBase58());
    console.log('Signature:', createAccountSig);
    console.log();
    
    // 2. Transfer SOL Instruction
    console.log('Transferring SOL...');
    
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: programUser.publicKey,
      lamports: 0.1 * LAMPORTS_PER_SOL
    });
    
    console.log('Transfer Instruction:');
    console.log('  From:', transferInstruction.keys[0].pubkey.toBase58());
    console.log('  To:', transferInstruction.keys[1].pubkey.toBase58());
    console.log('  Amount: 0.1 SOL');
    
    const transferTx = new Transaction().add(transferInstruction);
    const transferSig = await sendAndConfirmTransaction(
      connection,
      transferTx,
      [payer]
    );
    
    console.log('✅ Transfer complete!');
    console.log('Signature:', transferSig);
    console.log();
    
  } catch (error) {
    console.log('❌ System Program demo failed:', error.message);
    console.log();
  }
}

// --- Part 3: Program Derived Addresses (PDAs) ---
console.log('🔑 Part 3: Program Derived Addresses (PDAs)\n');

function demonstratePDAs() {
  console.log('Understanding PDAs:');
  console.log('• PDAs are addresses derived from seeds + program ID');
  console.log('• No private key exists for PDAs');
  console.log('• Only the program can sign for PDA accounts');
  console.log('• Used for program-controlled storage');
  console.log();
  
  // Example: Find PDA for a hypothetical program
  const programId = new PublicKey('11111111111111111111111111111111'); // Example
  const seeds = [
    Buffer.from('user_data'),
    payer.publicKey.toBuffer(),
    Buffer.from('v1')
  ];
  
  try {
    const [pda, bump] = PublicKey.findProgramAddressSync(seeds, programId);
    
    console.log('Example PDA Generation:');
    console.log('  Seeds: ["user_data", user_pubkey, "v1"]');
    console.log('  Program ID:', programId.toBase58());
    console.log('  Derived PDA:', pda.toBase58());
    console.log('  Bump seed:', bump);
    console.log();
    
    console.log('PDA Properties:');
    console.log('• Deterministic: Same seeds → same PDA');
    console.log('• Unique: Different seeds → different PDA');
    console.log('• Program-controlled: Only program can sign');
    console.log('• No private key: Cannot be controlled externally');
    console.log();
    
  } catch (error) {
    console.log('PDA generation example failed:', error.message);
    console.log();
  }
}

// --- Part 4: Associated Token Account Creation ---
console.log('🪙 Part 4: Associated Token Program\n');

async function demonstrateAssociatedTokenProgram() {
  try {
    console.log('Working with Associated Token Program...');
    
    // Example mint address (USDC on devnet)
    const usdcMint = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
    
    // Calculate associated token address
    const associatedTokenAddress = await getAssociatedTokenAddress(
      usdcMint,
      programUser.publicKey
    );
    
    console.log('Associated Token Account Calculation:');
    console.log('  Mint:', usdcMint.toBase58());
    console.log('  Owner:', programUser.publicKey.toBase58());
    console.log('  ATA Address:', associatedTokenAddress.toBase58());
    console.log();
    
    console.log('ATA Properties:');
    console.log('• Deterministic: owner + mint → same ATA address');
    console.log('• One per mint: Each user has one ATA per token type');
    console.log('• Standard: All wallets use the same calculation');
    console.log('• Efficient: No need to track multiple accounts');
    console.log();
    
  } catch (error) {
    console.log('❌ ATA demo failed:', error.message);
    console.log();
  }
}

// --- Part 5: Custom Instruction Example ---
console.log('⚙️  Part 5: Custom Program Instruction\n');

function demonstrateCustomInstruction() {
  console.log('Creating a custom instruction...');
  console.log('(This would interact with a deployed custom program)');
  console.log();
  
  // Example of creating a custom instruction
  const customProgramId = new PublicKey('11111111111111111111111111111111'); // Placeholder
  
  // Custom instruction data (would be defined by the program)
  const instructionData = Buffer.from([
    1, // Instruction discriminator
    ...Buffer.from('Hello, Program!', 'utf8')
  ]);
  
  const customInstruction = new TransactionInstruction({
    keys: [
      {
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: false
      },
      {
        pubkey: programUser.publicKey,
        isSigner: false,
        isWritable: true
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false
      }
    ],
    programId: customProgramId,
    data: instructionData
  });
  
  console.log('Custom Instruction Structure:');
  console.log('  Program ID:', customInstruction.programId.toBase58());
  console.log('  Accounts:', customInstruction.keys.length);
  console.log('  Data:', customInstruction.data.toString('hex'));
  console.log();
  
  console.log('Account Roles:');
  customInstruction.keys.forEach((key, index) => {
    console.log(`  ${index + 1}. ${key.pubkey.toBase58()}`);
    console.log(`     Signer: ${key.isSigner}, Writable: ${key.isWritable}`);
  });
  console.log();
}

// --- Part 6: Cross Program Invocation (CPI) ---
console.log('🔄 Part 6: Cross Program Invocation (CPI)\n');

function demonstrateCPI() {
  console.log('Understanding CPI:');
  console.log('• Programs can call other programs');
  console.log('• Maintains atomicity (all succeed or all fail)');
  console.log('• Common pattern in DeFi protocols');
  console.log('• Enables composability');
  console.log();
  
  console.log('Example CPI Flow:');
  console.log('1. User calls DEX program');
  console.log('2. DEX program calls Token program to transfer tokens');
  console.log('3. Token program updates token accounts');
  console.log('4. DEX program updates its state');
  console.log('5. All changes committed atomically');
  console.log();
  
  console.log('CPI Benefits:');
  console.log('• Composability: Programs can build on each other');
  console.log('• Atomic operations: All or nothing execution');
  console.log('• Code reuse: Leverage existing programs');
  console.log('• Security: Isolated execution contexts');
  console.log();
}

// --- Part 7: Program Security Concepts ---
console.log('🔒 Part 7: Program Security\n');

function explainProgramSecurity() {
  console.log('Solana Program Security:');
  console.log();
  
  console.log('Key Security Principles:');
  console.log('• Account Validation: Always verify account ownership');
  console.log('• Signer Checks: Ensure required signatures present');
  console.log('• Data Validation: Validate all input data');
  console.log('• Integer Overflow: Use safe math operations');
  console.log('• Reentrancy: Not applicable (stateless programs)');
  console.log();
  
  console.log('Common Vulnerabilities:');
  console.log('• Missing signer checks');
  console.log('• Incorrect account ownership validation');
  console.log('• Integer overflow/underflow');
  console.log('• Uninitialized account access');
  console.log('• Missing program ID validation');
  console.log();
  
  console.log('Best Practices:');
  console.log('• Use Anchor framework for safety');
  console.log('• Implement comprehensive tests');
  console.log('• Conduct security audits');
  console.log('• Use established patterns');
  console.log('• Validate all accounts and data');
  console.log();
}

// --- Main Execution ---
async function runDemo() {
  explainProgramConcepts();
  await demonstrateSystemProgram();
  demonstratePDAs();
  await demonstrateAssociatedTokenProgram();
  demonstrateCustomInstruction();
  demonstrateCPI();
  explainProgramSecurity();
  
  console.log('🎓 Module 4 Complete!');
  console.log('\n💡 Key Concepts Learned:');
  console.log('✅ Solana program architecture (stateless)');
  console.log('✅ Built-in programs (System, Token, ATA)');
  console.log('✅ Program Derived Addresses (PDAs)');
  console.log('✅ Creating custom instructions');
  console.log('✅ Cross Program Invocation (CPI)');
  console.log('✅ Account relationships and validation');
  console.log('✅ Security considerations');
  console.log('\nNext: Learn about DeFi basics!');
}

// Run the demonstration
runDemo().catch(console.error);
