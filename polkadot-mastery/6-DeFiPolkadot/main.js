#!/usr/bin/env node

/**
 * Polkadot Mastery - Module 6: DeFi on Polkadot
 * 
 * This module demonstrates cross-parachain DeFi protocols,
 * liquid staking, yield farming, and cross-chain asset management.
 */

console.log("🌊 DeFi on Polkadot Mastery");
console.log("===========================\n");

// === 1. Cross-Parachain DEX ===

class CrossChainDEX {
    constructor() {
        this.parachains = new Map();
        this.crossChainPools = new Map();
        this.bridges = new Map();
        this.nextPoolId = 1;
        this.tradingFee = 0.003; // 0.3%
        this.bridgeFee = 0.001; // 0.1%
    }

    // Register a parachain with the DEX
    registerParachain(parachainId, name, nativeAsset) {
        console.log(`🔗 Registering parachain ${parachainId}: ${name}`);
        
        this.parachains.set(parachainId, {
            id: parachainId,
            name,
            nativeAsset,
            pools: new Map(),
            totalLiquidity: 0,
            volume24h: 0
        });
    }

    // Create cross-chain liquidity pool
    createCrossChainPool(assetA, assetB, parachainA, parachainB) {
        const poolId = this.nextPoolId++;
        
        console.log(`💧 Creating cross-chain pool ${poolId}: ${assetA}@${parachainA} <> ${assetB}@${parachainB}`);

        const pool = {
            id: poolId,
            assetA: { asset: assetA, parachain: parachainA },
            assetB: { asset: assetB, parachain: parachainB },
            reserveA: 0,
            reserveB: 0,
            totalSupply: 0,
            lpTokenHolders: new Map(),
            created: Date.now(),
            volume24h: 0
        };

        this.crossChainPools.set(poolId, pool);
        return poolId;
    }

    // Add liquidity to cross-chain pool
    addCrossChainLiquidity(poolId, amountA, amountB, provider) {
        const pool = this.crossChainPools.get(poolId);
        if (!pool) {
            throw new Error(`Pool ${poolId} not found`);
        }

        console.log(`\n➕ Adding cross-chain liquidity to pool ${poolId}`);
        console.log(`   ${amountA} ${pool.assetA.asset}@${pool.assetA.parachain}`);
        console.log(`   ${amountB} ${pool.assetB.asset}@${pool.assetB.parachain}`);

        // Calculate LP tokens to mint
        let lpTokens;
        if (pool.totalSupply === 0) {
            lpTokens = Math.sqrt(amountA * amountB);
        } else {
            const shareA = (amountA * pool.totalSupply) / pool.reserveA;
            const shareB = (amountB * pool.totalSupply) / pool.reserveB;
            lpTokens = Math.min(shareA, shareB);
        }

        // Update pool state
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalSupply += lpTokens;

        // Update LP token holdings
        const currentLP = pool.lpTokenHolders.get(provider) || 0;
        pool.lpTokenHolders.set(provider, currentLP + lpTokens);

        console.log(`   LP tokens minted: ${lpTokens}`);
        return lpTokens;
    }

    // Cross-chain swap with automatic bridging
    crossChainSwap(fromAsset, toAsset, fromParachain, toParachain, amount, user) {
        console.log(`\n🔄 Cross-chain swap: ${amount} ${fromAsset}@${fromParachain} → ${toAsset}@${toParachain}`);

        // Find routing path
        const route = this.findOptimalRoute(fromAsset, toAsset, fromParachain, toParachain, amount);
        
        if (!route) {
            throw new Error("No route found for cross-chain swap");
        }

        console.log(`   Route: ${route.steps.map(s => s.description).join(" → ")}`);

        let currentAmount = amount;
        let currentAsset = fromAsset;
        let currentParachain = fromParachain;

        // Execute each step in the route
        for (const step of route.steps) {
            switch (step.type) {
                case "bridge":
                    currentAmount = this.bridgeAsset(
                        currentAsset, 
                        currentAmount, 
                        currentParachain, 
                        step.targetParachain
                    );
                    currentParachain = step.targetParachain;
                    break;

                case "swap":
                    currentAmount = this.swapOnParachain(
                        step.poolId,
                        currentAsset,
                        step.targetAsset,
                        currentAmount
                    );
                    currentAsset = step.targetAsset;
                    break;
            }
        }

        console.log(`   Final output: ${currentAmount} ${currentAsset}@${currentParachain}`);
        return {
            outputAmount: currentAmount,
            outputAsset: currentAsset,
            outputParachain: currentParachain,
            route: route.steps
        };
    }

