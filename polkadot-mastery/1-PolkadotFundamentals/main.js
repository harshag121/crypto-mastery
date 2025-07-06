#!/usr/bin/env node

/**
 * Polkadot Mastery - Module 1: Polkadot Fundamentals
 * Comprehensive implementation of Polkadot core concepts and architecture
 */

const crypto = require('crypto');
const fs = require('fs');

class PolkadotNetwork {
    constructor() {
        this.relayChain = null;
        this.parachains = new Map();
        this.validators = new Map();
        this.nominators = new Map();
        this.proposals = new Map();
        this.slotAuctions = [];
        this.treasury = { balance: 0, proposals: [] };
        this.currentEra = 1;
        this.currentSession = 1;
    }

    // Relay Chain Implementation
    initializeRelayChain(config = {}) {
        this.relayChain = {
            name: config.name || 'Polkadot',
            ss58Prefix: config.ss58Prefix || 0,
            tokenSymbol: config.tokenSymbol || 'DOT',
            tokenDecimals: config.tokenDecimals || 10,
            blockTime: config.blockTime || 6000, // 6 seconds
            epochLength: config.epochLength || 2400, // 4 hours
            sessionsPerEra: config.sessionsPerEra || 6, // 24 hours
            bondingDuration: config.bondingDuration || 28, // 28 eras (~28 days)
            maxValidators: config.maxValidators || 297,
            maxNominators: config.maxNominators || 22500,
            existentialDeposit: config.existentialDeposit || 1000000000, // 1 DOT
            validatorDeposit: config.validatorDeposit || 10000000000000, // 1000 DOT
            currentBlock: 0,
            currentSlot: 0,
            lastFinalized: 0,
            parachainSlots: 100,
            availableSlots: 100,
            genesisTime: Date.now()
        };

        console.log(`🔴 Relay Chain initialized: ${this.relayChain.name}`);
        console.log(`   Token: ${this.relayChain.tokenSymbol} (${this.relayChain.tokenDecimals} decimals)`);
        console.log(`   Max Validators: ${this.relayChain.maxValidators}`);
        console.log(`   Block Time: ${this.relayChain.blockTime}ms`);
        
        return this.relayChain;
    }

    // BABE Block Production Algorithm
    generateBABESlot() {
        const slot = {
            slotNumber: this.relayChain.currentSlot,
            timestamp: Date.now(),
            author: this.selectSlotAuthor(),
            vrfOutput: this.generateVRFOutput(),
            vrfProof: crypto.randomBytes(64).toString('hex'),
            blockNumber: this.relayChain.currentBlock + 1,
            parentHash: this.getLastBlockHash(),
            extrinsicsRoot: crypto.randomBytes(32).toString('hex'),
            stateRoot: crypto.randomBytes(32).toString('hex')
        };

        // Check if this validator can produce block in this slot
        if (this.canProduceBlock(slot.author, slot.vrfOutput)) {
            this.produceBlock(slot);
        }

        this.relayChain.currentSlot++;
        return slot;
    }

    selectSlotAuthor() {
        const activeValidators = this.getActiveValidators();
        if (activeValidators.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * activeValidators.length);
        return activeValidators[randomIndex];
    }

    generateVRFOutput() {
        // Simplified VRF (Verifiable Random Function) output
        return crypto.randomBytes(32).toString('hex');
    }

    canProduceBlock(validatorId, vrfOutput) {
        const validator = this.validators.get(validatorId);
        if (!validator || !validator.active) return false;

        // Simplified threshold calculation based on stake
        const totalStake = this.getTotalActiveStake();
        const validatorStake = validator.totalStake;
        const threshold = validatorStake / totalStake;
        
        // Convert VRF output to number between 0 and 1
        const vrfValue = parseInt(vrfOutput.slice(0, 8), 16) / 0xffffffff;
        
        return vrfValue < threshold;
    }

    produceBlock(slot) {
        const block = {
            number: slot.blockNumber,
            hash: crypto.randomBytes(32).toString('hex'),
            parentHash: slot.parentHash,
            author: slot.author,
            timestamp: slot.timestamp,
            extrinsics: this.collectExtrinsics(),
            logs: [],
            justification: null
        };

        this.relayChain.currentBlock = block.number;
        
        console.log(`🟢 Block #${block.number} produced by ${slot.author} at slot ${slot.slotNumber}`);
        
        // Trigger GRANDPA finalization
        this.checkFinalization(block);
        
        return block;
    }

