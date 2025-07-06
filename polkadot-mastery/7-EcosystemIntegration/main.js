#!/usr/bin/env node

/**
 * Polkadot Mastery - Module 7: Ecosystem Integration
 * 
 * This module demonstrates production deployment, bridge protocols,
 * monitoring systems, and ecosystem integration patterns.
 */

console.log("🌐 Ecosystem Integration Mastery");
console.log("=================================\n");

// === 1. Production Deployment Pipeline ===

class DeploymentPipeline {
    constructor() {
        this.environments = new Map();
        this.deployments = new Map();
        this.configurations = new Map();
        this.setupEnvironments();
    }

    setupEnvironments() {
        // Define deployment environments
        const envs = [
            {
                name: "development",
                network: "local",
                collators: 1,
                validators: 3,
                requirements: { cpu: 2, memory: 4, storage: 100 }
            },
            {
                name: "testnet",
                network: "rococo",
                collators: 3,
                validators: 10,
                requirements: { cpu: 4, memory: 8, storage: 500 }
            },
            {
                name: "staging",
                network: "westend",
                collators: 5,
                validators: 20,
                requirements: { cpu: 8, memory: 16, storage: 1000 }
            },
            {
                name: "production",
                network: "polkadot",
                collators: 10,
                validators: 100,
                requirements: { cpu: 16, memory: 32, storage: 2000 }
            }
        ];

        envs.forEach(env => {
            this.environments.set(env.name, env);
            console.log(`🏗️ Environment configured: ${env.name} (${env.network})`);
        });
    }

    // Create deployment configuration
    createDeploymentConfig(parachainId, environment, version) {
        const env = this.environments.get(environment);
        if (!env) {
            throw new Error(`Environment ${environment} not found`);
        }

        const config = {
            parachainId,
            environment,
            version,
            network: env.network,
            collatorConfig: {
                count: env.collators,
                nodeSpecs: env.requirements,
                image: `parachain:${version}`,
                ports: [9944, 9933, 30333],
                resources: env.requirements
            },
            rpcConfig: {
                endpoints: env.collators,
                loadBalancer: true,
                ssl: environment !== "development",
                rateLimiting: true
            },
            monitoringConfig: {
                metrics: true,
                logging: true,
                alerting: environment === "production",
                healthChecks: true
            },
            securityConfig: {
                firewall: environment !== "development",
                keyManagement: "vault",
                backups: environment === "production",
                auditing: true
            }
        };

        this.configurations.set(`${parachainId}_${environment}`, config);
        return config;
    }

    // Deploy parachain to environment
    async deployParachain(parachainId, environment, config) {
        console.log(`\n🚀 Deploying parachain ${parachainId} to ${environment}`);
        
        const deployment = {
            parachainId,
            environment,
            version: config.version,
            status: "deploying",
            startTime: Date.now(),
            steps: []
        };

        try {
            // Step 1: Infrastructure provisioning
            await this.provisionInfrastructure(config, deployment);
            
            // Step 2: Network setup
            await this.setupNetworking(config, deployment);
            
            // Step 3: Node deployment
            await this.deployNodes(config, deployment);
            
            // Step 4: Configuration and startup
            await this.configureAndStart(config, deployment);
            
            // Step 5: Health verification
            await this.verifyHealth(config, deployment);
            
            // Step 6: Register with relay chain (if production)
            if (environment === "production") {
                await this.registerWithRelayChain(config, deployment);
            }

            deployment.status = "deployed";
            deployment.endTime = Date.now();
            deployment.duration = deployment.endTime - deployment.startTime;

            console.log(`✅ Deployment completed in ${deployment.duration}ms`);
            
        } catch (error) {
            deployment.status = "failed";
            deployment.error = error.message;
            console.error(`❌ Deployment failed: ${error.message}`);
            throw error;
        }

        this.deployments.set(`${parachainId}_${environment}`, deployment);
        return deployment;
    }

    // Infrastructure provisioning simulation
    async provisionInfrastructure(config, deployment) {
        console.log("   📦 Provisioning infrastructure...");
        
        const step = {
            name: "infrastructure",
            status: "running",
            startTime: Date.now()
        };

        // Simulate infrastructure setup
        await this.sleep(1000);

        const resources = config.collatorConfig.count * config.collatorConfig.nodeSpecs.cpu;
        console.log(`   Created ${config.collatorConfig.count} instances (${resources} vCPUs total)`);

        step.status = "completed";
        step.endTime = Date.now();
        deployment.steps.push(step);
    }

