/**
 * Module 8: Anchor Framework
 * 
 * This module demonstrates the Anchor framework for Solana development.
 * Anchor is the most popular framework that provides high-level abstractions,
 * automatic serialization, and built-in security features for rapid dApp development.
 */

const {
    Connection,
    PublicKey,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL
} = require('@solana/web3.js');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

console.log('=== Anchor Framework for Solana ===\n');

// Part 1: Anchor vs Native Solana Comparison
function demonstrateAnchorBenefits() {
    console.log('⚓ Part 1: Anchor vs Native Solana');
    console.log('Why Anchor revolutionizes Solana development:\n');
    
    console.log('Native Solana (Raw Rust) - 50+ lines:');
    console.log(`
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Manual account iteration
    let account_iter = &mut accounts.iter();
    let user_account = next_account_info(account_iter)?;
    let token_account = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;
    
    // Manual validation (20+ lines)
    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    if user_account.owner != &system_program::ID {
        return Err(ProgramError::IncorrectProgramId);
    }
    // ... 30+ more lines of boilerplate validation
    
    // Finally, business logic
    Ok(())
}
`);

    console.log('Anchor Framework - 10 lines:');
    console.log(`
#[program]
pub mod my_program {
    use super::*;
    
    pub fn transfer_tokens(
        ctx: Context<TransferTokens>,
        amount: u64,
    ) -> Result<()> {
        // Business logic only - validation handled by Anchor
        token::transfer(ctx.accounts.transfer_ctx(), amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut, constraint = token_account.owner == user.key())]
    pub token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}
`);

    console.log('Anchor Benefits:');
    console.log('  ✅ 80% less boilerplate code');
    console.log('  ✅ Automatic account validation');
    console.log('  ✅ Built-in security constraints');
    console.log('  ✅ TypeScript client generation');
    console.log('  ✅ Comprehensive testing framework');
    console.log('  ✅ Simplified deployment pipeline\n');
}

// Part 2: Anchor Project Structure
function demonstrateProjectStructure() {
    console.log('🏗️ Part 2: Anchor Project Structure');
    console.log('Professional project organization:\n');
    
    console.log('Complete Anchor Project Layout:');
    console.log(`
my-anchor-project/
├── Anchor.toml              # Anchor configuration
├── Cargo.toml              # Rust dependencies
├── package.json            # Node.js dependencies
├── programs/               # Solana programs
│   └── my-program/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs      # Main program
│           ├── state.rs    # Data structures
│           ├── error.rs    # Custom errors
│           └── utils.rs    # Helper functions
├── tests/                  # JavaScript/TypeScript tests
│   └── my-program.ts
├── app/                    # Frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── target/                 # Build artifacts
│   ├── deploy/
│   ├── idl/
│   └── types/
└── migrations/             # Deployment scripts
    └── deploy.js
`);

    console.log('Key Configuration Files:');
    console.log('\nAnchor.toml:');
    console.log(`
[features]
seeds = false
skip-lint = false

[programs.localnet]
my_program = "YourProgramIDHere"

[programs.devnet]
my_program = "YourProgramIDHere"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
`);

    console.log('package.json dependencies:');
    console.log(`
{
  "dependencies": {
    "@coral-xyz/anchor": "^0.29.0",
    "@solana/web3.js": "^1.87.0",
    "@solana/wallet-adapter-react": "^0.15.32"
  },
  "devDependencies": {
    "@types/chai": "^4.3.0",
    "@types/mocha": "^9.1.0",
    "chai": "^4.3.0",
    "mocha": "^9.2.0",
    "ts-mocha": "^10.0.0",
    "typescript": "^4.9.0"
  }
}
`);
}

// Part 3: Account Validation and Constraints
function demonstrateAccountValidation() {
    console.log('✅ Part 3: Account Validation & Constraints');
    console.log('Anchor\'s powerful account validation system:\n');
    
    console.log('Basic Account Types:');
    console.log(`
#[derive(Accounts)]
pub struct MyInstruction<'info> {
    // Signer account (must sign transaction)
    #[account(mut)]
    pub user: Signer<'info>,
    
    // Program account
    pub token_program: Program<'info, Token>,
    
    // System program
    pub system_program: Program<'info, System>,
    
    // Account with specific type
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
}
`);

    console.log('Advanced Constraints:');
    console.log(`
#[derive(Accounts)]
pub struct AdvancedValidation<'info> {
    // Initialize new account with space calculation
    #[account(
        init,
        payer = user,
        space = 8 + UserProfile::INIT_SPACE
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    // PDA with seeds and bump
    #[account(
        init,
        payer = user,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    // Custom constraints with error messages
    #[account(
        constraint = token_account.amount >= 100 @ ErrorCode::InsufficientFunds
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    // Owner validation
    #[account(
        constraint = metadata.update_authority == authority.key()
    )]
    pub metadata: Account<'info, Metadata>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub authority: Signer<'info>,
}
`);

    console.log('Constraint Types:');
    console.log('  🔐 init - Initialize new account');
    console.log('  🔐 mut - Account will be modified');
    console.log('  🔐 signer - Must sign transaction');
    console.log('  🔐 seeds - PDA with specific seeds');
    console.log('  🔐 bump - PDA bump seed');
    console.log('  🔐 payer - Who pays for account creation');
    console.log('  🔐 space - Account size in bytes');
    console.log('  🔐 constraint - Custom validation logic');
    console.log('  🔐 close - Close account and reclaim rent\n');
}

