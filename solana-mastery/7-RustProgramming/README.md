# Module 7: Rust Programming for Solana 🦀

## 🎯 Learning Objectives
- Master Rust fundamentals for blockchain development
- Understand ownership, borrowing, and lifetimes
- Learn Solana-specific Rust patterns
- Build native Solana programs from scratch
- Handle error management and security
- Optimize performance for on-chain execution

## 🦀 Why Rust for Solana?

### **Performance** ⚡
- **Zero-cost abstractions** - No runtime overhead
- **Memory safety** - No garbage collector needed
- **Parallel execution** - Perfect for Solana's Sealevel runtime
- **Small binary size** - Critical for on-chain programs

### **Security** 🛡️
- **Ownership system** - Prevents memory leaks and race conditions
- **Type safety** - Catch errors at compile time
- **No null pointers** - Eliminates entire class of bugs
- **Immutability by default** - Safer concurrent programming

## 🏗️ Rust Fundamentals for Solana

### 1. **Ownership & Borrowing** 🔐
```rust
// Ownership - Each value has one owner
let data = String::from("blockchain");
let moved_data = data; // data is moved, no longer accessible

// Borrowing - Temporary access without ownership
let borrowed = &moved_data; // Immutable reference
let mut mutable_data = String::from("solana");
let mut_borrowed = &mut mutable_data; // Mutable reference
```

### 2. **Error Handling** ❌
```rust
// Result type for recoverable errors
fn transfer_tokens(amount: u64) -> Result<(), TransferError> {
    if amount == 0 {
        return Err(TransferError::ZeroAmount);
    }
    Ok(())
}

// Option type for nullable values
fn find_account(pubkey: &Pubkey) -> Option<Account> {
    // Returns Some(account) or None
}
```

### 3. **Pattern Matching** 🎯
```rust
match account_info.try_borrow_data() {
    Ok(data) => process_account_data(&data),
    Err(e) => return Err(ProgramError::AccountBorrowFailed),
}

// Destructuring structs
let AccountInfo { key, lamports, data, .. } = account_info;
```

### 4. **Traits & Generics** 🧬
```rust
// Define behavior that types can implement
trait Processable {
    fn process(&self) -> ProgramResult;
}

// Generic functions work with multiple types
fn serialize_data<T: Serialize>(data: &T) -> Vec<u8> {
    borsh::to_vec(data).unwrap()
}
```

## 🛠️ Solana Program Structure

### **Program Entry Point** 🚪
```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Declare the program entrypoint
entrypoint!(process_instruction);

// Program logic
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello, Solana!");
    Ok(())
}
```

### **Account Validation** ✅
```rust
fn validate_accounts(
    accounts: &[AccountInfo],
    expected_accounts: usize,
) -> ProgramResult {
    if accounts.len() != expected_accounts {
        return Err(ProgramError::NotEnoughAccountKeys);
    }
    
    let account_iter = &mut accounts.iter();
    let user_account = next_account_info(account_iter)?;
    
    // Verify account ownership
    if user_account.owner != &system_program::ID {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Verify signer
    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    Ok(())
}
```

### **State Management** 📊
```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserProfile {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub balance: u64,
    pub created_at: i64,
}

impl UserProfile {
    pub const SIZE: usize = 1 + 32 + 8 + 8; // bool + Pubkey + u64 + i64
    
    pub fn new(authority: Pubkey, timestamp: i64) -> Self {
        Self {
            is_initialized: true,
            authority,
            balance: 0,
            created_at: timestamp,
        }
    }
}
```

## 🔧 Advanced Rust Patterns

### **Cross-Program Invocation (CPI)** 🔗
```rust
use solana_program::program::invoke;

// Invoke another program
let transfer_instruction = system_instruction::transfer(
    source_account.key,
    destination_account.key,
    amount,
);

invoke(
    &transfer_instruction,
    &[
        source_account.clone(),
        destination_account.clone(),
        system_program.clone(),
    ],
)?;
```

### **Program Derived Addresses** 🎯
```rust
// Generate PDA
let (pda, bump_seed) = Pubkey::find_program_address(
    &[
        b"user_profile",
        user_account.key.as_ref(),
    ],
    program_id,
);

// Sign with PDA
invoke_signed(
    &instruction,
    &[pda_account.clone(), system_program.clone()],
    &[&[
        b"user_profile",
        user_account.key.as_ref(),
        &[bump_seed],
    ]],
)?;
```

