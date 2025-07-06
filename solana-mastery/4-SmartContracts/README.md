# Module 4: Smart Contracts (Programs)

## Concept

This module covers Solana Programs (smart contracts) - the code that runs on the blockchain:

- **Programs:** Executable code stored on Solana (like Ethereum smart contracts)
- **Instructions:** Commands sent to programs
- **Accounts:** Data storage that programs read/write
- **Cross Program Invocation (CPI):** Programs calling other programs
- **Program Derived Addresses (PDAs):** Deterministic addresses controlled by programs

## Key Differences from Ethereum

| Ethereum | Solana |
|----------|--------|
| Smart Contracts store state | Programs are stateless |
| Contracts own data | Accounts store data separately |
| Single transaction execution | Parallel execution |
| Gas fees | Transaction fees |

## How to Run

```bash
node main.js
```

This module demonstrates interacting with both built-in and custom programs.
