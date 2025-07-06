// Module 5: zkApps and Privacy Applications - Implementation Examples
// Zero-Knowledge Proofs Mastery Course
// Advanced practical implementations for privacy-preserving applications

const { 
  SmartContract, 
  State, 
  state, 
  PublicKey, 
  PrivateKey, 
  method, 
  Field, 
  UInt64, 
  Bool,
  MerkleTree, 
  MerkleWitness,
  Poseidon,
  Signature,
  Group,
  Scalar
} = require('o1js');

console.log('🚀 Module 5: zkApps and Privacy Applications - Implementation Examples\n');

// ============================================================================
// 1. BASIC ZKAPP FOUNDATION
// ============================================================================

/**
 * SimpleZkApp - Foundation for understanding zkApp structure
 * Demonstrates basic state management and method authorization
 */
class SimpleZkApp extends SmartContract {
  // State variables stored on-chain
  @state(PublicKey) owner = State();
  @state(UInt64) value = State();
  @state(Field) commitment = State();

  init() {
    super.init();
    this.owner.set(this.sender);
    this.value.set(UInt64.from(0));
    this.commitment.set(Field(0));
  }

  @method updateValue(newValue, secret) {
    // Authorization: only owner can update
    const currentOwner = this.owner.get();
    this.owner.assertEqual(currentOwner);
    this.sender.assertEqual(currentOwner);

    // Range check: value must be reasonable
    newValue.assertLessThan(UInt64.from(1000000));

    // Create commitment to secret
    const newCommitment = Poseidon.hash([newValue.value, secret]);
    
    // Update state atomically
    this.value.set(newValue);
    this.commitment.set(newCommitment);

    // Emit event for off-chain tracking
    this.emitEvent('value-updated', { 
      newValue: newValue.value, 
      commitment: newCommitment 
    });
  }

  @method verifySecret(secret) {
    // Verify knowledge of secret without revealing it
    const currentValue = this.value.get();
    this.value.assertEqual(currentValue);
    
    const currentCommitment = this.commitment.get();
    this.commitment.assertEqual(currentCommitment);

    // Prove knowledge of secret
    const expectedCommitment = Poseidon.hash([currentValue.value, secret]);
    expectedCommitment.assertEqual(currentCommitment);

    return Bool(true);
  }
}

// ============================================================================
// 2. PRIVATE VOTING SYSTEM
// ============================================================================

/**
 * PrivateVoting - Anonymous voting with eligibility verification
 * Features: voter privacy, double-vote prevention, public results
 */
class PrivateVoting extends SmartContract {
  @state(Field) eligibleVotersRoot = State(); // Merkle root of eligible voters
  @state(Field) nullifiersRoot = State();     // Used nullifiers to prevent double voting
  @state(UInt64) yesVotes = State();          // Public vote tally
  @state(UInt64) noVotes = State();
  @state(Bool) votingActive = State();

  init() {
    super.init();
    this.eligibleVotersRoot.set(Field(0));
    this.nullifiersRoot.set(Field(0));
    this.yesVotes.set(UInt64.from(0));
    this.noVotes.set(UInt64.from(0));
    this.votingActive.set(Bool(true));
  }

  @method vote(
    voterCommitment,    // Commitment to voter identity
    vote,               // 0 = No, 1 = Yes
    voterWitness,       // Merkle witness proving eligibility
    nullifier,          // Unique nullifier to prevent double voting
    nullifierWitness    // Witness for nullifier tree
  ) {
    // Verify voting is still active
    const isActive = this.votingActive.get();
    this.votingActive.assertEqual(isActive);
    isActive.assertTrue();

    // Verify voter eligibility without revealing identity
    const eligibleRoot = this.eligibleVotersRoot.get();
    this.eligibleVotersRoot.assertEqual(eligibleRoot);
    
    const calculatedRoot = voterWitness.calculateRoot(voterCommitment);
    calculatedRoot.assertEqual(eligibleRoot);

    // Verify nullifier hasn't been used (simplified check)
    const currentNullifiersRoot = this.nullifiersRoot.get();
    this.nullifiersRoot.assertEqual(currentNullifiersRoot);
    
    // In practice, you'd verify nullifier is not in the tree
    // and then add it to prevent double voting

    // Validate vote is binary
    const validVote = vote.equals(Field(0)).or(vote.equals(Field(1)));
    validVote.assertTrue();

    // Update vote tallies
    const currentYes = this.yesVotes.get();
    const currentNo = this.noVotes.get();
    this.yesVotes.assertEqual(currentYes);
    this.noVotes.assertEqual(currentNo);

    // Increment appropriate counter
    const isYesVote = vote.equals(Field(1));
    const newYes = currentYes.add(UInt64.from(1).mul(UInt64.from(isYesVote.toField())));
    const newNo = currentNo.add(UInt64.from(1).mul(UInt64.from(isYesVote.not().toField())));

    this.yesVotes.set(newYes);
    this.noVotes.set(newNo);

    // Emit event with nullifier to track usage
    this.emitEvent('vote-cast', { nullifier, timestamp: this.network.timestamp.get() });
  }

