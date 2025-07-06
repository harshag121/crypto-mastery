#!/usr/bin/env node

/**
 * Polkadot Mastery - Module 2: Substrate Framework
 * Comprehensive implementation of Substrate concepts and pallet development
 */

const crypto = require('crypto');
const fs = require('fs');

class SubstrateFramework {
    constructor() {
        this.pallets = new Map();
        this.storage = new Map();
        this.runtime = null;
        this.events = [];
        this.extrinsics = [];
        this.blockNumber = 0;
        this.timestamp = Date.now();
    }

    // Core Substrate Runtime Implementation
    initializeRuntime(config = {}) {
        this.runtime = {
            specName: config.specName || 'substrate-node',
            specVersion: config.specVersion || 1,
            implVersion: config.implVersion || 1,
            authoringVersion: config.authoringVersion || 1,
            blockHashCount: config.blockHashCount || 256,
            version: {
                specName: config.specName || 'substrate-node',
                implName: config.implName || 'substrate-node',
                specVersion: config.specVersion || 1,
                implVersion: config.implVersion || 1,
                apis: [
                    ['0xdf6acb689907609b', 4], // Core
                    ['0x37e397fc7c91f5e4', 1], // BlockBuilder
                    ['0xd2bc9897eed08f15', 3], // TaggedTransactionQueue
                    ['0x40fe3ad401f8959a', 6], // Metadata
                    ['0xbc9d89904f5b923f', 1], // OffchainWorkerApi
                    ['0xc6e9a76309f39b09', 2], // AuraApi
                    ['0xed99c5acb25eedf5', 3], // GrandpaApi
                ]
            },
            pallets: [],
            created: Date.now()
        };

        console.log(`🏗️  Substrate Runtime initialized: ${this.runtime.specName} v${this.runtime.specVersion}`);
        return this.runtime;
    }

    // Pallet Development Framework
    createPallet(palletConfig) {
        const pallet = {
            name: palletConfig.name,
            index: palletConfig.index,
            storage: new Map(),
            calls: new Map(),
            events: new Map(),
            errors: new Map(),
            constants: new Map(),
            config: {
                dependencies: palletConfig.dependencies || [],
                genesis: palletConfig.genesis || {},
                hooks: palletConfig.hooks || {},
                weights: palletConfig.weights || {}
            },
            metadata: {
                version: palletConfig.version || '1.0.0',
                author: palletConfig.author,
                description: palletConfig.description
            }
        };

        // Register storage items
        if (palletConfig.storage) {
            Object.entries(palletConfig.storage).forEach(([name, storageConfig]) => {
                pallet.storage.set(name, {
                    type: storageConfig.type, // Value, Map, DoubleMap, etc.
                    key: storageConfig.key,
                    value: storageConfig.value,
                    default: storageConfig.default,
                    hasher: storageConfig.hasher || 'Blake2_128Concat'
                });
            });
        }

        // Register dispatchable calls
        if (palletConfig.calls) {
            Object.entries(palletConfig.calls).forEach(([name, callConfig]) => {
                pallet.calls.set(name, {
                    params: callConfig.params || [],
                    weight: callConfig.weight || 10000,
                    handler: callConfig.handler
                });
            });
        }

        // Register events
        if (palletConfig.events) {
            Object.entries(palletConfig.events).forEach(([name, eventConfig]) => {
                pallet.events.set(name, {
                    params: eventConfig.params || [],
                    documentation: eventConfig.documentation
                });
            });
        }

        // Register errors
        if (palletConfig.errors) {
            Object.entries(palletConfig.errors).forEach(([name, errorConfig]) => {
                pallet.errors.set(name, {
                    documentation: errorConfig.documentation
                });
            });
        }

        this.pallets.set(pallet.name, pallet);
        this.runtime.pallets.push(pallet.name);

        console.log(`📦 Pallet ${pallet.name} created with ${pallet.calls.size} calls and ${pallet.storage.size} storage items`);
        return pallet;
    }

