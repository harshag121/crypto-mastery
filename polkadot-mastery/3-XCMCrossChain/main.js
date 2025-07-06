#!/usr/bin/env node

/**
 * Polkadot Mastery - Module 3: XCM and Cross-Chain Communication
 * 
 * This module demonstrates Cross-Consensus Messaging (XCM) format,
 * asset transfers, and remote execution across parachains.
 */

console.log("🌐 XCM and Cross-Chain Communication Mastery");
console.log("=============================================\n");

// === 1. Multi-Location System ===

class MultiLocation {
    constructor(parents = 0, interior = []) {
        this.parents = parents;
        this.interior = interior;
    }

    static here() {
        return new MultiLocation(0, []);
    }

    static parent() {
        return new MultiLocation(1, []);
    }

    static parachain(id) {
        return new MultiLocation(1, [{ parachain: id }]);
    }

    static account(parachain, account) {
        return new MultiLocation(1, [
            { parachain },
            { accountId32: { network: "any", id: account } }
        ]);
    }

    toString() {
        if (this.parents === 0 && this.interior.length === 0) {
            return "Here";
        }
        
        let path = "../".repeat(this.parents);
        if (this.interior.length > 0) {
            path += this.interior.map(junction => {
                if (junction.parachain) return `Parachain(${junction.parachain})`;
                if (junction.accountId32) return `Account(${junction.accountId32.id})`;
                return JSON.stringify(junction);
            }).join("/");
        }
        return path;
    }
}

// === 2. Asset Definitions ===

class MultiAsset {
    constructor(id, fun) {
        this.id = id;
        this.fun = fun;
    }

    static native(amount) {
        return new MultiAsset(
            { concrete: MultiLocation.here() },
            { fungible: amount }
        );
    }

    static fungible(location, amount) {
        return new MultiAsset(
            { concrete: location },
            { fungible: amount }
        );
    }

    static nonFungible(location, instance) {
        return new MultiAsset(
            { concrete: location },
            { nonFungible: instance }
        );
    }

    toString() {
        const location = this.id.concrete ? this.id.concrete.toString() : "Abstract";
        if (this.fun.fungible) {
            return `${this.fun.fungible} units of ${location}`;
        }
        return `NFT(${this.fun.nonFungible}) of ${location}`;
    }
}

// === 3. XCM Instructions ===

class XCMInstruction {
    static withdrawAsset(assets) {
        return { withdrawAsset: assets };
    }

    static buyExecution(fees, weightLimit = "unlimited") {
        return { buyExecution: { fees, weightLimit } };
    }

    static depositAsset(assets, beneficiary) {
        return { 
            depositAsset: { 
                assets: { wild: assets },
                beneficiary 
            } 
        };
    }

    static transact(originKind, requireWeightAtMost, call) {
        return {
            transact: {
                originKind,
                requireWeightAtMost,
                call: { encoded: call }
            }
        };
    }

    static transferAsset(assets, beneficiary) {
        return { transferAsset: { assets, beneficiary } };
    }

    static transferReserveAsset(assets, dest, xcm) {
        return { transferReserveAsset: { assets, dest, xcm } };
    }

    static receiveTeleportedAsset(assets) {
        return { receiveTeleportedAsset: assets };
    }

    static queryResponse(queryId, response, maxWeight, querier) {
        return { queryResponse: { queryId, response, maxWeight, querier } };
    }
}

// === 4. XCM Message Builder ===

class XCMMessage {
    constructor(version = 3) {
        this.version = version;
        this.instructions = [];
    }

    addInstruction(instruction) {
        this.instructions.push(instruction);
        return this;
    }

    build() {
        return {
            version: this.version,
            instructions: this.instructions
        };
    }

    toString() {
        return JSON.stringify(this.build(), null, 2);
    }
}

// === 5. Asset Transfer Simulator ===

class AssetTransferSimulator {
    constructor() {
        this.chains = new Map();
        this.setupChains();
    }

    setupChains() {
        // Setup relay chain
        this.chains.set("relay", {
            id: 0,
            name: "Relay Chain",
            balances: new Map([
                ["alice", { DOT: 1000 }],
                ["bob", { DOT: 500 }]
            ])
        });

        // Setup parachains
        this.chains.set("para1000", {
            id: 1000,
            name: "Asset Hub",
            balances: new Map([
                ["alice", { DOT: 100, USDT: 5000 }],
                ["bob", { DOT: 50, USDT: 2000 }]
            ])
        });

        this.chains.set("para2000", {
            id: 2000,
            name: "DeFi Chain",
            balances: new Map([
                ["alice", { DOT: 200 }],
                ["charlie", { DOT: 300 }]
            ])
        });
    }