// Part 4: State Management and Data Structures
function demonstrateStateManagement() {
    console.log('📊 Part 4: State Management & Data Structures');
    console.log('Efficient on-chain data storage patterns:\n');
    
    console.log('Basic Account Structure:');
    console.log(`
#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub authority: Pubkey,      // 32 bytes
    pub balance: u64,           // 8 bytes
    pub level: u8,              // 1 byte
    pub is_premium: bool,       // 1 byte
    #[max_len(32)]
    pub username: String,       // 4 + 32 bytes
    pub created_at: i64,        // 8 bytes
}
// Total: 32 + 8 + 1 + 1 + 36 + 8 = 86 bytes
// Plus 8-byte discriminator = 94 bytes
`);

    console.log('Complex State with Enums and Vectors:');
    console.log(`
#[account]
#[derive(InitSpace)]
pub struct GameState {
    pub game_id: u64,
    pub status: GameStatus,     // Enum
    #[max_len(4)]
    pub players: Vec<Pubkey>,   // Dynamic array with max length
    pub current_turn: u8,
    pub winner: Option<Pubkey>, // Optional field
    #[max_len(100)]
    pub description: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub enum GameStatus {
    Waiting,
    InProgress { round: u8 },
    Finished { winner_index: u8 },
    Cancelled,
}
`);

    console.log('Account Space Calculation:');
    console.log(`
// Automatic space calculation with InitSpace
#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + GameState::INIT_SPACE  // Anchor calculates automatically
    )]
    pub game: Account<'info, GameState>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
`);

    console.log('Space Calculation Benefits:');
    console.log('  📏 Automatic size calculation with InitSpace');
    console.log('  📏 Compile-time space validation');
    console.log('  📏 No manual byte counting errors');
    console.log('  📏 Efficient memory usage');
    console.log('  📏 Built-in rent exemption handling\n');
}

// Part 5: Cross-Program Invocation (CPI)
function demonstrateCPI() {
    console.log('🔗 Part 5: Cross-Program Invocation (CPI)');
    console.log('Composable program interactions with Anchor:\n');
    
    console.log('Token Transfer CPI:');
    console.log(`
use anchor_spl::token::{self, Transfer, Token, TokenAccount};

pub fn transfer_tokens(
    ctx: Context<TransferTokens>,
    amount: u64,
) -> Result<()> {
    // Create CPI context
    let cpi_accounts = Transfer {
        from: ctx.accounts.from_account.to_account_info(),
        to: ctx.accounts.to_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    // Execute CPI call
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub from_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to_account: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
`);

    console.log('PDA Signing CPI:');
    console.log(`
pub fn transfer_from_vault(
    ctx: Context<TransferFromVault>,
    amount: u64,
) -> Result<()> {
    let authority_key = ctx.accounts.authority.key();
    let seeds = &[
        b"vault",
        authority_key.as_ref(),
        &[ctx.bumps.vault],  // Anchor provides bump automatically
    ];
    let signer = &[&seeds[..]];
    
    // CPI with PDA signing
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        },
        signer,
    );
    
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
`);

    console.log('CPI Benefits in Anchor:');
    console.log('  🔄 Simplified account management');
    console.log('  🔄 Automatic PDA bump handling');
    console.log('  🔄 Type-safe program interfaces');
    console.log('  🔄 Built-in signature verification');
    console.log('  🔄 Composable program architecture\n');
}

