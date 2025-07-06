# Module 6: Merkle Trees

## Concept

This module implements Merkle Trees, the data structure that allows Bitcoin to efficiently prove transaction inclusion without storing all transactions.

-   **Merkle Tree:** A binary tree where each leaf is a transaction hash and each internal node is a hash of its children.
-   **Merkle Root:** The single hash at the top that represents all transactions in the block.
-   **Merkle Proof:** A way to prove a transaction exists in a block without downloading the entire block.
-   **SPV (Simplified Payment Verification):** Light clients can verify transactions using only block headers and Merkle proofs.

This is how Bitcoin scales - light clients don't need to download the entire blockchain.

## How to Run

Navigate to this directory in your terminal and run:

```bash
node main.js
```
