#!/usr/bin/env node

/**
 * Polkadot Mastery - Module 4: Parachain Development
 * 
 * This module demonstrates parachain development lifecycle,
 * collator management, and runtime upgrades.
 */

console.log("🔗 Parachain Development Mastery");
console.log("=================================\n");

// === 1. Parachain Runtime System ===

class ParachainRuntime {
    constructor(id, name, spec) {
        this.id = id;
        this.name = name;
        this.spec = spec;
        this.version = { spec: 1, impl: 1, authoring: 1, transaction: 1 };
        this.pallets = new Map();
        this.storage = new Map();
        this.events = [];
        this.genesis = null;
    }

    addPallet(name, config) {
        console.log(`📦 Adding pallet: ${name}`);
        this.pallets.set(name, {
            name,
            config,
            storage: new Map(),
            calls: new Map(),
            events: new Map(),
            version: "1.0.0"
        });
    }

    upgradeRuntime(newVersion, migrations = []) {
        console.log(`\n🔄 Runtime Upgrade: v${this.version.spec} → v${newVersion.spec}`);
        
        // Run migrations
        migrations.forEach((migration, index) => {
            console.log(`   Running migration ${index + 1}: ${migration.name}`);
            migration.execute(this.storage);
        });

        // Update version
        this.version = newVersion;
        console.log(`✅ Runtime upgraded successfully`);
    }

    processBlock(blockData) {
        console.log(`\n🏗️ Processing Block #${blockData.number}`);
        console.log(`   Hash: ${blockData.hash}`);
        console.log(`   Transactions: ${blockData.transactions.length}`);
        
        const processedTxs = [];
        
        blockData.transactions.forEach((tx, index) => {
            try {
                const result = this.executeTransaction(tx);
                processedTxs.push({ tx, result, success: true });
                console.log(`   ✅ Tx ${index + 1}: ${tx.call.pallet}.${tx.call.function}`);
            } catch (error) {
                processedTxs.push({ tx, error: error.message, success: false });
                console.log(`   ❌ Tx ${index + 1}: ${error.message}`);
            }
        });

        return {
            blockNumber: blockData.number,
            processedTransactions: processedTxs,
            stateRoot: this.calculateStateRoot(),
            events: [...this.events]
        };
    }

    executeTransaction(transaction) {
        const { pallet, function: func, args } = transaction.call;
        
        if (!this.pallets.has(pallet)) {
            throw new Error(`Pallet '${pallet}' not found`);
        }

        const palletInstance = this.pallets.get(pallet);
        
        // Simulate transaction execution
        switch (`${pallet}.${func}`) {
            case "balances.transfer":
                return this.handleBalanceTransfer(args);
            case "assets.create":
                return this.handleAssetCreation(args);
            case "governance.propose":
                return this.handleGovernanceProposal(args);
            default:
                throw new Error(`Unknown call: ${pallet}.${func}`);
        }
    }

    handleBalanceTransfer({ from, to, amount }) {
        const fromBalance = this.storage.get(`balances.${from}`) || 0;
        if (fromBalance < amount) {
            throw new Error("Insufficient balance");
        }

        this.storage.set(`balances.${from}`, fromBalance - amount);
        const toBalance = this.storage.get(`balances.${to}`) || 0;
        this.storage.set(`balances.${to}`, toBalance + amount);

        this.events.push({
            pallet: "balances",
            event: "Transfer",
            data: { from, to, amount }
        });

        return { success: true };
    }

    handleAssetCreation({ id, admin, minBalance }) {
        if (this.storage.has(`assets.${id}`)) {
            throw new Error("Asset already exists");
        }

        this.storage.set(`assets.${id}`, {
            admin,
            minBalance,
            totalSupply: 0,
            created: Date.now()
        });

        this.events.push({
            pallet: "assets",
            event: "Created",
            data: { id, admin }
        });

        return { success: true, assetId: id };
    }

    handleGovernanceProposal({ proposal, deposit }) {
        const proposalId = this.storage.get("governance.nextProposalId") || 1;
        
        this.storage.set(`governance.proposal.${proposalId}`, {
            proposal,
            deposit,
            votes: { ayes: 0, nays: 0 },
            created: Date.now(),
            status: "Active"
        });

        this.storage.set("governance.nextProposalId", proposalId + 1);

        this.events.push({
            pallet: "governance",
            event: "Proposed",
            data: { proposalId, deposit }
        });

        return { success: true, proposalId };
    }