// Part 6: Error Handling
function demonstrateErrorHandling() {
    console.log('⚠️ Part 6: Error Handling');
    console.log('Robust error management in Anchor programs:\n');
    
    console.log('Custom Error Definitions:');
    console.log(`
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds in account")]
    InsufficientFunds,
    
    #[msg("Invalid authority for this operation")]
    InvalidAuthority,
    
    #[msg("Amount exceeds maximum allowed")]
    AmountTooLarge,
    
    #[msg("Game is not in correct state")]
    InvalidGameState,
    
    #[msg("Player limit exceeded")]
    TooManyPlayers,
}
`);

    console.log('Using Errors in Constraints:');
    console.log(`
#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(
        mut,
        constraint = user_account.balance >= amount @ ErrorCode::InsufficientFunds,
        constraint = user_account.authority == authority.key() @ ErrorCode::InvalidAuthority
    )]
    pub user_account: Account<'info, UserAccount>,
    
    pub authority: Signer<'info>,
}
`);

    console.log('Error Handling in Functions:');
    console.log(`
pub fn withdraw_funds(
    ctx: Context<WithdrawFunds>,
    amount: u64,
) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;
    
    // Manual validation with custom errors
    if amount == 0 {
        return Err(ErrorCode::AmountTooLarge.into());
    }
    
    if user_account.balance < amount {
        return Err(ErrorCode::InsufficientFunds.into());
    }
    
    // Business logic
    user_account.balance = user_account.balance
        .checked_sub(amount)
        .ok_or(ErrorCode::InsufficientFunds)?;
    
    Ok(())
}
`);

    console.log('Error Handling Benefits:');
    console.log('  🚨 Clear, descriptive error messages');
    console.log('  🚨 Automatic error code generation');
    console.log('  🚨 Frontend error handling integration');
    console.log('  🚨 Constraint-level validation');
    console.log('  🚨 Type-safe error propagation\n');
}

// Part 7: Testing Framework
function demonstrateTesting() {
    console.log('🧪 Part 7: Testing Framework');
    console.log('Comprehensive testing strategies with Anchor:\n');
    
    console.log('Basic Test Structure:');
    console.log(`
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";
import { expect } from "chai";

describe("my-program", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MyProgram as Program<MyProgram>;
  const user = anchor.web3.Keypair.generate();

  before(async () => {
    // Setup: Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        user.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      )
    );
  });

  it("Creates user profile", async () => {
    const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), user.publicKey.toBuffer()],
      program.programId
    );

    // Execute instruction
    await program.methods
      .createUserProfile("Alice", 25)
      .accounts({
        userProfile: userProfilePda,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Verify results
    const userProfile = await program.account.userProfile.fetch(userProfilePda);
    expect(userProfile.username).to.equal("Alice");
    expect(userProfile.age).to.equal(25);
    expect(userProfile.authority.toString()).to.equal(user.publicKey.toString());
  });

  it("Handles errors correctly", async () => {
    try {
      await program.methods
        .createUserProfile("", 25) // Invalid empty name
        .accounts({
          userProfile: userProfilePda,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.message).to.include("InvalidUsername");
    }
  });
});
`);

    console.log('Advanced Testing Patterns:');
    console.log(`
// Test multiple instructions in one transaction
it("Executes batch operations", async () => {
  const tx = new anchor.web3.Transaction();
  
  // Add multiple instructions
  tx.add(
    await program.methods
      .initializeVault()
      .accounts({ /* accounts */ })
      .instruction()
  );
  
  tx.add(
    await program.methods
      .depositTokens(new anchor.BN(1000))
      .accounts({ /* accounts */ })
      .instruction()
  );
  
  // Send transaction
  await anchor.web3.sendAndConfirmTransaction(
    provider.connection,
    tx,
    [user]
  );
});

// Test event emission
it("Emits events correctly", async () => {
  let eventReceived = false;
  
  // Listen for events
  const listener = program.addEventListener("UserProfileCreated", (event) => {
    expect(event.user.toString()).to.equal(user.publicKey.toString());
    expect(event.username).to.equal("Bob");
    eventReceived = true;
  });
  
  // Execute instruction that emits event
  await program.methods
    .createUserProfile("Bob", 30)
    .accounts({ /* accounts */ })
    .signers([user])
    .rpc();
  
  // Wait for event
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(eventReceived).to.be.true;
  
  // Clean up listener
  program.removeEventListener(listener);
});
`);

    console.log('Testing Benefits:');
    console.log('  ✅ Local validator integration');
    console.log('  ✅ Automatic account setup');
    console.log('  ✅ TypeScript type safety');
    console.log('  ✅ Event testing support');
    console.log('  ✅ Error condition validation');
    console.log('  ✅ Performance benchmarking\n');
}

