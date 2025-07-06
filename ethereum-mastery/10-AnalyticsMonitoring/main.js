// Module 10: Analytics & Monitoring - Comprehensive Protocol Monitoring
// This module demonstrates building analytics and monitoring systems for Ethereum protocols

const { ethers } = require('ethers');

console.log('=== Ethereum Analytics & Monitoring Mastery ===\n');

// 10.1 Blockchain Data Analytics
class BlockchainAnalytics {
    constructor(provider) {
        this.provider = provider;
        this.dataCache = new Map();
        this.eventFilters = new Map();
    }

    // Extract and analyze transaction data
    async analyzeTransactionData(fromBlock, toBlock) {
        console.log('\n📊 Analyzing Transaction Data...');
        console.log(`   Block range: ${fromBlock} to ${toBlock}`);
        
        const analytics = {
            totalTransactions: 0,
            totalGasUsed: 0n,
            averageGasPrice: 0n,
            transactionTypes: new Map(),
            topContracts: new Map(),
            gasStats: {
                min: Infinity,
                max: 0,
                prices: []
            }
        };

        // Mock transaction analysis (in real implementation, would iterate through blocks)
        const mockTransactions = this.generateMockTransactionData(100);
        
        for (const tx of mockTransactions) {
            analytics.totalTransactions++;
            analytics.totalGasUsed += BigInt(tx.gasUsed);
            analytics.gasStats.prices.push(tx.gasPrice);
            
            // Track transaction types
            const txType = tx.to ? 'contract_call' : 'contract_creation';
            analytics.transactionTypes.set(txType, 
                (analytics.transactionTypes.get(txType) || 0) + 1);
            
            // Track popular contracts
            if (tx.to) {
                analytics.topContracts.set(tx.to,
                    (analytics.topContracts.get(tx.to) || 0) + 1);
            }
            
            // Gas price stats
            analytics.gasStats.min = Math.min(analytics.gasStats.min, tx.gasPrice);
            analytics.gasStats.max = Math.max(analytics.gasStats.max, tx.gasPrice);
        }

        // Calculate averages
        analytics.averageGasPrice = BigInt(
            analytics.gasStats.prices.reduce((sum, price) => sum + price, 0) / 
            analytics.gasStats.prices.length
        );

        this.displayAnalytics(analytics);
        return analytics;
    }

    // Generate mock transaction data
    generateMockTransactionData(count) {
        const transactions = [];
        const contracts = [
            '0xA0b86a33E6441B8e9FB9efE62E5B46f2Dc06E21B', // Uniswap
            '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', // Aave
            '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'  // SushiSwap
        ];

        for (let i = 0; i < count; i++) {
            transactions.push({
                hash: `0x${Math.random().toString(16).substr(2, 64)}`,
                to: Math.random() > 0.1 ? contracts[Math.floor(Math.random() * contracts.length)] : null,
                gasUsed: Math.floor(Math.random() * 500000) + 21000,
                gasPrice: Math.floor(Math.random() * 100) + 20,
                value: Math.random() * 10,
                blockNumber: Math.floor(Math.random() * 1000) + 18500000
            });
        }

        return transactions;
    }

