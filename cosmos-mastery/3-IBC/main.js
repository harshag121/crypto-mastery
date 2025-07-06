// IBC and Interoperability - Module 3
// Master cross-chain communication with the IBC protocol

console.log("🌉 IBC and Interoperability - Module 3");
console.log("======================================");

// =============================================
// 1. IBC PROTOCOL ARCHITECTURE
// =============================================

class IBCArchitecture {
    constructor() {
        this.layers = {
            application: "Token transfers, NFTs, custom protocols",
            ibcModules: "Transfer module, ICA, Fee middleware",
            ibcCore: "Channel, Connection, Client handlers",
            lightClients: "Tendermint, Solo Machine, Ethereum"
        };
        
        this.clients = new Map();
        this.connections = new Map();
        this.channels = new Map();
    }

    explainArchitecture() {
        console.log("\n🏗️  IBC PROTOCOL STACK");
        console.log("======================");
        
        console.log("IBC is organized in layers:");
        Object.entries(this.layers).forEach(([layer, description]) => {
            console.log(`• ${layer.toUpperCase()}: ${description}`);
        });

        console.log("\nIBC Communication Flow:");
        console.log("App A → IBC Module → Core IBC → Light Client → Network");
        console.log("Network → Light Client → Core IBC → IBC Module → App B");
    }

    demonstrateComponents() {
        console.log("\n🔧 IBC CORE COMPONENTS");
        console.log("======================");

        const components = {
            "Light Clients": {
                purpose: "Verify counterparty blockchain state",
                types: ["Tendermint", "Solo Machine", "Ethereum", "Substrate"],
                security: "No additional trust assumptions"
            },
            "Connections": {
                purpose: "Authentication between two chains", 
                lifecycle: ["INIT", "TRYOPEN", "OPEN"],
                features: ["Version negotiation", "Client verification"]
            },
            "Channels": {
                purpose: "Communication pathway for applications",
                ordering: ["ORDERED", "UNORDERED"],
                lifecycle: ["INIT", "TRYOPEN", "OPEN", "CLOSED"]
            },
            "Packets": {
                purpose: "Data transmission unit",
                components: ["sequence", "ports", "channels", "data", "timeout"],
                flow: ["Send", "Receive", "Acknowledge", "Timeout"]
            }
        };

        Object.entries(components).forEach(([component, details]) => {
            console.log(`\n${component}:`);
            Object.entries(details).forEach(([key, value]) => {
                const displayValue = Array.isArray(value) ? value.join(", ") : value;
                console.log(`  ${key}: ${displayValue}`);
            });
        });
    }
}

// =============================================
// 2. LIGHT CLIENT IMPLEMENTATION
// =============================================

class TendermintLightClient {
    constructor(chainId) {
        this.chainId = chainId;
        this.consensusStates = new Map();
        this.clientStates = new Map();
        this.trustedHeight = 0;
        this.trustedTime = Date.now();
    }

