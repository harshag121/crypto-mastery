// Governance and DAOs - Module 5
// Master on-chain governance and decentralized autonomous organizations

console.log("🏛️ Governance and DAOs - Module 5");
console.log("=================================");

// =============================================
// 1. COSMOS GOVERNANCE OVERVIEW
// =============================================

class CosmosGovernance {
    constructor() {
        this.proposals = new Map();
        this.votes = new Map();
        this.validators = new Map();
        this.delegations = new Map();
        this.communityPool = 0;
        this.setupGovernance();
    }

    setupGovernance() {
        // Initialize governance parameters
        this.parameters = {
            votingPeriod: 14 * 24 * 3600, // 14 days in seconds
            minDeposit: 64000000, // 64 ATOM in uatom
            quorum: 0.334, // 33.4%
            threshold: 0.5, // 50%
            vetoThreshold: 0.334, // 33.4%
            maxDepositPeriod: 14 * 24 * 3600, // 14 days
            burnRate: 0.5 // 50% of deposit burned on veto
        };

        // Initialize community pool
        this.communityPool = 1500000000000; // 1.5M ATOM in uatom

        // Setup initial validators
        const validators = [
            { address: "cosmosvaloper1...", name: "Validator A", votingPower: 5000000, commission: 0.05 },
            { address: "cosmosvaloper2...", name: "Validator B", votingPower: 3000000, commission: 0.08 },
            { address: "cosmosvaloper3...", name: "Validator C", votingPower: 2000000, commission: 0.1 }
        ];

        validators.forEach(val => this.validators.set(val.address, val));
    }

    explainGovernance() {
        console.log("\n🏛️ COSMOS GOVERNANCE SYSTEM");
        console.log("===========================");

        console.log("Governance enables the community to:");
        const capabilities = [
            "Upgrade the network software",
            "Change network parameters",
            "Allocate community pool funds",
            "Signal community sentiment",
            "Manage validator set changes"
        ];

        capabilities.forEach(capability => console.log(`• ${capability}`));

        console.log("\nKey Parameters:");
        Object.entries(this.parameters).forEach(([param, value]) => {
            let displayValue = value;
            if (param.includes('Period') || param.includes('period')) {
                displayValue = `${value / (24 * 3600)} days`;
            } else if (param === 'minDeposit') {
                displayValue = `${value / 1000000} ATOM`;
            } else if (typeof value === 'number' && value < 1) {
                displayValue = `${(value * 100).toFixed(1)}%`;
            }
            console.log(`• ${param}: ${displayValue}`);
        });
    }

    demonstrateProposalTypes() {
        console.log("\n📜 PROPOSAL TYPES");
        console.log("=================");

        const proposalTypes = {
            "Text Proposal": {
                purpose: "Signal community opinion",
                binding: false,
                execution: "Manual community action",
                example: "Should we rebrand the hub?"
            },
            "Parameter Change": {
                purpose: "Modify chain parameters",
                binding: true,
                execution: "Automatic on passage",
                example: "Increase block size limit"
            },
            "Software Upgrade": {
                purpose: "Coordinate network upgrades",
                binding: true,
                execution: "Validator upgrade required",
                example: "Upgrade to Cosmos SDK v0.50"
            },
            "Community Pool Spend": {
                purpose: "Allocate community funds",
                binding: true,
                execution: "Automatic fund transfer",
                example: "Fund development team"
            }
        };

        Object.entries(proposalTypes).forEach(([type, details]) => {
            console.log(`\n${type}:`);
            console.log(`  Purpose: ${details.purpose}`);
            console.log(`  Binding: ${details.binding ? "Yes" : "No"}`);
            console.log(`  Execution: ${details.execution}`);
            console.log(`  Example: "${details.example}"`);
        });
    }
}

// =============================================
// 2. PROPOSAL LIFECYCLE MANAGEMENT
// =============================================

class ProposalManager {
    constructor(governance) {
        this.governance = governance;
        this.proposalCounter = 0;
    }

    // Submit a new proposal
    submitProposal(submitter, title, description, type, deposit = 0) {
        console.log("\n📝 SUBMITTING PROPOSAL");
        console.log("======================");

        const proposalId = ++this.proposalCounter;
        const now = Date.now();

        const proposal = {
            id: proposalId,
            title,
            description,
            type,
            submitter,
            status: deposit >= this.governance.parameters.minDeposit ? "VOTING_PERIOD" : "DEPOSIT_PERIOD",
            submitTime: now,
            depositEndTime: now + (this.governance.parameters.maxDepositPeriod * 1000),
            votingStartTime: deposit >= this.governance.parameters.minDeposit ? now : null,
            votingEndTime: deposit >= this.governance.parameters.minDeposit ? 
                now + (this.governance.parameters.votingPeriod * 1000) : null,
            totalDeposit: deposit,
            deposits: new Map([[submitter, deposit]]),
            votes: new Map(),
            tallyResult: { yes: 0, no: 0, abstain: 0, veto: 0 }
        };

        this.governance.proposals.set(proposalId, proposal);

        console.log(`Proposal #${proposalId}: "${title}"`);
        console.log(`Type: ${type}`);
        console.log(`Status: ${proposal.status}`);
        console.log(`Initial Deposit: ${(deposit / 1000000).toFixed(2)} ATOM`);
        console.log(`Required Deposit: ${(this.governance.parameters.minDeposit / 1000000).toFixed(2)} ATOM`);

        if (proposal.status === "VOTING_PERIOD") {
            console.log(`Voting ends: ${new Date(proposal.votingEndTime).toLocaleString()}`);
        }

        return proposalId;
    }