    // Display analytics results
    displayAnalytics(analytics) {
        console.log('\n📈 Transaction Analytics Results:');
        console.log(`   Total transactions: ${analytics.totalTransactions}`);
        console.log(`   Total gas used: ${analytics.totalGasUsed.toString()}`);
        console.log(`   Average gas price: ${analytics.averageGasPrice.toString()} gwei`);
        console.log(`   Min gas price: ${analytics.gasStats.min} gwei`);
        console.log(`   Max gas price: ${analytics.gasStats.max} gwei`);

        console.log('\n   Transaction types:');
        analytics.transactionTypes.forEach((count, type) => {
            console.log(`     ${type}: ${count}`);
        });

        console.log('\n   Top contracts by activity:');
        const sortedContracts = Array.from(analytics.topContracts.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        sortedContracts.forEach(([contract, count]) => {
            console.log(`     ${contract}: ${count} transactions`);
        });
    }

    // Extract and analyze event logs
    async analyzeEventLogs(contractAddress, eventTopics, fromBlock, toBlock) {
        console.log('\n📋 Analyzing Event Logs...');
        console.log(`   Contract: ${contractAddress}`);
        console.log(`   Block range: ${fromBlock} to ${toBlock}`);

        // Mock event log analysis
        const mockEvents = [
            {
                event: 'Transfer',
                count: 1250,
                totalValue: '125000000000000000000000', // 125,000 tokens
                uniqueAddresses: 350
            },
            {
                event: 'Swap',
                count: 450,
                totalVolume: '50000000000000000000000', // 50,000 ETH
                uniqueTraders: 180
            },
            {
                event: 'Deposit',
                count: 220,
                totalAmount: '75000000000000000000000', // 75,000 tokens
                uniqueDepositors: 120
            }
        ];

        console.log('\n   Event analysis results:');
        mockEvents.forEach(event => {
            console.log(`\n   ${event.event} Events:`);
            console.log(`     Count: ${event.count}`);
            if (event.totalValue) console.log(`     Total value: ${ethers.formatEther(event.totalValue)} tokens`);
            if (event.totalVolume) console.log(`     Total volume: ${ethers.formatEther(event.totalVolume)} ETH`);
            if (event.totalAmount) console.log(`     Total amount: ${ethers.formatEther(event.totalAmount)} tokens`);
            console.log(`     Unique addresses: ${event.uniqueAddresses || event.uniqueTraders || event.uniqueDepositors}`);
        });

        return mockEvents;
    }
}

// 10.2 Real-time Monitoring System
class RealTimeMonitor {
    constructor(provider) {
        this.provider = provider;
        this.monitors = new Map();
        this.alerts = [];
        this.isRunning = false;
    }

    // Start monitoring system
    startMonitoring() {
        console.log('\n🔍 Starting Real-time Monitoring System...');
        this.isRunning = true;

        // Monitor new blocks
        this.monitorBlocks();
        
        // Monitor gas prices
        this.monitorGasPrices();
        
        // Monitor mempool
        this.monitorMempool();
        
        // Monitor specific contracts
        this.monitorContracts();

        console.log('✅ All monitoring systems active');
    }

    // Monitor new blocks
    monitorBlocks() {
        console.log('\n📦 Monitoring new blocks...');
        
        // Mock block monitoring
        setInterval(() => {
            if (!this.isRunning) return;
            
            const mockBlock = {
                number: Math.floor(Math.random() * 1000000) + 18500000,
                timestamp: Date.now(),
                gasUsed: Math.floor(Math.random() * 15000000) + 5000000,
                gasLimit: 15000000,
                transactionCount: Math.floor(Math.random() * 200) + 50
            };

            console.log(`   📦 Block ${mockBlock.number}: ${mockBlock.transactionCount} txs, ${Math.floor(mockBlock.gasUsed / mockBlock.gasLimit * 100)}% full`);
            
            // Check for alerts
            this.checkBlockAlerts(mockBlock);
            
        }, 5000); // Check every 5 seconds
    }

    // Monitor gas prices
    monitorGasPrices() {
        console.log('\n⛽ Monitoring gas prices...');
        
        const gasTracker = {
            current: 25,
            trend: 'stable',
            history: []
        };

        setInterval(() => {
            if (!this.isRunning) return;
            
            // Simulate gas price changes
            const change = (Math.random() - 0.5) * 10;
            gasTracker.current += change;
            gasTracker.current = Math.max(10, gasTracker.current); // Minimum 10 gwei
            
            gasTracker.history.push({
                price: gasTracker.current,
                timestamp: Date.now()
            });

            // Keep only last 20 readings
            if (gasTracker.history.length > 20) {
                gasTracker.history.shift();
            }

            // Determine trend
            if (gasTracker.history.length >= 5) {
                const recent = gasTracker.history.slice(-5);
                const trend = recent[recent.length - 1].price - recent[0].price;
                gasTracker.trend = trend > 2 ? 'rising' : trend < -2 ? 'falling' : 'stable';
            }

            console.log(`   ⛽ Gas price: ${gasTracker.current.toFixed(1)} gwei (${gasTracker.trend})`);
            
            // Check for gas price alerts
            this.checkGasAlerts(gasTracker);
            
        }, 3000); // Check every 3 seconds
    }