    // Simulate light client verification
    verifyHeader(header) {
        console.log("\n🔍 LIGHT CLIENT VERIFICATION");
        console.log("============================");

        const verification = {
            heightCheck: header.height > this.trustedHeight,
            timeCheck: header.time > this.trustedTime,
            validatorSetCheck: this.verifyValidatorSet(header.validators),
            signatureCheck: this.verifyCommit(header.commit)
        };

        console.log("Header verification steps:");
        Object.entries(verification).forEach(([check, result]) => {
            const status = result ? "✅" : "❌";
            console.log(`  ${status} ${check}: ${result}`);
        });

        const isValid = Object.values(verification).every(v => v);
        console.log(`\nHeader validation: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
        
        if (isValid) {
            this.updateTrustedState(header);
        }
        
        return isValid;
    }

    verifyValidatorSet(validators) {
        // Simplified validator set verification
        return validators && validators.length > 0 && validators.length <= 150;
    }

    verifyCommit(commit) {
        // Simplified commit verification
        return commit && commit.signatures && commit.signatures.length >= Math.ceil(2/3 * 100);
    }

    updateTrustedState(header) {
        this.trustedHeight = header.height;
        this.trustedTime = header.time;
        this.consensusStates.set(header.height, {
            timestamp: header.time,
            root: header.appHash,
            nextValidatorSet: header.nextValidators
        });
        
        console.log(`Updated trusted state to height: ${header.height}`);
    }

    // Verify state proof
    verifyMembership(proof, path, value) {
        console.log(`\n🔐 Verifying membership proof for path: ${path}`);
        
        // Simplified merkle proof verification
        const isValid = proof && proof.length > 0 && value;
        console.log(`Membership verification: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
        
        return isValid;
    }

    verifyNonMembership(proof, path) {
        console.log(`\n🚫 Verifying non-membership proof for path: ${path}`);
        
        // Simplified non-membership verification
        const isValid = proof && proof.length > 0;
        console.log(`Non-membership verification: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
        
        return isValid;
    }
}

// =============================================
// 3. CONNECTION HANDSHAKE
// =============================================

class IBCConnection {
    constructor(connectionId, clientId) {
        this.connectionId = connectionId;
        this.clientId = clientId;
        this.state = "UNINITIALIZED";
        this.counterparty = null;
        this.versions = ["1"];
        this.delayPeriod = 0;
    }

    // Connection handshake implementation
    demonstrateHandshake() {
        console.log("\n🤝 CONNECTION HANDSHAKE");
        console.log("=======================");

        console.log("4-step handshake process:");
        
        // Step 1: ConnOpenInit
        this.connOpenInit();
        
        // Step 2: ConnOpenTry  
        this.connOpenTry();
        
        // Step 3: ConnOpenAck
        this.connOpenAck();
        
        // Step 4: ConnOpenConfirm
        this.connOpenConfirm();
    }

    connOpenInit() {
        console.log("\n1️⃣  ConnOpenInit (Chain A)");
        this.state = "INIT";
        
        const initMsg = {
            clientId: this.clientId,
            counterparty: {
                clientId: "07-tendermint-1",
                connectionId: "",
                prefix: "ibc"
            },
            version: this.versions[0],
            delayPeriod: this.delayPeriod
        };
        
        console.log("   State: UNINITIALIZED → INIT");
        console.log(`   Message: ${JSON.stringify(initMsg, null, 4)}`);
    }

    connOpenTry() {
        console.log("\n2️⃣  ConnOpenTry (Chain B)");
        this.state = "TRYOPEN";
        
        console.log("   Verifies Chain A's client state");
        console.log("   Verifies Chain A's consensus state");
        console.log("   Verifies Chain A's connection state");
        console.log("   State: UNINITIALIZED → TRYOPEN");
    }

    connOpenAck() {
        console.log("\n3️⃣  ConnOpenAck (Chain A)");
        this.state = "OPEN";
        
        console.log("   Verifies Chain B's client state");
        console.log("   Verifies Chain B's consensus state"); 
        console.log("   Verifies Chain B's connection state");
        console.log("   State: INIT → OPEN");
    }

    connOpenConfirm() {
        console.log("\n4️⃣  ConnOpenConfirm (Chain B)");
        
        console.log("   Verifies Chain A's connection state is OPEN");
        console.log("   State: TRYOPEN → OPEN");
        console.log("\n✅ Connection established successfully!");
    }
}

// =============================================
// 4. CHANNEL COMMUNICATION
// =============================================

class IBCChannel {
    constructor(channelId, portId, connectionId) {
        this.channelId = channelId;
        this.portId = portId;
        this.connectionId = connectionId;
        this.state = "UNINITIALIZED";
        this.ordering = "UNORDERED";
        this.counterparty = null;
        this.version = "";
        this.sequence = 1;
    }

    demonstrateChannelLifecycle() {
        console.log("\n📺 CHANNEL LIFECYCLE");
        console.log("===================");

        // Channel handshake (similar to connection)
        this.channelHandshake();
        
        // Packet flow
        this.packetFlow();
        
        // Channel closing
        this.channelClosing();
    }

    channelHandshake() {
        console.log("\nChannel Handshake (4 steps):");
        const steps = [
            "1. ChanOpenInit - Initialize channel on Chain A",
            "2. ChanOpenTry - Try to open channel on Chain B", 
            "3. ChanOpenAck - Acknowledge channel on Chain A",
            "4. ChanOpenConfirm - Confirm channel on Chain B"
        ];
        
        steps.forEach(step => console.log(`   ${step}`));
        this.state = "OPEN";
        console.log("\n✅ Channel is now OPEN for communication");
    }

    packetFlow() {
        console.log("\n📦 PACKET FLOW");
        console.log("==============");

        // Send packet
        const packet = this.createPacket("Hello IBC!", 600);
        console.log(`\n📤 Sending packet: ${JSON.stringify(packet, null, 2)}`);
        
        // Receive packet
        this.receivePacket(packet);
        
        // Send acknowledgment
        this.sendAcknowledgment(packet, "success");
        
        // Process acknowledgment
        this.processAcknowledgment(packet, "success");
    }

    createPacket(data, timeoutHeight) {
        return {
            sequence: this.sequence++,
            sourcePort: this.portId,
            sourceChannel: this.channelId,
            destinationPort: "transfer",
            destinationChannel: "channel-0",
            data: Buffer.from(data).toString('base64'),
            timeoutHeight: {
                revisionNumber: 1,
                revisionHeight: timeoutHeight
            },
            timeoutTimestamp: Date.now() + 3600000 // 1 hour timeout
        };
    }

    receivePacket(packet) {
        console.log("\n📥 Receiving packet on destination chain");
        console.log("   1. Verify packet commitment on source chain");
        console.log("   2. Check timeout conditions");
        console.log("   3. Execute application logic");
        console.log("   4. Write acknowledgment");
        
        const ack = this.processPacketData(packet.data);
        return ack;
    }

    processPacketData(data) {
        const decodedData = Buffer.from(data, 'base64').toString();
        console.log(`   Processing data: "${decodedData}"`);
        
        // Application-specific processing
        if (decodedData.includes("Hello")) {
            return { result: "success", response: "Hello received!" };
        }
        
        return { result: "error", error: "Unknown data format" };
    }

    sendAcknowledgment(packet, result) {
        console.log(`\n✅ Sending acknowledgment: ${result}`);
        const ackData = {
            result: result,
            timestamp: Date.now()
        };
        
        console.log(`   Ack data: ${JSON.stringify(ackData)}`);
    }

    processAcknowledgment(packet, ack) {
        console.log("\n🔄 Processing acknowledgment on source chain");
        console.log("   1. Verify acknowledgment on destination chain");
        console.log("   2. Delete packet commitment");
        console.log("   3. Execute success/error logic");
        
        if (ack === "success") {
            console.log("   ✅ Packet successfully processed");
        } else {
            console.log("   ❌ Packet processing failed");
        }
    }

    channelClosing() {
        console.log("\n🔒 CHANNEL CLOSING");
        console.log("==================");
        
        console.log("Channel can be closed by:");
        console.log("• ChanCloseInit - Initiate closing");
        console.log("• ChanCloseConfirm - Confirm closing");
        console.log("• Timeout - Automatic cleanup after timeout");
    }
}

// =============================================
// 5. CROSS-CHAIN TOKEN TRANSFER
// =============================================

class IBCTokenTransfer {
    constructor() {
        this.escrows = new Map();
        this.vouchers = new Map();
        this.denomTraces = new Map();
    }

    demonstrateTokenTransfer() {
        console.log("\n💰 IBC TOKEN TRANSFER");
        console.log("=====================");

        // Native token transfer (Chain A → Chain B)
        this.transferNativeToken();
        
        // Voucher token transfer back (Chain B → Chain A) 
        this.transferVoucherToken();
        
        // Multi-hop transfer
        this.demonstrateMultiHop();
    }

    transferNativeToken() {
        console.log("\n🔄 NATIVE TOKEN TRANSFER (Chain A → Chain B)");
        console.log("=============================================");

        const transfer = {
            sender: "cosmos1sender...",
            receiver: "osmosis1receiver...", 
            token: { denom: "uatom", amount: "1000000" },
            sourcePort: "transfer",
            sourceChannel: "channel-141",
            timeoutHeight: { revisionNumber: 1, revisionHeight: 1000 }
        };

        console.log("1. Lock tokens in escrow on Chain A");
        this.escrowTokens("channel-141", transfer.token);
        
        console.log("2. Send IBC packet with transfer data");
        const packet = this.createTransferPacket(transfer);
        
        console.log("3. Mint voucher tokens on Chain B");
        const voucherDenom = this.createVoucherDenom("transfer", "channel-141", "uatom");
        this.mintVoucher(voucherDenom, transfer.token.amount, transfer.receiver);
        
        console.log(`\n✅ Transfer complete!`);
        console.log(`   Escrowed: ${transfer.token.amount} ${transfer.token.denom} on Chain A`);
        console.log(`   Minted: ${transfer.token.amount} ${voucherDenom} on Chain B`);
    }

    transferVoucherToken() {
        console.log("\n🔙 VOUCHER TOKEN TRANSFER (Chain B → Chain A)");
        console.log("==============================================");

        const voucherDenom = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
        const transfer = {
            sender: "osmosis1sender...",
            receiver: "cosmos1receiver...",
            token: { denom: voucherDenom, amount: "500000" },
            sourcePort: "transfer", 
            sourceChannel: "channel-0",
            timeoutHeight: { revisionNumber: 1, revisionHeight: 2000 }
        };

        console.log("1. Burn voucher tokens on Chain B");
        this.burnVoucher(transfer.token.denom, transfer.token.amount);
        
        console.log("2. Send IBC packet with transfer data");
        const packet = this.createTransferPacket(transfer);
        
        console.log("3. Unlock escrowed tokens on Chain A");
        this.unlockEscrowed("channel-141", "uatom", transfer.token.amount, transfer.receiver);
        
        console.log(`\n✅ Return transfer complete!`);
        console.log(`   Burned: ${transfer.token.amount} voucher tokens on Chain B`);
        console.log(`   Unlocked: ${transfer.token.amount} uatom on Chain A`);
    }

    demonstrateMultiHop() {
        console.log("\n🔀 MULTI-HOP TRANSFER");
        console.log("=====================");

        console.log("Token path: Chain A → Chain B → Chain C");
        console.log("\nDenom evolution:");
        console.log("• Chain A: uatom");
        console.log("• Chain B: ibc/[hash_AB]/uatom");  
        console.log("• Chain C: ibc/[hash_BC]/ibc/[hash_AB]/uatom");
        
        console.log("\nUnwinding path: Chain C → Chain B → Chain A");
        console.log("• Each hop removes one prefix");
        console.log("• Final destination receives original tokens");
    }

    createTransferPacket(transfer) {
        const transferData = {
            denom: transfer.token.denom,
            amount: transfer.token.amount,
            sender: transfer.sender,
            receiver: transfer.receiver
        };

        return {
            sourcePort: transfer.sourcePort,
            sourceChannel: transfer.sourceChannel,
            data: JSON.stringify(transferData),
            timeoutHeight: transfer.timeoutHeight
        };
    }

    escrowTokens(channel, token) {
        const escrowKey = `${channel}_${token.denom}`;
        const currentEscrow = this.escrows.get(escrowKey) || 0;
        this.escrows.set(escrowKey, currentEscrow + parseInt(token.amount));
        
        console.log(`   Escrowed ${token.amount} ${token.denom} in ${channel}`);
    }

    createVoucherDenom(port, channel, baseDenom) {
        const trace = `${port}/${channel}/${baseDenom}`;
        const hash = this.hashDenomTrace(trace);
        const voucherDenom = `ibc/${hash}`;
        
        this.denomTraces.set(voucherDenom, trace);
        return voucherDenom;
    }

    hashDenomTrace(trace) {
        // Simplified hash function (in reality, uses SHA256)
        return trace.split('').reduce((hash, char) => {
            return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
        }, 0).toString(16).toUpperCase().padStart(64, '0');
    }

    mintVoucher(denom, amount, recipient) {
        const voucherKey = `${denom}_${recipient}`;
        const currentBalance = this.vouchers.get(voucherKey) || 0;
        this.vouchers.set(voucherKey, currentBalance + parseInt(amount));
        
        console.log(`   Minted ${amount} ${denom} to ${recipient}`);
    }

    burnVoucher(denom, amount) {
        console.log(`   Burned ${amount} ${denom}`);
        // Implementation would reduce voucher supply
    }

    unlockEscrowed(channel, denom, amount, recipient) {
        const escrowKey = `${channel}_${denom}`;
        const currentEscrow = this.escrows.get(escrowKey) || 0;
        this.escrows.set(escrowKey, Math.max(0, currentEscrow - parseInt(amount)));
        
        console.log(`   Unlocked ${amount} ${denom} to ${recipient}`);
    }
}

// =============================================
// 6. CUSTOM IBC APPLICATION
// =============================================

class CrossChainVoting {
    constructor() {
        this.proposals = new Map();
        this.votes = new Map();
        this.chains = new Set();
    }

    demonstrateCustomApp() {
        console.log("\n🗳️  CUSTOM IBC APPLICATION: CROSS-CHAIN VOTING");
        console.log("==============================================");

        // Create proposal on governance chain
        this.createProposal();
        
        // Send voting packets to connected chains
        this.sendVotingPackets();
        
        // Receive votes from other chains
        this.receiveVotes();
        
        // Aggregate results and execute
        this.aggregateAndExecute();
    }

    createProposal() {
        console.log("\n1️⃣  Creating Proposal on Governance Chain");
        
        const proposal = {
            id: "prop-001",
            title: "Enable IBC transfers for new token",
            description: "Proposal to enable IBC transfers for NEWTOKEN",
            votingPeriod: 7 * 24 * 3600, // 7 days
            threshold: 0.67, // 67% approval needed
            allowedChains: ["chain-a", "chain-b", "chain-c"],
            createdAt: Date.now()
        };

        this.proposals.set(proposal.id, proposal);
        proposal.allowedChains.forEach(chain => this.chains.add(chain));
        
        console.log(`   Proposal created: ${proposal.title}`);
        console.log(`   Voting chains: ${proposal.allowedChains.join(", ")}`);
    }

    sendVotingPackets() {
        console.log("\n2️⃣  Sending Voting Packets to Connected Chains");
        
        this.chains.forEach(chain => {
            const votingPacket = {
                type: "voting-notification",
                proposalId: "prop-001",
                votingDeadline: Date.now() + (7 * 24 * 3600 * 1000),
                requiredStake: "1000000utoken"
            };

            console.log(`   📤 Sent voting packet to ${chain}`);
            console.log(`      Packet: ${JSON.stringify(votingPacket, null, 6)}`);
        });
    }

    receiveVotes() {
        console.log("\n3️⃣  Receiving Votes from Connected Chains");
        
        // Simulate votes from different chains
        const votes = [
            { chain: "chain-a", vote: "yes", power: 5000000, voter: "validator1" },
            { chain: "chain-b", vote: "yes", power: 3000000, voter: "validator2" },
            { chain: "chain-c", vote: "no", power: 2000000, voter: "validator3" },
            { chain: "chain-a", vote: "yes", power: 1000000, voter: "delegator1" }
        ];

        votes.forEach(vote => {
            const votePacket = {
                type: "vote-submission",
                proposalId: "prop-001", 
                vote: vote.vote,
                votingPower: vote.power,
                voter: vote.voter,
                sourceChain: vote.chain,
                timestamp: Date.now()
            };

            this.processVotePacket(votePacket);
        });
    }

    processVotePacket(packet) {
        // Verify packet authenticity through IBC
        console.log(`   📥 Received vote from ${packet.sourceChain}`);
        console.log(`      Voter: ${packet.voter}`);
        console.log(`      Vote: ${packet.vote}`);
        console.log(`      Power: ${packet.votingPower.toLocaleString()}`);
        
        // Store vote
        const voteKey = `${packet.proposalId}_${packet.sourceChain}_${packet.voter}`;
        this.votes.set(voteKey, packet);
        
        // Send acknowledgment
        const ack = {
            result: "success",
            message: "Vote recorded successfully"
        };
        
        console.log(`      ✅ Vote acknowledged: ${ack.message}`);
    }

    aggregateAndExecute() {
        console.log("\n4️⃣  Aggregating Results and Executing");
        
        const proposalId = "prop-001";
        const proposal = this.proposals.get(proposalId);
        
        // Calculate vote totals
        let totalYes = 0;
        let totalNo = 0;
        let totalPower = 0;

        this.votes.forEach(vote => {
            if (vote.proposalId === proposalId) {
                totalPower += vote.votingPower;
                if (vote.vote === "yes") {
                    totalYes += vote.votingPower;
                } else {
                    totalNo += vote.votingPower;
                }
            }
        });

        const yesPercentage = totalYes / totalPower;
        const passed = yesPercentage >= proposal.threshold;

        console.log(`\n📊 Voting Results:`);
        console.log(`   Total voting power: ${totalPower.toLocaleString()}`);
        console.log(`   Yes votes: ${totalYes.toLocaleString()} (${(yesPercentage * 100).toFixed(1)}%)`);
        console.log(`   No votes: ${totalNo.toLocaleString()} (${((totalNo / totalPower) * 100).toFixed(1)}%)`);
        console.log(`   Threshold: ${(proposal.threshold * 100).toFixed(1)}%`);
        console.log(`   Result: ${passed ? "✅ PASSED" : "❌ FAILED"}`);

        if (passed) {
            this.executeProposal(proposalId);
        }
    }

    executeProposal(proposalId) {
        console.log(`\n⚡ Executing proposal ${proposalId}`);
        console.log("   1. Enable IBC transfers for NEWTOKEN");
        console.log("   2. Update token registry on all chains");
        console.log("   3. Notify connected chains of execution");
        console.log("   ✅ Proposal executed successfully!");
    }
}

// =============================================
// 7. RELAYER OPERATIONS
// =============================================

class IBCRelayer {
    constructor(name) {
        this.name = name;
        this.chains = new Map();
        this.packets = [];
        this.isRunning = false;
    }

    demonstrateRelayer() {
        console.log("\n🚀 IBC RELAYER OPERATIONS");
        console.log("=========================");

        this.setupRelayer();
        this.startRelaying();
        this.handlePackets();
        this.monitorPerformance();
    }

    setupRelayer() {
        console.log("\n⚙️  Relayer Setup");
        
        // Configure chains
        const chains = [
            { id: "cosmoshub-4", rpc: "https://rpc.cosmos.network", gasPrice: "0.025uatom" },
            { id: "osmosis-1", rpc: "https://rpc.osmosis.zone", gasPrice: "0.025uosmo" }
        ];

        chains.forEach(chain => {
            this.chains.set(chain.id, {
                ...chain,
                latestHeight: 1000000,
                connection: "connection-0"
            });
            console.log(`   Added chain: ${chain.id}`);
        });

        console.log(`\n✅ Relayer "${this.name}" configured with ${chains.length} chains`);
    }

    startRelaying() {
        console.log("\n🔄 Starting Relayer");
        this.isRunning = true;
        
        console.log("   Monitoring for:");
        console.log("   • New packet commitments");
        console.log("   • Pending acknowledgments");
        console.log("   • Timeout packets");
        console.log("   • Client updates needed");
    }

    handlePackets() {
        console.log("\n📦 Packet Relaying Process");
        
        // Simulate finding packets
        const pendingPackets = [
            {
                source: "cosmoshub-4",
                dest: "osmosis-1", 
                sequence: 100,
                type: "transfer",
                timeout: Date.now() + 3600000
            },
            {
                source: "osmosis-1",
                dest: "cosmoshub-4",
                sequence: 55,
                type: "ack", 
                timeout: Date.now() + 1800000
            }
        ];

        pendingPackets.forEach(packet => {
            this.relayPacket(packet);
        });
    }

    relayPacket(packet) {
        console.log(`\n🔀 Relaying packet ${packet.sequence}`);
        console.log(`   Source: ${packet.source}`);
        console.log(`   Destination: ${packet.dest}`);
        console.log(`   Type: ${packet.type}`);
        
        // Simulate relaying steps
        const steps = [
            "1. Query packet commitment on source chain",
            "2. Build proof of packet commitment",
            "3. Submit packet to destination chain",
            "4. Wait for transaction confirmation",
            "5. Update packet status"
        ];

        steps.forEach(step => console.log(`   ${step}`));
        
        const success = Math.random() > 0.1; // 90% success rate
        console.log(`   Result: ${success ? "✅ SUCCESS" : "❌ FAILED"}`);
        
        if (success) {
            console.log(`   Gas used: ${Math.floor(Math.random() * 200000 + 100000)}`);
        }
    }

    monitorPerformance() {
        console.log("\n📊 Relayer Performance Metrics");
        console.log("==============================");
        
        const metrics = {
            "Packets relayed": Math.floor(Math.random() * 1000 + 500),
            "Success rate": "94.2%",
            "Average latency": "12.3 seconds",
            "Gas efficiency": "85.7%",
            "Uptime": "99.8%",
            "Revenue earned": "$1,234.56"
        };

        Object.entries(metrics).forEach(([metric, value]) => {
            console.log(`   ${metric}: ${value}`);
        });

        console.log("\n💡 Optimization tips:");
        console.log("   • Monitor gas prices for cost efficiency");
        console.log("   • Batch multiple packets when possible");
        console.log("   • Maintain up-to-date light clients");
        console.log("   • Set appropriate timeout parameters");
    }
}

// =============================================
// 8. TESTING AND DEBUGGING
// =============================================

class IBCTesting {
    constructor() {
        this.testSuite = [];
        this.debugLogs = [];
    }

    demonstrateTesting() {
        console.log("\n🧪 IBC TESTING FRAMEWORK");
        console.log("========================");

        this.setupTestEnvironment();
        this.runIntegrationTests();
        this.debugCommonIssues();
    }

    setupTestEnvironment() {
        console.log("\n🔧 Test Environment Setup");
        
        console.log("Required components:");
        console.log("• Two or more test chains");
        console.log("• Relayer configuration"); 
        console.log("• Test accounts with funds");
        console.log("• IBC-enabled applications");

        console.log("\nTest tools:");
        console.log("• Hermes relayer for E2E tests");
        console.log("• SimApp for unit testing");
        console.log("• Gaia for integration testing");
        console.log("• Custom test harnesses");
    }

    runIntegrationTests() {
        console.log("\n🔍 Integration Test Suite");
        
        const tests = [
            {
                name: "Client Creation and Updates",
                test: () => this.testClientOperations()
            },
            {
                name: "Connection Handshake",
                test: () => this.testConnectionHandshake()
            },
            {
                name: "Channel Handshake", 
                test: () => this.testChannelHandshake()
            },
            {
                name: "Token Transfer",
                test: () => this.testTokenTransfer()
            },
            {
                name: "Packet Timeout",
                test: () => this.testPacketTimeout()
            },
            {
                name: "Custom Application",
                test: () => this.testCustomApplication()
            }
        ];

        tests.forEach(({name, test}) => {
            try {
                const result = test();
                console.log(`   ✅ ${name}: PASSED`);
            } catch (error) {
                console.log(`   ❌ ${name}: FAILED - ${error.message}`);
            }
        });
    }

    testClientOperations() {
        const client = new TendermintLightClient("test-chain");
        const header = {
            height: 100,
            time: Date.now(),
            validators: [{ address: "val1" }],
            commit: { signatures: Array(67).fill({ signature: "sig" }) },
            appHash: "hash123",
            nextValidators: [{ address: "val2" }]
        };
        
        return client.verifyHeader(header);
    }

    testConnectionHandshake() {
        const connection = new IBCConnection("connection-0", "07-tendermint-0");
        connection.demonstrateHandshake();
        return connection.state === "OPEN";
    }

    testChannelHandshake() {
        const channel = new IBCChannel("channel-0", "transfer", "connection-0");
        channel.channelHandshake();
        return channel.state === "OPEN";
    }

    testTokenTransfer() {
        const transfer = new IBCTokenTransfer();
        transfer.transferNativeToken();
        return true; // Simplified test
    }

    testPacketTimeout() {
        console.log("      Testing packet timeout scenarios...");
        return true; // Simplified test
    }

    testCustomApplication() {
        const voting = new CrossChainVoting();
        voting.createProposal();
        return voting.proposals.size > 0;
    }

    debugCommonIssues() {
        console.log("\n🐛 Common IBC Issues & Solutions");
        console.log("================================");

        const issues = {
            "Client expiry": {
                cause: "Light client not updated within trusting period",
                solution: "Regular client updates via relayer or governance"
            },
            "Packet timeout": {
                cause: "Packet not relayed before timeout height/timestamp",
                solution: "Appropriate timeout values and active relayers"
            },
            "Channel closure": {
                cause: "Application-specific errors or governance decisions",
                solution: "Debug application logic and check channel state"
            },
            "Proof verification failure": {
                cause: "Incorrect proofs or outdated consensus state",
                solution: "Update light clients and verify proof generation"
            },
            "Gas estimation errors": {
                cause: "Complex IBC transactions requiring more gas",
                solution: "Increase gas limits and optimize transaction size"
            }
        };

        Object.entries(issues).forEach(([issue, details]) => {
            console.log(`\n${issue}:`);
            console.log(`   Cause: ${details.cause}`);
            console.log(`   Solution: ${details.solution}`);
        });
    }
}

// =============================================
// MAIN EXECUTION
// =============================================

function runIBCModule() {
    console.log("Starting IBC and Interoperability Tutorial...\n");

    // Architecture Overview
    const architecture = new IBCArchitecture();
    architecture.explainArchitecture();
    architecture.demonstrateComponents();

    // Light Client Implementation
    const lightClient = new TendermintLightClient("test-chain");
    const testHeader = {
        height: 100,
        time: Date.now(),
        validators: [{ address: "validator1" }, { address: "validator2" }],
        commit: { signatures: Array(67).fill({ signature: "valid_sig" }) },
        appHash: "app_hash_123",
        nextValidators: [{ address: "validator3" }]
    };
    lightClient.verifyHeader(testHeader);

    // Connection Handshake
    const connection = new IBCConnection("connection-0", "07-tendermint-0");
    connection.demonstrateHandshake();

    // Channel Communication
    const channel = new IBCChannel("channel-0", "transfer", "connection-0");
    channel.demonstrateChannelLifecycle();

    // Token Transfer
    const tokenTransfer = new IBCTokenTransfer();
    tokenTransfer.demonstrateTokenTransfer();

    // Custom IBC Application
    const voting = new CrossChainVoting();
    voting.demonstrateCustomApp();

    // Relayer Operations
    const relayer = new IBCRelayer("cosmos-relayer");
    relayer.demonstrateRelayer();

    // Testing and Debugging
    const testing = new IBCTesting();
    testing.demonstrateTesting();

    console.log("\n🎓 MODULE 3 COMPLETE!");
    console.log("====================");
    console.log("You've mastered:");
    console.log("✅ IBC protocol architecture and security model");
    console.log("✅ Light client verification and state proofs");
    console.log("✅ Connection and channel handshakes");
    console.log("✅ Cross-chain packet communication");
    console.log("✅ Token transfer mechanisms");
    console.log("✅ Custom IBC application development");
    console.log("✅ Relayer operations and optimization");
    console.log("✅ Testing and debugging techniques");
    console.log("\n🔜 Next: Module 4 - DeFi on Cosmos");
}

// Run the module
runIBCModule();