    // Find optimal routing path
    findOptimalRoute(fromAsset, toAsset, fromParachain, toParachain, amount) {
        // Simplified routing - in reality this would be more complex
        const steps = [];

        // If assets are on different parachains, bridge first
        if (fromParachain !== toParachain) {
            // Check if direct bridge exists
            if (this.bridges.has(`${fromParachain}_${toParachain}`)) {
                steps.push({
                    type: "bridge",
                    description: `Bridge ${fromAsset} from ${fromParachain} to ${toParachain}`,
                    targetParachain: toParachain
                });
            } else {
                // Route through relay chain or hub
                steps.push({
                    type: "bridge",
                    description: `Bridge ${fromAsset} from ${fromParachain} to relay`,
                    targetParachain: "relay"
                });
                steps.push({
                    type: "bridge",
                    description: `Bridge ${fromAsset} from relay to ${toParachain}`,
                    targetParachain: toParachain
                });
            }
        }

        // Find pool for asset swap
        if (fromAsset !== toAsset) {
            const poolId = this.findPoolForSwap(fromAsset, toAsset, toParachain);
            if (poolId) {
                steps.push({
                    type: "swap",
                    description: `Swap ${fromAsset} to ${toAsset}`,
                    poolId,
                    targetAsset: toAsset
                });
            }
        }

        return steps.length > 0 ? { steps } : null;
    }

    // Bridge asset between parachains
    bridgeAsset(asset, amount, fromParachain, toParachain) {
        console.log(`   🌉 Bridging ${amount} ${asset}: ${fromParachain} → ${toParachain}`);
        
        const bridgeFee = amount * this.bridgeFee;
        const bridgedAmount = amount - bridgeFee;

        // Simulate bridging delay and validation
        console.log(`   Bridge fee: ${bridgeFee} ${asset}`);
        console.log(`   Bridged amount: ${bridgedAmount} ${asset}`);

        return bridgedAmount;
    }

    // Swap on specific parachain
    swapOnParachain(poolId, fromAsset, toAsset, amount) {
        const pool = this.crossChainPools.get(poolId);
        if (!pool) {
            throw new Error(`Pool ${poolId} not found`);
        }

        console.log(`   💱 Swapping ${amount} ${fromAsset} → ${toAsset} on pool ${poolId}`);

        // Determine which asset is which in the pool
        let reserveIn, reserveOut;
        if (pool.assetA.asset === fromAsset) {
            reserveIn = pool.reserveA;
            reserveOut = pool.reserveB;
        } else {
            reserveIn = pool.reserveB;
            reserveOut = pool.reserveA;
        }

        // Apply constant product formula with fees
        const amountInWithFee = amount * (1 - this.tradingFee);
        const amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);

        // Update pool reserves
        if (pool.assetA.asset === fromAsset) {
            pool.reserveA += amount;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amount;
            pool.reserveA -= amountOut;
        }

        pool.volume24h += amount;

        console.log(`   Output: ${amountOut} ${toAsset}`);
        return amountOut;
    }

    // Find pool for asset swap
    findPoolForSwap(assetA, assetB, parachain) {
        for (const [poolId, pool] of this.crossChainPools) {
            const hasAssetA = pool.assetA.asset === assetA || pool.assetB.asset === assetA;
            const hasAssetB = pool.assetA.asset === assetB || pool.assetB.asset === assetB;
            const onParachain = pool.assetA.parachain === parachain || pool.assetB.parachain === parachain;
            
            if (hasAssetA && hasAssetB && onParachain) {
                return poolId;
            }
        }
        return null;
    }

    // Setup bridge connection
    setupBridge(fromParachain, toParachain, assets) {
        const bridgeId = `${fromParachain}_${toParachain}`;
        console.log(`🌉 Setting up bridge: ${bridgeId}`);
        
        this.bridges.set(bridgeId, {
            fromParachain,
            toParachain,
            supportedAssets: assets,
            totalVolume: 0,
            active: true
        });
    }
}