    // Monitor mempool
    monitorMempool() {
        console.log('\n🏊 Monitoring mempool...');
        
        setInterval(() => {
            if (!this.isRunning) return;
            
            const mempoolStats = {
                pendingTxs: Math.floor(Math.random() * 50000) + 10000,
                averageGasPrice: Math.floor(Math.random() * 50) + 20,
                congestionLevel: Math.random()
            };

            let congestionStatus = 'low';
            if (mempoolStats.congestionLevel > 0.7) congestionStatus = 'high';
            else if (mempoolStats.congestionLevel > 0.4) congestionStatus = 'medium';

            console.log(`   🏊 Mempool: ${mempoolStats.pendingTxs} pending, avg ${mempoolStats.averageGasPrice} gwei, congestion: ${congestionStatus}`);
            
            // Check for mempool alerts
            this.checkMempoolAlerts(mempoolStats);
            
        }, 7000); // Check every 7 seconds
    }

    // Monitor specific contracts
    monitorContracts() {
        console.log('\n🔍 Monitoring specific contracts...');
        
        const contractsToMonitor = [
            { address: '0xA0b86a33E6441B8e9FB9efE62E5B46f2Dc06E21B', name: 'Uniswap Router' },
            { address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', name: 'Aave Pool' }
        ];

        contractsToMonitor.forEach(contract => {
            setInterval(() => {
                if (!this.isRunning) return;
                
                const activity = {
                    txCount: Math.floor(Math.random() * 20) + 1,
                    gasUsage: Math.floor(Math.random() * 1000000) + 100000,
                    uniqueUsers: Math.floor(Math.random() * 15) + 1
                };

                console.log(`   🔍 ${contract.name}: ${activity.txCount} txs, ${activity.uniqueUsers} users`);
                
            }, 10000); // Check every 10 seconds
        });
    }

    // Check for block-related alerts
    checkBlockAlerts(block) {
        const utilizationRate = block.gasUsed / block.gasLimit;
        
        if (utilizationRate > 0.95) {
            this.createAlert('HIGH_BLOCK_UTILIZATION', `Block ${block.number} is ${Math.floor(utilizationRate * 100)}% full`, 'high');
        }

        if (block.transactionCount > 250) {
            this.createAlert('HIGH_TRANSACTION_COUNT', `Block ${block.number} contains ${block.transactionCount} transactions`, 'medium');
        }
    }

    // Check for gas price alerts
    checkGasAlerts(gasTracker) {
        if (gasTracker.current > 100) {
            this.createAlert('HIGH_GAS_PRICE', `Gas price is ${gasTracker.current.toFixed(1)} gwei`, 'high');
        } else if (gasTracker.current > 50) {
            this.createAlert('ELEVATED_GAS_PRICE', `Gas price is ${gasTracker.current.toFixed(1)} gwei`, 'medium');
        }

        if (gasTracker.trend === 'rising' && gasTracker.current > 30) {
            this.createAlert('GAS_PRICE_RISING', `Gas prices trending upward: ${gasTracker.current.toFixed(1)} gwei`, 'low');
        }
    }

    // Check for mempool alerts
    checkMempoolAlerts(mempoolStats) {
        if (mempoolStats.pendingTxs > 40000) {
            this.createAlert('HIGH_MEMPOOL_CONGESTION', `${mempoolStats.pendingTxs} transactions pending`, 'high');
        }

        if (mempoolStats.congestionLevel > 0.8) {
            this.createAlert('NETWORK_CONGESTION', 'High network congestion detected', 'medium');
        }
    }

    // Create alert
    createAlert(type, message, severity) {
        const alert = {
            id: Date.now(),
            type,
            message,
            severity,
            timestamp: new Date().toISOString()
        };

        this.alerts.push(alert);
        
        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
            this.alerts.shift();
        }

        console.log(`   🚨 ALERT [${severity.toUpperCase()}]: ${message}`);
        
        // In real implementation, would send notifications
        this.handleAlert(alert);
    }