    // Network setup simulation
    async setupNetworking(config, deployment) {
        console.log("   🌐 Setting up networking...");
        
        const step = {
            name: "networking",
            status: "running",
            startTime: Date.now()
        };

        await this.sleep(500);

        console.log(`   Configured ${config.rpcConfig.endpoints} RPC endpoints`);
        if (config.rpcConfig.ssl) {
            console.log("   SSL certificates configured");
        }

        step.status = "completed";
        step.endTime = Date.now();
        deployment.steps.push(step);
    }

    // Node deployment simulation
    async deployNodes(config, deployment) {
        console.log("   🖥️ Deploying collator nodes...");
        
        const step = {
            name: "nodes",
            status: "running",
            startTime: Date.now()
        };

        await this.sleep(2000);

        console.log(`   Deployed ${config.collatorConfig.count} collator nodes`);
        console.log(`   Image: ${config.collatorConfig.image}`);

        step.status = "completed";
        step.endTime = Date.now();
        deployment.steps.push(step);
    }

    // Configuration and startup simulation
    async configureAndStart(config, deployment) {
        console.log("   ⚙️ Configuring and starting services...");
        
        const step = {
            name: "startup",
            status: "running",
            startTime: Date.now()
        };

        await this.sleep(1500);

        console.log("   Runtime configuration applied");
        console.log("   Genesis state initialized");
        console.log("   Collator services started");

        step.status = "completed";
        step.endTime = Date.now();
        deployment.steps.push(step);
    }

    // Health verification simulation
    async verifyHealth(config, deployment) {
        console.log("   🩺 Verifying system health...");
        
        const step = {
            name: "health_check",
            status: "running",
            startTime: Date.now()
        };

        await this.sleep(1000);

        const healthChecks = [
            "Node connectivity",
            "Block production", 
            "RPC endpoints",
            "Peer connections",
            "Database integrity"
        ];

        healthChecks.forEach(check => {
            console.log(`   ✅ ${check}`);
        });

        step.status = "completed";
        step.endTime = Date.now();
        deployment.steps.push(step);
    }

    // Relay chain registration simulation
    async registerWithRelayChain(config, deployment) {
        console.log("   🔗 Registering with relay chain...");
        
        const step = {
            name: "relay_registration",
            status: "running",
            startTime: Date.now()
        };

        await this.sleep(2000);

        console.log("   Parachain validation function (PVF) uploaded");
        console.log("   Genesis state submitted");
        console.log("   Slot lease verified");

        step.status = "completed";
        step.endTime = Date.now();
        deployment.steps.push(step);
    }

    // Utility function for simulation delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get deployment status
    getDeploymentStatus(parachainId, environment) {
        return this.deployments.get(`${parachainId}_${environment}`);
    }

    // List all deployments
    listDeployments() {
        return Array.from(this.deployments.values());
    }
}

// === 2. Bridge Protocol Implementation ===

