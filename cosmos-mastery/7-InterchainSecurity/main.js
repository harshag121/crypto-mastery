#!/usr/bin/env node

/**
 * Cosmos Mastery - Module 7: Interchain Security
 * Comprehensive implementation of ICS concepts, monitoring, and tools
 */

const crypto = require('crypto');
const fs = require('fs');

class InterchainSecurity {
    constructor() {
        this.chains = new Map();
        this.validators = new Map();
        this.vscPackets = [];
        this.slashingEvents = [];
        this.rewardDistribution = new Map();
    }

    // Core ICS Architecture
    createProviderChain(chainId, validatorSet) {
        const provider = {
            chainId,
            type: 'provider',
            validators: new Map(validatorSet.map(v => [v.address, v])),
            consumerChains: new Set(),
            bondedTokens: validatorSet.reduce((sum, v) => sum + v.stake, 0),
            lastBlockHeight: 0,
            createdAt: Date.now()
        };

        this.chains.set(chainId, provider);
        console.log(`✅ Provider chain ${chainId} created with ${validatorSet.length} validators`);
        return provider;
    }

    createConsumerChain(chainId, providerChainId, initialParams = {}) {
        const provider = this.chains.get(providerChainId);
        if (!provider) {
            throw new Error(`Provider chain ${providerChainId} not found`);
        }

        const consumer = {
            chainId,
            type: 'consumer',
            providerChainId,
            validators: new Map(provider.validators),
            params: {
                unbondingPeriod: initialParams.unbondingPeriod || 1814400000, // 21 days
                ccvTimeoutPeriod: initialParams.ccvTimeoutPeriod || 2419200000, // 28 days
                transferTimeoutPeriod: initialParams.transferTimeoutPeriod || 3600000, // 1 hour
                consumerRedistributionFraction: initialParams.redistribution || 0.75,
                historicalEntries: initialParams.historicalEntries || 10000,
                ...initialParams
            },
            lastBlockHeight: 0,
            rewardsPool: 0,
            createdAt: Date.now()
        };

        this.chains.set(chainId, consumer);
        provider.consumerChains.add(chainId);
        
        console.log(`✅ Consumer chain ${chainId} created under provider ${providerChainId}`);
        return consumer;
    }

    // Validator Set Change (VSC) Packets
    generateVSCPacket(providerChainId, validatorUpdates) {
        const provider = this.chains.get(providerChainId);
        if (!provider || provider.type !== 'provider') {
            throw new Error('Invalid provider chain');
        }

        const vscPacket = {
            id: crypto.randomUUID(),
            providerChainId,
            validatorUpdates,
            vscId: this.vscPackets.length + 1,
            timestamp: Date.now(),
            blockHeight: provider.lastBlockHeight + 1
        };

        this.vscPackets.push(vscPacket);

        // Apply updates to provider chain
        validatorUpdates.forEach(update => {
            if (update.power === 0) {
                provider.validators.delete(update.address);
            } else {
                provider.validators.set(update.address, {
                    address: update.address,
                    pubkey: update.pubkey,
                    stake: update.power,
                    commission: update.commission || 0.05
                });
            }
        });

        // Propagate to consumer chains
        provider.consumerChains.forEach(consumerChainId => {
            this.propagateVSCPacket(consumerChainId, vscPacket);
        });

        console.log(`📦 VSC packet ${vscPacket.vscId} generated for ${validatorUpdates.length} validator updates`);
        return vscPacket;
    }

    propagateVSCPacket(consumerChainId, vscPacket) {
        const consumer = this.chains.get(consumerChainId);
        if (!consumer) return;

        // Apply validator updates to consumer chain
        vscPacket.validatorUpdates.forEach(update => {
            if (update.power === 0) {
                consumer.validators.delete(update.address);
            } else {
                consumer.validators.set(update.address, {
                    address: update.address,
                    pubkey: update.pubkey,
                    stake: update.power,
                    commission: update.commission || 0.05
                });
            }
        });

        console.log(`🔄 VSC packet ${vscPacket.vscId} applied to consumer chain ${consumerChainId}`);
    }