// === 2. Liquid Staking Protocol ===

class LiquidStakingProtocol {
    constructor(stakingAsset = "DOT") {
        this.stakingAsset = stakingAsset;
        this.liquidToken = `st${stakingAsset}`; // stDOT
        this.totalStaked = 0;
        this.totalLiquidSupply = 0;
        this.validators = new Map();
        this.unbondingPools = [];
        this.exchangeRate = 1.0;
        this.rewardRate = 0.12; // 12% APY
        this.protocolFee = 0.10; // 10% of rewards
        this.unbondingPeriod = 28; // 28 days
    }

    // Stake assets and receive liquid tokens
    stake(amount, user) {
        console.log(`\n🥩 Liquid staking: ${amount} ${this.stakingAsset} → ${this.liquidToken}`);
        
        if (amount <= 0) {
            throw new Error("Stake amount must be positive");
        }

        // Calculate liquid tokens to mint based on current exchange rate
        const liquidTokens = amount / this.exchangeRate;

        // Update protocol state
        this.totalStaked += amount;
        this.totalLiquidSupply += liquidTokens;

        // Distribute stake across validators
        this.distributeToValidators(amount);

        console.log(`   Liquid tokens minted: ${liquidTokens} ${this.liquidToken}`);
        console.log(`   Exchange rate: 1 ${this.liquidToken} = ${this.exchangeRate} ${this.stakingAsset}`);

        return {
            liquidTokens,
            exchangeRate: this.exchangeRate,
            estimatedRewards: liquidTokens * this.rewardRate
        };
    }

    // Unstake liquid tokens (initiate unbonding)
    unstake(liquidTokens, user) {
        console.log(`\n📤 Unstaking: ${liquidTokens} ${this.liquidToken} → ${this.stakingAsset}`);

        if (liquidTokens <= 0) {
            throw new Error("Unstake amount must be positive");
        }

        // Calculate underlying staked amount
        const underlyingAmount = liquidTokens * this.exchangeRate;

        // Create unbonding entry
        const unbondingEntry = {
            user,
            liquidTokens,
            underlyingAmount,
            startDate: Date.now(),
            completionDate: Date.now() + (this.unbondingPeriod * 24 * 60 * 60 * 1000),
            status: "unbonding"
        };

        this.unbondingPools.push(unbondingEntry);

        // Update liquid supply
        this.totalLiquidSupply -= liquidTokens;

        console.log(`   Underlying amount: ${underlyingAmount} ${this.stakingAsset}`);
        console.log(`   Unbonding period: ${this.unbondingPeriod} days`);
        console.log(`   Completion date: ${new Date(unbondingEntry.completionDate).toLocaleDateString()}`);

        return unbondingEntry;
    }

    // Claim completed unbonding
    claimUnbonded(user) {
        console.log(`\n💰 Claiming unbonded assets for ${user}`);

        const now = Date.now();
        const completedUnbonding = this.unbondingPools.filter(
            entry => entry.user === user && 
                    entry.status === "unbonding" && 
                    entry.completionDate <= now
        );

        if (completedUnbonding.length === 0) {
            console.log("   No completed unbonding found");
            return [];
        }

        const totalClaimed = completedUnbonding.reduce(
            (sum, entry) => sum + entry.underlyingAmount, 
            0
        );

        // Mark as claimed
        completedUnbonding.forEach(entry => {
            entry.status = "claimed";
        });

        // Update total staked
        this.totalStaked -= totalClaimed;

        console.log(`   Total claimed: ${totalClaimed} ${this.stakingAsset}`);
        return completedUnbonding;
    }