    // Handle alert notifications
    handleAlert(alert) {
        if (alert.severity === 'high') {
            console.log(`   📱 Sending immediate notification for: ${alert.message}`);
        }
        
        // Would integrate with notification services like:
        // - Discord/Slack webhooks
        // - Email notifications
        // - SMS alerts
        // - PagerDuty/OpsGenie
    }

    // Stop monitoring
    stopMonitoring() {
        console.log('\n🛑 Stopping monitoring system...');
        this.isRunning = false;
    }

    // Get recent alerts
    getRecentAlerts(count = 10) {
        return this.alerts.slice(-count).reverse();
    }
}

// 10.3 Protocol Metrics & KPIs
class ProtocolMetrics {
    constructor() {
        this.metrics = new Map();
        this.historicalData = new Map();
    }

    // Calculate Total Value Locked (TVL)
    async calculateTVL(protocolContracts) {
        console.log('\n💰 Calculating Total Value Locked (TVL)...');
        
        let totalTVL = 0;
        const breakdown = new Map();

        // Mock TVL calculation for different pools/contracts
        for (const contract of protocolContracts) {
            const tvl = Math.random() * 100000000; // Random TVL between 0-100M
            breakdown.set(contract.name, tvl);
            totalTVL += tvl;
        }

        console.log(`   Total TVL: $${totalTVL.toLocaleString('en-US', { maximumFractionDigits: 0 })}`);
        console.log('\n   Breakdown by pool:');
        breakdown.forEach((tvl, poolName) => {
            const percentage = (tvl / totalTVL * 100).toFixed(1);
            console.log(`     ${poolName}: $${tvl.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${percentage}%)`);
        });

        this.metrics.set('tvl', { total: totalTVL, breakdown, timestamp: Date.now() });
        return { total: totalTVL, breakdown };
    }