    // Storage Management System
    setStorage(palletName, storageItem, key, value) {
        const storageKey = key ? `${palletName}.${storageItem}.${key}` : `${palletName}.${storageItem}`;
        this.storage.set(storageKey, {
            value,
            blockNumber: this.blockNumber,
            timestamp: Date.now()
        });
        
        console.log(`💾 Storage updated: ${storageKey} = ${JSON.stringify(value)}`);
    }

    getStorage(palletName, storageItem, key = null) {
        const storageKey = key ? `${palletName}.${storageItem}.${key}` : `${palletName}.${storageItem}`;
        const stored = this.storage.get(storageKey);
        return stored ? stored.value : null;
    }

    // Extrinsic Processing
    submitExtrinsic(extrinsicData) {
        const extrinsic = {
            hash: crypto.randomBytes(32).toString('hex'),
            call: extrinsicData.call,
            signer: extrinsicData.signer,
            signature: extrinsicData.signature || crypto.randomBytes(64).toString('hex'),
            nonce: extrinsicData.nonce || 0,
            tip: extrinsicData.tip || 0,
            blockNumber: this.blockNumber,
            timestamp: Date.now(),
            result: null,
            events: []
        };

        try {
            // Process the extrinsic
            const result = this.processCall(extrinsic.call, extrinsic.signer);
            extrinsic.result = result;
            extrinsic.events = [...this.events]; // Capture events generated during processing
            
            this.extrinsics.push(extrinsic);
            
            console.log(`📝 Extrinsic processed: ${extrinsic.call.pallet}.${extrinsic.call.method}`);
            console.log(`   Hash: ${extrinsic.hash}`);
            console.log(`   Result: ${result.success ? 'Success' : 'Failed'}`);
            
            return extrinsic;
        } catch (error) {
            extrinsic.result = { success: false, error: error.message };
            this.extrinsics.push(extrinsic);
            console.error(`❌ Extrinsic failed: ${error.message}`);
            return extrinsic;
        }
    }

    processCall(call, signer) {
        const pallet = this.pallets.get(call.pallet);
        if (!pallet) {
            throw new Error(`Pallet ${call.pallet} not found`);
        }

        const callDef = pallet.calls.get(call.method);
        if (!callDef) {
            throw new Error(`Call ${call.method} not found in pallet ${call.pallet}`);
        }

        // Execute the call handler
        if (callDef.handler) {
            return callDef.handler(call.params, signer, this);
        }

        return { success: true, message: 'Call executed successfully' };
    }

    // Event System
    emitEvent(palletName, eventName, data) {
        const event = {
            pallet: palletName,
            event: eventName,
            data,
            blockNumber: this.blockNumber,
            timestamp: Date.now()
        };

        this.events.push(event);
        console.log(`📡 Event emitted: ${palletName}.${eventName}`, data);
        return event;
    }

    // Off-chain Worker Simulation
    createOffchainWorker(workerConfig) {
        const worker = {
            name: workerConfig.name,
            triggers: workerConfig.triggers || ['block'], // block, transaction, time
            handler: workerConfig.handler,
            interval: workerConfig.interval || 60000, // 1 minute
            lastRun: 0,
            enabled: true
        };

        // Simulate off-chain work
        if (worker.triggers.includes('block')) {
            this.processOffchainWork(worker);
        }

        console.log(`🔄 Off-chain worker created: ${worker.name}`);
        return worker;
    }

    processOffchainWork(worker) {
        console.log(`⚙️  Processing off-chain work: ${worker.name}`);
        
        if (worker.handler) {
            try {
                const result = worker.handler(this.blockNumber, this);
                console.log(`✅ Off-chain work completed: ${JSON.stringify(result)}`);
                return result;
            } catch (error) {
                console.error(`❌ Off-chain work failed: ${error.message}`);
            }
        }
        
        worker.lastRun = Date.now();
    }