    getBalance(chainId, account, asset) {
        const chain = this.chains.get(chainId);
        if (!chain) return 0;
        
        const balances = chain.balances.get(account);
        return balances ? (balances[asset] || 0) : 0;
    }

    updateBalance(chainId, account, asset, amount) {
        const chain = this.chains.get(chainId);
        if (!chain) return false;

        if (!chain.balances.has(account)) {
            chain.balances.set(account, {});
        }

        const balances = chain.balances.get(account);
        balances[asset] = (balances[asset] || 0) + amount;

        if (balances[asset] < 0) {
            console.log(`❌ Insufficient balance for ${account} on ${chain.name}`);
            return false;
        }

        return true;
    }

    // Simulate reserve-backed transfer
    reserveTransfer(sourceChain, destChain, account, asset, amount) {
        console.log(`\n🔄 Reserve Transfer: ${amount} ${asset}`);
        console.log(`   From: ${sourceChain} to ${destChain}`);
        console.log(`   Account: ${account}`);

        // Check source balance
        const sourceBalance = this.getBalance(sourceChain, account, asset);
        if (sourceBalance < amount) {
            console.log(`❌ Insufficient balance: ${sourceBalance} < ${amount}`);
            return false;
        }

        // Lock assets on source
        this.updateBalance(sourceChain, account, asset, -amount);
        console.log(`   🔒 Locked ${amount} ${asset} on ${sourceChain}`);

        // Mint derivative on destination
        this.updateBalance(destChain, account, `${asset}_Reserve`, amount);
        console.log(`   ✨ Minted ${amount} ${asset}_Reserve on ${destChain}`);

        return true;
    }

    // Simulate teleportation
    teleportAsset(sourceChain, destChain, account, asset, amount) {
        console.log(`\n⚡ Teleport Transfer: ${amount} ${asset}`);
        console.log(`   From: ${sourceChain} to ${destChain}`);
        console.log(`   Account: ${account}`);

        // Check source balance
        const sourceBalance = this.getBalance(sourceChain, account, asset);
        if (sourceBalance < amount) {
            console.log(`❌ Insufficient balance: ${sourceBalance} < ${amount}`);
            return false;
        }

        // Burn on source
        this.updateBalance(sourceChain, account, asset, -amount);
        console.log(`   🔥 Burned ${amount} ${asset} on ${sourceChain}`);

        // Mint on destination
        this.updateBalance(destChain, account, asset, amount);
        console.log(`   ✨ Minted ${amount} ${asset} on ${destChain}`);

        return true;
    }

    printBalances() {
        console.log("\n💰 Current Balances:");
        console.log("===================");
        
        for (const [chainId, chain] of this.chains) {
            console.log(`\n${chain.name} (${chainId}):`);
            for (const [account, balances] of chain.balances) {
                console.log(`  ${account}:`, balances);
            }
        }
    }
}

// === 6. Remote Execution Simulator ===

class RemoteExecutionSimulator {
    constructor() {
        this.parachains = new Map();
        this.setupParachains();
    }

    setupParachains() {
        this.parachains.set(1000, {
            name: "Asset Hub",
            contracts: new Map([
                ["swap", { available: true, fee: 10 }],
                ["transfer", { available: true, fee: 5 }]
            ])
        });

        this.parachains.set(2000, {
            name: "DeFi Chain",
            contracts: new Map([
                ["stake", { available: true, fee: 15 }],
                ["lend", { available: true, fee: 20 }]
            ])
        });
    }

    executeRemoteCall(targetPara, contract, params, executionFee) {
        console.log(`\n🚀 Remote Execution:`);
        console.log(`   Target: Parachain ${targetPara}`);
        console.log(`   Contract: ${contract}`);
        console.log(`   Params:`, params);

        const parachain = this.parachains.get(targetPara);
        if (!parachain) {
            console.log(`❌ Parachain ${targetPara} not found`);
            return false;
        }

        const contractInfo = parachain.contracts.get(contract);
        if (!contractInfo) {
            console.log(`❌ Contract '${contract}' not found on ${parachain.name}`);
            return false;
        }

        if (!contractInfo.available) {
            console.log(`❌ Contract '${contract}' is not available`);
            return false;
        }

        if (executionFee < contractInfo.fee) {
            console.log(`❌ Insufficient execution fee: ${executionFee} < ${contractInfo.fee}`);
            return false;
        }

        console.log(`✅ Successfully executed '${contract}' on ${parachain.name}`);
        console.log(`   Fee charged: ${contractInfo.fee}`);
        console.log(`   Result: Success`);

        return true;
    }
}