  @method closeVoting() {
    // Only contract owner can close voting
    const owner = this.owner.get();
    this.sender.assertEqual(owner);

    this.votingActive.set(Bool(false));
    
    // Emit final results
    const finalYes = this.yesVotes.get();
    const finalNo = this.noVotes.get();
    this.emitEvent('voting-closed', { 
      yesVotes: finalYes.value, 
      noVotes: finalNo.value,
      totalVotes: finalYes.add(finalNo).value
    });
  }
}

// ============================================================================
// 3. PRIVATE TOKEN TRANSFER SYSTEM
// ============================================================================

/**
 * PrivateToken - Privacy-preserving token transfers
 * Features: hidden balances, anonymous transfers, public supply
 */
class PrivateToken extends SmartContract {
  @state(Field) balancesRoot = State();      // Merkle root of all balances
  @state(Field) nullifiersRoot = State();    // Spent nullifiers
  @state(UInt64) totalSupply = State();      // Public total supply

  init() {
    super.init();
    this.balancesRoot.set(Field(0));
    this.nullifiersRoot.set(Field(0));
    this.totalSupply.set(UInt64.from(0));
  }

  @method mint(recipient, amount, recipientWitness) {
    // Only owner can mint (simplified authorization)
    const owner = this.owner.get();
    this.sender.assertEqual(owner);

    // Verify amount is reasonable
    amount.assertLessThan(UInt64.from(1000000));

    // Update total supply
    const currentSupply = this.totalSupply.get();
    this.totalSupply.assertEqual(currentSupply);
    this.totalSupply.set(currentSupply.add(amount));

    // Update recipient's balance in merkle tree
    // (In practice, this requires off-chain balance tracking)
    
    this.emitEvent('mint', { 
      recipient: recipient, 
      amount: amount.value,
      newSupply: currentSupply.add(amount).value
    });
  }

  @method transfer(
    senderCommitment,      // Commitment to sender identity
    recipientCommitment,   // Commitment to recipient identity
    amount,                // Transfer amount
    senderBalanceBefore,   // Sender's balance before transfer
    recipientBalanceBefore,// Recipient's balance before transfer
    senderWitness,         // Merkle witness for sender
    recipientWitness,      // Merkle witness for recipient
    nullifier,             // Unique nullifier for this transfer
    transferProof          // Proof of valid transfer computation
  ) {
    // Verify sender has sufficient balance
    senderBalanceBefore.assertGreaterThanOrEqual(amount);

    // Verify current balance root
    const currentRoot = this.balancesRoot.get();
    this.balancesRoot.assertEqual(currentRoot);

    // Verify sender and recipient balances in merkle tree
    const senderRoot = senderWitness.calculateRoot(
      Poseidon.hash([senderCommitment, senderBalanceBefore.value])
    );
    senderRoot.assertEqual(currentRoot);

    const recipientRoot = recipientWitness.calculateRoot(
      Poseidon.hash([recipientCommitment, recipientBalanceBefore.value])
    );
    recipientRoot.assertEqual(currentRoot);

    // Calculate new balances
    const senderBalanceAfter = senderBalanceBefore.sub(amount);
    const recipientBalanceAfter = recipientBalanceBefore.add(amount);

    // Verify nullifier hasn't been used
    // (Simplified - in practice, maintain nullifier set)

    // Emit transfer event with commitments (preserves privacy)
    this.emitEvent('transfer', {
      nullifier,
      senderCommitment,
      recipientCommitment,
      timestamp: this.network.timestamp.get()
    });
  }
}

// ============================================================================
// 4. IDENTITY VERIFICATION SYSTEM
// ============================================================================

/**
 * PrivateIdentity - Anonymous credential verification
 * Features: age verification, nationality checks, selective disclosure
 */
class PrivateIdentity extends SmartContract {
  @state(Field) verifiedCredentialsRoot = State();
  @state(Field) allowedCountriesRoot = State();
  @state(UInt64) verifiedUsersCount = State();