    calculateStateRoot() {
        // Simplified state root calculation
        const stateData = Array.from(this.storage.entries()).sort();
        const hash = this.simpleHash(JSON.stringify(stateData));
        return `0x${hash}`;
    }

    simpleHash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }
}

// === 2. Collator Network ===

class Collator {
    constructor(id, address, stake) {
        this.id = id;
        this.address = address;
        this.stake = stake;
        this.isActive = false;
        this.blocksProduced = 0;
        this.reputation = 100;
        this.lastBlockTime = 0;
    }

    produceBlock(parachain, transactions, parentHash) {
        console.log(`\n👷 Collator ${this.id} producing block...`);
        
        const block = {
            number: parachain.lastBlockNumber + 1,
            hash: this.generateBlockHash(parentHash, transactions),
            parentHash,
            timestamp: Date.now(),
            collator: this.id,
            transactions,
            proof: this.generateProofOfValidity(transactions)
        };

        // Process block in runtime
        const result = parachain.runtime.processBlock(block);
        
        this.blocksProduced++;
        this.lastBlockTime = block.timestamp;
        
        console.log(`✅ Block #${block.number} produced by Collator ${this.id}`);
        
        return { block, result };
    }

    generateBlockHash(parentHash, transactions) {
        const data = `${parentHash}${transactions.length}${Date.now()}`;
        return `0x${this.simpleHash(data)}`;
    }

    generateProofOfValidity(transactions) {
        // Simplified PoV generation
        return {
            witnessData: `0x${this.simpleHash(JSON.stringify(transactions))}`,
            size: transactions.length * 100, // Approximate size in bytes
            compressionRatio: 0.7
        };
    }

    simpleHash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }
}

class CollatorSet {
    constructor() {
        this.collators = new Map();
        this.activeSet = new Set();
        this.maxCollators = 5;
        this.sessionLength = 10; // blocks
        this.currentSession = 1;
    }

    addCollator(collator) {
        console.log(`➕ Adding collator ${collator.id} with stake ${collator.stake}`);
        this.collators.set(collator.id, collator);
        this.updateActiveSet();
    }

    removeCollator(collatorId) {
        console.log(`➖ Removing collator ${collatorId}`);
        this.collators.delete(collatorId);
        this.activeSet.delete(collatorId);
        this.updateActiveSet();
    }

    updateActiveSet() {
        // Select top collators by stake
        const sortedCollators = Array.from(this.collators.values())
            .sort((a, b) => b.stake - a.stake)
            .slice(0, this.maxCollators);

        this.activeSet.clear();
        sortedCollators.forEach(collator => {
            this.activeSet.add(collator.id);
            collator.isActive = true;
        });

        // Deactivate others
        this.collators.forEach(collator => {
            if (!this.activeSet.has(collator.id)) {
                collator.isActive = false;
            }
        });

        console.log(`🔄 Active collator set updated: [${Array.from(this.activeSet).join(', ')}]`);
    }

    selectBlockProducer(blockNumber) {
        const activeCollators = Array.from(this.activeSet);
        if (activeCollators.length === 0) {
            throw new Error("No active collators available");
        }

        // Simple round-robin selection
        const index = blockNumber % activeCollators.length;
        return this.collators.get(activeCollators[index]);
    }

    getStats() {
        const stats = {
            totalCollators: this.collators.size,
            activeCollators: this.activeSet.size,
            totalStake: 0,
            averageReputation: 0,
            totalBlocks: 0
        };

        let totalReputation = 0;
        this.collators.forEach(collator => {
            stats.totalStake += collator.stake;
            totalReputation += collator.reputation;
            stats.totalBlocks += collator.blocksProduced;
        });

        stats.averageReputation = this.collators.size > 0 
            ? totalReputation / this.collators.size 
            : 0;

        return stats;
    }
}

// === 3. Parachain Manager ===