    // Distribute stake across validators
    distributeToValidators(amount) {
        // Simple equal distribution - in reality this would be more sophisticated
        const validatorList = Array.from(this.validators.keys());
        
        if (validatorList.length === 0) {
            // Create default validator set
            this.addValidator("validator1", 0.12);
            this.addValidator("validator2", 0.11);
            this.addValidator("validator3", 0.13);
            validatorList.push("validator1", "validator2", "validator3");
        }

        const amountPerValidator = amount / validatorList.length;

        validatorList.forEach(validatorId => {
            const validator = this.validators.get(validatorId);
            validator.stakedAmount += amountPerValidator;
            console.log(`   Delegated ${amountPerValidator} to ${validatorId}`);
        });
    }

    // Add validator to set
    addValidator(validatorId, commission) {
        console.log(`➕ Adding validator ${validatorId} with ${commission * 100}% commission`);
        
        this.validators.set(validatorId, {
            id: validatorId,
            commission,
            stakedAmount: 0,
            totalRewards: 0,
            active: true
        });
    }

    // Process staking rewards and update exchange rate
    processRewards() {
        console.log(`\n🎁 Processing staking rewards`);

        let totalRewards = 0;

        // Calculate rewards from each validator
        this.validators.forEach((validator, validatorId) => {
            if (validator.active && validator.stakedAmount > 0) {
                // Calculate annual rewards (simplified)
                const annualReward = validator.stakedAmount * this.rewardRate;
                const dailyReward = annualReward / 365;
                
                // Apply validator commission
                const netReward = dailyReward * (1 - validator.commission);
                
                totalRewards += netReward;
                validator.totalRewards += netReward;
                
                console.log(`   ${validatorId}: ${netReward.toFixed(4)} ${this.stakingAsset} rewards`);
            }
        });

        // Apply protocol fee
        const protocolFeeAmount = totalRewards * this.protocolFee;
        const netRewards = totalRewards - protocolFeeAmount;

        // Update exchange rate (more staked assets per liquid token)
        if (this.totalLiquidSupply > 0) {
            this.totalStaked += netRewards;
            this.exchangeRate = this.totalStaked / this.totalLiquidSupply;
        }

        console.log(`   Total rewards: ${totalRewards.toFixed(4)} ${this.stakingAsset}`);
        console.log(`   Protocol fee: ${protocolFeeAmount.toFixed(4)} ${this.stakingAsset}`);
        console.log(`   Net rewards: ${netRewards.toFixed(4)} ${this.stakingAsset}`);
        console.log(`   New exchange rate: ${this.exchangeRate.toFixed(6)}`);

        return {
            totalRewards,
            protocolFee: protocolFeeAmount,
            netRewards,
            newExchangeRate: this.exchangeRate
        };
    }

    // Get protocol statistics
    getStats() {
        return {
            totalStaked: this.totalStaked,
            totalLiquidSupply: this.totalLiquidSupply,
            exchangeRate: this.exchangeRate,
            validators: this.validators.size,
            unbondingEntries: this.unbondingPools.filter(e => e.status === "unbonding").length,
            estimatedAPY: this.rewardRate * (1 - this.protocolFee)
        };
    }
}

// === 3. Yield Aggregator ===

class YieldAggregator {
    constructor() {
        this.strategies = new Map();
        this.userVaults = new Map();
        this.protocols = new Map();
        this.nextStrategyId = 1;
    }

    // Register yield protocol
    registerProtocol(protocolId, name, assets, baseAPY, riskLevel) {
        console.log(`📊 Registering yield protocol: ${name}`);
        
        this.protocols.set(protocolId, {
            id: protocolId,
            name,
            supportedAssets: assets,
            baseAPY,
            riskLevel, // 1-10 scale
            totalDeposited: 0,
            active: true
        });
    }