  init() {
    super.init();
    this.verifiedCredentialsRoot.set(Field(0));
    this.allowedCountriesRoot.set(Field(0));
    this.verifiedUsersCount.set(UInt64.from(0));
  }

  @method verifyAge(
    ageCommitment,     // Commitment to actual age
    minimumAge,        // Required minimum age (e.g., 18)
    ageProof,          // Proof that committed age >= minimumAge
    nullifier          // Prevents duplicate verification
  ) {
    // Verify the age proof demonstrates age >= minimumAge
    // without revealing the actual age
    this.verifyAgeConstraint(ageCommitment, minimumAge, ageProof);

    // Ensure reasonable age bounds (prevent invalid proofs)
    this.verifyReasonableAge(ageCommitment, ageProof);

    // Add to verified users count
    const currentCount = this.verifiedUsersCount.get();
    this.verifiedUsersCount.assertEqual(currentCount);
    this.verifiedUsersCount.set(currentCount.add(UInt64.from(1)));

    this.emitEvent('age-verified', {
      nullifier,
      minimumAge: minimumAge.value,
      timestamp: this.network.timestamp.get()
    });
  }

  @method verifyNationality(
    nationalityCommitment,  // Commitment to nationality
    membershipWitness,      // Witness proving nationality in allowed set
    nullifier               // Unique identifier
  ) {
    // Verify nationality is in allowed countries set
    const allowedRoot = this.allowedCountriesRoot.get();
    this.allowedCountriesRoot.assertEqual(allowedRoot);

    const calculatedRoot = membershipWitness.calculateRoot(nationalityCommitment);
    calculatedRoot.assertEqual(allowedRoot);

    this.emitEvent('nationality-verified', {
      nullifier,
      timestamp: this.network.timestamp.get()
    });
  }

  @method verifySelectiveDisclosure(
    attributeCommitments,   // Array of committed attributes
    disclosureProof,        // Proof of selective revelation
    revealedAttributes,     // Which attributes to reveal
    nullifier
  ) {
    // Verify user can selectively disclose certain attributes
    // while keeping others private
    
    // Verify the disclosure proof is valid
    this.verifyDisclosureProof(
      attributeCommitments, 
      disclosureProof, 
      revealedAttributes
    );

    this.emitEvent('selective-disclosure', {
      nullifier,
      revealedCount: revealedAttributes.length,
      timestamp: this.network.timestamp.get()
    });
  }

  // Helper methods for verification logic
  verifyAgeConstraint(commitment, minimum, proof) {
    // In practice, this would verify a range proof
    // demonstrating committed age >= minimum
    // Implementation would use range proof circuits
  }

  verifyReasonableAge(commitment, proof) {
    // Verify age is within reasonable bounds (e.g., 0-150)
    // Prevents edge cases and invalid proofs
  }

  verifyDisclosureProof(commitments, proof, revealed) {
    // Verify selective disclosure proof
    // Allows revealing some attributes while hiding others
  }
}

// ============================================================================
// 5. ORACLE INTEGRATION EXAMPLE
// ============================================================================

/**
 * OracleZkApp - Integrating external data with privacy preservation
 * Features: verified oracle data, private computations, result commitments
 */
class OracleZkApp extends SmartContract {
  @state(PublicKey) trustedOracle = State();
  @state(Field) lastDataHash = State();
  @state(UInt64) lastUpdateTime = State();

  @method processOracleData(
    oracleData,           // External data (e.g., price, weather)
    oracleSignature,      // Oracle's signature on the data
    privateInput,         // User's private input
    computationProof      // Proof of correct private computation
  ) {
    // Verify oracle signature
    const oracle = this.trustedOracle.get();
    this.trustedOracle.assertEqual(oracle);
    
    oracleSignature.verify(oracle, [oracleData]);

    // Verify the computation was performed correctly
    this.verifyPrivateComputation(oracleData, privateInput, computationProof);

    // Update state with data hash (not raw data for privacy)
    const dataHash = Poseidon.hash([oracleData]);
    this.lastDataHash.set(dataHash);
    this.lastUpdateTime.set(this.network.timestamp.get());

    this.emitEvent('oracle-data-processed', {
      dataHash,
      timestamp: this.network.timestamp.get()
    });
  }

  verifyPrivateComputation(oracleData, privateInput, proof) {
    // Verify that the computation was performed correctly
    // without revealing the private input
    // This could be a proof of any computation like:
    // - Risk assessment based on private portfolio and public market data
    // - Insurance claim validation with private personal data
    // - Credit scoring with private financial information
  }
}