    // Add deposit to proposal
    addDeposit(proposalId, depositor, amount) {
        console.log(`\n💰 ADDING DEPOSIT TO PROPOSAL #${proposalId}`);
        console.log("==========================================");

        const proposal = this.governance.proposals.get(proposalId);
        if (!proposal) throw new Error("Proposal not found");

        if (proposal.status !== "DEPOSIT_PERIOD") {
            throw new Error("Proposal not in deposit period");
        }

        // Add to deposits
        const currentDeposit = proposal.deposits.get(depositor) || 0;
        proposal.deposits.set(depositor, currentDeposit + amount);
        proposal.totalDeposit += amount;

        console.log(`Deposited: ${(amount / 1000000).toFixed(2)} ATOM`);
        console.log(`Total Deposit: ${(proposal.totalDeposit / 1000000).toFixed(2)} ATOM`);
        console.log(`Required: ${(this.governance.parameters.minDeposit / 1000000).toFixed(2)} ATOM`);

        // Check if minimum deposit reached
        if (proposal.totalDeposit >= this.governance.parameters.minDeposit) {
            proposal.status = "VOTING_PERIOD";
            proposal.votingStartTime = Date.now();
            proposal.votingEndTime = Date.now() + (this.governance.parameters.votingPeriod * 1000);
            
            console.log("\n✅ Minimum deposit reached!");
            console.log("🗳️  Proposal moved to voting period");
            console.log(`Voting ends: ${new Date(proposal.votingEndTime).toLocaleString()}`);
        }

        return proposal.totalDeposit;
    }

    // Vote on proposal
    vote(proposalId, voter, option, votingPower) {
        console.log(`\n🗳️  VOTING ON PROPOSAL #${proposalId}`);
        console.log("===============================");

        const proposal = this.governance.proposals.get(proposalId);
        if (!proposal) throw new Error("Proposal not found");

        if (proposal.status !== "VOTING_PERIOD") {
            throw new Error("Proposal not in voting period");
        }

        if (Date.now() > proposal.votingEndTime) {
            throw new Error("Voting period has ended");
        }

        const validOptions = ["yes", "no", "abstain", "veto"];
        if (!validOptions.includes(option)) {
            throw new Error("Invalid vote option");
        }

        // Record vote
        proposal.votes.set(voter, { option, power: votingPower, timestamp: Date.now() });

        console.log(`Voter: ${voter}`);
        console.log(`Vote: ${option.toUpperCase()}`);
        console.log(`Voting Power: ${(votingPower / 1000000).toFixed(2)} ATOM`);
        console.log(`Votes Cast: ${proposal.votes.size}`);

        // Calculate current tally
        this.calculateTally(proposalId);

        return proposal.votes.size;
    }

    // Calculate vote tally
    calculateTally(proposalId) {
        const proposal = this.governance.proposals.get(proposalId);
        const tally = { yes: 0, no: 0, abstain: 0, veto: 0 };

        proposal.votes.forEach(vote => {
            tally[vote.option] += vote.power;
        });

        proposal.tallyResult = tally;

        const totalVotingPower = Object.values(tally).reduce((sum, power) => sum + power, 0);
        const totalStaked = 10000000000000; // 10M ATOM total staked

        console.log("\n📊 Current Tally:");
        Object.entries(tally).forEach(([option, power]) => {
            const percentage = totalVotingPower > 0 ? (power / totalVotingPower * 100).toFixed(1) : "0.0";
            console.log(`  ${option.toUpperCase()}: ${(power / 1000000).toFixed(2)} ATOM (${percentage}%)`);
        });

        const participation = (totalVotingPower / totalStaked * 100).toFixed(1);
        console.log(`\nParticipation: ${participation}%`);
        console.log(`Quorum Required: ${(this.governance.parameters.quorum * 100).toFixed(1)}%`);

        return tally;
    }