    collectExtrinsics() {
        // Simulate collecting extrinsics from mempool
        const extrinsics = [];
        
        // Add some random transactions
        for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
            extrinsics.push({
                hash: crypto.randomBytes(32).toString('hex'),
                from: `account_${Math.floor(Math.random() * 1000)}`,
                call: 'balances.transfer',
                signature: crypto.randomBytes(64).toString('hex')
            });
        }
        
        return extrinsics;
    }

    // GRANDPA Finality Algorithm
    checkFinalization(block) {
        const activeValidators = this.getActiveValidators();
        const requiredVotes = Math.floor(activeValidators.length * 2 / 3) + 1;
        
        // Simulate GRANDPA voting
        const votes = this.simulateGrandpaVotes(block, activeValidators);
        
        if (votes >= requiredVotes) {
            this.finalizeBlock(block);
        }
    }

    simulateGrandpaVotes(block, validators) {
        let votes = 0;
        
        validators.forEach(validatorId => {
            const validator = this.validators.get(validatorId);
            if (validator && validator.active) {
                // 95% chance each validator votes for finalization
                if (Math.random() < 0.95) {
                    votes++;
                }
            }
        });
        
        return votes;
    }

    finalizeBlock(block) {
        this.relayChain.lastFinalized = block.number;
        console.log(`✅ Block #${block.number} finalized by GRANDPA`);
        
        // Process era and session transitions
        this.checkEraTransition();
    }

    getLastBlockHash() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Nominated Proof of Stake (NPoS)
    registerValidator(validatorData) {
        const validator = {
            id: validatorData.id,
            stash: validatorData.stash,
            controller: validatorData.controller,
            commission: validatorData.commission || 0.1, // 10% default
            selfStake: validatorData.selfStake,
            totalStake: validatorData.selfStake,
            nominators: new Map(),
            active: false,
            blocks: 0,
            points: 0,
            slashes: 0,
            registeredAt: Date.now()
        };

        if (validator.selfStake < this.relayChain.validatorDeposit) {
            throw new Error(`Insufficient self-stake. Required: ${this.relayChain.validatorDeposit}`);
        }

        this.validators.set(validator.id, validator);
        console.log(`👤 Validator ${validator.id} registered with ${validator.selfStake} DOT stake`);
        
        return validator;
    }

    nominate(nominatorId, validatorIds, stakeAmount) {
        const nominator = {
            id: nominatorId,
            targets: validatorIds,
            stake: stakeAmount,
            rewards: 0,
            registeredAt: Date.now()
        };

        this.nominators.set(nominatorId, nominator);

        // Distribute stake to validators using Phragmén's algorithm (simplified)
        const distribution = this.calculateStakeDistribution(validatorIds, stakeAmount);
        
        distribution.forEach((amount, validatorId) => {
            const validator = this.validators.get(validatorId);
            if (validator) {
                validator.nominators.set(nominatorId, amount);
                validator.totalStake += amount;
            }
        });

        console.log(`🗳️  Nominator ${nominatorId} staked ${stakeAmount} DOT across ${validatorIds.length} validators`);
        return nominator;
    }

    calculateStakeDistribution(validatorIds, totalStake) {
        // Simplified Phragmén's algorithm implementation
        const distribution = new Map();
        const stakePerValidator = totalStake / validatorIds.length;
        
        validatorIds.forEach(validatorId => {
            distribution.set(validatorId, stakePerValidator);
        });
        
        return distribution;
    }

    runValidatorElection() {
        console.log(`\n🗳️  Running validator election for Era ${this.currentEra}`);
        
        // Get all validators with their total stake
        const candidates = Array.from(this.validators.values())
            .filter(v => v.totalStake >= this.relayChain.validatorDeposit)
            .sort((a, b) => b.totalStake - a.totalStake);

        // Select top validators up to max limit
        const selectedValidators = candidates.slice(0, this.relayChain.maxValidators);
        
        // Update validator active status
        this.validators.forEach(validator => {
            validator.active = selectedValidators.includes(validator);
        });

        const totalActiveStake = selectedValidators.reduce((sum, v) => sum + v.totalStake, 0);
        
        console.log(`   Selected ${selectedValidators.length} validators`);
        console.log(`   Total active stake: ${totalActiveStake.toLocaleString()} DOT`);
        console.log(`   Average stake per validator: ${(totalActiveStake / selectedValidators.length).toLocaleString()} DOT`);
        
        return selectedValidators;
    }

    // Parachain Slot Auctions
    createParachainSlotAuction(auctionConfig) {
        const auction = {
            id: crypto.randomUUID(),
            startBlock: this.relayChain.currentBlock + (auctionConfig.delayBlocks || 100),
            endBlock: this.relayChain.currentBlock + (auctionConfig.delayBlocks || 100) + (auctionConfig.durationBlocks || 1000),
            leasePeriodIndex: auctionConfig.leasePeriodIndex || 0,
            leasePeriods: auctionConfig.leasePeriods || 8, // 8 periods = ~2 years
            bids: [],
            winner: null,
            status: 'upcoming',
            created: Date.now()
        };

        this.slotAuctions.push(auction);
        console.log(`🏛️  Parachain slot auction ${auction.id} created`);
        console.log(`   Auction blocks: ${auction.startBlock} - ${auction.endBlock}`);
        console.log(`   Lease periods: ${auction.leasePeriods}`);
        
        return auction;
    }

    submitParachainBid(auctionId, bidData) {
        const auction = this.slotAuctions.find(a => a.id === auctionId);
        if (!auction) throw new Error('Auction not found');

        if (this.relayChain.currentBlock < auction.startBlock) {
            throw new Error('Auction has not started yet');
        }

        if (this.relayChain.currentBlock > auction.endBlock) {
            throw new Error('Auction has ended');
        }

        const bid = {
            id: crypto.randomUUID(),
            parachainId: bidData.parachainId,
            bidder: bidData.bidder,
            amount: bidData.amount,
            firstSlot: bidData.firstSlot,
            lastSlot: bidData.lastSlot,
            blockNumber: this.relayChain.currentBlock,
            timestamp: Date.now()
        };

        auction.bids.push(bid);
        auction.status = 'active';

        console.log(`💰 Bid submitted: ${bid.amount} DOT for parachain ${bid.parachainId}`);
        console.log(`   Slot range: ${bid.firstSlot} - ${bid.lastSlot}`);
        
        return bid;
    }

    finalizeParachainAuction(auctionId) {
        const auction = this.slotAuctions.find(a => a.id === auctionId);
        if (!auction) throw new Error('Auction not found');

        // Determine winner using candle auction mechanism
        const randomEndPoint = auction.startBlock + Math.floor(Math.random() * (auction.endBlock - auction.startBlock));
        const validBids = auction.bids.filter(bid => bid.blockNumber <= randomEndPoint);
        
        if (validBids.length === 0) {
            auction.status = 'no_winner';
            console.log(`🚫 Auction ${auctionId} ended with no winner`);
            return null;
        }

        // Find highest bidder
        const winner = validBids.reduce((highest, current) => 
            current.amount > highest.amount ? current : highest
        );

        auction.winner = winner;
        auction.status = 'completed';
        this.relayChain.availableSlots--;

        console.log(`🎉 Auction winner: Parachain ${winner.parachainId} with ${winner.amount} DOT`);
        console.log(`   Random end point: block ${randomEndPoint}`);
        
        return winner;
    }

    // Crowdloan System
    createCrowdloan(crowdloanData) {
        const crowdloan = {
            id: crypto.randomUUID(),
            parachainId: crowdloanData.parachainId,
            cap: crowdloanData.cap,
            raised: 0,
            end: crowdloanData.end,
            firstPeriod: crowdloanData.firstPeriod,
            lastPeriod: crowdloanData.lastPeriod,
            contributors: new Map(),
            rewardRate: crowdloanData.rewardRate || 0, // Native token rewards per DOT
            status: 'active',
            created: Date.now()
        };

        console.log(`🤝 Crowdloan created for parachain ${crowdloan.parachainId}`);
        console.log(`   Cap: ${crowdloan.cap} DOT`);
        console.log(`   Ends at block: ${crowdloan.end}`);
        
        return crowdloan;
    }

    contributeToCrowdloan(crowdloanId, contributorId, amount) {
        const crowdloan = this.getCrowdloanById(crowdloanId);
        if (!crowdloan) throw new Error('Crowdloan not found');

        if (crowdloan.status !== 'active') {
            throw new Error('Crowdloan is not active');
        }

        if (crowdloan.raised + amount > crowdloan.cap) {
            throw new Error('Contribution would exceed cap');
        }

        if (this.relayChain.currentBlock > crowdloan.end) {
            throw new Error('Crowdloan has ended');
        }

        const existingContribution = crowdloan.contributors.get(contributorId) || 0;
        crowdloan.contributors.set(contributorId, existingContribution + amount);
        crowdloan.raised += amount;

        const rewards = amount * crowdloan.rewardRate;
        
        console.log(`💝 ${contributorId} contributed ${amount} DOT to crowdloan ${crowdloanId}`);
        if (rewards > 0) {
            console.log(`   Expected rewards: ${rewards} tokens`);
        }
        
        return {
            contribution: amount,
            totalContribution: existingContribution + amount,
            expectedRewards: rewards
        };
    }

    getCrowdloanById(id) {
        // This would normally query the crowdloans storage
        return {
            id,
            parachainId: 2000,
            cap: 100000,
            raised: 0,
            end: this.relayChain.currentBlock + 1000,
            firstPeriod: 0,
            lastPeriod: 7,
            contributors: new Map(),
            rewardRate: 10,
            status: 'active',
            created: Date.now()
        };
    }

    // Governance System
    submitProposal(proposalData) {
        const proposal = {
            id: crypto.randomUUID(),
            type: proposalData.type, // 'democracy', 'council', 'technical'
            proposer: proposalData.proposer,
            call: proposalData.call,
            description: proposalData.description,
            deposit: proposalData.deposit || 100000000000, // 10 DOT
            threshold: proposalData.threshold || 'simple_majority',
            delay: proposalData.delay || 100800, // ~1 week
            status: 'proposed',
            votes: { ayes: 0, nays: 0, abstain: 0 },
            voters: new Set(),
            created: Date.now(),
            votingEnd: Date.now() + (proposalData.votingPeriod || 604800000) // 1 week
        };

        this.proposals.set(proposal.id, proposal);
        
        console.log(`📋 Proposal ${proposal.id} submitted: ${proposal.description}`);
        console.log(`   Type: ${proposal.type}`);
        console.log(`   Voting ends: ${new Date(proposal.votingEnd).toISOString()}`);
        
        return proposal;
    }

    voteOnProposal(proposalId, voterId, vote, conviction = 1) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) throw new Error('Proposal not found');

        if (proposal.voters.has(voterId)) {
            throw new Error('Already voted on this proposal');
        }

        if (Date.now() > proposal.votingEnd) {
            throw new Error('Voting period has ended');
        }

        const voter = this.getVoterStake(voterId);
        const votingPower = voter.stake * conviction;

        switch (vote) {
            case 'aye':
                proposal.votes.ayes += votingPower;
                break;
            case 'nay':
                proposal.votes.nays += votingPower;
                break;
            case 'abstain':
                proposal.votes.abstain += votingPower;
                break;
        }

        proposal.voters.add(voterId);
        
        console.log(`🗳️  ${voterId} voted ${vote} on proposal ${proposalId} with ${votingPower} voting power`);
        
        return {
            vote,
            votingPower,
            totalAyes: proposal.votes.ayes,
            totalNays: proposal.votes.nays
        };
    }

    getVoterStake(voterId) {
        // Simplified stake calculation
        return { stake: 10000000000 }; // 1000 DOT
    }

    // Utility Functions
    getActiveValidators() {
        return Array.from(this.validators.values())
            .filter(v => v.active)
            .map(v => v.id);
    }

    getTotalActiveStake() {
        return Array.from(this.validators.values())
            .filter(v => v.active)
            .reduce((sum, v) => sum + v.totalStake, 0);
    }

    checkEraTransition() {
        const blocksPerEra = this.relayChain.epochLength * this.relayChain.sessionsPerEra;
        const blocksSinceGenesis = this.relayChain.currentBlock;
        const expectedEra = Math.floor(blocksSinceGenesis / blocksPerEra) + 1;

        if (expectedEra > this.currentEra) {
            this.transitionToNewEra(expectedEra);
        }
    }

    transitionToNewEra(newEra) {
        console.log(`\n🔄 Era transition: ${this.currentEra} → ${newEra}`);
        
        // Pay validator rewards
        this.distributeValidatorRewards();
        
        // Run new validator election
        this.runValidatorElection();
        
        this.currentEra = newEra;
        console.log(`✅ Era ${newEra} started\n`);
    }

    distributeValidatorRewards() {
        const totalRewards = 1000000000000; // 100 DOT per era
        const activeValidators = Array.from(this.validators.values()).filter(v => v.active);
        
        activeValidators.forEach(validator => {
            const validatorReward = (validator.totalStake / this.getTotalActiveStake()) * totalRewards;
            const commission = validatorReward * validator.commission;
            const nominatorRewards = validatorReward - commission;
            
            validator.points += Math.floor(Math.random() * 100);
            
            // Distribute to nominators
            validator.nominators.forEach((stake, nominatorId) => {
                const nominatorReward = (stake / validator.totalStake) * nominatorRewards;
                const nominator = this.nominators.get(nominatorId);
                if (nominator) {
                    nominator.rewards += nominatorReward;
                }
            });
            
            console.log(`💰 Validator ${validator.id} earned ${commission.toLocaleString()} DOT commission`);
        });
    }

    // Network Statistics
    getNetworkStats() {
        const activeValidators = this.getActiveValidators();
        const totalStake = this.getTotalActiveStake();
        const activeProposals = Array.from(this.proposals.values()).filter(p => p.status === 'proposed').length;
        
        return {
            currentBlock: this.relayChain.currentBlock,
            currentEra: this.currentEra,
            activeValidators: activeValidators.length,
            totalValidators: this.validators.size,
            totalNominators: this.nominators.size,
            totalStake,
            stakingRate: totalStake / (21000000 * Math.pow(10, this.relayChain.tokenDecimals)), // Assuming 21M total supply
            parachains: this.parachains.size,
            availableSlots: this.relayChain.availableSlots,
            activeProposals,
            treasuryBalance: this.treasury.balance,
            lastFinalized: this.relayChain.lastFinalized
        };
    }

    generateNetworkReport() {
        const stats = this.getNetworkStats();
        
        console.log('\n📊 Polkadot Network Report');
        console.log('=' .repeat(40));
        console.log(`Current Block: #${stats.currentBlock} (Era ${stats.currentEra})`);
        console.log(`Last Finalized: #${stats.lastFinalized}`);
        console.log(`Active Validators: ${stats.activeValidators}/${stats.totalValidators}`);
        console.log(`Total Nominators: ${stats.totalNominators}`);
        console.log(`Total Staked: ${(stats.totalStake / Math.pow(10, this.relayChain.tokenDecimals)).toLocaleString()} DOT`);
        console.log(`Staking Rate: ${(stats.stakingRate * 100).toFixed(2)}%`);
        console.log(`Active Parachains: ${stats.parachains}`);
        console.log(`Available Slots: ${stats.availableSlots}`);
        console.log(`Active Proposals: ${stats.activeProposals}`);
        console.log(`Treasury: ${(stats.treasuryBalance / Math.pow(10, this.relayChain.tokenDecimals)).toLocaleString()} DOT`);
        
        return stats;
    }
}

