# Module 1: Solana Basics

## Concept

This module covers the fundamental concepts of Solana that differ from Bitcoin:

- **Accounts:** Everything in Solana is an account (users, programs, data)
- **Programs:** Smart contracts that process transactions
- **Transactions:** Instructions sent to programs
- **Keypairs:** Public/private key pairs for authentication
- **Lamports:** Smallest unit of SOL (like satoshis for Bitcoin)

## Key Differences from Bitcoin

| Bitcoin | Solana |
|---------|--------|
| UTXO Model | Account Model |
| ~7 TPS | 65,000+ TPS |
| Proof of Work | Proof of History + Proof of Stake |
| Bitcoin Script | Rust/C/C++ Programs |
| ~10 minute blocks | ~400ms slots |

## How to Run

```bash
node main.js
```