    // Execute proposal after voting period
    executeProposal(proposalId) {
        console.log(`\n⚡ EXECUTING PROPOSAL #${proposalId}`);
        console.log("===============================");

        const proposal = this.governance.proposals.get(proposalId);
        if (!proposal) throw new Error("Proposal not found");

        if (Date.now() < proposal.votingEndTime) {
            throw new Error("Voting period not ended");
        }

        // Calculate final results
        const tally = this.calculateTally(proposalId);
        const totalVotes = Object.values(tally).reduce((sum, power) => sum + power, 0);
        const totalStaked = 10000000000000;

        // Check quorum
        const participation = totalVotes / totalStaked;
        if (participation < this.governance.parameters.quorum) {
            proposal.status = "REJECTED";
            console.log("❌ Proposal REJECTED - Insufficient quorum");
            this.burnDeposits(proposal, 0); // No burn for quorum failure
            return "REJECTED";
        }

        // Check for veto
        const vetoRatio = tally.veto / totalVotes;
        if (vetoRatio >= this.governance.parameters.vetoThreshold) {
            proposal.status = "REJECTED";
            console.log("🔥 Proposal VETOED - Burning deposits");
            this.burnDeposits(proposal, this.governance.parameters.burnRate);
            return "VETOED";
        }

        // Check threshold (exclude abstain votes)
        const votesExcludingAbstain = tally.yes + tally.no + tally.veto;
        const yesRatio = tally.yes / votesExcludingAbstain;

        if (yesRatio >= this.governance.parameters.threshold) {
            proposal.status = "PASSED";
            console.log("✅ Proposal PASSED");
            this.returnDeposits(proposal);
            this.executeProposalAction(proposal);
            return "PASSED";
        } else {
            proposal.status = "REJECTED";
            console.log("❌ Proposal REJECTED - Insufficient yes votes");
            this.burnDeposits(proposal, 0);
            return "REJECTED";
        }
    }

    executeProposalAction(proposal) {
        console.log("\n🔧 Executing proposal action...");

        switch (proposal.type) {
            case "TEXT":
                console.log("📄 Text proposal - No automatic action");
                break;
            case "PARAMETER_CHANGE":
                console.log("⚙️ Applying parameter changes");
                // Would update chain parameters
                break;
            case "SOFTWARE_UPGRADE":
                console.log("🚀 Scheduling software upgrade");
                // Would schedule upgrade at specific height
                break;
            case "COMMUNITY_POOL_SPEND":
                console.log("💰 Transferring community pool funds");
                // Would transfer funds from community pool
                break;
        }
    }

    returnDeposits(proposal) {
        console.log("💰 Returning deposits to contributors");
        proposal.deposits.forEach((amount, depositor) => {
            console.log(`  Returned ${(amount / 1000000).toFixed(2)} ATOM to ${depositor}`);
        });
    }

    burnDeposits(proposal, burnRate) {
        if (burnRate > 0) {
            console.log(`🔥 Burning ${(burnRate * 100).toFixed(0)}% of deposits`);
        }
        proposal.deposits.forEach((amount, depositor) => {
            const burned = amount * burnRate;
            const returned = amount - burned;
            if (burned > 0) {
                console.log(`  Burned ${(burned / 1000000).toFixed(2)} ATOM from ${depositor}`);
            }
            if (returned > 0) {
                console.log(`  Returned ${(returned / 1000000).toFixed(2)} ATOM to ${depositor}`);
            }
        });
    }
}

// =============================================
// 3. DAO IMPLEMENTATION
// =============================================

class DecentralizedDAO {
    constructor() {
        this.treasury = new Map();
        this.members = new Map();
        this.proposals = new Map();
        this.votingStrategies = new Map();
        this.proposalCounter = 0;
        this.setupDAO();
    }

    setupDAO() {
        // Initialize DAO treasury
        this.treasury.set("ATOM", 100000000000); // 100k ATOM
        this.treasury.set("OSMO", 500000000000); // 500k OSMO
        this.treasury.set("USDC", 1000000000000); // 1M USDC

        // Setup initial members
        const members = [
            { address: "cosmos1founder", tokens: 10000000000, reputation: 100, joinDate: Date.now() - 365*24*3600*1000 },
            { address: "cosmos1dev1", tokens: 5000000000, reputation: 85, joinDate: Date.now() - 180*24*3600*1000 },
            { address: "cosmos1community", tokens: 2000000000, reputation: 70, joinDate: Date.now() - 90*24*3600*1000 }
        ];

        members.forEach(member => this.members.set(member.address, member));

        // Setup voting strategies
        this.votingStrategies.set("token_weighted", {
            name: "Token Weighted Voting",
            calculatePower: (member) => member.tokens
        });

        this.votingStrategies.set("quadratic", {
            name: "Quadratic Voting",
            calculatePower: (member) => Math.sqrt(member.tokens)
        });

        this.votingStrategies.set("reputation", {
            name: "Reputation Based",
            calculatePower: (member) => member.tokens * (member.reputation / 100)
        });
    }

