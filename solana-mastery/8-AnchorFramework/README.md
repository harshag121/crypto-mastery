# Module 8: Anchor Framework 🔮

## 🎯 Learning Objectives
- Master the Anchor framework for rapid Solana development
- Understand macros and code generation
- Build complex dApps with minimal boilerplate
- Implement advanced Anchor patterns
- Deploy and manage programs efficiently
- Integrate with frontend applications

## ⚓ What is Anchor?

**Anchor** is the most popular framework for Solana development, providing:
- **High-level abstractions** over raw Solana programs
- **Automatic serialization** and account validation
- **Built-in security features** and best practices
- **TypeScript client generation** for frontend integration
- **Testing framework** with local validator support

## 🚀 Anchor vs Native Solana

### **Native Solana** (Raw Rust)
```rust
// 50+ lines of boilerplate for basic instruction
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let user_account = next_account_info(account_iter)?;
    let token_account = next_account_info(account_iter)?;
    
    // Manual validation...
    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    // ... 40 more lines of validation and processing
}
```

### **Anchor Framework** ⚓
```rust
// Same functionality in 10 lines
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
    
    #[account(
        mut,
        constraint = token_account.owner == user.key()
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}
```

## 🏗️ Anchor Project Structure

### **Complete Project Layout** 📁
```
my-anchor-project/
├── Anchor.toml              # Anchor configuration
├── Cargo.toml              # Rust dependencies
├── package.json            # Node.js dependencies
├── programs/               # Solana programs
│   └── my-program/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs
├── tests/                  # JavaScript/TypeScript tests
│   └── my-program.ts
├── app/                    # Frontend application
│   ├── src/
│   └── package.json
├── target/                 # Build artifacts
└── migrations/             # Deployment scripts
    └── deploy.js
```

### **Program Structure** 🧱
```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};

declare_id!("Your_Program_ID_Here");

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // Initialization logic
        Ok(())
    }

    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        name: String,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        profile.authority = ctx.accounts.user.key();
        profile.name = name;
        profile.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

// Account validation structs
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 32)]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateUserProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8, // discriminator + authority + name + timestamp
        seeds = [b"user_profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Data structures
#[account]
pub struct Config {
    pub authority: Pubkey,
}

#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub name: String,
    pub created_at: i64,
}
```

## 🔧 Anchor Macros and Attributes

### **Program Macro** 📝
```rust
#[program]
pub mod my_program {
    // All instruction handlers go here
}
```

### **Account Constraints** ✅
```rust
#[derive(Accounts)]
pub struct MyInstruction<'info> {
    // Initialize new account
    #[account(
        init,
        payer = user,
        space = 8 + UserProfile::INIT_SPACE
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    // Mutable signer
    #[account(mut)]
    pub user: Signer<'info>,
    
    // PDA with seeds
    #[account(
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    // Custom constraint
    #[account(
        constraint = token_account.amount >= 100 @ ErrorCode::InsufficientFunds
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    // Program accounts
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
```

### **Error Handling** ⚠️
```rust
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds in account")]
    InsufficientFunds,
    
    #[msg("Invalid authority")]
    InvalidAuthority,
    
    #[msg("Amount too large")]
    AmountTooLarge,
}

// Usage in constraints
#[account(
    constraint = user.lamports() >= 1_000_000 @ ErrorCode::InsufficientFunds
)]
pub user: Signer<'info>,
```

## 🎯 Advanced Anchor Patterns

### **Cross-Program Invocation (CPI)** 🔗
```rust
use anchor_spl::token::{self, Transfer};

pub fn transfer_tokens(
    ctx: Context<TransferTokens>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.from.to_account_info(),
        to: ctx.accounts.to.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

### **Program Derived Addresses (PDAs)** 🎯
```rust
// Generate PDA in program
let (vault_pda, vault_bump) = Pubkey::find_program_address(
    &[b"vault", authority.key().as_ref()],
    ctx.program_id,
);

// Use PDA in account validation
#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Signing with PDA
pub fn transfer_from_vault(
    ctx: Context<TransferFromVault>,
    amount: u64,
) -> Result<()> {
    let authority_key = ctx.accounts.authority.key();
    let seeds = &[
        b"vault",
        authority_key.as_ref(),
        &[ctx.bumps.vault], // Anchor provides bump automatically
    ];
    let signer = &[&seeds[..]];
    
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
```

### **State Management** 📊
```rust
#[account]
#[derive(InitSpace)]
pub struct GameState {
    pub players: Vec<Pubkey>,          // Dynamic vector
    pub current_turn: u8,
    pub game_status: GameStatus,
    pub created_at: i64,
    #[max_len(100)]
    pub name: String,                  // Bounded string
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub enum GameStatus {
    Waiting,
    InProgress,
    Finished,
}

// Usage with automatic space calculation
#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + GameState::INIT_SPACE
    )]
    pub game: Account<'info, GameState>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```