// Part 8: Frontend Integration
function demonstrateFrontendIntegration() {
    console.log('🌐 Part 8: Frontend Integration');
    console.log('Seamless React integration with Anchor:\n');
    
    console.log('React Hook for Program Interaction:');
    console.log(`
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { MyProgram } from '../types/my_program';
import IDL from '../idl/my_program.json';

export function useMyProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const provider = new AnchorProvider(
    connection,
    wallet as any,
    AnchorProvider.defaultOptions()
  );
  
  const program = new Program<MyProgram>(IDL, PROGRAM_ID, provider);
  
  const createUserProfile = async (username: string, age: number) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    
    const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), wallet.publicKey.toBuffer()],
      program.programId
    );
    
    const tx = await program.methods
      .createUserProfile(username, age)
      .accounts({
        userProfile: userProfilePda,
        user: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
      
    return { signature: tx, userProfile: userProfilePda };
  };
  
  const getUserProfile = async (userPubkey: web3.PublicKey) => {
    const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), userPubkey.toBuffer()],
      program.programId
    );
    
    try {
      const profile = await program.account.userProfile.fetch(userProfilePda);
      return profile;
    } catch (error) {
      return null; // Profile doesn't exist
    }
  };
  
  return { program, createUserProfile, getUserProfile };
}
`);

    console.log('React Component Usage:');
    console.log(`
import React, { useState } from 'react';
import { useMyProgram } from '../hooks/useMyProgram';

export function UserProfileComponent() {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const { createUserProfile } = useMyProgram();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await createUserProfile(username, age);
      console.log('Profile created:', result.signature);
      // Show success message
    } catch (error) {
      console.error('Error creating profile:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(parseInt(e.target.value))}
        placeholder="Age"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Profile'}
      </button>
    </form>
  );
}
`);

    console.log('Frontend Integration Benefits:');
    console.log('  🌐 Automatic TypeScript type generation');
    console.log('  🌐 React wallet adapter integration');
    console.log('  🌐 Real-time account subscription');
    console.log('  🌐 Event listening and notifications');
    console.log('  🌐 Error handling and user feedback');
    console.log('  🌐 Transaction state management\n');
}

// Part 9: Deployment and Management
function demonstrateDeployment() {
    console.log('🚀 Part 9: Deployment & Management');
    console.log('Professional deployment workflow:\n');
    
    console.log('Build and Deploy Commands:');
    console.log(`
# Install Anchor CLI globally
npm install -g @coral-xyz/anchor-cli

# Initialize new Anchor project
anchor init my-awesome-dapp --typescript

# Build all programs
anchor build

# Generate TypeScript types from IDL
anchor build --idl

# Run local test validator
anchor test --skip-deploy

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
anchor verify --provider.cluster devnet <program-id>

# Upgrade existing program
anchor upgrade target/deploy/my_program.so --program-id <program-id>

# Show program logs
solana logs --url devnet <program-id>
`);

    console.log('Environment Configuration:');
    console.log(`
// .env file for different networks
REACT_APP_NETWORK=devnet
REACT_APP_PROGRAM_ID=YourProgramIdHere
REACT_APP_RPC_URL=https://api.devnet.solana.com

// Production deployment checklist:
1. ✅ Comprehensive test coverage
2. ✅ Security audit completed
3. ✅ Gas optimization verified
4. ✅ Error handling tested
5. ✅ Frontend integration tested
6. ✅ Monitoring and alerts setup
7. ✅ Upgrade authority configured
8. ✅ Emergency procedures documented
`);

    console.log('Program Upgrade Strategy:');
    console.log(`
// Anchor supports seamless program upgrades
// 1. Deploy new version to same program ID
// 2. Maintain backward compatibility
// 3. Migrate state if necessary
// 4. Monitor for issues post-upgrade

// Upgrade authority management
solana program set-upgrade-authority <program-id> <new-authority>
solana program close <program-id> --bypass-warning
`);
}

// Main execution function
async function runAnchorDemo() {
    try {
        demonstrateAnchorBenefits();
        demonstrateProjectStructure();
        demonstrateAccountValidation();
        demonstrateStateManagement();
        demonstrateCPI();
        demonstrateErrorHandling();
        demonstrateTesting();
        demonstrateFrontendIntegration();
        demonstrateDeployment();
        
        console.log('🎓 Module 8 Complete!');
        console.log('\n⚓ Anchor Framework Mastery Achieved!');
        console.log('\nYou now understand:');
        console.log('• Anchor\'s powerful abstraction layer');
        console.log('• Professional project structure and organization');
        console.log('• Advanced account validation and constraints');
        console.log('• Efficient state management patterns');
        console.log('• Cross-program invocation with type safety');
        console.log('• Robust error handling and custom errors');
        console.log('• Comprehensive testing strategies');
        console.log('• Seamless frontend integration');
        console.log('• Production deployment workflows');
        console.log('\n💡 Ready to build enterprise-grade Solana dApps!');
        console.log('\nNext: Module 9 - NFTs and Metaplex for digital assets');
        
    } catch (error) {
        console.error('Demo error:', error.message);
    }
}

// Run the demo
runAnchorDemo();