    demonstrateDAO() {
        console.log("\n🏢 DECENTRALIZED AUTONOMOUS ORGANIZATION");
        console.log("=======================================");

        console.log("DAO Features:");
        const features = [
            "Community-owned treasury",
            "Proposal-based decision making",
            "Multiple voting mechanisms", 
            "Automatic execution",
            "Transparent governance"
        ];

        features.forEach(feature => console.log(`• ${feature}`));

        console.log(`\n💰 Treasury Assets:`);
        this.treasury.forEach((amount, asset) => {
            console.log(`• ${(amount / 1000000).toLocaleString()} ${asset}`);
        });

        console.log(`\n👥 Members: ${this.members.size}`);
        this.members.forEach((member, address) => {
            const tokens = (member.tokens / 1000000).toFixed(0);
            console.log(`• ${address}: ${tokens}K tokens, ${member.reputation} reputation`);
        });
    }

    // Create DAO proposal
    createDAOProposal(creator, title, description, action, votingStrategy = "token_weighted") {
        console.log("\n📋 CREATING DAO PROPOSAL");
        console.log("========================");

        if (!this.members.has(creator)) {
            throw new Error("Only DAO members can create proposals");
        }

        const proposalId = ++this.proposalCounter;
        const proposal = {
            id: proposalId,
            title,
            description,
            creator,
            action, // { type, target, amount, recipient }
            votingStrategy,
            status: "ACTIVE",
            createdAt: Date.now(),
            endsAt: Date.now() + (7 * 24 * 3600 * 1000), // 7 days
            votes: new Map(),
            executed: false
        };

        this.proposals.set(proposalId, proposal);

        console.log(`Proposal #${proposalId}: "${title}"`);
        console.log(`Creator: ${creator}`);
        console.log(`Voting Strategy: ${this.votingStrategies.get(votingStrategy).name}`);
        console.log(`Voting Period: 7 days`);

        if (action.type === "SPEND") {
            console.log(`Spending: ${(action.amount / 1000000).toLocaleString()} ${action.asset}`);
            console.log(`Recipient: ${action.recipient}`);
        }

        return proposalId;
    }

    // Vote on DAO proposal
    voteOnDAOProposal(proposalId, voter, support) {
        console.log(`\n🗳️  DAO VOTE - PROPOSAL #${proposalId}`);
        console.log("===============================");

        const proposal = this.proposals.get(proposalId);
        if (!proposal) throw new Error("Proposal not found");

        const member = this.members.get(voter);
        if (!member) throw new Error("Only DAO members can vote");

        if (proposal.status !== "ACTIVE") {
            throw new Error("Proposal not active");
        }

        if (Date.now() > proposal.endsAt) {
            throw new Error("Voting period ended");
        }

        // Calculate voting power based on strategy
        const strategy = this.votingStrategies.get(proposal.votingStrategy);
        const votingPower = strategy.calculatePower(member);

        proposal.votes.set(voter, {
            support,
            power: votingPower,
            timestamp: Date.now()
        });

        console.log(`Voter: ${voter}`);
        console.log(`Vote: ${support ? "FOR" : "AGAINST"}`);
        console.log(`Voting Power: ${(votingPower / 1000000).toFixed(2)}`);

        // Calculate current results
        this.calculateDAOResults(proposalId);

        return votingPower;
    }

    // Calculate DAO voting results
    calculateDAOResults(proposalId) {
        const proposal = this.proposals.get(proposalId);
        let forVotes = 0;
        let againstVotes = 0;
        let totalPower = 0;

        proposal.votes.forEach(vote => {
            if (vote.support) {
                forVotes += vote.power;
            } else {
                againstVotes += vote.power;
            }
            totalPower += vote.power;
        });

        const forPercentage = totalPower > 0 ? (forVotes / totalPower * 100).toFixed(1) : "0.0";
        const againstPercentage = totalPower > 0 ? (againstVotes / totalPower * 100).toFixed(1) : "0.0";

        console.log("\n📊 Current Results:");
        console.log(`  FOR: ${(forVotes / 1000000).toFixed(2)} (${forPercentage}%)`);
        console.log(`  AGAINST: ${(againstVotes / 1000000).toFixed(2)} (${againstPercentage}%)`);
        console.log(`  Votes Cast: ${proposal.votes.size}`);

        return { forVotes, againstVotes, totalPower };
    }