    // Calculate trading volume metrics
    async calculateVolumeMetrics(timeframe = '24h') {
        console.log(`\n📊 Calculating ${timeframe} Volume Metrics...`);
        
        const volumeData = {
            totalVolume: Math.random() * 50000000, // Random volume
            trades: Math.floor(Math.random() * 10000) + 1000,
            uniqueTraders: Math.floor(Math.random() * 2000) + 500,
            averageTradeSize: 0,
            topPairs: new Map()
        };

        volumeData.averageTradeSize = volumeData.totalVolume / volumeData.trades;

        // Mock top trading pairs
        const pairs = ['ETH/USDC', 'WBTC/ETH', 'USDT/USDC', 'LINK/ETH', 'UNI/ETH'];
        pairs.forEach(pair => {
            volumeData.topPairs.set(pair, Math.random() * volumeData.totalVolume * 0.3);
        });

        console.log(`   Total Volume: $${volumeData.totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}`);
        console.log(`   Total Trades: ${volumeData.trades.toLocaleString()}`);
        console.log(`   Unique Traders: ${volumeData.uniqueTraders.toLocaleString()}`);
        console.log(`   Average Trade Size: $${volumeData.averageTradeSize.toLocaleString('en-US', { maximumFractionDigits: 0 })}`);

        console.log('\n   Top trading pairs:');
        const sortedPairs = Array.from(volumeData.topPairs.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        sortedPairs.forEach(([pair, volume]) => {
            const percentage = (volume / volumeData.totalVolume * 100).toFixed(1);
            console.log(`     ${pair}: $${volume.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${percentage}%)`);
        });

        this.metrics.set('volume', { ...volumeData, timeframe, timestamp: Date.now() });
        return volumeData;
    }

    // Calculate user behavior metrics
    async calculateUserMetrics() {
        console.log('\n👥 Calculating User Behavior Metrics...');
        
        const userMetrics = {
            dailyActiveUsers: Math.floor(Math.random() * 5000) + 1000,
            weeklyActiveUsers: Math.floor(Math.random() * 20000) + 5000,
            monthlyActiveUsers: Math.floor(Math.random() * 80000) + 20000,
            newUsers: Math.floor(Math.random() * 500) + 100,
            returningUsers: Math.floor(Math.random() * 1000) + 500,
            averageSessionDuration: Math.floor(Math.random() * 600) + 300, // seconds
            retentionRate: {
                day1: Math.random() * 0.3 + 0.4, // 40-70%
                day7: Math.random() * 0.2 + 0.2, // 20-40%
                day30: Math.random() * 0.1 + 0.1 // 10-20%
            }
        };

        console.log(`   Daily Active Users: ${userMetrics.dailyActiveUsers.toLocaleString()}`);
        console.log(`   Weekly Active Users: ${userMetrics.weeklyActiveUsers.toLocaleString()}`);
        console.log(`   Monthly Active Users: ${userMetrics.monthlyActiveUsers.toLocaleString()}`);
        console.log(`   New Users (24h): ${userMetrics.newUsers.toLocaleString()}`);
        console.log(`   Returning Users (24h): ${userMetrics.returningUsers.toLocaleString()}`);
        console.log(`   Avg Session Duration: ${Math.floor(userMetrics.averageSessionDuration / 60)} minutes`);
        
        console.log('\n   User Retention:');
        console.log(`     Day 1: ${(userMetrics.retentionRate.day1 * 100).toFixed(1)}%`);
        console.log(`     Day 7: ${(userMetrics.retentionRate.day7 * 100).toFixed(1)}%`);
        console.log(`     Day 30: ${(userMetrics.retentionRate.day30 * 100).toFixed(1)}%`);

        this.metrics.set('users', { ...userMetrics, timestamp: Date.now() });
        return userMetrics;
    }

    // Calculate revenue and fee metrics
    async calculateRevenueMetrics() {
        console.log('\n💵 Calculating Revenue & Fee Metrics...');
        
        const revenueMetrics = {
            totalFees24h: Math.random() * 500000,
            protocolRevenue24h: Math.random() * 100000,
            lpRewards24h: Math.random() * 300000,
            feeBreakdown: new Map(),
            averageFeePerTx: 0,
            revenueGrowth: {
                daily: (Math.random() - 0.5) * 20, // -10% to +10%
                weekly: (Math.random() - 0.5) * 50, // -25% to +25%
                monthly: (Math.random() - 0.5) * 100 // -50% to +50%
            }
        };

        // Fee breakdown by service
        revenueMetrics.feeBreakdown.set('Trading Fees', revenueMetrics.totalFees24h * 0.6);
        revenueMetrics.feeBreakdown.set('Lending Fees', revenueMetrics.totalFees24h * 0.3);
        revenueMetrics.feeBreakdown.set('Other Fees', revenueMetrics.totalFees24h * 0.1);

        // Estimate transactions for average calculation
        const estimatedTxs = Math.floor(Math.random() * 50000) + 10000;
        revenueMetrics.averageFeePerTx = revenueMetrics.totalFees24h / estimatedTxs;

        console.log(`   Total Fees (24h): $${revenueMetrics.totalFees24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}`);
        console.log(`   Protocol Revenue (24h): $${revenueMetrics.protocolRevenue24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}`);
        console.log(`   LP Rewards (24h): $${revenueMetrics.lpRewards24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}`);
        console.log(`   Average Fee per Transaction: $${revenueMetrics.averageFeePerTx.toFixed(2)}`);

        console.log('\n   Fee breakdown:');
        revenueMetrics.feeBreakdown.forEach((amount, feeType) => {
            const percentage = (amount / revenueMetrics.totalFees24h * 100).toFixed(1);
            console.log(`     ${feeType}: $${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${percentage}%)`);
        });

        console.log('\n   Revenue growth:');
        console.log(`     Daily: ${revenueMetrics.revenueGrowth.daily > 0 ? '+' : ''}${revenueMetrics.revenueGrowth.daily.toFixed(1)}%`);
        console.log(`     Weekly: ${revenueMetrics.revenueGrowth.weekly > 0 ? '+' : ''}${revenueMetrics.revenueGrowth.weekly.toFixed(1)}%`);
        console.log(`     Monthly: ${revenueMetrics.revenueGrowth.monthly > 0 ? '+' : ''}${revenueMetrics.revenueGrowth.monthly.toFixed(1)}%`);

        this.metrics.set('revenue', { ...revenueMetrics, timestamp: Date.now() });
        return revenueMetrics;
    }

    // Get comprehensive protocol health score
    calculateHealthScore() {
        console.log('\n🏥 Calculating Protocol Health Score...');
        
        const healthFactors = {
            tvlGrowth: Math.random() * 100, // 0-100
            volumeConsistency: Math.random() * 100,
            userRetention: Math.random() * 100,
            revenueStability: Math.random() * 100,
            technicalHealth: Math.random() * 100
        };

        const weights = {
            tvlGrowth: 0.25,
            volumeConsistency: 0.2,
            userRetention: 0.2,
            revenueStability: 0.2,
            technicalHealth: 0.15
        };

        let overallScore = 0;
        Object.entries(healthFactors).forEach(([factor, score]) => {
            overallScore += score * weights[factor];
        });

        console.log('   Health factors:');
        Object.entries(healthFactors).forEach(([factor, score]) => {
            console.log(`     ${factor}: ${score.toFixed(1)}/100`);
        });

        console.log(`\n   Overall Health Score: ${overallScore.toFixed(1)}/100`);
        
        let healthStatus = 'Poor';
        if (overallScore >= 80) healthStatus = 'Excellent';
        else if (overallScore >= 60) healthStatus = 'Good';
        else if (overallScore >= 40) healthStatus = 'Fair';
        
        console.log(`   Status: ${healthStatus}`);

        return { score: overallScore, factors: healthFactors, status: healthStatus };
    }
}

// 10.4 Dashboard & Visualization
class AnalyticsDashboard {
    constructor() {
        this.widgets = new Map();
        this.refreshInterval = 30000; // 30 seconds
        this.isRunning = false;
    }