### **Custom Errors** ⚠️
```rust
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum CustomError {
    #[error("Insufficient funds")]
    InsufficientFunds,
    #[error("Account already initialized")]
    AlreadyInitialized,
    #[error("Invalid authority")]
    InvalidAuthority,
}

impl From<CustomError> for ProgramError {
    fn from(e: CustomError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

## 🎓 Development Tools & Setup

### **Required Dependencies** 📦
```toml
[dependencies]
solana-program = "1.17"
borsh = "0.10"
thiserror = "1.0"

[dev-dependencies]
solana-program-test = "1.17"
solana-sdk = "1.17"
tokio = "1.0"
```

### **Build Configuration** ⚙️
```toml
[lib]
crate-type = ["cdylib", "lib"]

[[bin]]
name = "my-solana-program"
path = "src/bin/program.rs"

[profile.release]
overflow-checks = true
lto = "fat"
codegen-units = 1
```

## 🧪 Testing Patterns

### **Unit Tests** 🔬
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use solana_program_test::*;
    use solana_sdk::{
        account::Account,
        signature::{Keypair, Signer},
        transaction::Transaction,
    };

    #[tokio::test]
    async fn test_initialize_account() {
        let program_id = Pubkey::new_unique();
        let (mut banks_client, payer, recent_blockhash) = 
            ProgramTest::new("my_program", program_id, processor!(process_instruction))
                .start().await;

        // Test implementation here
    }
}
```

### **Integration Tests** 🔄
```rust
// Test with real Solana validator
#[tokio::test]
async fn test_full_program_flow() {
    let program_test = ProgramTest::default();
    let (banks_client, payer, recent_blockhash) = program_test.start().await;
    
    // Create accounts, build transactions, verify results
}
```

## 🚀 Performance Optimization

### **Memory Management** 💾
- Use `&str` instead of `String` when possible
- Minimize allocations in program logic
- Use stack allocation for small data
- Implement custom serialization for efficiency

### **Compute Budget** ⚡
- Profile instruction complexity
- Optimize hot paths
- Use efficient algorithms
- Minimize account data reads/writes

### **Binary Size** 📦
- Enable LTO (Link Time Optimization)
- Remove unused dependencies
- Use feature flags to reduce bloat
- Strip debug symbols in release

## 🛡️ Security Best Practices

### **Input Validation** ✅
```rust
fn validate_amount(amount: u64) -> ProgramResult {
    if amount == 0 {
        return Err(CustomError::ZeroAmount.into());
    }
    if amount > MAX_TRANSFER_AMOUNT {
        return Err(CustomError::AmountTooLarge.into());
    }
    Ok(())
}
```

### **Integer Overflow Protection** 🔢
```rust
// Use checked arithmetic
let new_balance = old_balance
    .checked_add(amount)
    .ok_or(CustomError::Overflow)?;

// Or use saturating arithmetic
let capped_amount = amount.min(MAX_AMOUNT);
```

### **Access Control** 🔐
```rust
fn require_authority(
    user_account: &AccountInfo,
    expected_authority: &Pubkey,
) -> ProgramResult {
    if user_account.key != expected_authority {
        return Err(CustomError::InvalidAuthority.into());
    }
    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    Ok(())
}
```

## 📚 Real-World Examples

This module demonstrates:
1. **Token Program Clone** - Build your own SPL token
2. **Escrow Contract** - Trustless trading system
3. **Voting System** - On-chain governance
4. **Staking Pool** - Liquid staking mechanics
5. **Oracle Integration** - Price feed consumption
6. **Multi-sig Wallet** - Shared account control

## 🎯 Learning Path

1. **Setup Rust environment** - Install toolchain and CLI
2. **Basic Rust concepts** - Ownership, borrowing, traits
3. **Solana program structure** - Entry points and account handling
4. **State management** - Serialization and data persistence
5. **Cross-program calls** - Composable program architecture
6. **Testing strategies** - Unit and integration testing
7. **Security practices** - Common vulnerabilities and mitigations
8. **Performance optimization** - Efficient on-chain execution

---

**🦀 Ready to build native Solana programs in Rust?**

Run `node main.js` to start your journey into systems-level blockchain programming!