    // Execute DAO proposal
    executeDAOProposal(proposalId) {
        console.log(`\n⚡ EXECUTING DAO PROPOSAL #${proposalId}`);
        console.log("==================================");

        const proposal = this.proposals.get(proposalId);
        if (!proposal) throw new Error("Proposal not found");

        if (Date.now() < proposal.endsAt) {
            throw new Error("Voting period not ended");
        }

        if (proposal.executed) {
            throw new Error("Proposal already executed");
        }

        const { forVotes, againstVotes } = this.calculateDAOResults(proposalId);

        // Check if proposal passes (simple majority)
        if (forVotes > againstVotes && forVotes > 0) {
            proposal.status = "PASSED";
            proposal.executed = true;

            console.log("✅ Proposal PASSED");
            this.executeDAOAction(proposal);
        } else {
            proposal.status = "REJECTED";
            console.log("❌ Proposal REJECTED");
        }

        return proposal.status;
    }

    executeDAOAction(proposal) {
        const action = proposal.action;

        switch (action.type) {
            case "SPEND":
                console.log(`💰 Transferring ${(action.amount / 1000000).toLocaleString()} ${action.asset}`);
                console.log(`📍 To: ${action.recipient}`);
                
                const currentBalance = this.treasury.get(action.asset) || 0;
                if (currentBalance >= action.amount) {
                    this.treasury.set(action.asset, currentBalance - action.amount);
                    console.log("✅ Transfer completed");
                } else {
                    console.log("❌ Insufficient treasury balance");
                }
                break;

            case "PARAMETER_CHANGE":
                console.log(`⚙️ Changing parameter: ${action.parameter}`);
                console.log(`📊 New value: ${action.value}`);
                console.log("✅ Parameter updated");
                break;

            case "MEMBERSHIP":
                console.log(`👥 Adding new member: ${action.member}`);
                this.members.set(action.member, {
                    address: action.member,
                    tokens: action.initialTokens || 0,
                    reputation: 50,
                    joinDate: Date.now()
                });
                console.log("✅ Member added");
                break;
        }
    }
}

// =============================================
// 4. VALIDATOR GOVERNANCE
// =============================================

class ValidatorGovernance {
    constructor() {
        this.validators = new Map();
        this.delegations = new Map();
        this.slashingEvents = new Map();
        this.commissionChanges = new Map();
        this.setupValidators();
    }

    setupValidators() {
        const validators = [
            {
                address: "cosmosvaloper1validator1",
                moniker: "Cosmos Hub Validator",
                commission: 0.05,
                maxCommission: 0.20,
                maxChangeRate: 0.01,
                minSelfDelegation: 1000000,
                votingPower: 5000000000000,
                jailed: false,
                uptime: 0.998
            },
            {
                address: "cosmosvaloper2validator2", 
                moniker: "Staking Facilities",
                commission: 0.08,
                maxCommission: 0.15,
                maxChangeRate: 0.02,
                minSelfDelegation: 500000,
                votingPower: 3000000000000,
                jailed: false,
                uptime: 0.995
            }
        ];

        validators.forEach(val => this.validators.set(val.address, val));
    }

    demonstrateValidatorGovernance() {
        console.log("\n⚖️  VALIDATOR GOVERNANCE");
        console.log("========================");

        console.log("Validator responsibilities:");
        const responsibilities = [
            "Vote on governance proposals",
            "Maintain high uptime and performance", 
            "Set reasonable commission rates",
            "Engage with delegator community",
            "Upgrade node software promptly"
        ];

        responsibilities.forEach(resp => console.log(`• ${resp}`));

        console.log("\nValidator Set:");
        this.validators.forEach(validator => {
            const power = (validator.votingPower / 1000000000000).toFixed(1);
            console.log(`• ${validator.moniker}: ${power}M voting power, ${(validator.commission * 100).toFixed(1)}% commission`);
        });
    }

    // Validator votes on proposal
    validatorVote(validatorAddress, proposalId, option, justification) {
        console.log(`\n🏛️ VALIDATOR VOTE`);
        console.log("=================");

        const validator = this.validators.get(validatorAddress);
        if (!validator) throw new Error("Validator not found");

        if (validator.jailed) {
            throw new Error("Jailed validators cannot vote");
        }

        console.log(`Validator: ${validator.moniker}`);
        console.log(`Vote: ${option.toUpperCase()}`);
        console.log(`Voting Power: ${(validator.votingPower / 1000000000000).toFixed(2)}M ATOM`);
        console.log(`Justification: "${justification}"`);

        // Record vote (would be stored on-chain)
        const vote = {
            validator: validatorAddress,
            proposal: proposalId,
            option,
            justification,
            timestamp: Date.now(),
            votingPower: validator.votingPower
        };

        console.log("✅ Vote recorded on-chain");
        return vote;
    }