    // Runtime Upgrade Simulation
    upgradeRuntime(newRuntimeConfig) {
        console.log(`🔄 Upgrading runtime from v${this.runtime.specVersion} to v${newRuntimeConfig.specVersion}`);
        
        const oldVersion = this.runtime.specVersion;
        this.runtime.specVersion = newRuntimeConfig.specVersion;
        this.runtime.implVersion = newRuntimeConfig.implVersion || this.runtime.implVersion + 1;
        
        // Simulate migration logic
        if (newRuntimeConfig.migrations) {
            newRuntimeConfig.migrations.forEach(migration => {
                console.log(`📦 Running migration: ${migration.name}`);
                if (migration.handler) {
                    migration.handler(this);
                }
            });
        }

        this.emitEvent('System', 'RuntimeUpgraded', {
            oldVersion,
            newVersion: this.runtime.specVersion
        });

        console.log(`✅ Runtime upgrade completed: v${this.runtime.specVersion}`);
    }

    // Block Production
    produceBlock() {
        this.blockNumber++;
        const block = {
            number: this.blockNumber,
            hash: crypto.randomBytes(32).toString('hex'),
            parentHash: crypto.randomBytes(32).toString('hex'),
            timestamp: Date.now(),
            extrinsics: [...this.extrinsics],
            events: [...this.events],
            storageRoot: this.calculateStorageRoot(),
            extrinsicsRoot: this.calculateExtrinsicsRoot()
        };

        // Clear events for next block
        this.events = [];
        
        console.log(`🧱 Block #${block.number} produced with ${block.extrinsics.length} extrinsics`);
        return block;
    }

    calculateStorageRoot() {
        const storageKeys = Array.from(this.storage.keys()).sort();
        const concatenated = storageKeys.join('');
        return crypto.createHash('sha256').update(concatenated).digest('hex');
    }

    calculateExtrinsicsRoot() {
        const extrinsicHashes = this.extrinsics.map(ext => ext.hash);
        const concatenated = extrinsicHashes.join('');
        return crypto.createHash('sha256').update(concatenated).digest('hex');
    }

    // Generate Runtime Metadata
    generateMetadata() {
        const metadata = {
            magicNumber: 0x6174656d,
            version: 14,
            types: {},
            pallets: []
        };

        this.pallets.forEach((pallet, name) => {
            const palletMetadata = {
                name,
                storage: Array.from(pallet.storage.entries()).map(([key, storage]) => ({
                    name: key,
                    type: storage.type,
                    hasher: storage.hasher,
                    documentation: []
                })),
                calls: Array.from(pallet.calls.entries()).map(([key, call]) => ({
                    name: key,
                    params: call.params,
                    documentation: []
                })),
                events: Array.from(pallet.events.entries()).map(([key, event]) => ({
                    name: key,
                    params: event.params,
                    documentation: event.documentation || []
                })),
                errors: Array.from(pallet.errors.entries()).map(([key, error]) => ({
                    name: key,
                    documentation: error.documentation || []
                })),
                constants: Array.from(pallet.constants.entries()).map(([key, constant]) => ({
                    name: key,
                    type: constant.type,
                    value: constant.value,
                    documentation: constant.documentation || []
                }))
            };

            metadata.pallets.push(palletMetadata);
        });

        return metadata;
    }

    // Network Statistics
    getNetworkStats() {
        return {
            runtime: {
                specName: this.runtime.specName,
                specVersion: this.runtime.specVersion,
                implVersion: this.runtime.implVersion
            },
            blockchain: {
                currentBlock: this.blockNumber,
                totalExtrinsics: this.extrinsics.length,
                totalEvents: this.events.length,
                storageItems: this.storage.size
            },
            pallets: {
                count: this.pallets.size,
                names: Array.from(this.pallets.keys())
            }
        };
    }
}