// === 7. Demonstration Functions ===

function demonstrateMultiLocation() {
    console.log("📍 Multi-Location Addressing Demo");
    console.log("==================================");

    const locations = [
        { name: "Here (current location)", location: MultiLocation.here() },
        { name: "Parent (relay chain)", location: MultiLocation.parent() },
        { name: "Parachain 1000", location: MultiLocation.parachain(1000) },
        { name: "Account on Parachain 2000", location: MultiLocation.account(2000, "0x1234...") }
    ];

    locations.forEach(({ name, location }) => {
        console.log(`${name}: ${location.toString()}`);
    });
}

function demonstrateAssetDefinitions() {
    console.log("\n💎 Asset Definitions Demo");
    console.log("==========================");

    const assets = [
        MultiAsset.native(1000000000000),  // 1 DOT (12 decimals)
        MultiAsset.fungible(MultiLocation.parachain(1000), 5000000),  // 5 USDT
        MultiAsset.nonFungible(MultiLocation.parachain(2000), "item_123")
    ];

    assets.forEach((asset, index) => {
        console.log(`Asset ${index + 1}: ${asset.toString()}`);
    });
}

function demonstrateXCMMessage() {
    console.log("\n📨 XCM Message Construction Demo");
    console.log("=================================");

    // Create a simple asset transfer message
    const transferMessage = new XCMMessage(3)
        .addInstruction(XCMInstruction.withdrawAsset([
            MultiAsset.native(1000000000000)
        ]))
        .addInstruction(XCMInstruction.buyExecution(
            MultiAsset.native(100000000000),
            "unlimited"
        ))
        .addInstruction(XCMInstruction.depositAsset(
            "all",
            MultiLocation.account(2000, "0xalice...")
        ));

    console.log("Transfer Message:");
    console.log(transferMessage.toString());

    // Create a remote execution message
    const remoteExecMessage = new XCMMessage(3)
        .addInstruction(XCMInstruction.withdrawAsset([
            MultiAsset.native(2000000000000)
        ]))
        .addInstruction(XCMInstruction.buyExecution(
            MultiAsset.native(100000000000),
            "unlimited"
        ))
        .addInstruction(XCMInstruction.transact(
            "SovereignAccount",
            1000000000,
            "0x1234abcd..."  // Encoded call data
        ));

    console.log("\nRemote Execution Message:");
    console.log(remoteExecMessage.toString());
}

function demonstrateAssetTransfers() {
    console.log("\n🔄 Asset Transfer Simulation");
    console.log("=============================");

    const simulator = new AssetTransferSimulator();
    
    console.log("Initial state:");
    simulator.printBalances();

    // Demonstrate reserve transfer
    simulator.reserveTransfer("para1000", "para2000", "alice", "USDT", 1000);

    // Demonstrate teleportation
    simulator.teleportAsset("relay", "para1000", "bob", "DOT", 100);

    // Show final state
    simulator.printBalances();
}

function demonstrateRemoteExecution() {
    console.log("\n🚀 Remote Execution Demo");
    console.log("=========================");

    const executor = new RemoteExecutionSimulator();

    // Successful execution
    executor.executeRemoteCall(1000, "swap", { tokenA: "DOT", tokenB: "USDT", amount: 100 }, 15);

    // Failed execution (insufficient fee)
    executor.executeRemoteCall(2000, "stake", { amount: 500 }, 10);

    // Failed execution (contract not found)
    executor.executeRemoteCall(1000, "nonexistent", {}, 50);
}

function demonstrateXCMBarriers() {
    console.log("\n🛡️ XCM Barriers and Security Demo");
    console.log("===================================");

    const barriers = [
        {
            name: "TakeWeightCredit",
            description: "Ensures execution weight is paid for",
            check: (instruction, weight) => {
                console.log(`Checking weight credit for instruction: ${Object.keys(instruction)[0]}`);
                return weight > 0;
            }
        },
        {
            name: "AllowTopLevelPaidExecutionFrom",
            description: "Only allows paid execution from trusted locations",
            check: (origin, instruction) => {
                const trustedLocations = ["relay", "para1000"];
                console.log(`Checking if ${origin} is trusted for paid execution`);
                return trustedLocations.includes(origin);
            }
        },
        {
            name: "AllowKnownQueryResponses",
            description: "Only allows responses to known queries",
            check: (queryId, knownQueries) => {
                console.log(`Checking if query ${queryId} is known`);
                return knownQueries.includes(queryId);
            }
        }
    ];

    barriers.forEach(barrier => {
        console.log(`\n${barrier.name}:`);
        console.log(`  ${barrier.description}`);
        
        // Simulate barrier check
        switch (barrier.name) {
            case "TakeWeightCredit":
                console.log(`  Result: ${barrier.check({ buyExecution: {} }, 1000000)}`);
                break;
            case "AllowTopLevelPaidExecutionFrom":
                console.log(`  Result: ${barrier.check("para1000", { buyExecution: {} })}`);
                break;
            case "AllowKnownQueryResponses":
                console.log(`  Result: ${barrier.check(12345, [12345, 67890])}`);
                break;
        }
    });
}