    // Create yield strategy
    createStrategy(name, targetAsset, protocols, allocation) {
        const strategyId = this.nextStrategyId++;
        
        console.log(`⚡ Creating yield strategy: ${name}`);
        console.log(`   Target asset: ${targetAsset}`);
        
        // Validate allocations sum to 100%
        const totalAllocation = allocation.reduce((sum, alloc) => sum + alloc.percentage, 0);
        if (Math.abs(totalAllocation - 1.0) > 0.001) {
            throw new Error("Allocations must sum to 100%");
        }

        const strategy = {
            id: strategyId,
            name,
            targetAsset,
            protocols: protocols.map((protocolId, index) => ({
                protocolId,
                allocation: allocation[index].percentage
            })),
            totalDeposited: 0,
            estimatedAPY: this.calculateStrategyAPY(protocols, allocation),
            riskScore: this.calculateRiskScore(protocols, allocation),
            created: Date.now()
        };

        this.strategies.set(strategyId, strategy);
        
        console.log(`   Estimated APY: ${(strategy.estimatedAPY * 100).toFixed(2)}%`);
        console.log(`   Risk score: ${strategy.riskScore}/10`);
        
        return strategyId;
    }

    // Deposit into yield strategy
    deposit(strategyId, amount, user) {
        const strategy = this.strategies.get(strategyId);
        if (!strategy) {
            throw new Error(`Strategy ${strategyId} not found`);
        }

        console.log(`\n💰 Depositing ${amount} ${strategy.targetAsset} into strategy: ${strategy.name}`);

        // Allocate across protocols according to strategy
        const allocations = strategy.protocols.map(protocolAlloc => {
            const allocAmount = amount * protocolAlloc.allocation;
            const protocol = this.protocols.get(protocolAlloc.protocolId);
            
            console.log(`   ${allocAmount.toFixed(2)} → ${protocol.name} (${(protocolAlloc.allocation * 100).toFixed(1)}%)`);
            
            // Update protocol deposits
            protocol.totalDeposited += allocAmount;
            
            return {
                protocolId: protocolAlloc.protocolId,
                amount: allocAmount
            };
        });

        // Update strategy totals
        strategy.totalDeposited += amount;

        // Update user vault
        const vaultKey = `${user}_${strategyId}`;
        if (!this.userVaults.has(vaultKey)) {
            this.userVaults.set(vaultKey, {
                user,
                strategyId,
                deposited: 0,
                shares: 0,
                lastDeposit: 0
            });
        }

        const vault = this.userVaults.get(vaultKey);
        vault.deposited += amount;
        vault.shares += this.calculateShares(strategyId, amount);
        vault.lastDeposit = Date.now();

        return {
            strategyId,
            deposited: amount,
            totalDeposited: vault.deposited,
            shares: vault.shares,
            allocations
        };
    }

    // Withdraw from yield strategy
    withdraw(strategyId, shareAmount, user) {
        const strategy = this.strategies.get(strategyId);
        if (!strategy) {
            throw new Error(`Strategy ${strategyId} not found`);
        }

        const vaultKey = `${user}_${strategyId}`;
        const vault = this.userVaults.get(vaultKey);
        
        if (!vault || vault.shares < shareAmount) {
            throw new Error("Insufficient shares to withdraw");
        }

        console.log(`\n📤 Withdrawing ${shareAmount} shares from strategy: ${strategy.name}`);

        // Calculate withdrawal amount including yield
        const withdrawalAmount = this.calculateWithdrawalAmount(strategyId, shareAmount);

        // Process withdrawals from each protocol
        const withdrawals = strategy.protocols.map(protocolAlloc => {
            const protocolWithdrawal = withdrawalAmount * protocolAlloc.allocation;
            const protocol = this.protocols.get(protocolAlloc.protocolId);
            
            console.log(`   ${protocolWithdrawal.toFixed(2)} ← ${protocol.name}`);
            
            // Update protocol deposits
            protocol.totalDeposited = Math.max(0, protocol.totalDeposited - protocolWithdrawal);
            
            return {
                protocolId: protocolAlloc.protocolId,
                amount: protocolWithdrawal
            };
        });

        // Update user vault
        vault.shares -= shareAmount;
        vault.deposited = Math.max(0, vault.deposited - withdrawalAmount);

        // Update strategy totals
        strategy.totalDeposited = Math.max(0, strategy.totalDeposited - withdrawalAmount);

        console.log(`   Total withdrawn: ${withdrawalAmount.toFixed(2)} ${strategy.targetAsset}`);

        return {
            strategyId,
            withdrawn: withdrawalAmount,
            remainingShares: vault.shares,
            withdrawals
        };
    }