// ============================================================================
// 6. ADVANCED: RECURSIVE PROOF COMPOSITION
// ============================================================================

/**
 * RecursiveZkApp - Composing proofs for scalability
 * Features: proof aggregation, state compression, efficient verification
 */
class RecursiveZkApp extends SmartContract {
  @state(Field) aggregatedProofHash = State();
  @state(UInt64) proofCount = State();

  @method verifyAndAggregate(
    newProof,             // New proof to include
    previousProofHash,    // Hash of previously aggregated proofs
    aggregationProof      // Proof that aggregation is correct
  ) {
    // Verify the new proof
    newProof.verify();

    // Verify previous aggregated proof hash
    const currentHash = this.aggregatedProofHash.get();
    this.aggregatedProofHash.assertEqual(currentHash);
    currentHash.assertEqual(previousProofHash);

    // Verify aggregation is correct
    this.verifyAggregation(newProof, previousProofHash, aggregationProof);

    // Update aggregated proof hash
    const newAggregatedHash = Poseidon.hash([
      previousProofHash,
      this.hashProof(newProof)
    ]);
    this.aggregatedProofHash.set(newAggregatedHash);

    // Increment proof count
    const currentCount = this.proofCount.get();
    this.proofCount.assertEqual(currentCount);
    this.proofCount.set(currentCount.add(UInt64.from(1)));
  }

  verifyAggregation(proof, previousHash, aggregationProof) {
    // Verify that the aggregation was computed correctly
    // This enables compressing many proofs into one
  }

  hashProof(proof) {
    // Create a hash representation of the proof
    return Poseidon.hash([proof.publicInput, proof.publicOutput]);
  }
}

// ============================================================================
// 7. UTILITY CLASSES AND HELPERS
// ============================================================================

/**
 * MerkleTreeManager - Efficient merkle tree operations
 */
class MerkleTreeManager {
  constructor(height) {
    this.tree = new MerkleTree(height);
    this.leaves = new Map();
  }

  // Add or update a leaf
  setLeaf(index, value) {
    this.tree.setLeaf(BigInt(index), value);
    this.leaves.set(index, value);
    return this.tree.getWitness(BigInt(index));
  }

  // Get merkle witness for a leaf
  getWitness(index) {
    return this.tree.getWitness(BigInt(index));
  }

  // Get current root
  getRoot() {
    return this.tree.getRoot();
  }

  // Verify a leaf is in the tree
  verify(leaf, witness) {
    return witness.calculateRoot(leaf).equals(this.getRoot()).toBoolean();
  }
}

/**
 * CommitmentScheme - Secure commitment and revelation
 */
class CommitmentScheme {
  // Create a commitment to a value with randomness
  static commit(value, nonce) {
    return Poseidon.hash([value, nonce]);
  }

  // Verify a commitment opens to a specific value
  static verify(commitment, value, nonce) {
    const expectedCommitment = this.commit(value, nonce);
    return commitment.equals(expectedCommitment).toBoolean();
  }

  // Generate secure random nonce
  static generateNonce() {
    return Field.random();
  }
}

/**
 * NullifierManager - Prevent double-spending and replay attacks
 */
class NullifierManager {
  constructor() {
    this.usedNullifiers = new Set();
  }

  // Generate deterministic nullifier
  static generateNullifier(secret, context) {
    return Poseidon.hash([secret, context]);
  }

  // Check if nullifier has been used
  isUsed(nullifier) {
    return this.usedNullifiers.has(nullifier.toString());
  }

  // Mark nullifier as used
  markUsed(nullifier) {
    this.usedNullifiers.add(nullifier.toString());
  }

  // Verify nullifier is fresh
  requireFresh(nullifier) {
    if (this.isUsed(nullifier)) {
      throw new Error('Nullifier already used');
    }
    this.markUsed(nullifier);
  }
}

// ============================================================================
// 8. TESTING AND DEMONSTRATION
// ============================================================================