class BridgeProtocol {
    constructor(bridgeType = "optimistic") {
        this.bridgeType = bridgeType;
        this.chains = new Map();
        this.bridges = new Map();
        this.relayers = new Map();
        this.transfers = new Map();
        this.nextTransferId = 1;
        this.fraudWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    // Register chain with bridge
    registerChain(chainId, name, type, config) {
        console.log(`🔗 Registering chain: ${name} (${chainId})`);
        
        this.chains.set(chainId, {
            id: chainId,
            name,
            type, // "substrate", "ethereum", "bitcoin"
            config,
            active: true,
            lastBlock: 0,
            validators: new Set()
        });
    }

    // Create bridge between chains
    createBridge(fromChain, toChain, supportedAssets, config) {
        const bridgeId = `${fromChain}_${toChain}`;
        
        console.log(`🌉 Creating bridge: ${fromChain} → ${toChain}`);
        console.log(`   Supported assets: ${supportedAssets.join(", ")}`);
        
        const bridge = {
            id: bridgeId,
            fromChain,
            toChain,
            supportedAssets,
            config: {
                minTransfer: config.minTransfer || 1,
                maxTransfer: config.maxTransfer || 1000000,
                fee: config.fee || 0.001,
                confirmations: config.confirmations || 12,
                fraudWindow: this.fraudWindow,
                ...config
            },
            totalVolume: 0,
            totalTransfers: 0,
            active: true,
            created: Date.now()
        };

        this.bridges.set(bridgeId, bridge);
        return bridgeId;
    }

    // Register relayer
    registerRelayer(relayerId, chains, stake, endpoint) {
        console.log(`🔄 Registering relayer: ${relayerId}`);
        
        this.relayers.set(relayerId, {
            id: relayerId,
            supportedChains: chains,
            stake,
            endpoint,
            reputation: 100,
            totalRelayed: 0,
            active: true,
            registered: Date.now()
        });
    }

    // Initiate cross-chain transfer
    initiateTransfer(bridgeId, asset, amount, recipient, sender) {
        const bridge = this.bridges.get(bridgeId);
        if (!bridge) {
            throw new Error(`Bridge ${bridgeId} not found`);
        }

        if (!bridge.supportedAssets.includes(asset)) {
            throw new Error(`Asset ${asset} not supported on bridge`);
        }

        if (amount < bridge.config.minTransfer || amount > bridge.config.maxTransfer) {
            throw new Error("Transfer amount outside allowed range");
        }

        const transferId = this.nextTransferId++;
        const fee = amount * bridge.config.fee;
        const netAmount = amount - fee;

        console.log(`\n💸 Initiating transfer ${transferId}:`);
        console.log(`   Bridge: ${bridgeId}`);
        console.log(`   Asset: ${asset}`);
        console.log(`   Amount: ${amount} (fee: ${fee})`);
        console.log(`   From: ${sender} → To: ${recipient}`);

        const transfer = {
            id: transferId,
            bridgeId,
            asset,
            amount,
            fee,
            netAmount,
            sender,
            recipient,
            status: "initiated",
            initiated: Date.now(),
            confirmations: 0,
            fraudChallenges: [],
            evidence: null
        };

        this.transfers.set(transferId, transfer);

        // Start transfer processing
        this.processTransfer(transferId);

        return transferId;
    }

    // Process transfer through bridge
    async processTransfer(transferId) {
        const transfer = this.transfers.get(transferId);
        if (!transfer) return;

        try {
            // Step 1: Lock/burn assets on source chain
            await this.lockSourceAssets(transfer);

            // Step 2: Submit proof to destination chain
            await this.submitProof(transfer);

            // Step 3: Wait for confirmations
            await this.waitForConfirmations(transfer);

            // Step 4: Mint/unlock on destination (if optimistic)
            if (this.bridgeType === "optimistic") {
                await this.optimisticMint(transfer);
            } else {
                await this.cryptographicVerification(transfer);
            }

        } catch (error) {
            transfer.status = "failed";
            transfer.error = error.message;
            console.error(`❌ Transfer ${transferId} failed: ${error.message}`);
        }
    }

    // Lock assets on source chain
    async lockSourceAssets(transfer) {
        console.log(`   🔒 Locking ${transfer.amount} ${transfer.asset} on source chain`);
        
        transfer.status = "locked";
        transfer.lockedAt = Date.now();

        await this.sleep(1000); // Simulate block confirmation time
        
        console.log(`   ✅ Assets locked in bridge contract`);
    }

    // Submit proof to destination chain
    async submitProof(transfer) {
        console.log(`   📄 Submitting transfer proof to destination chain`);
        
        // Generate merkle proof (simplified)
        transfer.evidence = {
            merkleRoot: this.generateHash(`transfer_${transfer.id}`),
            proof: this.generateMerkleProof(transfer),
            blockHeight: 12345 + transfer.id,
            timestamp: Date.now()
        };

        transfer.status = "proof_submitted";
        transfer.proofSubmitted = Date.now();

        await this.sleep(500);
        
        console.log(`   ✅ Proof submitted (block: ${transfer.evidence.blockHeight})`);
    }

    // Wait for required confirmations
    async waitForConfirmations(transfer) {
        const bridge = this.bridges.get(transfer.bridgeId);
        const requiredConfirmations = bridge.config.confirmations;

        console.log(`   ⏳ Waiting for ${requiredConfirmations} confirmations`);

        for (let i = 1; i <= requiredConfirmations; i++) {
            await this.sleep(200); // Simulate block time
            transfer.confirmations = i;
            
            if (i % 3 === 0) {
                console.log(`   📊 ${i}/${requiredConfirmations} confirmations received`);
            }
        }

        transfer.status = "confirmed";
        console.log(`   ✅ Required confirmations reached`);
    }

    // Optimistic minting (subject to fraud proofs)
    async optimisticMint(transfer) {
        console.log(`   ⚡ Optimistic minting on destination chain`);
        
        transfer.status = "minted";
        transfer.mintedAt = Date.now();
        transfer.fraudWindowEnd = transfer.mintedAt + this.fraudWindow;

        // Update bridge statistics
        const bridge = this.bridges.get(transfer.bridgeId);
        bridge.totalVolume += transfer.amount;
        bridge.totalTransfers++;

        await this.sleep(500);
        
        console.log(`   ✅ ${transfer.netAmount} ${transfer.asset} minted to ${transfer.recipient}`);
        console.log(`   ⚠️ Fraud window: ${new Date(transfer.fraudWindowEnd).toLocaleDateString()}`);
    }

    // Cryptographic verification (for non-optimistic bridges)
    async cryptographicVerification(transfer) {
        console.log(`   🔐 Performing cryptographic verification`);
        
        // Simulate ZK proof verification or light client validation
        const verified = this.verifyTransferProof(transfer.evidence);
        
        if (!verified) {
            throw new Error("Cryptographic verification failed");
        }

        transfer.status = "verified";
        transfer.verifiedAt = Date.now();

        await this.sleep(1000);
        
        console.log(`   ✅ Transfer cryptographically verified`);
        
        // Mint assets
        await this.finalMint(transfer);
    }

    // Final minting after verification
    async finalMint(transfer) {
        transfer.status = "completed";
        transfer.completedAt = Date.now();

        // Update bridge statistics
        const bridge = this.bridges.get(transfer.bridgeId);
        bridge.totalVolume += transfer.amount;
        bridge.totalTransfers++;

        console.log(`   ✅ ${transfer.netAmount} ${transfer.asset} minted to ${transfer.recipient}`);
    }

    // Submit fraud proof against optimistic transfer
    submitFraudProof(transferId, evidence, challenger) {
        const transfer = this.transfers.get(transferId);
        if (!transfer) {
            throw new Error(`Transfer ${transferId} not found`);
        }

        if (Date.now() > transfer.fraudWindowEnd) {
            throw new Error("Fraud window has expired");
        }

        console.log(`\n🚨 Fraud proof submitted for transfer ${transferId}`);
        console.log(`   Challenger: ${challenger}`);

        const fraudChallenge = {
            challenger,
            evidence,
            submitted: Date.now(),
            status: "pending"
        };

        transfer.fraudChallenges.push(fraudChallenge);
        transfer.status = "challenged";

        // Process fraud proof
        this.processFraudProof(transferId, fraudChallenge);
    }

    // Process fraud proof
    async processFraudProof(transferId, challenge) {
        console.log(`   🔍 Processing fraud proof...`);
        
        await this.sleep(2000); // Simulate verification time

        // Simplified fraud detection (random for demo)
        const fraudDetected = Math.random() < 0.1; // 10% chance

        if (fraudDetected) {
            console.log(`   ❌ Fraud detected! Reversing transfer`);
            challenge.status = "proven";
            
            const transfer = this.transfers.get(transferId);
            transfer.status = "reversed";
            
            // Slash relayer bonds, reward challenger
            
        } else {
            console.log(`   ✅ Transfer valid, fraud proof rejected`);
            challenge.status = "rejected";
        }
    }

    // Utility functions
    generateHash(data) {
        // Simplified hash function
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
    }

    generateMerkleProof(transfer) {
        return [
            this.generateHash(`proof1_${transfer.id}`),
            this.generateHash(`proof2_${transfer.id}`),
            this.generateHash(`proof3_${transfer.id}`)
        ];
    }

    verifyTransferProof(evidence) {
        // Simplified verification
        return evidence && evidence.merkleRoot && evidence.proof.length > 0;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get transfer status
    getTransferStatus(transferId) {
        return this.transfers.get(transferId);
    }

    // Get bridge statistics
    getBridgeStats(bridgeId) {
        return this.bridges.get(bridgeId);
    }
}

// === 3. Monitoring and Analytics System ===

class MonitoringSystem {
    constructor() {
        this.metrics = new Map();
        this.alerts = [];
        this.thresholds = new Map();
        this.collectors = new Map();
        this.setupDefaultThresholds();
        this.startMetricsCollection();
    }

    setupDefaultThresholds() {
        const thresholds = [
            { metric: "block_time", warning: 15, critical: 30 }, // seconds
            { metric: "peer_count", warning: 5, critical: 2 },
            { metric: "memory_usage", warning: 80, critical: 95 }, // percentage
            { metric: "disk_usage", warning: 85, critical: 95 }, // percentage
            { metric: "tx_pool_size", warning: 1000, critical: 5000 },
            { metric: "finality_lag", warning: 5, critical: 10 }, // blocks
        ];

        thresholds.forEach(t => {
            this.thresholds.set(t.metric, {
                warning: t.warning,
                critical: t.critical
            });
        });

        console.log("📊 Monitoring thresholds configured");
    }

    // Start collecting metrics
    startMetricsCollection() {
        console.log("🔄 Starting metrics collection...");
        
        // Simulate metrics collection every 5 seconds
        setInterval(() => {
            this.collectMetrics();
        }, 5000);
    }

    // Collect various system metrics
    collectMetrics() {
        const timestamp = Date.now();
        
        // Simulate metric collection
        const metrics = {
            block_time: 12 + Math.random() * 6, // 12-18 seconds
            peer_count: Math.floor(15 + Math.random() * 10), // 15-25 peers
            memory_usage: 50 + Math.random() * 40, // 50-90%
            disk_usage: 30 + Math.random() * 20, // 30-50%
            tx_pool_size: Math.floor(Math.random() * 2000), // 0-2000 transactions
            finality_lag: Math.floor(Math.random() * 3), // 0-3 blocks
            block_height: this.getLastMetric("block_height", 0) + 1,
            tx_count: Math.floor(Math.random() * 100), // 0-100 tx per block
            cpu_usage: 20 + Math.random() * 60 // 20-80%
        };

        // Store metrics
        Object.entries(metrics).forEach(([metric, value]) => {
            this.recordMetric(metric, value, timestamp);
        });

        // Check for alerts
        this.checkAlerts(metrics, timestamp);
    }

    // Record a metric value
    recordMetric(metric, value, timestamp = Date.now()) {
        if (!this.metrics.has(metric)) {
            this.metrics.set(metric, []);
        }

        const metricData = this.metrics.get(metric);
        metricData.push({ value, timestamp });

        // Keep only last 100 data points
        if (metricData.length > 100) {
            metricData.shift();
        }
    }

    // Get latest metric value
    getLastMetric(metric, defaultValue = 0) {
        const metricData = this.metrics.get(metric);
        if (!metricData || metricData.length === 0) {
            return defaultValue;
        }
        return metricData[metricData.length - 1].value;
    }

    // Check for alert conditions
    checkAlerts(metrics, timestamp) {
        Object.entries(metrics).forEach(([metric, value]) => {
            const threshold = this.thresholds.get(metric);
            if (!threshold) return;

            let alertLevel = null;
            
            if (value >= threshold.critical) {
                alertLevel = "critical";
            } else if (value >= threshold.warning) {
                alertLevel = "warning";
            }

            if (alertLevel) {
                this.triggerAlert(metric, value, alertLevel, timestamp);
            }
        });
    }

    // Trigger an alert
    triggerAlert(metric, value, level, timestamp) {
        const alert = {
            id: this.alerts.length + 1,
            metric,
            value,
            level,
            timestamp,
            message: `${metric.toUpperCase()}: ${value} (${level} threshold exceeded)`,
            acknowledged: false
        };

        this.alerts.push(alert);

        // Log alert
        const emoji = level === "critical" ? "🚨" : "⚠️";
        console.log(`${emoji} ALERT: ${alert.message}`);

        // In production, this would send notifications
        this.sendNotification(alert);
    }

    // Send notification (simulated)
    sendNotification(alert) {
        // Simulate different notification channels
        const channels = ["email", "slack", "pagerduty"];
        
        channels.forEach(channel => {
            if (alert.level === "critical" || channel !== "pagerduty") {
                console.log(`   📧 Notification sent via ${channel}`);
            }
        });
    }

    // Get system health summary
    getHealthSummary() {
        const summary = {
            status: "healthy",
            lastUpdate: Date.now(),
            metrics: {},
            activeAlerts: this.alerts.filter(a => !a.acknowledged).length,
            criticalAlerts: this.alerts.filter(a => a.level === "critical" && !a.acknowledged).length
        };

        // Get latest values for key metrics
        ["block_time", "peer_count", "memory_usage", "block_height"].forEach(metric => {
            summary.metrics[metric] = this.getLastMetric(metric);
        });

        // Determine overall status
        if (summary.criticalAlerts > 0) {
            summary.status = "critical";
        } else if (summary.activeAlerts > 0) {
            summary.status = "warning";
        }

        return summary;
    }

    // Get metric history
    getMetricHistory(metric, duration = 3600000) { // 1 hour default
        const metricData = this.metrics.get(metric);
        if (!metricData) return [];

        const cutoff = Date.now() - duration;
        return metricData.filter(point => point.timestamp >= cutoff);
    }

    // Acknowledge alert
    acknowledgeAlert(alertId, acknowledgedBy) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedBy = acknowledgedBy;
            alert.acknowledgedAt = Date.now();
            console.log(`✅ Alert ${alertId} acknowledged by ${acknowledgedBy}`);
        }
    }