    // Initialize dashboard
    initializeDashboard() {
        console.log('\n📊 Initializing Analytics Dashboard...');
        
        this.widgets.set('tvl', { type: 'metric', title: 'Total Value Locked', refreshRate: 60000 });
        this.widgets.set('volume', { type: 'chart', title: '24h Trading Volume', refreshRate: 30000 });
        this.widgets.set('users', { type: 'table', title: 'User Metrics', refreshRate: 120000 });
        this.widgets.set('alerts', { type: 'list', title: 'Recent Alerts', refreshRate: 10000 });
        this.widgets.set('health', { type: 'gauge', title: 'Protocol Health', refreshRate: 300000 });

        console.log('✅ Dashboard initialized with widgets:');
        this.widgets.forEach((widget, id) => {
            console.log(`   ${id}: ${widget.title} (${widget.type})`);
        });
    }

    // Start dashboard updates
    startDashboard() {
        console.log('\n🖥️ Starting Dashboard Updates...');
        this.isRunning = true;

        // Simulate dashboard updates
        setInterval(() => {
            if (!this.isRunning) return;
            
            console.log('\n📊 Dashboard Update:');
            console.log(`   Timestamp: ${new Date().toISOString()}`);
            console.log('   Widgets refreshed: 5/5');
            console.log('   Active connections: 23');
            console.log('   Data latency: 1.2s');
            
        }, this.refreshInterval);
    }