    // Calculate strategy APY based on protocol allocations
    calculateStrategyAPY(protocols, allocations) {
        let weightedAPY = 0;
        
        protocols.forEach((protocolId, index) => {
            const protocol = this.protocols.get(protocolId);
            if (protocol) {
                weightedAPY += protocol.baseAPY * allocations[index].percentage;
            }
        });

        return weightedAPY;
    }

    // Calculate risk score based on protocol allocations
    calculateRiskScore(protocols, allocations) {
        let weightedRisk = 0;
        
        protocols.forEach((protocolId, index) => {
            const protocol = this.protocols.get(protocolId);
            if (protocol) {
                weightedRisk += protocol.riskLevel * allocations[index].percentage;
            }
        });

        return Math.round(weightedRisk);
    }

    // Calculate shares for deposit
    calculateShares(strategyId, amount) {
        const strategy = this.strategies.get(strategyId);
        if (!strategy || strategy.totalDeposited === 0) {
            return amount; // 1:1 for first deposit
        }

        // Calculate based on current value including yield
        return amount; // Simplified - should include yield calculations
    }

    // Calculate withdrawal amount including yield
    calculateWithdrawalAmount(strategyId, shares) {
        // Simplified - should include accrued yield
        return shares;
    }

    // Rebalance strategy allocations
    rebalanceStrategy(strategyId) {
        const strategy = this.strategies.get(strategyId);
        if (!strategy) {
            throw new Error(`Strategy ${strategyId} not found`);
        }

        console.log(`\n⚖️ Rebalancing strategy: ${strategy.name}`);

        // Check current allocations vs target
        const currentAllocations = this.getCurrentAllocations(strategyId);
        const targetAllocations = strategy.protocols;

        console.log("Current vs Target allocations:");
        targetAllocations.forEach((target, index) => {
            const current = currentAllocations[index];
            const protocol = this.protocols.get(target.protocolId);
            console.log(`   ${protocol.name}: ${(current * 100).toFixed(1)}% → ${(target.allocation * 100).toFixed(1)}%`);
        });

        // Execute rebalancing trades (simplified)
        console.log("✅ Strategy rebalanced");
    }

    // Get current allocations
    getCurrentAllocations(strategyId) {
        const strategy = this.strategies.get(strategyId);
        if (!strategy || strategy.totalDeposited === 0) {
            return strategy.protocols.map(p => p.allocation);
        }

        // Calculate actual allocations based on current deposits
        return strategy.protocols.map(protocolAlloc => {
            const protocol = this.protocols.get(protocolAlloc.protocolId);
            return protocol.totalDeposited / strategy.totalDeposited;
        });
    }

    // Get user's vault information
    getUserVault(user, strategyId) {
        const vaultKey = `${user}_${strategyId}`;
        return this.userVaults.get(vaultKey);
    }

    // Get all available strategies
    getStrategies() {
        return Array.from(this.strategies.values());
    }
}

// === 4. Demonstration Functions ===