class ParachainManager {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.runtime = new ParachainRuntime(id, name, "dev");
        this.collatorSet = new CollatorSet();
        this.lastBlockNumber = 0;
        this.blocks = [];
        this.isRunning = false;
        this.slotLease = null;
        this.initializeGenesis();
    }

    initializeGenesis() {
        console.log(`🚀 Initializing Genesis for Parachain ${this.id}`);
        
        // Add core pallets
        this.runtime.addPallet("system", { blockHashCount: 250 });
        this.runtime.addPallet("balances", { existentialDeposit: 1 });
        this.runtime.addPallet("assets", { approvalDeposit: 10 });
        this.runtime.addPallet("governance", { motionDuration: 100 });

        // Set initial balances
        this.runtime.storage.set("balances.alice", 1000000);
        this.runtime.storage.set("balances.bob", 500000);
        this.runtime.storage.set("balances.charlie", 250000);

        console.log("✅ Genesis initialized");
    }

    addCollator(id, address, stake) {
        const collator = new Collator(id, address, stake);
        this.collatorSet.addCollator(collator);
    }

    startProduction() {
        console.log(`\n🏁 Starting block production for ${this.name}`);
        this.isRunning = true;
    }

    stopProduction() {
        console.log(`⏹️ Stopping block production for ${this.name}`);
        this.isRunning = false;
    }

    produceBlock(transactions = []) {
        if (!this.isRunning) {
            throw new Error("Parachain is not running");
        }

        const parentHash = this.blocks.length > 0 
            ? this.blocks[this.blocks.length - 1].hash 
            : "0x0000000000000000";

        const producer = this.collatorSet.selectBlockProducer(this.lastBlockNumber + 1);
        if (!producer) {
            throw new Error("No collator available to produce block");
        }

        const { block, result } = producer.produceBlock(this, transactions, parentHash);
        
        this.blocks.push(block);
        this.lastBlockNumber = block.number;

        return { block, result };
    }

    upgradeRuntime(newVersion, migrations = []) {
        console.log(`\n🔧 Upgrading ${this.name} runtime...`);
        
        // Pause block production during upgrade
        const wasRunning = this.isRunning;
        this.stopProduction();

        try {
            this.runtime.upgradeRuntime(newVersion, migrations);
            
            if (wasRunning) {
                this.startProduction();
            }
            
            console.log("✅ Runtime upgrade completed successfully");
        } catch (error) {
            console.error("❌ Runtime upgrade failed:", error.message);
            if (wasRunning) {
                this.startProduction();
            }
            throw error;
        }
    }

    acquireSlot(duration, bondedAmount) {
        console.log(`\n🎯 Acquiring parachain slot for ${duration} lease periods`);
        console.log(`   Bonded amount: ${bondedAmount} DOT`);
        
        this.slotLease = {
            startPeriod: Math.floor(Date.now() / 86400000), // Current day
            duration,
            bondedAmount,
            acquired: Date.now()
        };

        console.log("✅ Parachain slot acquired successfully");
    }

    renewSlot(additionalPeriods, additionalBond) {
        if (!this.slotLease) {
            throw new Error("No existing slot lease to renew");
        }

        console.log(`\n🔄 Renewing parachain slot for ${additionalPeriods} additional periods`);
        
        this.slotLease.duration += additionalPeriods;
        this.slotLease.bondedAmount += additionalBond;

        console.log("✅ Parachain slot renewed successfully");
    }

    getStatus() {
        return {
            id: this.id,
            name: this.name,
            isRunning: this.isRunning,
            lastBlockNumber: this.lastBlockNumber,
            totalBlocks: this.blocks.length,
            runtimeVersion: this.runtime.version,
            collatorStats: this.collatorSet.getStats(),
            slotLease: this.slotLease
        };
    }
}

// === 4. Runtime Migration System ===

class RuntimeMigration {
    constructor(name, fromVersion, toVersion, migrationFn) {
        this.name = name;
        this.fromVersion = fromVersion;
        this.toVersion = toVersion;
        this.migrationFn = migrationFn;
    }

    execute(storage) {
        console.log(`   📦 Executing migration: ${this.name}`);
        this.migrationFn(storage);
    }

    static balanceStorageV1ToV2() {
        return new RuntimeMigration(
            "Balance Storage V1 to V2",
            1,
            2,
            (storage) => {
                // Migrate balance storage format
                const balanceKeys = Array.from(storage.keys())
                    .filter(key => key.startsWith("balances."));
                
                balanceKeys.forEach(key => {
                    const balance = storage.get(key);
                    const newKey = key.replace("balances.", "balances.account.");
                    storage.set(newKey, { free: balance, reserved: 0 });
                    storage.delete(key);
                });
            }
        );
    }