    // Get performance statistics
    getPerformanceStats() {
        const stats = {
            avgBlockTime: 0,
            blockCount: 0,
            totalTransactions: 0,
            avgTxPerBlock: 0,
            uptimePercentage: 99.9, // Simplified
            lastHourAlerts: 0
        };

        // Calculate averages
        const blockTimes = this.getMetricHistory("block_time");
        if (blockTimes.length > 0) {
            stats.avgBlockTime = blockTimes.reduce((sum, p) => sum + p.value, 0) / blockTimes.length;
        }

        stats.blockCount = this.getLastMetric("block_height");
        
        const recentAlerts = this.alerts.filter(a => a.timestamp > Date.now() - 3600000);
        stats.lastHourAlerts = recentAlerts.length;

        return stats;
    }
}

// === 4. API Gateway and Integration ===

class APIGateway {
    constructor() {
        this.services = new Map();
        this.rateLimits = new Map();
        this.apiKeys = new Map();
        this.requestLogs = [];
        this.setupDefaultServices();
    }

    setupDefaultServices() {
        const services = [
            {
                name: "rpc",
                endpoint: "ws://localhost:9944",
                methods: ["system_health", "chain_getBlock", "state_getStorage"],
                rateLimit: 1000 // requests per minute
            },
            {
                name: "indexer",
                endpoint: "http://localhost:3000",
                methods: ["getTransactions", "getBlocks", "getEvents"],
                rateLimit: 500
            },
            {
                name: "analytics",
                endpoint: "http://localhost:4000",
                methods: ["getMetrics", "getStats", "getCharts"],
                rateLimit: 100
            }
        ];

        services.forEach(service => {
            this.registerService(service.name, service);
        });
    }