function demonstrateCrossChainDEX() {
    console.log("🔄 Cross-Chain DEX Demo");
    console.log("=======================");

    const dex = new CrossChainDEX();

    // Register parachains
    dex.registerParachain(1000, "Asset Hub", "DOT");
    dex.registerParachain(2000, "Acala", "ACA");
    dex.registerParachain(2004, "Moonbeam", "GLMR");

    // Setup bridges
    dex.setupBridge(1000, 2000, ["DOT", "USDT"]);
    dex.setupBridge(2000, 2004, ["ACA", "DOT"]);

    // Create cross-chain pools
    const pool1 = dex.createCrossChainPool("DOT", "USDT", 1000, 1000);
    const pool2 = dex.createCrossChainPool("DOT", "ACA", 1000, 2000);

    // Add liquidity
    dex.addCrossChainLiquidity(pool1, 1000, 5000, "alice");
    dex.addCrossChainLiquidity(pool2, 1000, 2000, "bob");

    // Perform cross-chain swap
    try {
        const result = dex.crossChainSwap("USDT", "ACA", 1000, 2000, 1000, "charlie");
        console.log("Swap result:", result);
    } catch (error) {
        console.error("Swap failed:", error.message);
    }
}

function demonstrateLiquidStaking() {
    console.log("\n🥩 Liquid Staking Demo");
    console.log("======================");

    const liquidStaking = new LiquidStakingProtocol("DOT");

    // Add validators
    liquidStaking.addValidator("validator1", 0.05); // 5% commission
    liquidStaking.addValidator("validator2", 0.03); // 3% commission
    liquidStaking.addValidator("validator3", 0.07); // 7% commission

    // Stake assets
    const stakeResult1 = liquidStaking.stake(1000, "alice");
    const stakeResult2 = liquidStaking.stake(500, "bob");

    console.log("Alice stake result:", stakeResult1);

    // Process rewards (simulate time passing)
    liquidStaking.processRewards();

    // Show updated stats
    console.log("\nProtocol stats after rewards:");
    console.log(liquidStaking.getStats());

    // Unstake some tokens
    const unstakeResult = liquidStaking.unstake(100, "alice");
    console.log("Alice unstake result:", unstakeResult);

    // Try to claim (won't work yet due to unbonding period)
    liquidStaking.claimUnbonded("alice");
}

function demonstrateYieldAggregator() {
    console.log("\n📈 Yield Aggregator Demo");
    console.log("========================");

    const aggregator = new YieldAggregator();

    // Register protocols
    aggregator.registerProtocol("acala_lending", "Acala Lending", ["DOT", "ACA"], 0.08, 3);
    aggregator.registerProtocol("moonbeam_defi", "Moonbeam DeFi", ["DOT", "GLMR"], 0.12, 5);
    aggregator.registerProtocol("parallel_money", "Parallel Money Market", ["DOT"], 0.10, 4);

    // Create yield strategy
    const strategyId = aggregator.createStrategy(
        "Balanced DOT Strategy",
        "DOT",
        ["acala_lending", "moonbeam_defi", "parallel_money"],
        [
            { percentage: 0.4 }, // 40% Acala
            { percentage: 0.3 }, // 30% Moonbeam
            { percentage: 0.3 }  // 30% Parallel
        ]
    );

    // Users deposit into strategy
    const deposit1 = aggregator.deposit(strategyId, 1000, "alice");
    const deposit2 = aggregator.deposit(strategyId, 500, "bob");

    console.log("Alice deposit result:", deposit1);

    // Rebalance strategy
    aggregator.rebalanceStrategy(strategyId);

    // Withdraw some funds
    const withdrawal = aggregator.withdraw(strategyId, 200, "alice");
    console.log("Alice withdrawal result:", withdrawal);

    // Show all strategies
    console.log("\nAvailable strategies:");
    aggregator.getStrategies().forEach(strategy => {
        console.log(`- ${strategy.name}: ${(strategy.estimatedAPY * 100).toFixed(2)}% APY, Risk: ${strategy.riskScore}/10`);
    });
}