    // Cross-Chain Slashing
    reportSlashingEvent(chainId, validatorAddress, slashType, evidence) {
        const chain = this.chains.get(chainId);
        if (!chain) throw new Error('Chain not found');

        const slashingEvent = {
            id: crypto.randomUUID(),
            chainId,
            validatorAddress,
            slashType, // 'double_sign' or 'downtime'
            evidence,
            timestamp: Date.now(),
            processed: false
        };

        this.slashingEvents.push(slashingEvent);

        // If this is a consumer chain, propagate to provider
        if (chain.type === 'consumer') {
            this.propagateSlashing(chain.providerChainId, slashingEvent);
        }

        console.log(`⚠️  Slashing event reported: ${slashType} by ${validatorAddress} on ${chainId}`);
        return slashingEvent;
    }

    propagateSlashing(providerChainId, slashingEvent) {
        const provider = this.chains.get(providerChainId);
        if (!provider) return;

        const validator = provider.validators.get(slashingEvent.validatorAddress);
        if (!validator) return;

        // Apply slashing
        const slashFraction = slashingEvent.slashType === 'double_sign' ? 0.05 : 0.0001;
        const slashAmount = validator.stake * slashFraction;
        
        validator.stake -= slashAmount;
        provider.bondedTokens -= slashAmount;

        // Propagate slashing to all consumer chains
        provider.consumerChains.forEach(consumerChainId => {
            if (consumerChainId !== slashingEvent.chainId) {
                const consumer = this.chains.get(consumerChainId);
                const consumerValidator = consumer.validators.get(slashingEvent.validatorAddress);
                if (consumerValidator) {
                    consumerValidator.stake = validator.stake; // Sync stake
                }
            }
        });

        slashingEvent.processed = true;
        console.log(`🔥 Slashing applied: ${slashAmount} tokens slashed from ${slashingEvent.validatorAddress}`);
    }

    // Reward Distribution
    distributeRewards(consumerChainId, totalRewards) {
        const consumer = this.chains.get(consumerChainId);
        if (!consumer || consumer.type !== 'provider') {
            const actualConsumer = this.chains.get(consumerChainId);
            if (!actualConsumer) return;

            const provider = this.chains.get(actualConsumer.providerChainId);
            const redistributionFraction = actualConsumer.params.consumerRedistributionFraction;
            
            // Consumer chain keeps portion
            const consumerShare = totalRewards * redistributionFraction;
            actualConsumer.rewardsPool += consumerShare;

            // Provider validators get the rest
            const providerShare = totalRewards * (1 - redistributionFraction);
            
            const totalStake = Array.from(provider.validators.values())
                .reduce((sum, v) => sum + v.stake, 0);

            provider.validators.forEach(validator => {
                const validatorShare = (validator.stake / totalStake) * providerShare;
                const existing = this.rewardDistribution.get(validator.address) || 0;
                this.rewardDistribution.set(validator.address, existing + validatorShare);
            });

            console.log(`💰 Rewards distributed: ${consumerShare} to consumer, ${providerShare} to provider validators`);
        }
    }