    // Register external service
    registerService(name, config) {
        console.log(`🔌 Registering service: ${name}`);
        
        this.services.set(name, {
            name,
            endpoint: config.endpoint,
            methods: config.methods || [],
            rateLimit: config.rateLimit || 100,
            active: true,
            totalRequests: 0,
            lastRequest: 0,
            healthStatus: "unknown"
        });
    }

    // Generate API key
    generateAPIKey(userId, permissions) {
        const apiKey = `pk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.apiKeys.set(apiKey, {
            userId,
            permissions,
            created: Date.now(),
            lastUsed: 0,
            requestCount: 0,
            rateLimit: 1000 // per hour
        });

        console.log(`🔑 API key generated for user ${userId}: ${apiKey}`);
        return apiKey;
    }

    // Handle API request
    async handleRequest(apiKey, service, method, params) {
        console.log(`\n📡 API Request: ${service}.${method}`);
        
        // Validate API key
        const keyInfo = this.apiKeys.get(apiKey);
        if (!keyInfo) {
            throw new Error("Invalid API key");
        }

        // Check rate limiting
        if (!this.checkRateLimit(apiKey, service)) {
            throw new Error("Rate limit exceeded");
        }

        // Validate service and method
        const serviceInfo = this.services.get(service);
        if (!serviceInfo || !serviceInfo.active) {
            throw new Error(`Service ${service} not available`);
        }

        if (!serviceInfo.methods.includes(method)) {
            throw new Error(`Method ${method} not supported by ${service}`);
        }

        // Log request
        const requestLog = {
            timestamp: Date.now(),
            apiKey: apiKey.substr(0, 10) + "...",
            service,
            method,
            params,
            userId: keyInfo.userId
        };

        this.requestLogs.push(requestLog);

        // Update counters
        keyInfo.lastUsed = Date.now();
        keyInfo.requestCount++;
        serviceInfo.totalRequests++;
        serviceInfo.lastRequest = Date.now();

        try {
            // Route to appropriate service
            const result = await this.routeRequest(service, method, params);
            
            requestLog.status = "success";
            requestLog.duration = Date.now() - requestLog.timestamp;
            
            console.log(`   ✅ Request completed in ${requestLog.duration}ms`);
            
            return result;
        } catch (error) {
            requestLog.status = "error";
            requestLog.error = error.message;
            
            console.log(`   ❌ Request failed: ${error.message}`);
            throw error;
        }
    }

    // Route request to appropriate service
    async routeRequest(service, method, params) {
        // Simulate different service responses
        await this.sleep(Math.random() * 1000); // Variable response time

        switch (service) {
            case "rpc":
                return this.handleRPCRequest(method, params);
            case "indexer":
                return this.handleIndexerRequest(method, params);
            case "analytics":
                return this.handleAnalyticsRequest(method, params);
            default:
                throw new Error(`Unknown service: ${service}`);
        }
    }

    // Handle RPC requests
    handleRPCRequest(method, params) {
        switch (method) {
            case "system_health":
                return {
                    peers: 23,
                    isSyncing: false,
                    shouldHavePeers: true
                };
            case "chain_getBlock":
                return {
                    block: {
                        header: {
                            number: "0x12345",
                            parentHash: "0xabcdef...",
                            stateRoot: "0x123456..."
                        },
                        extrinsics: []
                    }
                };
            case "state_getStorage":
                return {
                    result: "0x" + Math.random().toString(16).substr(2, 32)
                };
            default:
                throw new Error(`Unknown RPC method: ${method}`);
        }
    }

    // Handle indexer requests
    handleIndexerRequest(method, params) {
        switch (method) {
            case "getTransactions":
                return {
                    transactions: Array.from({ length: 10 }, (_, i) => ({
                        hash: `0x${i.toString(16).padStart(64, '0')}`,
                        blockNumber: 12345 + i,
                        success: Math.random() > 0.1
                    }))
                };
            case "getBlocks":
                return {
                    blocks: Array.from({ length: 5 }, (_, i) => ({
                        number: 12340 + i,
                        hash: `0x${i.toString(16).padStart(64, '0')}`,
                        timestamp: Date.now() - (i * 12000)
                    }))
                };
            case "getEvents":
                return {
                    events: Array.from({ length: 20 }, (_, i) => ({
                        eventId: `event_${i}`,
                        blockNumber: 12345,
                        event: "Transfer",
                        data: { from: "alice", to: "bob", amount: 1000 }
                    }))
                };
            default:
                throw new Error(`Unknown indexer method: ${method}`);
        }
    }

    // Handle analytics requests
    handleAnalyticsRequest(method, params) {
        switch (method) {
            case "getMetrics":
                return {
                    blockTime: 12.5,
                    txPerSecond: 15.3,
                    activeAccounts: 1250,
                    totalSupply: 1000000000
                };
            case "getStats":
                return {
                    totalBlocks: 123456,
                    totalTransactions: 5678900,
                    uniqueAddresses: 98765,
                    avgBlockSize: 125.6
                };
            case "getCharts":
                return {
                    chartData: Array.from({ length: 24 }, (_, i) => ({
                        hour: i,
                        transactions: Math.floor(Math.random() * 1000),
                        value: Math.random() * 100
                    }))
                };
            default:
                throw new Error(`Unknown analytics method: ${method}`);
        }
    }

    // Check rate limiting
    checkRateLimit(apiKey, service) {
        const keyInfo = this.apiKeys.get(apiKey);
        const serviceInfo = this.services.get(service);
        
        if (!keyInfo || !serviceInfo) return false;

        // Simple rate limiting (in production, use Redis or similar)
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute window

        const recentRequests = this.requestLogs.filter(log => 
            log.apiKey.startsWith(apiKey.substr(0, 10)) &&
            log.timestamp >= windowStart &&
            log.service === service
        );

        return recentRequests.length < serviceInfo.rateLimit / 60; // per minute
    }

    // Get API usage statistics
    getUsageStats() {
        const stats = {
            totalRequests: this.requestLogs.length,
            uniqueUsers: new Set(this.requestLogs.map(r => r.userId)).size,
            topServices: {},
            hourlyRequestCount: 0,
            errorRate: 0
        };

        // Calculate service usage
        this.requestLogs.forEach(log => {
            stats.topServices[log.service] = (stats.topServices[log.service] || 0) + 1;
        });

        // Calculate hourly requests and error rate
        const hourAgo = Date.now() - 3600000;
        const recentLogs = this.requestLogs.filter(log => log.timestamp >= hourAgo);
        stats.hourlyRequestCount = recentLogs.length;
        
        const errors = recentLogs.filter(log => log.status === "error").length;
        stats.errorRate = recentLogs.length > 0 ? errors / recentLogs.length : 0;

        return stats;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// === 5. Demonstration Functions ===

function demonstrateDeploymentPipeline() {
    console.log("🚀 Deployment Pipeline Demo");
    console.log("============================");

    const pipeline = new DeploymentPipeline();

    // Create deployment configurations
    const testnetConfig = pipeline.createDeploymentConfig(2000, "testnet", "v1.0.0");
    console.log("Testnet config created:", testnetConfig.parachainId);

    // Deploy to testnet
    pipeline.deployParachain(2000, "testnet", testnetConfig)
        .then(deployment => {
            console.log(`Deployment completed: ${deployment.status}`);
        })
        .catch(error => {
            console.error("Deployment failed:", error.message);
        });
}

function demonstrateBridgeProtocol() {
    console.log("\n🌉 Bridge Protocol Demo");
    console.log("========================");

    const bridge = new BridgeProtocol("optimistic");

    // Register chains
    bridge.registerChain("polkadot", "Polkadot", "substrate", {});
    bridge.registerChain("ethereum", "Ethereum", "ethereum", {});
    bridge.registerChain("bitcoin", "Bitcoin", "bitcoin", {});

    // Create bridges
    bridge.createBridge("polkadot", "ethereum", ["DOT", "USDT"], {
        minTransfer: 10,
        maxTransfer: 100000,
        fee: 0.002,
        confirmations: 6
    });

    // Register relayers
    bridge.registerRelayer("relayer1", ["polkadot", "ethereum"], 50000, "https://relayer1.com");
    bridge.registerRelayer("relayer2", ["polkadot", "ethereum"], 75000, "https://relayer2.com");

    // Initiate transfer
    const transferId = bridge.initiateTransfer(
        "polkadot_ethereum",
        "DOT",
        1000,
        "0xrecipient...",
        "alice"
    );

    console.log(`Transfer initiated: ${transferId}`);

    // Simulate fraud proof (5% chance)
    setTimeout(() => {
        if (Math.random() < 0.05) {
            bridge.submitFraudProof(transferId, {
                invalidTx: "0xevidence...",
                reason: "Invalid signature"
            }, "fraud_detector");
        }
    }, 3000);
}

function demonstrateMonitoringSystem() {
    console.log("\n📊 Monitoring System Demo");
    console.log("==========================");

    const monitoring = new MonitoringSystem();

    // Simulate running for a few seconds to generate data
    setTimeout(() => {
        console.log("\nHealth Summary:");
        const health = monitoring.getHealthSummary();
        console.log(JSON.stringify(health, null, 2));

        console.log("\nPerformance Stats:");
        const performance = monitoring.getPerformanceStats();
        console.log(JSON.stringify(performance, null, 2));

        // Acknowledge any alerts
        const activeAlerts = monitoring.alerts.filter(a => !a.acknowledged);
        if (activeAlerts.length > 0) {
            monitoring.acknowledgeAlert(activeAlerts[0].id, "operator");
        }
    }, 15000);
}

function demonstrateAPIGateway() {
    console.log("\n📡 API Gateway Demo");
    console.log("===================");

    const gateway = new APIGateway();

    // Generate API key
    const apiKey = gateway.generateAPIKey("developer1", ["read", "write"]);

    // Make some API requests
    const requests = [
        { service: "rpc", method: "system_health", params: {} },
        { service: "indexer", method: "getTransactions", params: { limit: 10 } },
        { service: "analytics", method: "getMetrics", params: {} },
        { service: "rpc", method: "chain_getBlock", params: { hash: "latest" } }
    ];

    // Execute requests with delays
    requests.forEach((req, index) => {
        setTimeout(async () => {
            try {
                const result = await gateway.handleRequest(apiKey, req.service, req.method, req.params);
                console.log(`Request ${index + 1} result:`, Object.keys(result));
            } catch (error) {
                console.error(`Request ${index + 1} failed:`, error.message);
            }
        }, index * 1000);
    });

    // Show usage stats after requests
    setTimeout(() => {
        console.log("\nAPI Usage Stats:");
        const stats = gateway.getUsageStats();
        console.log(JSON.stringify(stats, null, 2));
    }, 5000);
}

function analyzeEcosystemIntegration() {
    console.log("\n🌐 Ecosystem Integration Analysis");
    console.log("==================================");

    const integrationPoints = [
        {
            category: "Infrastructure",
            components: ["Collator nodes", "RPC endpoints", "Indexing services", "Monitoring systems"],
            challenges: ["High availability", "Scalability", "Security", "Cost optimization"]
        },
        {
            category: "Interoperability",
            components: ["XCM integration", "Bridge protocols", "Asset transfers", "Message passing"],
            challenges: ["Trust assumptions", "Latency", "Finality", "Liquidity"]
        },
        {
            category: "Developer Experience",
            components: ["APIs", "SDKs", "Documentation", "Tools"],
            challenges: ["Complexity", "Learning curve", "Debugging", "Testing"]
        },
        {
            category: "User Experience",
            components: ["Wallets", "dApps", "Mobile apps", "Web interfaces"],
            challenges: ["Onboarding", "Performance", "Security", "Fees"]
        }
    ];

    integrationPoints.forEach(point => {
        console.log(`\n${point.category}:`);
        console.log(`  Components: ${point.components.join(", ")}`);
        console.log(`  Challenges: ${point.challenges.join(", ")}`);
    });

    console.log("\nBest Practices:");
    console.log("• Implement comprehensive monitoring and alerting");
    console.log("• Use infrastructure as code for reproducible deployments");
    console.log("• Design for high availability and disaster recovery");
    console.log("• Implement proper security measures and regular audits");
    console.log("• Provide excellent developer documentation and tools");
    console.log("• Build community engagement and support systems");
}

// === Main Execution ===

function main() {
    try {
        console.log("Starting Ecosystem Integration Mastery demonstration...\n");

        demonstrateDeploymentPipeline();
        demonstrateBridgeProtocol();
        demonstrateMonitoringSystem();
        demonstrateAPIGateway();
        analyzeEcosystemIntegration();

        console.log("\n🎉 Ecosystem Integration Mastery Complete!");
        console.log("\nKey Takeaways:");
        console.log("• Production deployment requires careful planning and automation");
        console.log("• Bridge protocols enable cross-ecosystem value transfer");
        console.log("• Comprehensive monitoring is essential for reliability");
        console.log("• API gateways provide unified access to ecosystem services");
        console.log("• Success requires strong infrastructure and developer experience");

    } catch (error) {
        console.error("❌ Error in ecosystem integration demonstration:", error.message);
    }
}

// Run the demonstration
if (require.main === module) {
    main();
}

module.exports = {
    DeploymentPipeline,
    BridgeProtocol,
    MonitoringSystem,
    APIGateway
};