function demonstrateRiskManagement() {
    console.log("\n🛡️ Risk Management Demo");
    console.log("========================");

    const riskFactors = [
        {
            name: "Smart Contract Risk",
            description: "Risk of bugs or exploits in protocol code",
            mitigation: "Audit reports, bug bounties, gradual rollout",
            level: "Medium"
        },
        {
            name: "Liquidity Risk",
            description: "Risk of insufficient liquidity for large withdrawals",
            mitigation: "Diversified liquidity sources, reserve buffers",
            level: "Low"
        },
        {
            name: "Validator Risk",
            description: "Risk of validator slashing or downtime",
            mitigation: "Diversified validator set, reputation tracking",
            level: "Low"
        },
        {
            name: "Cross-Chain Risk",
            description: "Risk of bridge failures or message delays",
            mitigation: "Multiple bridge providers, timeout mechanisms",
            level: "Medium"
        },
        {
            name: "Governance Risk",
            description: "Risk of malicious governance proposals",
            mitigation: "Time delays, emergency pause mechanisms",
            level: "Medium"
        }
    ];

    console.log("Risk Assessment Matrix:");
    console.log("======================");
    
    riskFactors.forEach(risk => {
        console.log(`\n${risk.name} (${risk.level}):`);
        console.log(`  Description: ${risk.description}`);
        console.log(`  Mitigation: ${risk.mitigation}`);
    });

    console.log("\nRisk Mitigation Strategies:");
    console.log("• Diversification across protocols and parachains");
    console.log("• Insurance coverage for smart contract risks");
    console.log("• Gradual exposure limits for new protocols");
    console.log("• Real-time monitoring and alert systems");
    console.log("• Emergency pause and recovery mechanisms");
}

function analyzePolkadotDeFiEcosystem() {
    console.log("\n🌐 Polkadot DeFi Ecosystem Analysis");
    console.log("====================================");

    const defiProjects = [
        { name: "Acala", category: "DeFi Hub", tvl: "$50M", specialty: "Stablecoin & Lending" },
        { name: "Moonbeam", category: "EVM Compatible", tvl: "$30M", specialty: "Ethereum Dapps" },
        { name: "Parallel", category: "Money Market", tvl: "$25M", specialty: "Lending & Borrowing" },
        { name: "Bifrost", category: "Liquid Staking", tvl: "$40M", specialty: "Staking Derivatives" },
        { name: "Centrifuge", category: "RWA", tvl: "$20M", specialty: "Real World Assets" },
        { name: "HydraDX", category: "DEX", tvl: "$35M", specialty: "Omnipool AMM" }
    ];

    console.log("Major DeFi Projects:");
    console.log("===================");
    
    defiProjects.forEach(project => {
        console.log(`${project.name}:`);
        console.log(`  Category: ${project.category}`);
        console.log(`  TVL: ${project.tvl}`);
        console.log(`  Specialty: ${project.specialty}`);
        console.log("");
    });

    console.log("Ecosystem Advantages:");
    console.log("• Shared security across all parachains");
    console.log("• Native cross-chain communication (XCM)");
    console.log("• Parallel transaction processing");
    console.log("• Specialized chains for specific use cases");
    console.log("• Upgradeable runtimes without hard forks");

    console.log("\nGrowth Opportunities:");
    console.log("• Institutional DeFi products");
    console.log("• Cross-chain yield optimization");
    console.log("• Real-world asset tokenization");
    console.log("• Advanced derivatives and structured products");
    console.log("• Integration with traditional finance");
}

// === Main Execution ===

function main() {
    try {
        console.log("Starting DeFi on Polkadot Mastery demonstration...\n");

        demonstrateCrossChainDEX();
        demonstrateLiquidStaking();
        demonstrateYieldAggregator();
        demonstrateRiskManagement();
        analyzePolkadotDeFiEcosystem();

        console.log("\n🎉 DeFi on Polkadot Mastery Complete!");
        console.log("\nKey Takeaways:");
        console.log("• Cross-chain DeFi unlocks new liquidity and use cases");
        console.log("• Liquid staking maintains capital efficiency while earning rewards");
        console.log("• Yield aggregation optimizes returns across protocols");
        console.log("• Risk management is crucial for protocol sustainability");
        console.log("• Polkadot's architecture enables unique DeFi primitives");

    } catch (error) {
        console.error("❌ Error in DeFi demonstration:", error.message);
    }
}

// Run the demonstration
if (require.main === module) {
    main();
}

module.exports = {
    CrossChainDEX,
    LiquidStakingProtocol,
    YieldAggregator
};