// === 8. Advanced XCM Patterns ===

function demonstrateAdvancedPatterns() {
    console.log("\n🎯 Advanced XCM Patterns");
    console.log("=========================");

    // Pattern 1: Cross-chain governance proposal
    console.log("\n1. Cross-chain Governance Proposal:");
    const governanceMessage = new XCMMessage(3)
        .addInstruction(XCMInstruction.withdrawAsset([
            MultiAsset.native(1000000000000)
        ]))
        .addInstruction(XCMInstruction.buyExecution(
            MultiAsset.native(100000000000),
            "unlimited"
        ))
        .addInstruction(XCMInstruction.transact(
            "Superuser",
            2000000000,
            "0xgovernance_proposal_call..."
        ));

    console.log("Governance message structure created ✅");

    // Pattern 2: Multi-hop asset transfer
    console.log("\n2. Multi-hop Asset Transfer:");
    const multihopMessage = new XCMMessage(3)
        .addInstruction(XCMInstruction.transferReserveAsset(
            [MultiAsset.fungible(MultiLocation.parachain(1000), 5000000)],
            MultiLocation.parachain(2000),
            [
                XCMInstruction.buyExecution(
                    MultiAsset.native(50000000),
                    "unlimited"
                ),
                XCMInstruction.depositAsset(
                    "all",
                    MultiLocation.account(2000, "0xfinal_destination...")
                )
            ]
        ));

    console.log("Multi-hop transfer message created ✅");

    // Pattern 3: Conditional execution
    console.log("\n3. Conditional Execution Pattern:");
    console.log("Message with query-response pattern for conditional logic ✅");
}

// === 9. Performance Analysis ===

function analyzeXCMPerformance() {
    console.log("\n⚡ XCM Performance Analysis");
    console.log("============================");

    const messageTypes = [
        { name: "Simple Transfer", instructions: 3, weight: 1000000000, fee: "~0.01 DOT" },
        { name: "Remote Call", instructions: 4, weight: 2000000000, fee: "~0.02 DOT" },
        { name: "Multi-hop Transfer", instructions: 6, weight: 3000000000, fee: "~0.03 DOT" },
        { name: "Complex DeFi Operation", instructions: 10, weight: 5000000000, fee: "~0.05 DOT" }
    ];

    console.log("Message Type".padEnd(25) + "Instructions".padEnd(15) + "Weight".padEnd(15) + "Est. Fee");
    console.log("=".repeat(70));

    messageTypes.forEach(msg => {
        console.log(
            msg.name.padEnd(25) + 
            msg.instructions.toString().padEnd(15) + 
            msg.weight.toLocaleString().padEnd(15) + 
            msg.fee
        );
    });

    console.log("\n📊 Optimization Tips:");
    console.log("• Batch multiple operations into single XCM message");
    console.log("• Use appropriate weight limits to avoid over-payment");
    console.log("• Consider asset transfer costs vs. execution benefits");
    console.log("• Implement proper error handling and timeouts");
}

// === Main Execution ===

function main() {
    try {
        demonstrateMultiLocation();
        demonstrateAssetDefinitions();
        demonstrateXCMMessage();
        demonstrateAssetTransfers();
        demonstrateRemoteExecution();
        demonstrateXCMBarriers();
        demonstrateAdvancedPatterns();
        analyzeXCMPerformance();

        console.log("\n🎉 XCM and Cross-Chain Communication Mastery Complete!");
        console.log("\nKey Takeaways:");
        console.log("• XCM enables trustless cross-chain communication");
        console.log("• Multi-location addressing provides universal asset identification");
        console.log("• Reserve transfers and teleportation offer different security models");
        console.log("• Barriers and weight management ensure secure execution");
        console.log("• Advanced patterns enable complex cross-chain applications");

    } catch (error) {
        console.error("❌ Error in XCM demonstration:", error.message);
    }
}

// Run the demonstration
if (require.main === module) {
    main();
}

module.exports = {
    MultiLocation,
    MultiAsset,
    XCMInstruction,
    XCMMessage,
    AssetTransferSimulator,
    RemoteExecutionSimulator
};