// Demonstration and Testing
function demonstratePolkadotFundamentals() {
    console.log('🔴 Polkadot Fundamentals Demonstration\n');
    
    const polkadot = new PolkadotNetwork();
    
    // Initialize relay chain
    console.log('=== Relay Chain Initialization ===');
    polkadot.initializeRelayChain({
        name: 'Polkadot',
        maxValidators: 297,
        blockTime: 6000
    });

    // Register validators
    console.log('\n=== Validator Registration ===');
    const validators = [
        { id: 'validator_1', stash: 'stash_1', controller: 'ctrl_1', commission: 0.05, selfStake: 1000000000000 },
        { id: 'validator_2', stash: 'stash_2', controller: 'ctrl_2', commission: 0.08, selfStake: 1500000000000 },
        { id: 'validator_3', stash: 'stash_3', controller: 'ctrl_3', commission: 0.10, selfStake: 2000000000000 },
        { id: 'validator_4', stash: 'stash_4', controller: 'ctrl_4', commission: 0.07, selfStake: 1200000000000 },
        { id: 'validator_5', stash: 'stash_5', controller: 'ctrl_5', commission: 0.06, selfStake: 1800000000000 }
    ];

    validators.forEach(v => polkadot.registerValidator(v));

    // Nominate validators
    console.log('\n=== Nominator Registration ===');
    polkadot.nominate('nominator_1', ['validator_1', 'validator_2', 'validator_3'], 5000000000000);
    polkadot.nominate('nominator_2', ['validator_2', 'validator_4', 'validator_5'], 3000000000000);
    polkadot.nominate('nominator_3', ['validator_1', 'validator_4'], 2000000000000);

    // Run validator election
    console.log('\n=== Validator Election ===');
    polkadot.runValidatorElection();

    // Simulate block production
    console.log('\n=== Block Production (BABE + GRANDPA) ===');
    for (let i = 0; i < 10; i++) {
        polkadot.generateBABESlot();
        // Small delay to simulate block time
        if (i < 9) {
            setTimeout(() => {}, 100);
        }
    }

    // Create parachain slot auction
    console.log('\n=== Parachain Slot Auction ===');
    const auction = polkadot.createParachainSlotAuction({
        delayBlocks: 50,
        durationBlocks: 200,
        leasePeriods: 8
    });

    // Submit bids
    polkadot.submitParachainBid(auction.id, {
        parachainId: 2000,
        bidder: 'acala_team',
        amount: 3200000000000000, // 320,000 DOT
        firstSlot: 0,
        lastSlot: 7
    });

    polkadot.submitParachainBid(auction.id, {
        parachainId: 2001,
        bidder: 'moonbeam_team',
        amount: 2800000000000000, // 280,000 DOT
        firstSlot: 0,
        lastSlot: 7
    });

    // Simulate auction progression
    polkadot.relayChain.currentBlock += 300;
    polkadot.finalizeParachainAuction(auction.id);

    // Create crowdloan
    console.log('\n=== Crowdloan System ===');
    const crowdloan = polkadot.createCrowdloan({
        parachainId: 2002,
        cap: 2000000000000000, // 200,000 DOT
        end: polkadot.relayChain.currentBlock + 1000,
        firstPeriod: 0,
        lastPeriod: 7,
        rewardRate: 15 // 15 native tokens per DOT
    });

    // Simulate contributions
    polkadot.contributeToCrowdloan(crowdloan.id, 'contributor_1', 10000000000000);
    polkadot.contributeToCrowdloan(crowdloan.id, 'contributor_2', 25000000000000);
    polkadot.contributeToCrowdloan(crowdloan.id, 'contributor_3', 50000000000000);

    // Governance proposals
    console.log('\n=== Governance System ===');
    const proposal = polkadot.submitProposal({
        type: 'democracy',
        proposer: 'community_member',
        call: 'runtime_upgrade',
        description: 'Upgrade runtime to support async backing',
        votingPeriod: 604800000 // 1 week
    });

    // Vote on proposal
    polkadot.voteOnProposal(proposal.id, 'validator_1', 'aye', 6);
    polkadot.voteOnProposal(proposal.id, 'validator_2', 'aye', 4);
    polkadot.voteOnProposal(proposal.id, 'nominator_1', 'nay', 2);

    // Generate network report
    console.log('\n=== Network Statistics ===');
    polkadot.generateNetworkReport();

    console.log('\n✅ Polkadot Fundamentals demonstration completed!');
    console.log('📚 Key concepts demonstrated:');
    console.log('   • Relay chain architecture and configuration');
    console.log('   • BABE block production algorithm');
    console.log('   • GRANDPA finality mechanism');
    console.log('   • Nominated Proof of Stake (NPoS)');
    console.log('   • Validator election and reward distribution');
    console.log('   • Parachain slot auctions and bidding');
    console.log('   • Crowdloan funding mechanisms');
    console.log('   • On-chain governance and voting');

    return polkadot;
}

// Run demonstration
if (require.main === module) {
    demonstratePolkadotFundamentals();
}

module.exports = {
    PolkadotNetwork,
    demonstratePolkadotFundamentals
};