    // Change validator commission
    changeCommission(validatorAddress, newCommission) {
        console.log(`\n📊 COMMISSION CHANGE`);
        console.log("====================");

        const validator = this.validators.get(validatorAddress);
        if (!validator) throw new Error("Validator not found");

        const oldCommission = validator.commission;

        // Check constraints
        if (newCommission > validator.maxCommission) {
            throw new Error("Commission exceeds maximum");
        }

        const maxChange = validator.maxChangeRate;
        if (Math.abs(newCommission - oldCommission) > maxChange) {
            throw new Error("Commission change exceeds maximum rate");
        }

        validator.commission = newCommission;

        console.log(`Validator: ${validator.moniker}`);
        console.log(`Old Commission: ${(oldCommission * 100).toFixed(2)}%`);
        console.log(`New Commission: ${(newCommission * 100).toFixed(2)}%`);
        console.log(`Change: ${((newCommission - oldCommission) * 100).toFixed(2)}%`);

        // Record commission change
        const changeRecord = {
            validator: validatorAddress,
            oldCommission,
            newCommission,
            timestamp: Date.now(),
            height: Math.floor(Math.random() * 1000000) + 8000000
        };

        console.log("✅ Commission change applied");
        return changeRecord;
    }

    // Slash validator for misbehavior
    slashValidator(validatorAddress, reason, slashPercentage) {
        console.log(`\n⚡ VALIDATOR SLASHING`);
        console.log("====================");

        const validator = this.validators.get(validatorAddress);
        if (!validator) throw new Error("Validator not found");

        const slashAmount = validator.votingPower * slashPercentage;
        validator.votingPower -= slashAmount;

        if (reason === "downtime" && slashPercentage > 0.001) {
            validator.jailed = true;
        } else if (reason === "double_sign") {
            validator.jailed = true;
        }

        console.log(`Validator: ${validator.moniker}`);
        console.log(`Reason: ${reason}`);
        console.log(`Slash Percentage: ${(slashPercentage * 100).toFixed(2)}%`);
        console.log(`Amount Slashed: ${(slashAmount / 1000000000000).toFixed(2)}M ATOM`);
        console.log(`Remaining Power: ${(validator.votingPower / 1000000000000).toFixed(2)}M ATOM`);

        if (validator.jailed) {
            console.log("🔒 Validator JAILED");
        }

        const slashingEvent = {
            validator: validatorAddress,
            reason,
            slashPercentage,
            slashAmount,
            timestamp: Date.now(),
            height: Math.floor(Math.random() * 1000000) + 8000000
        };

        return slashingEvent;
    }
}

// =============================================
// 5. LIQUID DEMOCRACY IMPLEMENTATION
// =============================================

class LiquidDemocracy {
    constructor() {
        this.delegations = new Map(); // delegator -> delegate
        this.votes = new Map(); // voter -> vote
        this.delegationChains = new Map();
    }

    demonstrateLiquidDemocracy() {
        console.log("\n🌊 LIQUID DEMOCRACY");
        console.log("===================");

        console.log("Liquid Democracy enables:");
        const features = [
            "Delegate voting power to experts",
            "Override delegate votes directly",
            "Delegate different topics to different experts",
            "Revoke delegations at any time",
            "Transitive delegation chains"
        ];

        features.forEach(feature => console.log(`• ${feature}`));

        // Demonstrate delegation
        this.delegateVote("alice", "expert1", "DeFi");
        this.delegateVote("bob", "expert2", "Infrastructure");
        this.delegateVote("charlie", "expert1", "All");

        // Show voting with delegations
        this.voteWithDelegation("proposal1", "expert1", "yes");
        this.overrideVote("proposal1", "alice", "no");
    }

    // Delegate voting power
    delegateVote(delegator, delegate, category = "All") {
        console.log(`\n🔗 CREATING DELEGATION`);
        console.log("======================");

        const delegationKey = `${delegator}_${category}`;
        this.delegations.set(delegationKey, {
            delegator,
            delegate,
            category,
            timestamp: Date.now(),
            active: true
        });

        console.log(`${delegator} → ${delegate} (${category})`);
        console.log("✅ Delegation created");

        return delegationKey;
    }

    // Vote with delegation power
    voteWithDelegation(proposalId, voter, option) {
        console.log(`\n🗳️  LIQUID DEMOCRACY VOTE`);
        console.log("=========================");

        // Count direct voting power
        let votingPower = this.getDirectVotingPower(voter);

        // Count delegated power
        const delegatedPower = this.getDelegatedVotingPower(voter, proposalId);
        votingPower += delegatedPower;

        const vote = {
            proposalId,
            voter,
            option,
            directPower: this.getDirectVotingPower(voter),
            delegatedPower,
            totalPower: votingPower,
            timestamp: Date.now()
        };

        this.votes.set(`${proposalId}_${voter}`, vote);

        console.log(`Voter: ${voter}`);
        console.log(`Vote: ${option.toUpperCase()}`);
        console.log(`Direct Power: ${vote.directPower.toLocaleString()}`);
        console.log(`Delegated Power: ${vote.delegatedPower.toLocaleString()}`);
        console.log(`Total Power: ${vote.totalPower.toLocaleString()}`);

        return vote;
    }