// Example Pallet Implementations
class BalancesPallet {
    static createConfig() {
        return {
            name: 'Balances',
            index: 10,
            storage: {
                Account: {
                    type: 'Map',
                    key: 'AccountId',
                    value: 'AccountData',
                    hasher: 'Blake2_128Concat'
                },
                TotalIssuance: {
                    type: 'Value',
                    value: 'Balance',
                    default: 0
                }
            },
            calls: {
                transfer: {
                    params: [
                        { name: 'dest', type: 'AccountId' },
                        { name: 'value', type: 'Balance' }
                    ],
                    weight: 25000,
                    handler: (params, signer, runtime) => {
                        const [dest, value] = params;
                        
                        // Get sender balance
                        const senderBalance = runtime.getStorage('Balances', 'Account', signer) || { free: 0 };
                        
                        if (senderBalance.free < value) {
                            throw new Error('InsufficientBalance');
                        }

                        // Get recipient balance
                        const recipientBalance = runtime.getStorage('Balances', 'Account', dest) || { free: 0 };

                        // Update balances
                        runtime.setStorage('Balances', 'Account', signer, {
                            free: senderBalance.free - value
                        });
                        runtime.setStorage('Balances', 'Account', dest, {
                            free: recipientBalance.free + value
                        });

                        // Emit transfer event
                        runtime.emitEvent('Balances', 'Transfer', {
                            from: signer,
                            to: dest,
                            amount: value
                        });

                        return { success: true, message: 'Transfer completed' };
                    }
                },
                setBalance: {
                    params: [
                        { name: 'who', type: 'AccountId' },
                        { name: 'newBalance', type: 'Balance' }
                    ],
                    weight: 20000,
                    handler: (params, signer, runtime) => {
                        const [who, newBalance] = params;
                        
                        runtime.setStorage('Balances', 'Account', who, {
                            free: newBalance
                        });

                        runtime.emitEvent('Balances', 'BalanceSet', {
                            who,
                            balance: newBalance
                        });

                        return { success: true, message: 'Balance set' };
                    }
                }
            },
            events: {
                Transfer: {
                    params: [
                        { name: 'from', type: 'AccountId' },
                        { name: 'to', type: 'AccountId' },
                        { name: 'amount', type: 'Balance' }
                    ]
                },
                BalanceSet: {
                    params: [
                        { name: 'who', type: 'AccountId' },
                        { name: 'balance', type: 'Balance' }
                    ]
                }
            },
            errors: {
                InsufficientBalance: {
                    documentation: 'Balance too low to send value'
                },
                ExistentialDeposit: {
                    documentation: 'Value too low to create account due to existential deposit'
                }
            }
        };
    }
}

class IdentityPallet {
    static createConfig() {
        return {
            name: 'Identity',
            index: 20,
            storage: {
                IdentityOf: {
                    type: 'Map',
                    key: 'AccountId',
                    value: 'IdentityInfo',
                    hasher: 'Blake2_128Concat'
                },
                Registrars: {
                    type: 'Value',
                    value: 'Vec<RegistrarInfo>',
                    default: []
                }
            },
            calls: {
                setIdentity: {
                    params: [
                        { name: 'info', type: 'IdentityInfo' }
                    ],
                    weight: 50000,
                    handler: (params, signer, runtime) => {
                        const [info] = params;
                        
                        runtime.setStorage('Identity', 'IdentityOf', signer, {
                            info,
                            judgements: [],
                            deposit: 10000
                        });

                        runtime.emitEvent('Identity', 'IdentitySet', {
                            who: signer
                        });

                        return { success: true, message: 'Identity set' };
                    }
                },
                clearIdentity: {
                    params: [],
                    weight: 30000,
                    handler: (params, signer, runtime) => {
                        runtime.setStorage('Identity', 'IdentityOf', signer, null);

                        runtime.emitEvent('Identity', 'IdentityCleared', {
                            who: signer
                        });

                        return { success: true, message: 'Identity cleared' };
                    }
                }
            },
            events: {
                IdentitySet: {
                    params: [{ name: 'who', type: 'AccountId' }]
                },
                IdentityCleared: {
                    params: [{ name: 'who', type: 'AccountId' }]
                }
            }
        };
    }
}