    // ICS Monitoring Tools
    generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            providerChains: [],
            consumerChains: [],
            totalValidators: 0,
            totalBondedTokens: 0,
            recentSlashing: [],
            networkHealth: {}
        };

        this.chains.forEach((chain, chainId) => {
            const chainData = {
                chainId,
                validatorCount: chain.validators.size,
                totalStake: Array.from(chain.validators.values()).reduce((sum, v) => sum + v.stake, 0),
                lastUpdate: new Date(chain.createdAt).toISOString()
            };

            if (chain.type === 'provider') {
                chainData.consumerChains = Array.from(chain.consumerChains);
                report.providerChains.push(chainData);
            } else {
                chainData.providerChain = chain.providerChainId;
                chainData.rewardsPool = chain.rewardsPool;
                report.consumerChains.push(chainData);
            }

            report.totalValidators += chain.validators.size;
            report.totalBondedTokens += chainData.totalStake;
        });

        // Recent slashing events
        report.recentSlashing = this.slashingEvents
            .filter(event => Date.now() - event.timestamp < 86400000) // Last 24 hours
            .map(event => ({
                chainId: event.chainId,
                validator: event.validatorAddress,
                type: event.slashType,
                timestamp: new Date(event.timestamp).toISOString()
            }));

        // Network health metrics
        report.networkHealth = {
            vscPacketsGenerated: this.vscPackets.length,
            activeSlashingEvents: this.slashingEvents.filter(e => !e.processed).length,
            averageValidatorStake: report.totalBondedTokens / report.totalValidators || 0
        };

        return report;
    }

    // Governance Integration
    createConsumerChainProposal(proposalData) {
        const proposal = {
            id: crypto.randomUUID(),
            type: 'consumer_addition',
            title: proposalData.title,
            description: proposalData.description,
            chainId: proposalData.chainId,
            initialHeight: proposalData.initialHeight || 1,
            genesisHash: proposalData.genesisHash,
            binaryHash: proposalData.binaryHash,
            spawnTime: proposalData.spawnTime || Date.now() + 604800000, // 1 week
            unbondingPeriod: proposalData.unbondingPeriod || 1814400000,
            distributionTransmissionChannel: proposalData.distributionChannel,
            status: 'voting',
            votingEndTime: Date.now() + 1209600000, // 2 weeks
            votes: { yes: 0, no: 0, abstain: 0, veto: 0 },
            createdAt: Date.now()
        };

        console.log(`🗳️  Consumer chain proposal created: ${proposal.title}`);
        return proposal;
    }

    // Advanced Monitoring
    analyzeSecurityMetrics() {
        const metrics = {
            decentralization: this.calculateDecentralizationIndex(),
            slashingRate: this.calculateSlashingRate(),
            validatorPerformance: this.analyzeValidatorPerformance(),
            crossChainLatency: this.measureCrossChainLatency(),
            economicSecurity: this.calculateEconomicSecurity()
        };

        console.log('📊 Security Metrics Analysis:');
        console.log(`   Decentralization Index: ${metrics.decentralization.toFixed(4)}`);
        console.log(`   24h Slashing Rate: ${(metrics.slashingRate * 100).toFixed(4)}%`);
        console.log(`   Avg Cross-Chain Latency: ${metrics.crossChainLatency}ms`);
        console.log(`   Economic Security: $${metrics.economicSecurity.toLocaleString()}`);

        return metrics;
    }

    calculateDecentralizationIndex() {
        // Simplified Nakamoto coefficient calculation
        const providers = Array.from(this.chains.values()).filter(c => c.type === 'provider');
        if (providers.length === 0) return 0;

        const totalStake = providers.reduce((sum, p) => 
            sum + Array.from(p.validators.values()).reduce((s, v) => s + v.stake, 0), 0);

        let cumulativeStake = 0;
        let validatorCount = 0;
        
        const allValidators = [];
        providers.forEach(provider => {
            provider.validators.forEach(validator => {
                allValidators.push(validator.stake);
            });
        });

        allValidators.sort((a, b) => b - a);
        
        for (const stake of allValidators) {
            cumulativeStake += stake;
            validatorCount++;
            if (cumulativeStake >= totalStake * 0.33) break;
        }

        return validatorCount / allValidators.length;
    }

    calculateSlashingRate() {
        const recentEvents = this.slashingEvents.filter(e => 
            Date.now() - e.timestamp < 86400000);
        return recentEvents.length / this.getTotalValidatorCount();
    }

    analyzeValidatorPerformance() {
        const validators = new Map();
        
        this.chains.forEach(chain => {
            chain.validators.forEach((validator, address) => {
                if (!validators.has(address)) {
                    validators.set(address, {
                        totalStake: 0,
                        chainCount: 0,
                        slashingEvents: 0
                    });
                }
                
                const data = validators.get(address);
                data.totalStake += validator.stake;
                data.chainCount++;
            });
        });

        this.slashingEvents.forEach(event => {
            const validator = validators.get(event.validatorAddress);
            if (validator) validator.slashingEvents++;
        });

        return Array.from(validators.entries()).map(([address, data]) => ({
            address,
            averageStake: data.totalStake / data.chainCount,
            chainParticipation: data.chainCount,
            slashingEvents: data.slashingEvents,
            performanceScore: (data.totalStake / data.chainCount) / (data.slashingEvents + 1)
        }));
    }

    measureCrossChainLatency() {
        // Simulated cross-chain latency measurement
        return Math.floor(Math.random() * 5000) + 1000; // 1-6 seconds
    }

    calculateEconomicSecurity() {
        // Simplified economic security calculation (assuming $10 per token)
        const totalBondedTokens = Array.from(this.chains.values())
            .reduce((sum, chain) => 
                sum + Array.from(chain.validators.values()).reduce((s, v) => s + v.stake, 0), 0);
        
        return totalBondedTokens * 10; // $10 per token assumption
    }

    getTotalValidatorCount() {
        const uniqueValidators = new Set();
        this.chains.forEach(chain => {
            chain.validators.forEach((_, address) => {
                uniqueValidators.add(address);
            });
        });
        return uniqueValidators.size;
    }

    // Export data for analysis
    exportSecurityData() {
        const data = {
            chains: Object.fromEntries(this.chains),
            vscPackets: this.vscPackets,
            slashingEvents: this.slashingEvents,
            rewardDistribution: Object.fromEntries(this.rewardDistribution),
            securityReport: this.generateSecurityReport(),
            metrics: this.analyzeSecurityMetrics()
        };

        const filename = `ics-security-data-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`📄 Security data exported to ${filename}`);
        
        return data;
    }
}

// Demonstration and Testing
function demonstrateInterchainSecurity() {
    console.log('🚀 Cosmos Interchain Security Demo\n');
    
    const ics = new InterchainSecurity();

    // Create provider chain (Cosmos Hub)
    console.log('=== Setting up Provider Chain ===');
    const hubValidators = [
        { address: 'cosmosvaloper1', pubkey: 'pub1', stake: 1000000, commission: 0.05 },
        { address: 'cosmosvaloper2', pubkey: 'pub2', stake: 800000, commission: 0.07 },
        { address: 'cosmosvaloper3', pubkey: 'pub3', stake: 600000, commission: 0.10 },
        { address: 'cosmosvaloper4', pubkey: 'pub4', stake: 500000, commission: 0.08 },
        { address: 'cosmosvaloper5', pubkey: 'pub5', stake: 400000, commission: 0.06 }
    ];
    
    ics.createProviderChain('cosmoshub-4', hubValidators);

    // Create consumer chains
    console.log('\n=== Creating Consumer Chains ===');
    ics.createConsumerChain('stride-1', 'cosmoshub-4', {
        unbondingPeriod: 1814400000,
        redistribution: 0.75
    });

    ics.createConsumerChain('neutron-1', 'cosmoshub-4', {
        unbondingPeriod: 2419200000,
        redistribution: 0.80
    });

    // Generate VSC packets
    console.log('\n=== Validator Set Changes ===');
    ics.generateVSCPacket('cosmoshub-4', [
        { address: 'cosmosvaloper6', pubkey: 'pub6', power: 300000, commission: 0.09 },
        { address: 'cosmosvaloper2', pubkey: 'pub2', power: 0 } // Remove validator
    ]);

    // Simulate slashing events
    console.log('\n=== Slashing Events ===');
    ics.reportSlashingEvent('stride-1', 'cosmosvaloper3', 'downtime', {
        missedBlocks: 10000,
        timeRange: '2024-01-15 to 2024-01-16'
    });

    ics.reportSlashingEvent('neutron-1', 'cosmosvaloper4', 'double_sign', {
        height1: 1000000,
        height2: 1000001,
        evidence: 'conflicting_votes'
    });

    // Distribute rewards
    console.log('\n=== Reward Distribution ===');
    ics.distributeRewards('stride-1', 50000);
    ics.distributeRewards('neutron-1', 75000);

    // Generate security report
    console.log('\n=== Security Analysis ===');
    const report = ics.generateSecurityReport();
    console.log('Security Report Generated:');
    console.log(`  Provider Chains: ${report.providerChains.length}`);
    console.log(`  Consumer Chains: ${report.consumerChains.length}`);
    console.log(`  Total Bonded Tokens: ${report.totalBondedTokens.toLocaleString()}`);
    console.log(`  Recent Slashing Events: ${report.recentSlashing.length}`);

    // Analyze metrics
    console.log('\n=== Advanced Metrics ===');
    ics.analyzeSecurityMetrics();

    // Create governance proposal
    console.log('\n=== Governance Integration ===');
    const proposal = ics.createConsumerChainProposal({
        title: 'Add Persistence Chain to ICS',
        description: 'Proposal to add Persistence as a consumer chain',
        chainId: 'core-1',
        genesisHash: '0x1234567890abcdef',
        binaryHash: '0xabcdef1234567890',
        unbondingPeriod: 1814400000,
        distributionChannel: 'channel-24'
    });

    // Export data
    console.log('\n=== Data Export ===');
    const exportedData = ics.exportSecurityData();

    console.log('\n✅ Interchain Security demonstration completed!');
    console.log('📚 Key concepts covered:');
    console.log('   • Provider-Consumer chain architecture');
    console.log('   • VSC packet generation and propagation');
    console.log('   • Cross-chain slashing mechanisms');
    console.log('   • Reward distribution models');
    console.log('   • Security monitoring and metrics');
    console.log('   • Governance integration');

    return ics;
}

// Run demonstration
if (require.main === module) {
    demonstrateInterchainSecurity();
}

module.exports = {
    InterchainSecurity,
    demonstrateInterchainSecurity
};