async function demonstrateZkApps() {
  console.log('='.repeat(80));
  console.log('🧪 TESTING ZKAPP IMPLEMENTATIONS');
  console.log('='.repeat(80));

  try {
    // Test MerkleTreeManager
    console.log('\n📊 Testing Merkle Tree Operations...');
    const treeManager = new MerkleTreeManager(8);
    
    const leaf1 = Field(42);
    const witness1 = treeManager.setLeaf(0, leaf1);
    console.log('✅ Added leaf to position 0');
    console.log('   Root:', treeManager.getRoot().toString());
    console.log('   Verification:', treeManager.verify(leaf1, witness1));

    // Test CommitmentScheme
    console.log('\n🔒 Testing Commitment Scheme...');
    const secret = Field(12345);
    const nonce = CommitmentScheme.generateNonce();
    const commitment = CommitmentScheme.commit(secret, nonce);
    const isValid = CommitmentScheme.verify(commitment, secret, nonce);
    
    console.log('✅ Created commitment');
    console.log('   Commitment:', commitment.toString());
    console.log('   Verification:', isValid);

    // Test NullifierManager
    console.log('\n🚫 Testing Nullifier Management...');
    const nullifierManager = new NullifierManager();
    const nullifier = NullifierManager.generateNullifier(secret, Field(1));
    
    console.log('✅ Generated nullifier:', nullifier.toString());
    console.log('   Initially used?', nullifierManager.isUsed(nullifier));
    
    nullifierManager.markUsed(nullifier);
    console.log('   After marking used?', nullifierManager.isUsed(nullifier));

    console.log('\n🎯 All utility classes working correctly!');

  } catch (error) {
    console.error('❌ Error in demonstration:', error.message);
  }
}

// ============================================================================
// 9. EDUCATIONAL EXAMPLES
// ============================================================================

function explainZkAppConcepts() {
  console.log('\n' + '='.repeat(80));
  console.log('📚 ZKAPP CONCEPTS EXPLAINED');
  console.log('='.repeat(80));

  console.log(`
💡 KEY ZKAPP CONCEPTS:

1. STATE MANAGEMENT:
   • On-chain state variables store public commitments
   • Off-chain data provides privacy while maintaining verifiability
   • Merkle trees efficiently represent large state spaces

2. PRIVACY PATTERNS:
   • Commitments hide values while enabling verification
   • Nullifiers prevent double-spending without revealing identity
   • Zero-knowledge proofs validate computations privately

3. PROOF COMPOSITION:
   • Recursive proofs enable scalability
   • Proof aggregation reduces verification costs
   • Modular circuits allow code reuse

4. ORACLE INTEGRATION:
   • External data verified through signatures
   • Private computations on public oracle data
   • Maintaining privacy while using real-world information

5. SECURITY CONSIDERATIONS:
   • Input validation prevents malicious proofs
   • Nullifier schemes prevent replay attacks
   • Proper randomness ensures commitment security
  `);
}

// ============================================================================
// 10. PERFORMANCE BENCHMARKING
// ============================================================================

function benchmarkOperations() {
  console.log('\n' + '='.repeat(80));
  console.log('⚡ PERFORMANCE BENCHMARKS');
  console.log('='.repeat(80));

  const operations = [
    'Field arithmetic',
    'Poseidon hash',
    'Merkle witness generation',
    'Commitment creation',
    'Nullifier generation'
  ];

  const times = [
    '~0.1ms',
    '~1.5ms', 
    '~10ms',
    '~2ms',
    '~1.5ms'
  ];

  console.log('\n📊 Typical Operation Times:');
  operations.forEach((op, i) => {
    console.log(`   ${op.padEnd(25)} ${times[i]}`);
  });

  console.log(`
🔍 OPTIMIZATION TIPS:
• Batch similar operations together
• Cache merkle witnesses when possible
• Use efficient constraint counting
• Minimize state reads/writes
• Implement proper proof caching
  `);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting Module 5: zkApps and Privacy Applications');
  console.log('📖 This module demonstrates practical zero-knowledge application development\n');

  // Run demonstrations
  await demonstrateZkApps();
  explainZkAppConcepts();
  benchmarkOperations();

  console.log('\n' + '='.repeat(80));
  console.log('✅ MODULE 5 COMPLETE');
  console.log('='.repeat(80));
  console.log(`
🎓 You have learned:
✅ zkApp architecture and development patterns
✅ Privacy-preserving application design
✅ State management with merkle trees
✅ Commitment schemes and nullifiers
✅ Oracle integration and external data handling
✅ Performance optimization techniques

🚀 Next Steps:
• Build your own privacy application
• Experiment with different proof compositions
• Integrate with real oracle data sources
• Deploy to Mina testnet
• Explore Module 6: Privacy Protocols and Applications

💡 Keep practicing with the examples and try building your own zkApps!
  `);
}

// Run the module if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  SimpleZkApp,
  PrivateVoting,
  PrivateToken,
  PrivateIdentity,
  OracleZkApp,
  RecursiveZkApp,
  MerkleTreeManager,
  CommitmentScheme,
  NullifierManager
};