## 🧪 Testing with Anchor

### **Test Setup** 🔬
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";
import { expect } from "chai";

describe("my-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MyProgram as Program<MyProgram>;
  const user = anchor.web3.Keypair.generate();

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        user.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      )
    );
  });

  it("Initializes user profile", async () => {
    const [userProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), user.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createUserProfile("Alice")
      .accounts({
        userProfile: userProfilePda,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const userProfile = await program.account.userProfile.fetch(userProfilePda);
    expect(userProfile.name).to.equal("Alice");
    expect(userProfile.authority.toString()).to.equal(user.publicKey.toString());
  });
});
```

### **Frontend Integration** 🌐
```typescript
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export function useMyProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const provider = new AnchorProvider(
    connection,
    wallet as any,
    AnchorProvider.defaultOptions()
  );
  
  const program = new Program(IDL, PROGRAM_ID, provider);
  
  const createUserProfile = async (name: string) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    
    const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('user_profile'), wallet.publicKey.toBuffer()],
      program.programId
    );
    
    const tx = await program.methods
      .createUserProfile(name)
      .accounts({
        userProfile: userProfilePda,
        user: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
      
    return { signature: tx, userProfile: userProfilePda };
  };
  
  return { program, createUserProfile };
}
```

## 🚀 Deployment and Management

### **Anchor.toml Configuration** ⚙️
```toml
[features]
seeds = false
skip-lint = false

[programs.localnet]
my_program = "YourProgramIDHere"

[programs.devnet]
my_program = "YourProgramIDHere"

[programs.mainnet]
my_program = "YourProgramIDHere"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"

[test.validator]
url = "https://api.devnet.solana.com"

[[test.validator.clone]]
address = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"

[[test.validator.clone]]
address = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
```

### **Build and Deploy Commands** 🔨
```bash
# Install Anchor CLI
npm install -g @coral-xyz/anchor-cli

# Initialize new project
anchor init my-project

# Build programs
anchor build

# Generate TypeScript types
anchor build --idl

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
anchor verify --provider.cluster devnet <program-id>

# Upgrade program
anchor upgrade <path-to-program.so> --program-id <program-id>
```

## 🔥 Advanced Features

### **Event Emission** 📡
```rust
#[event]
pub struct UserProfileCreated {
    pub user: Pubkey,
    pub name: String,
    pub timestamp: i64,
}

pub fn create_user_profile(
    ctx: Context<CreateUserProfile>,
    name: String,
) -> Result<()> {
    let profile = &mut ctx.accounts.user_profile;
    profile.authority = ctx.accounts.user.key();
    profile.name = name.clone();
    profile.created_at = Clock::get()?.unix_timestamp;
    
    emit!(UserProfileCreated {
        user: ctx.accounts.user.key(),
        name,
        timestamp: profile.created_at,
    });
    
    Ok(())
}
```

### **Account Reallocation** 📈
```rust
pub fn update_user_profile(
    ctx: Context<UpdateUserProfile>,
    new_name: String,
) -> Result<()> {
    let profile = &mut ctx.accounts.user_profile;
    
    // Reallocate if new name is longer
    let new_space = 8 + 32 + 4 + new_name.len() + 8;
    let current_space = profile.to_account_info().data_len();
    
    if new_space > current_space {
        profile.to_account_info().realloc(new_space, false)?;
    }
    
    profile.name = new_name;
    Ok(())
}
```

### **Multiple Instruction Transaction** 🔄
```typescript
const tx = new Transaction();

// Add multiple instructions
tx.add(
  await program.methods
    .initializeVault()
    .accounts({ /* accounts */ })
    .instruction()
);

tx.add(
  await program.methods
    .depositTokens(new BN(1000))
    .accounts({ /* accounts */ })
    .instruction()
);

// Send transaction
const signature = await sendAndConfirmTransaction(
  connection,
  tx,
  [wallet]
);
```

## 📊 Real-World Examples

This module includes complete implementations of:

1. **Decentralized Exchange (DEX)** - Token swapping with liquidity pools
2. **NFT Marketplace** - Minting, listing, and trading NFTs
3. **Staking Program** - Lock tokens and earn rewards
4. **Governance DAO** - Proposal creation and voting
5. **Lending Protocol** - Collateralized borrowing and lending
6. **Gaming Platform** - On-chain game state and mechanics

---

**⚓ Ready to build production dApps with Anchor?**

Run `node main.js` to explore the most powerful Solana development framework!