    // Override delegate vote
    overrideVote(proposalId, voter, option) {
        console.log(`\n🔄 OVERRIDING DELEGATION`);
        console.log("========================");

        // Remove delegated power from delegate's vote
        const delegate = this.findDelegate(voter);
        if (delegate) {
            const delegateVoteKey = `${proposalId}_${delegate}`;
            const delegateVote = this.votes.get(delegateVoteKey);
            
            if (delegateVote) {
                const voterPower = this.getDirectVotingPower(voter);
                delegateVote.delegatedPower -= voterPower;
                delegateVote.totalPower -= voterPower;
                
                console.log(`Removed ${voterPower.toLocaleString()} power from ${delegate}`);
            }
        }

        // Cast direct vote
        const directVote = this.voteWithDelegation(proposalId, voter, option);
        directVote.overridden = true;

        console.log("✅ Vote override successful");
        return directVote;
    }

    getDirectVotingPower(voter) {
        // Simplified - would get from staking module
        const stakingAmounts = {
            "alice": 1000000,
            "bob": 2000000,
            "charlie": 500000,
            "expert1": 3000000,
            "expert2": 2500000
        };
        
        return stakingAmounts[voter] || 0;
    }

    getDelegatedVotingPower(delegate, proposalId) {
        let delegatedPower = 0;

        this.delegations.forEach(delegation => {
            if (delegation.delegate === delegate && delegation.active) {
                // Check if delegator has overridden this specific vote
                const overrideVote = this.votes.get(`${proposalId}_${delegation.delegator}`);
                if (!overrideVote || !overrideVote.overridden) {
                    delegatedPower += this.getDirectVotingPower(delegation.delegator);
                }
            }
        });

        return delegatedPower;
    }

    findDelegate(delegator) {
        for (let [key, delegation] of this.delegations) {
            if (delegation.delegator === delegator && delegation.active) {
                return delegation.delegate;
            }
        }
        return null;
    }
}

// =============================================
// 6. GOVERNANCE ANALYTICS AND MONITORING
// =============================================

class GovernanceAnalytics {
    constructor() {
        this.metrics = new Map();
        this.participationHistory = [];
        this.proposalHistory = [];
    }

    demonstrateAnalytics() {
        console.log("\n📊 GOVERNANCE ANALYTICS");
        console.log("=======================");

        this.generateMetrics();
        this.analyzeParticipation();
        this.trackProposalTrends();
        this.identifyInfluentialVoters();
    }

    generateMetrics() {
        console.log("\n📈 KEY METRICS");
        console.log("==============");

        const metrics = {
            "Total Proposals": 47,
            "Passed Proposals": 34,
            "Rejected Proposals": 11,
            "Vetoed Proposals": 2,
            "Average Participation": "38.2%",
            "Average Voting Period": "13.8 days",
            "Total Community Pool": "$2.4M",
            "Funds Allocated": "$450K"
        };

        Object.entries(metrics).forEach(([metric, value]) => {
            console.log(`• ${metric}: ${value}`);
        });

        const passRate = (34 / 47 * 100).toFixed(1);
        const vetoRate = (2 / 47 * 100).toFixed(1);
        
        console.log(`\n📊 Success Rates:`);
        console.log(`• Pass Rate: ${passRate}%`);
        console.log(`• Veto Rate: ${vetoRate}%`);
    }

    analyzeParticipation() {
        console.log("\n👥 PARTICIPATION ANALYSIS");
        console.log("=========================");

        const participationTrends = [
            { period: "Q1 2024", participation: 42.1, proposals: 12 },
            { period: "Q2 2024", participation: 38.7, proposals: 15 },
            { period: "Q3 2024", participation: 35.2, proposals: 10 },
            { period: "Q4 2024", participation: 40.8, proposals: 10 }
        ];

        console.log("Quarterly Participation:");
        participationTrends.forEach(quarter => {
            console.log(`• ${quarter.period}: ${quarter.participation}% (${quarter.proposals} proposals)`);
        });

        const avgParticipation = participationTrends.reduce((sum, q) => sum + q.participation, 0) / 4;
        console.log(`\nAverage Participation: ${avgParticipation.toFixed(1)}%`);

        console.log("\nParticipation Factors:");
        console.log("• Higher for upgrade proposals");
        console.log("• Lower for text proposals");
        console.log("• Increased with validator education");
        console.log("• Correlated with proposal importance");
    }