    static addAssetMetadata() {
        return new RuntimeMigration(
            "Add Asset Metadata Support",
            2,
            3,
            (storage) => {
                // Add metadata to existing assets
                const assetKeys = Array.from(storage.keys())
                    .filter(key => key.startsWith("assets.") && !key.includes("metadata"));

                assetKeys.forEach(key => {
                    const asset = storage.get(key);
                    if (asset && typeof asset === 'object') {
                        asset.metadata = {
                            name: "Unknown",
                            symbol: "UNK",
                            decimals: 12
                        };
                        storage.set(key, asset);
                    }
                });
            }
        );
    }
}

// === 5. Relay Chain Integration ===

class RelayChainInterface {
    constructor() {
        this.parachains = new Map();
        this.validators = new Set();
        this.currentSlot = 1;
    }

    registerParachain(parachain) {
        console.log(`\n🔗 Registering parachain ${parachain.id} with relay chain`);
        this.parachains.set(parachain.id, {
            parachain,
            registrationBlock: this.currentSlot,
            lastValidated: 0,
            validationAttempts: 0
        });
        console.log("✅ Parachain registered successfully");
    }

    validateBlock(parachainId, block) {
        console.log(`\n🔍 Validating block #${block.number} from parachain ${parachainId}`);
        
        const parachainInfo = this.parachains.get(parachainId);
        if (!parachainInfo) {
            throw new Error(`Parachain ${parachainId} not registered`);
        }

        // Simulate validation process
        const validationResult = this.performValidation(block);
        
        parachainInfo.lastValidated = block.number;
        parachainInfo.validationAttempts++;

        if (validationResult.valid) {
            console.log("✅ Block validation successful");
            return { valid: true, included: true };
        } else {
            console.log("❌ Block validation failed:", validationResult.reason);
            return { valid: false, reason: validationResult.reason };
        }
    }

    performValidation(block) {
        // Simplified validation logic
        const checks = [
            { name: "Hash integrity", check: () => block.hash.startsWith('0x') },
            { name: "Transaction format", check: () => Array.isArray(block.transactions) },
            { name: "Proof validity", check: () => block.proof && block.proof.witnessData },
            { name: "Collator signature", check: () => block.collator }
        ];

        for (const check of checks) {
            if (!check.check()) {
                return { valid: false, reason: `Failed ${check.name}` };
            }
        }

        return { valid: true };
    }

    getParachainStatus(parachainId) {
        const info = this.parachains.get(parachainId);
        if (!info) {
            return null;
        }

        return {
            parachainId,
            registrationBlock: info.registrationBlock,
            lastValidated: info.lastValidated,
            validationAttempts: info.validationAttempts,
            status: info.lastValidated > 0 ? "Active" : "Pending"
        };
    }
}

// === 6. Demonstration Functions ===

function demonstrateParachainSetup() {
    console.log("🏗️ Parachain Setup Demo");
    console.log("========================");

    // Create parachain
    const myParachain = new ParachainManager(2000, "MyDeFi Chain");

    // Add collators
    myParachain.addCollator("collator1", "0xabc123...", 10000);
    myParachain.addCollator("collator2", "0xdef456...", 15000);
    myParachain.addCollator("collator3", "0x789ghi...", 8000);

    // Acquire slot
    myParachain.acquireSlot(8, 100000); // 8 lease periods, 100k DOT

    // Start production
    myParachain.startProduction();

    console.log("\nParachain Status:");
    console.log(JSON.stringify(myParachain.getStatus(), null, 2));

    return myParachain;
}

function demonstrateBlockProduction(parachain) {
    console.log("\n⛏️ Block Production Demo");
    console.log("=========================");

    // Create some sample transactions
    const transactions = [
        {
            call: { pallet: "balances", function: "transfer", args: { from: "alice", to: "bob", amount: 1000 } },
            signature: "0xsignature1"
        },
        {
            call: { pallet: "assets", function: "create", args: { id: 1, admin: "alice", minBalance: 10 } },
            signature: "0xsignature2"
        }
    ];

    // Produce several blocks
    for (let i = 0; i < 3; i++) {
        try {
            const { block, result } = parachain.produceBlock(transactions);
            console.log(`Block #${block.number} produced with ${result.processedTransactions.length} transactions`);
        } catch (error) {
            console.error("Block production failed:", error.message);
        }
    }
}