    // Generate dashboard layout
    generateDashboardLayout() {
        const layout = {
            header: {
                title: 'Protocol Analytics Dashboard',
                lastUpdate: new Date().toISOString(),
                status: 'Online'
            },
            sections: {
                overview: {
                    widgets: ['tvl', 'volume', 'users'],
                    layout: 'row'
                },
                monitoring: {
                    widgets: ['alerts', 'health'],
                    layout: 'column'
                },
                charts: {
                    widgets: ['price-chart', 'volume-chart', 'user-chart'],
                    layout: 'grid'
                }
            },
            footer: {
                lastDataUpdate: new Date().toISOString(),
                dataProvider: 'Ethereum Node',
                version: '1.0.0'
            }
        };

        console.log('\n🎨 Dashboard Layout Generated:');
        console.log(`   Title: ${layout.header.title}`);
        console.log(`   Sections: ${Object.keys(layout.sections).length}`);
        console.log(`   Total widgets: ${Object.values(layout.sections).reduce((sum, section) => sum + section.widgets.length, 0)}`);

        return layout;
    }

    // Stop dashboard
    stopDashboard() {
        console.log('\n🛑 Stopping dashboard updates...');
        this.isRunning = false;
    }
}

// Demo execution
async function demonstrateAnalyticsMonitoring() {
    console.log('\n=== 10.1 Blockchain Analytics Demo ===');
    const provider = ethers.getDefaultProvider(); // Mock provider
    const analytics = new BlockchainAnalytics(provider);
    
    await analytics.analyzeTransactionData(18500000, 18500100);
    await analytics.analyzeEventLogs(
        '0xA0b86a33E6441B8e9FB9efE62E5B46f2Dc06E21B',
        ['Transfer', 'Swap'],
        18500000,
        18500100
    );

    console.log('\n=== 10.2 Real-time Monitoring Demo ===');
    const monitor = new RealTimeMonitor(provider);
    monitor.startMonitoring();

    // Let monitoring run for a short time
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    const recentAlerts = monitor.getRecentAlerts(5);
    console.log('\n🚨 Recent Alerts:');
    recentAlerts.forEach(alert => {
        console.log(`   [${alert.severity.toUpperCase()}] ${alert.message}`);
    });

    monitor.stopMonitoring();

    console.log('\n=== 10.3 Protocol Metrics Demo ===');
    const metrics = new ProtocolMetrics();
    
    const mockProtocolContracts = [
        { name: 'ETH/USDC Pool', address: '0x123...' },
        { name: 'WBTC/ETH Pool', address: '0x456...' },
        { name: 'Lending Pool', address: '0x789...' }
    ];

    await metrics.calculateTVL(mockProtocolContracts);
    await metrics.calculateVolumeMetrics('24h');
    await metrics.calculateUserMetrics();
    await metrics.calculateRevenueMetrics();
    const healthScore = metrics.calculateHealthScore();

    console.log('\n=== 10.4 Analytics Dashboard Demo ===');
    const dashboard = new AnalyticsDashboard();
    dashboard.initializeDashboard();
    dashboard.generateDashboardLayout();
    dashboard.startDashboard();

    // Let dashboard run briefly
    await new Promise(resolve => setTimeout(resolve, 10000));
    dashboard.stopDashboard();

    console.log('\n🎉 Analytics & Monitoring mastery complete!');
    console.log('\nKey takeaways:');
    console.log('- Comprehensive blockchain data analysis');
    console.log('- Real-time monitoring and alerting');
    console.log('- Protocol metrics and KPI calculation');
    console.log('- Dashboard design and implementation');
    console.log('- Performance monitoring and health scoring');
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BlockchainAnalytics,
        RealTimeMonitor,
        ProtocolMetrics,
        AnalyticsDashboard,
        demonstrateAnalyticsMonitoring
    };
}

// Run demo if called directly
if (require.main === module) {
    demonstrateAnalyticsMonitoring().catch(console.error);
}