    trackProposalTrends() {
        console.log("\n📋 PROPOSAL TRENDS");
        console.log("==================");

        const proposalTypes = {
            "Software Upgrade": { count: 18, passRate: 94.4 },
            "Parameter Change": { count: 15, passRate: 73.3 },
            "Community Spend": { count: 10, passRate: 60.0 },
            "Text Proposal": { count: 4, passRate: 50.0 }
        };

        console.log("Proposal Types:");
        Object.entries(proposalTypes).forEach(([type, data]) => {
            console.log(`• ${type}: ${data.count} proposals, ${data.passRate}% pass rate`);
        });

        console.log("\nTrend Analysis:");
        console.log("• Software upgrades have highest success rate");
        console.log("• Community spending faces more scrutiny");
        console.log("• Parameter changes often contentious");
        console.log("• Text proposals used for signaling");
    }

    identifyInfluentialVoters() {
        console.log("\n🎯 INFLUENTIAL VOTERS");
        console.log("=====================");

        const influentialVoters = [
            { entity: "Binance Staking", votingPower: 8.2, proposals: 45, alignment: "Conservative" },
            { entity: "Coinbase Custody", votingPower: 6.8, proposals: 42, alignment: "Moderate" },
            { entity: "Kraken", votingPower: 4.9, proposals: 47, alignment: "Progressive" },
            { entity: "Figment", votingPower: 3.1, proposals: 46, alignment: "Technical" },
            { entity: "Chorus One", votingPower: 2.8, proposals: 47, alignment: "Community" }
        ];

        console.log("Top Validators by Influence:");
        influentialVoters.forEach((voter, index) => {
            console.log(`${index + 1}. ${voter.entity}: ${voter.votingPower}% power, ${voter.proposals}/47 votes, ${voter.alignment}`);
        });

        console.log("\nVoting Patterns:");
        console.log("• Large exchanges tend to be conservative");
        console.log("• Community validators more likely to support spending");
        console.log("• Technical validators focus on upgrade quality");
        console.log("• Geographic distribution affects timing");
    }
}

// =============================================
// MAIN EXECUTION
// =============================================

function runGovernanceModule() {
    console.log("Starting Governance and DAOs Tutorial...\n");

    // Cosmos Governance Overview
    const governance = new CosmosGovernance();
    governance.explainGovernance();
    governance.demonstrateProposalTypes();

    // Proposal Lifecycle
    const proposalManager = new ProposalManager(governance);
    
    // Create and manage a proposal
    const proposalId = proposalManager.submitProposal(
        "cosmos1proposer",
        "Increase Block Size Limit",
        "Proposal to increase the maximum block size from 200KB to 400KB to improve throughput",
        "PARAMETER_CHANGE",
        32000000 // 32 ATOM initial deposit
    );

    proposalManager.addDeposit(proposalId, "cosmos1supporter", 32000000);
    proposalManager.vote(proposalId, "cosmosvaloper1validator1", "yes", 5000000000000);
    proposalManager.vote(proposalId, "cosmosvaloper2validator2", "no", 3000000000000);
    
    // Simulate end of voting period
    setTimeout(() => {
        proposalManager.executeProposal(proposalId);
    }, 1000);

    // DAO Implementation
    const dao = new DecentralizedDAO();
    dao.demonstrateDAO();
    
    const daoProposalId = dao.createDAOProposal(
        "cosmos1founder",
        "Fund Development Team",
        "Allocate 50K ATOM to core development team for next 6 months",
        { type: "SPEND", asset: "ATOM", amount: 50000000000, recipient: "cosmos1devteam" }
    );

    dao.voteOnDAOProposal(daoProposalId, "cosmos1founder", true);
    dao.voteOnDAOProposal(daoProposalId, "cosmos1dev1", true);
    dao.executeDAOProposal(daoProposalId);

    // Validator Governance
    const validatorGov = new ValidatorGovernance();
    validatorGov.demonstrateValidatorGovernance();
    validatorGov.validatorVote(
        "cosmosvaloper1validator1",
        proposalId,
        "yes",
        "This upgrade is necessary for network scalability and has been thoroughly tested"
    );
    validatorGov.changeCommission("cosmosvaloper1validator1", 0.06);

    // Liquid Democracy
    const liquidDemocracy = new LiquidDemocracy();
    liquidDemocracy.demonstrateLiquidDemocracy();

    // Governance Analytics
    const analytics = new GovernanceAnalytics();
    analytics.demonstrateAnalytics();

    console.log("\n🎓 MODULE 5 COMPLETE!");
    console.log("====================");
    console.log("You've mastered:");
    console.log("✅ Cosmos governance architecture and proposal types");
    console.log("✅ Proposal lifecycle management and execution");
    console.log("✅ DAO implementation with multiple voting strategies");
    console.log("✅ Validator governance and delegation mechanisms");
    console.log("✅ Liquid democracy and vote delegation");
    console.log("✅ Governance analytics and monitoring");
    console.log("✅ Community engagement and participation optimization");
    console.log("\n🔜 Next: Module 6 - CosmWasm Smart Contracts");
}

// Run the module
runGovernanceModule();