function demonstrateRuntimeUpgrade(parachain) {
    console.log("\n🔄 Runtime Upgrade Demo");
    console.log("========================");

    // Create migrations
    const migrations = [
        RuntimeMigration.balanceStorageV1ToV2(),
        RuntimeMigration.addAssetMetadata()
    ];

    // Perform upgrade
    const newVersion = { spec: 3, impl: 1, authoring: 1, transaction: 1 };
    
    try {
        parachain.upgradeRuntime(newVersion, migrations);
    } catch (error) {
        console.error("Upgrade failed:", error.message);
    }
}

function demonstrateRelayChainIntegration(parachain) {
    console.log("\n🔗 Relay Chain Integration Demo");
    console.log("================================");

    const relayChain = new RelayChainInterface();
    
    // Register parachain
    relayChain.registerParachain(parachain);

    // Validate some blocks
    if (parachain.blocks.length > 0) {
        const lastBlock = parachain.blocks[parachain.blocks.length - 1];
        const validationResult = relayChain.validateBlock(parachain.id, lastBlock);
        
        console.log("Validation result:", validationResult);
        
        // Check status
        const status = relayChain.getParachainStatus(parachain.id);
        console.log("Parachain status on relay chain:", status);
    }
}

function demonstrateGovernance(parachain) {
    console.log("\n🗳️ Governance Demo");
    console.log("==================");

    // Create governance proposal
    const proposalTx = {
        call: {
            pallet: "governance",
            function: "propose",
            args: {
                proposal: "runtime_upgrade_v4",
                deposit: 10000
            }
        },
        signature: "0xproposal_signature"
    };

    try {
        const { block, result } = parachain.produceBlock([proposalTx]);
        console.log("Governance proposal submitted in block:", block.number);
        
        // Check governance state
        const proposals = Array.from(parachain.runtime.storage.keys())
            .filter(key => key.startsWith("governance.proposal."));
        
        console.log(`Active proposals: ${proposals.length}`);
    } catch (error) {
        console.error("Governance proposal failed:", error.message);
    }
}

function analyzePerformance(parachain) {
    console.log("\n📊 Performance Analysis");
    console.log("========================");

    const stats = parachain.getStatus();
    
    console.log("Performance Metrics:");
    console.log(`• Total blocks produced: ${stats.totalBlocks}`);
    console.log(`• Average block time: ~12 seconds (target)`);
    console.log(`• Transaction throughput: ~100 tx/block`);
    console.log(`• State size: ${parachain.runtime.storage.size} entries`);
    console.log(`• Collator efficiency: ${(stats.collatorStats.totalBlocks / stats.collatorStats.totalCollators).toFixed(2)} blocks/collator`);

    console.log("\nOptimization Recommendations:");
    console.log("• Implement parallel transaction execution");
    console.log("• Optimize state trie structure");
    console.log("• Use proof compression techniques");
    console.log("• Implement efficient collator rotation");
}

// === Main Execution ===

function main() {
    try {
        console.log("Starting Parachain Development Mastery demonstration...\n");

        // 1. Set up parachain
        const parachain = demonstrateParachainSetup();

        // 2. Demonstrate block production
        demonstrateBlockProduction(parachain);

        // 3. Demonstrate runtime upgrades
        demonstrateRuntimeUpgrade(parachain);

        // 4. Demonstrate relay chain integration
        demonstrateRelayChainIntegration(parachain);

        // 5. Demonstrate governance
        demonstrateGovernance(parachain);

        // 6. Analyze performance
        analyzePerformance(parachain);

        console.log("\n🎉 Parachain Development Mastery Complete!");
        console.log("\nKey Takeaways:");
        console.log("• Parachains provide specialized blockchain functionality");
        console.log("• Collators ensure decentralized block production");
        console.log("• Runtime upgrades enable continuous evolution");
        console.log("• Relay chain integration provides shared security");
        console.log("• Governance enables community-driven development");

    } catch (error) {
        console.error("❌ Error in parachain demonstration:", error.message);
    }
}

// Run the demonstration
if (require.main === module) {
    main();
}

module.exports = {
    ParachainRuntime,
    Collator,
    CollatorSet,
    ParachainManager,
    RuntimeMigration,
    RelayChainInterface
};