// Demonstration and Testing
function demonstrateSubstrateFramework() {
    console.log('🏗️  Substrate Framework Demonstration\n');
    
    const substrate = new SubstrateFramework();

    // Initialize runtime
    console.log('=== Runtime Initialization ===');
    substrate.initializeRuntime({
        specName: 'demo-runtime',
        specVersion: 1,
        implVersion: 1
    });

    // Create and register pallets
    console.log('\n=== Pallet Creation ===');
    const balancesPallet = substrate.createPallet(BalancesPallet.createConfig());
    const identityPallet = substrate.createPallet(IdentityPallet.createConfig());

    // Initialize some accounts with balances
    console.log('\n=== Genesis Configuration ===');
    substrate.setStorage('Balances', 'Account', 'alice', { free: 1000000 });
    substrate.setStorage('Balances', 'Account', 'bob', { free: 500000 });
    substrate.setStorage('Balances', 'TotalIssuance', null, 1500000);

    // Submit some extrinsics
    console.log('\n=== Extrinsic Processing ===');
    
    // Alice transfers to Bob
    substrate.submitExtrinsic({
        call: {
            pallet: 'Balances',
            method: 'transfer',
            params: ['bob', 100000]
        },
        signer: 'alice'
    });

    // Bob sets identity
    substrate.submitExtrinsic({
        call: {
            pallet: 'Identity',
            method: 'setIdentity',
            params: [{
                display: 'Bob Smith',
                email: 'bob@example.com',
                twitter: '@bobsmith'
            }]
        },
        signer: 'bob'
    });

    // Alice transfers to Charlie (new account)
    substrate.submitExtrinsic({
        call: {
            pallet: 'Balances',
            method: 'transfer',
            params: ['charlie', 50000]
        },
        signer: 'alice'
    });

    // Create off-chain worker
    console.log('\n=== Off-chain Worker ===');
    substrate.createOffchainWorker({
        name: 'PriceOracle',
        triggers: ['block'],
        handler: (blockNumber, runtime) => {
            const price = Math.random() * 100 + 50; // Random price between 50-150
            console.log(`📊 Price oracle update: $${price.toFixed(2)} at block ${blockNumber}`);
            return { price, block: blockNumber };
        }
    });

    // Produce a block
    console.log('\n=== Block Production ===');
    const block = substrate.produceBlock();

    // Simulate runtime upgrade
    console.log('\n=== Runtime Upgrade ===');
    substrate.upgradeRuntime({
        specVersion: 2,
        implVersion: 2,
        migrations: [
            {
                name: 'AddNewStorageItem',
                handler: (runtime) => {
                    runtime.setStorage('System', 'NewFeature', null, 'enabled');
                }
            }
        ]
    });

    // Generate metadata
    console.log('\n=== Metadata Generation ===');
    const metadata = substrate.generateMetadata();
    console.log(`📄 Generated metadata with ${metadata.pallets.length} pallets`);

    // Display network statistics
    console.log('\n=== Network Statistics ===');
    const stats = substrate.getNetworkStats();
    console.log('Network Statistics:');
    console.log(`  Runtime: ${stats.runtime.specName} v${stats.runtime.specVersion}`);
    console.log(`  Current Block: #${stats.blockchain.currentBlock}`);
    console.log(`  Total Extrinsics: ${stats.blockchain.totalExtrinsics}`);
    console.log(`  Storage Items: ${stats.blockchain.storageItems}`);
    console.log(`  Pallets: ${stats.pallets.names.join(', ')}`);

    // Display final balances
    console.log('\n=== Final Balances ===');
    const aliceBalance = substrate.getStorage('Balances', 'Account', 'alice');
    const bobBalance = substrate.getStorage('Balances', 'Account', 'bob');
    const charlieBalance = substrate.getStorage('Balances', 'Account', 'charlie');
    
    console.log(`Alice: ${aliceBalance?.free || 0} units`);
    console.log(`Bob: ${bobBalance?.free || 0} units`);
    console.log(`Charlie: ${charlieBalance?.free || 0} units`);

    console.log('\n✅ Substrate Framework demonstration completed!');
    console.log('📚 Key concepts demonstrated:');
    console.log('   • Runtime initialization and configuration');
    console.log('   • Custom pallet development with storage and calls');
    console.log('   • Extrinsic processing and event emission');
    console.log('   • Off-chain worker implementation');
    console.log('   • Runtime upgrades and migrations');
    console.log('   • Metadata generation and introspection');

    return substrate;
}

// Run demonstration
if (require.main === module) {
    demonstrateSubstrateFramework();
}

module.exports = {
    SubstrateFramework,
    BalancesPallet,
    IdentityPallet,
    demonstrateSubstrateFramework
};
