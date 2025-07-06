// DeFi on Cosmos - Module 4
// Master decentralized finance development in the Cosmos ecosystem

console.log("💰 DeFi on Cosmos - Module 4");
console.log("============================");

// =============================================
// 1. COSMOS DeFi ECOSYSTEM OVERVIEW
// =============================================

class CosmosDeFiEcosystem {
    constructor() {
        this.protocols = new Map();
        this.chains = new Map();
        this.totalValueLocked = 0;
        this.setupEcosystem();
    }

    setupEcosystem() {
        // Major DeFi protocols in Cosmos
        const protocols = [
            { name: "Osmosis", type: "DEX", chain: "osmosis-1", tvl: 150000000 },
            { name: "JunoSwap", type: "DEX", chain: "juno-1", tvl: 25000000 },
            { name: "Mars Protocol", type: "Lending", chain: "osmosis-1", tvl: 45000000 },
            { name: "Kava Lend", type: "Lending", chain: "kava_2222-10", tvl: 75000000 },
            { name: "Umee", type: "Lending", chain: "umee-1", tvl: 30000000 },
            { name: "Crescent", type: "DEX", chain: "crescent-1", tvl: 20000000 }
        ];

        protocols.forEach(protocol => {
            this.protocols.set(protocol.name, protocol);
            this.totalValueLocked += protocol.tvl;
        });

        // DeFi-enabled chains
        const chains = [
            { id: "osmosis-1", focus: "DEX and AMM", native: "OSMO" },
            { id: "juno-1", focus: "Smart contracts", native: "JUNO" },
            { id: "kava_2222-10", focus: "DeFi lending", native: "KAVA" },
            { id: "umee-1", focus: "Cross-chain lending", native: "UMEE" },
            { id: "crescent-1", focus: "DEX and farming", native: "CRE" }
        ];

        chains.forEach(chain => this.chains.set(chain.id, chain));
    }

    demonstrateEcosystem() {
        console.log("\n🌌 COSMOS DeFi ECOSYSTEM");
        console.log("========================");

        console.log(`Total Value Locked: $${(this.totalValueLocked / 1000000).toFixed(1)}M`);
        console.log(`Active Protocols: ${this.protocols.size}`);
        console.log(`DeFi Chains: ${this.chains.size}`);

        console.log("\n🏛️ Major Protocols:");
        this.protocols.forEach(protocol => {
            console.log(`• ${protocol.name} (${protocol.type}): $${(protocol.tvl / 1000000).toFixed(1)}M TVL`);
        });

        console.log("\n⛓️ DeFi-Enabled Chains:");
        this.chains.forEach(chain => {
            console.log(`• ${chain.id}: ${chain.focus} (${chain.native})`);
        });
    }

    explainAdvantages() {
        console.log("\n🚀 COSMOS DeFi ADVANTAGES");
        console.log("=========================");

        const advantages = {
            "High Performance": "1000+ TPS with instant finality",
            "Low Fees": "$0.01-0.10 transaction costs",
            "Interoperability": "IBC enables cross-chain DeFi",
            "Sovereignty": "Application-specific blockchains",
            "Customization": "Tailor consensus and governance",
            "Shared Security": "Interchain Security for smaller chains"
        };

        Object.entries(advantages).forEach(([advantage, description]) => {
            console.log(`• ${advantage}: ${description}`);
        });
    }
}

// =============================================
// 2. AUTOMATED MARKET MAKER (AMM) IMPLEMENTATION
// =============================================

class CosmosAMM {
    constructor() {
        this.pools = new Map();
        this.lpTokens = new Map();
        this.feeRate = 0.003; // 0.3% swap fee
        this.totalPools = 0;
    }

    // Create a liquidity pool
    createPool(tokenA, tokenB, amountA, amountB, poolType = "constant_product") {
        console.log("\n🏊 CREATING LIQUIDITY POOL");
        console.log("==========================");

        const poolId = this.totalPools++;
        const pool = {
            id: poolId,
            tokenA: { denom: tokenA, reserve: amountA },
            tokenB: { denom: tokenB, reserve: amountB },
            type: poolType,
            k: amountA * amountB, // Constant product
            lpTokenSupply: Math.sqrt(amountA * amountB),
            swapFee: this.feeRate,
            totalShares: Math.sqrt(amountA * amountB),
            createdAt: Date.now()
        };

        this.pools.set(poolId, pool);

        console.log(`Pool Created: ${tokenA}/${tokenB}`);
        console.log(`Pool ID: ${poolId}`);
        console.log(`Initial Reserves: ${amountA.toLocaleString()} ${tokenA}, ${amountB.toLocaleString()} ${tokenB}`);
        console.log(`K (constant): ${pool.k.toLocaleString()}`);
        console.log(`LP Token Supply: ${pool.lpTokenSupply.toFixed(6)}`);

        return poolId;
    }

    // Constant product AMM swap
    executeSwap(poolId, tokenIn, amountIn, minAmountOut = 0) {
        console.log("\n🔄 EXECUTING SWAP");
        console.log("=================");

        const pool = this.pools.get(poolId);
        if (!pool) throw new Error("Pool not found");

        console.log(`Swapping ${amountIn.toLocaleString()} ${tokenIn}`);

        let reserveIn, reserveOut, tokenOut;
        if (tokenIn === pool.tokenA.denom) {
            reserveIn = pool.tokenA.reserve;
            reserveOut = pool.tokenB.reserve;
            tokenOut = pool.tokenB.denom;
        } else {
            reserveIn = pool.tokenB.reserve;
            reserveOut = pool.tokenA.reserve;
            tokenOut = pool.tokenA.denom;
        }

        // Apply swap fee
        const amountInWithFee = amountIn * (1 - pool.swapFee);
        console.log(`Amount after fee (${(pool.swapFee * 100).toFixed(1)}%): ${amountInWithFee.toLocaleString()}`);

        // Calculate output using constant product formula
        // (x + Δx) * (y - Δy) = k
        // Δy = (y * Δx) / (x + Δx)
        const amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);

        if (amountOut < minAmountOut) {
            throw new Error("Insufficient output amount");
        }

        // Update reserves
        if (tokenIn === pool.tokenA.denom) {
            pool.tokenA.reserve += amountIn;
            pool.tokenB.reserve -= amountOut;
        } else {
            pool.tokenB.reserve += amountIn;
            pool.tokenA.reserve -= amountOut;
        }

        // Calculate price impact
        const priceImpact = ((amountIn / reserveIn) / (1 + (amountIn / reserveIn))) * 100;

        console.log(`Output: ${amountOut.toLocaleString()} ${tokenOut}`);
        console.log(`Price Impact: ${priceImpact.toFixed(2)}%`);
        console.log(`New Reserves: ${pool.tokenA.reserve.toLocaleString()} ${pool.tokenA.denom}, ${pool.tokenB.reserve.toLocaleString()} ${pool.tokenB.denom}`);

        return {
            amountOut,
            priceImpact,
            executionPrice: amountIn / amountOut
        };
    }

    // Add liquidity to pool
    addLiquidity(poolId, amountA, amountB) {
        console.log("\n💧 ADDING LIQUIDITY");
        console.log("===================");

        const pool = this.pools.get(poolId);
        if (!pool) throw new Error("Pool not found");

        // Calculate optimal amounts to maintain price ratio
        const ratioA = amountA / pool.tokenA.reserve;
        const ratioB = amountB / pool.tokenB.reserve;
        const optimalRatio = Math.min(ratioA, ratioB);

        const actualAmountA = pool.tokenA.reserve * optimalRatio;
        const actualAmountB = pool.tokenB.reserve * optimalRatio;

        // Calculate LP tokens to mint
        const lpTokensToMint = pool.lpTokenSupply * optimalRatio;

        // Update pool state
        pool.tokenA.reserve += actualAmountA;
        pool.tokenB.reserve += actualAmountB;
        pool.lpTokenSupply += lpTokensToMint;
        pool.totalShares += lpTokensToMint;

        console.log(`Added: ${actualAmountA.toLocaleString()} ${pool.tokenA.denom}, ${actualAmountB.toLocaleString()} ${pool.tokenB.denom}`);
        console.log(`LP Tokens Minted: ${lpTokensToMint.toFixed(6)}`);
        console.log(`Total LP Supply: ${pool.lpTokenSupply.toFixed(6)}`);

        return {
            lpTokensMinted: lpTokensToMint,
            actualAmountA,
            actualAmountB
        };
    }

    // Remove liquidity from pool
    removeLiquidity(poolId, lpTokens) {
        console.log("\n🚿 REMOVING LIQUIDITY");
        console.log("=====================");

        const pool = this.pools.get(poolId);
        if (!pool) throw new Error("Pool not found");

        const shareRatio = lpTokens / pool.lpTokenSupply;
        const amountA = pool.tokenA.reserve * shareRatio;
        const amountB = pool.tokenB.reserve * shareRatio;

        // Update pool state
        pool.tokenA.reserve -= amountA;
        pool.tokenB.reserve -= amountB;
        pool.lpTokenSupply -= lpTokens;

        console.log(`LP Tokens Burned: ${lpTokens.toFixed(6)}`);
        console.log(`Withdrawn: ${amountA.toLocaleString()} ${pool.tokenA.denom}, ${amountB.toLocaleString()} ${pool.tokenB.denom}`);
        console.log(`Remaining LP Supply: ${pool.lpTokenSupply.toFixed(6)}`);

        return { amountA, amountB };
    }

    // Advanced AMM: Stable swap for correlated assets
    createStableSwap(tokens, amounts, amplification = 100) {
        console.log("\n🔄 STABLE SWAP POOL");
        console.log("===================");

        const poolId = this.totalPools++;
        const pool = {
            id: poolId,
            type: "stable_swap",
            tokens: tokens.map((token, i) => ({ denom: token, reserve: amounts[i] })),
            amplification,
            swapFee: 0.0004, // 0.04% for stable swaps
            lpTokenSupply: amounts.reduce((sum, amount) => sum + amount, 0),
            totalShares: amounts.reduce((sum, amount) => sum + amount, 0)
        };

        this.pools.set(poolId, pool);

        console.log(`Stable Swap Pool Created: ${tokens.join("/")}`);
        console.log(`Amplification Factor: ${amplification}`);
        console.log(`Reserves: ${amounts.map((amt, i) => `${amt.toLocaleString()} ${tokens[i]}`).join(", ")}`);

        return poolId;
    }

    // Calculate current price for a token pair
    getPrice(poolId, tokenA, tokenB) {
        const pool = this.pools.get(poolId);
        if (!pool) throw new Error("Pool not found");

        if (pool.type === "constant_product") {
            const reserveA = pool.tokenA.denom === tokenA ? pool.tokenA.reserve : pool.tokenB.reserve;
            const reserveB = pool.tokenA.denom === tokenB ? pool.tokenA.reserve : pool.tokenB.reserve;
            return reserveB / reserveA;
        }

        return 1; // Simplified for stable swaps
    }

    getPoolInfo(poolId) {
        return this.pools.get(poolId);
    }
}

// =============================================
// 3. LENDING AND BORROWING PROTOCOL
// =============================================

class CosmosLending {
    constructor() {
        this.markets = new Map();
        this.positions = new Map();
        this.priceOracle = new Map();
        this.setupMarkets();
    }

    setupMarkets() {
        // Initialize lending markets
        const markets = [
            { asset: "ATOM", collateralFactor: 0.75, liquidationThreshold: 0.8, baseRate: 0.02, slope: 0.2 },
            { asset: "OSMO", collateralFactor: 0.7, liquidationThreshold: 0.75, baseRate: 0.025, slope: 0.25 },
            { asset: "USDC", collateralFactor: 0.9, liquidationThreshold: 0.92, baseRate: 0.01, slope: 0.1 },
            { asset: "JUNO", collateralFactor: 0.65, liquidationThreshold: 0.7, baseRate: 0.03, slope: 0.3 }
        ];

        markets.forEach(market => {
            this.markets.set(market.asset, {
                ...market,
                totalSupply: 0,
                totalBorrow: 0,
                supplyRate: 0,
                borrowRate: 0,
                utilizationRate: 0,
                reserves: 1000000, // Starting reserves
                lastUpdateTime: Date.now()
            });
        });

        // Set initial prices
        this.priceOracle.set("ATOM", 12.50);
        this.priceOracle.set("OSMO", 0.85);
        this.priceOracle.set("USDC", 1.00);
        this.priceOracle.set("JUNO", 3.20);
    }

    demonstrateLending() {
        console.log("\n🏦 LENDING PROTOCOL");
        console.log("===================");

        console.log("Available Markets:");
        this.markets.forEach((market, asset) => {
            console.log(`• ${asset}: CF=${(market.collateralFactor * 100).toFixed(0)}%, LT=${(market.liquidationThreshold * 100).toFixed(0)}%`);
        });
    }

    // Supply assets to earn interest
    supply(user, asset, amount) {
        console.log(`\n💰 SUPPLYING ${amount.toLocaleString()} ${asset}`);
        console.log("====================================");

        const market = this.markets.get(asset);
        if (!market) throw new Error("Market not found");

        // Update interest rates before operation
        this.updateMarket(asset);

        // Calculate cTokens to mint (simplified 1:1 for demo)
        const cTokens = amount;

        // Update market state
        market.totalSupply += amount;
        market.reserves += amount;

        // Update user position
        const positionKey = `${user}_${asset}`;
        const position = this.positions.get(positionKey) || { 
            user, asset, supplied: 0, borrowed: 0, cTokens: 0 
        };
        
        position.supplied += amount;
        position.cTokens += cTokens;
        this.positions.set(positionKey, position);

        console.log(`Supplied: ${amount.toLocaleString()} ${asset}`);
        console.log(`cTokens Minted: ${cTokens.toLocaleString()}`);
        console.log(`Current Supply APY: ${(market.supplyRate * 100).toFixed(2)}%`);

        this.updateInterestRates(asset);
        return cTokens;
    }

    // Borrow assets against collateral
    borrow(user, asset, amount) {
        console.log(`\n💳 BORROWING ${amount.toLocaleString()} ${asset}`);
        console.log("===================================");

        const market = this.markets.get(asset);
        if (!market) throw new Error("Market not found");

        // Check borrowing capacity
        const borrowCapacity = this.calculateBorrowCapacity(user);
        const assetPrice = this.priceOracle.get(asset);
        const borrowValueUSD = amount * assetPrice;

        if (borrowValueUSD > borrowCapacity) {
            throw new Error("Insufficient collateral");
        }

        // Update interest rates before operation
        this.updateMarket(asset);

        // Update market state
        market.totalBorrow += amount;
        market.reserves -= amount;

        // Update user position
        const positionKey = `${user}_${asset}`;
        const position = this.positions.get(positionKey) || { 
            user, asset, supplied: 0, borrowed: 0, cTokens: 0 
        };
        
        position.borrowed += amount;
        this.positions.set(positionKey, position);

        console.log(`Borrowed: ${amount.toLocaleString()} ${asset}`);
        console.log(`Current Borrow APY: ${(market.borrowRate * 100).toFixed(2)}%`);
        console.log(`Health Factor: ${this.calculateHealthFactor(user).toFixed(2)}`);

        this.updateInterestRates(asset);
        return amount;
    }

    // Calculate user's borrowing capacity
    calculateBorrowCapacity(user) {
        let totalCollateralUSD = 0;
        let totalBorrowUSD = 0;

        // Sum all positions for user
        this.positions.forEach(position => {
            if (position.user === user) {
                const price = this.priceOracle.get(position.asset);
                const market = this.markets.get(position.asset);
                
                // Add collateral value (with collateral factor)
                totalCollateralUSD += position.supplied * price * market.collateralFactor;
                
                // Add borrowed value
                totalBorrowUSD += position.borrowed * price;
            }
        });

        const borrowCapacity = totalCollateralUSD - totalBorrowUSD;
        console.log(`   Collateral Value: $${totalCollateralUSD.toLocaleString()}`);
        console.log(`   Borrowed Value: $${totalBorrowUSD.toLocaleString()}`);
        console.log(`   Available to Borrow: $${borrowCapacity.toLocaleString()}`);

        return borrowCapacity;
    }

    // Calculate health factor for liquidation risk
    calculateHealthFactor(user) {
        let totalCollateralUSD = 0;
        let totalBorrowUSD = 0;

        this.positions.forEach(position => {
            if (position.user === user) {
                const price = this.priceOracle.get(position.asset);
                const market = this.markets.get(position.asset);
                
                // Use liquidation threshold for health factor
                totalCollateralUSD += position.supplied * price * market.liquidationThreshold;
                totalBorrowUSD += position.borrowed * price;
            }
        });

        return totalBorrowUSD > 0 ? totalCollateralUSD / totalBorrowUSD : Infinity;
    }

    // Update interest rates based on utilization
    updateInterestRates(asset) {
        const market = this.markets.get(asset);
        
        // Calculate utilization rate
        market.utilizationRate = market.totalSupply > 0 ? 
            market.totalBorrow / market.totalSupply : 0;

        // Calculate borrow rate using interest rate model
        market.borrowRate = market.baseRate + 
            (market.utilizationRate * market.slope);

        // Calculate supply rate (borrow rate * utilization * (1 - reserve factor))
        const reserveFactor = 0.1; // 10% goes to reserves
        market.supplyRate = market.borrowRate * market.utilizationRate * (1 - reserveFactor);

        console.log(`   Utilization: ${(market.utilizationRate * 100).toFixed(1)}%`);
        console.log(`   Supply APY: ${(market.supplyRate * 100).toFixed(2)}%`);
        console.log(`   Borrow APY: ${(market.borrowRate * 100).toFixed(2)}%`);
    }

    // Update market with accrued interest
    updateMarket(asset) {
        const market = this.markets.get(asset);
        const timeElapsed = (Date.now() - market.lastUpdateTime) / (1000 * 60 * 60 * 24 * 365); // Years
        
        // Accrue interest
        const interestAccrued = market.totalBorrow * market.borrowRate * timeElapsed;
        market.totalBorrow += interestAccrued;
        market.reserves += interestAccrued * 0.1; // Reserve factor
        
        market.lastUpdateTime = Date.now();
    }

    // Liquidate unhealthy positions
    liquidate(liquidator, borrower, asset, amount) {
        console.log(`\n⚠️  LIQUIDATING POSITION`);
        console.log("=======================");

        const healthFactor = this.calculateHealthFactor(borrower);
        if (healthFactor >= 1.0) {
            throw new Error("Position is healthy, cannot liquidate");
        }

        const liquidationBonus = 0.05; // 5% bonus for liquidator
        const market = this.markets.get(asset);
        const price = this.priceOracle.get(asset);

        console.log(`Health Factor: ${healthFactor.toFixed(2)} (< 1.0)`);
        console.log(`Liquidating ${amount.toLocaleString()} ${asset}`);
        console.log(`Liquidation Bonus: ${(liquidationBonus * 100).toFixed(1)}%`);

        // Calculate collateral to seize
        const collateralValue = amount * price * (1 + liquidationBonus);
        
        console.log(`Collateral Seized Value: $${collateralValue.toLocaleString()}`);
        console.log(`✅ Liquidation successful`);

        return collateralValue;
    }
}

// =============================================
// 4. CROSS-CHAIN DeFi WITH IBC
// =============================================

class CrossChainDeFi {
    constructor() {
        this.chains = new Map();
        this.ibcChannels = new Map();
        this.crossChainPositions = new Map();
        this.setupChains();
    }

    setupChains() {
        const chains = [
            { id: "cosmoshub-4", native: "ATOM", defi: ["lending"] },
            { id: "osmosis-1", native: "OSMO", defi: ["dex", "lending"] },
            { id: "juno-1", native: "JUNO", defi: ["dex", "nft"] },
            { id: "kava_2222-10", native: "KAVA", defi: ["lending", "mint"] }
        ];

        chains.forEach(chain => this.chains.set(chain.id, chain));

        // Setup IBC channels
        this.ibcChannels.set("cosmoshub-osmosis", { 
            src: "channel-141", dest: "channel-0", status: "open" 
        });
        this.ibcChannels.set("osmosis-juno", { 
            src: "channel-42", dest: "channel-47", status: "open" 
        });
    }

    demonstrateCrossChainDefi() {
        console.log("\n🌉 CROSS-CHAIN DeFi");
        console.log("===================");

        // Cross-chain swap
        this.crossChainSwap();
        
        // Cross-chain lending
        this.crossChainLending();
        
        // Yield aggregation
        this.yieldAggregation();
    }

    crossChainSwap() {
        console.log("\n🔄 CROSS-CHAIN SWAP");
        console.log("===================");

        const swap = {
            from: { chain: "cosmoshub-4", asset: "ATOM", amount: 100 },
            to: { chain: "osmosis-1", asset: "OSMO", amount: 0 },
            route: "ATOM → IBC/ATOM → OSMO"
        };

        console.log("Swap Process:");
        console.log("1. Lock ATOM on Cosmos Hub");
        console.log("2. Mint IBC/ATOM on Osmosis via IBC transfer");
        console.log("3. Swap IBC/ATOM for OSMO on Osmosis DEX");
        console.log("4. Optional: Transfer OSMO back to Cosmos Hub");

        const steps = [
            "📤 IBC transfer: 100 ATOM → Osmosis",
            "🔄 AMM swap: IBC/ATOM → OSMO",
            "💰 Received: ~1,470 OSMO",
            "⏱️  Total time: ~30 seconds"
        ];

        steps.forEach((step, i) => {
            console.log(`   ${i + 1}. ${step}`);
        });

        console.log("\n✅ Cross-chain swap completed");
    }

    crossChainLending() {
        console.log("\n🏦 CROSS-CHAIN LENDING");
        console.log("======================");

        console.log("Scenario: Collateral on Cosmos Hub, Borrow on Osmosis");
        
        const position = {
            collateral: { chain: "cosmoshub-4", asset: "ATOM", amount: 1000 },
            borrow: { chain: "osmosis-1", asset: "USDC", amount: 8000 },
            mechanism: "Interchain Accounts (ICA)"
        };

        console.log("\nProcess:");
        console.log("1. Deposit ATOM as collateral on Cosmos Hub");
        console.log("2. Use ICA to control account on Osmosis");
        console.log("3. Borrow USDC against ATOM collateral");
        console.log("4. Monitor health factor across chains");

        console.log(`\nCollateral: ${position.collateral.amount.toLocaleString()} ${position.collateral.asset} on ${position.collateral.chain}`);
        console.log(`Borrowed: ${position.borrow.amount.toLocaleString()} ${position.borrow.asset} on ${position.borrow.chain}`);
        console.log(`LTV: ${((position.borrow.amount / (position.collateral.amount * 12.5)) * 100).toFixed(1)}%`);
    }

    yieldAggregation() {
        console.log("\n🌾 YIELD AGGREGATION");
        console.log("====================");

        const strategies = [
            { chain: "osmosis-1", protocol: "Osmosis LP", apy: 25.4, asset: "OSMO/ATOM" },
            { chain: "juno-1", protocol: "JunoSwap LP", apy: 31.2, asset: "JUNO/ATOM" },
            { chain: "kava_2222-10", protocol: "Kava Lend", apy: 8.7, asset: "ATOM" },
            { chain: "osmosis-1", protocol: "Mars Lending", apy: 12.3, asset: "ATOM" }
        ];

        console.log("Optimal yield strategies across Cosmos:");
        strategies.forEach((strategy, i) => {
            console.log(`${i + 1}. ${strategy.protocol} (${strategy.chain}): ${strategy.apy}% APY`);
        });

        console.log("\nAuto-rebalancing based on:");
        console.log("• APY changes across protocols");
        console.log("• IBC transfer costs");
        console.log("• Impermanent loss risk");
        console.log("• Liquidity requirements");
    }

    // Interchain Accounts implementation
    demonstrateICA() {
        console.log("\n🔗 INTERCHAIN ACCOUNTS (ICA)");
        console.log("=============================");

        const icaExample = {
            controller: "cosmoshub-4",
            host: "osmosis-1",
            account: "osmo1ica...",
            owner: "cosmos1user..."
        };

        console.log("ICA enables:");
        console.log("• Execute transactions on remote chains");
        console.log("• Maintain custody on the controller chain");
        console.log("• Enable complex cross-chain strategies");
        console.log("• Reduce trust assumptions");

        console.log(`\nExample: ${icaExample.owner} on ${icaExample.controller}`);
        console.log(`Controls: ${icaExample.account} on ${icaExample.host}`);
        console.log("Can execute: Swaps, lending, governance, staking");
    }
}

// =============================================
// 5. YIELD FARMING AND LIQUIDITY MINING
// =============================================

class YieldFarming {
    constructor() {
        this.farms = new Map();
        this.userPositions = new Map();
        this.rewardTokens = new Map();
        this.setupFarms();
    }

    setupFarms() {
        const farms = [
            { 
                id: "osmo-atom-lp",
                pair: "OSMO/ATOM",
                rewardTokens: ["OSMO"],
                baseApy: 15.2,
                rewardApy: 18.3,
                totalStaked: 5000000,
                multiplier: 2.0
            },
            {
                id: "juno-atom-lp", 
                pair: "JUNO/ATOM",
                rewardTokens: ["JUNO", "RAW"],
                baseApy: 12.8,
                rewardApy: 22.1,
                totalStaked: 2500000,
                multiplier: 1.5
            },
            {
                id: "osmo-usdc-lp",
                pair: "OSMO/USDC",
                rewardTokens: ["OSMO"],
                baseApy: 8.7,
                rewardApy: 14.2,
                totalStaked: 8000000,
                multiplier: 1.0
            }
        ];

        farms.forEach(farm => this.farms.set(farm.id, farm));
    }

    demonstrateYieldFarming() {
        console.log("\n🌾 YIELD FARMING");
        console.log("================");

        console.log("Available Farms:");
        this.farms.forEach(farm => {
            const totalApy = farm.baseApy + farm.rewardApy;
            console.log(`• ${farm.pair}: ${totalApy.toFixed(1)}% APY (${farm.rewardTokens.join(", ")} rewards)`);
        });

        // Demonstrate farming process
        this.stakeLpTokens("user1", "osmo-atom-lp", 10000);
        this.calculateRewards("user1", "osmo-atom-lp");
        this.harvestRewards("user1", "osmo-atom-lp");
    }

    stakeLpTokens(user, farmId, amount) {
        console.log(`\n🚜 STAKING LP TOKENS`);
        console.log("===================");

        const farm = this.farms.get(farmId);
        if (!farm) throw new Error("Farm not found");

        const positionKey = `${user}_${farmId}`;
        const position = this.userPositions.get(positionKey) || {
            user, farmId, staked: 0, rewards: 0, lastUpdate: Date.now()
        };

        // Update existing rewards before adding new stake
        this.updateRewards(positionKey);

        position.staked += amount;
        farm.totalStaked += amount;
        this.userPositions.set(positionKey, position);

        console.log(`Staked: ${amount.toLocaleString()} ${farm.pair} LP tokens`);
        console.log(`Total Staked: ${position.staked.toLocaleString()}`);
        console.log(`Farm Total: ${farm.totalStaked.toLocaleString()}`);
        console.log(`Your Share: ${((position.staked / farm.totalStaked) * 100).toFixed(2)}%`);
    }

    calculateRewards(user, farmId) {
        console.log(`\n💰 CALCULATING REWARDS`);
        console.log("=====================");

        const positionKey = `${user}_${farmId}`;
        const position = this.userPositions.get(positionKey);
        const farm = this.farms.get(farmId);

        if (!position) throw new Error("No position found");

        // Calculate time elapsed
        const timeElapsed = (Date.now() - position.lastUpdate) / (1000 * 60 * 60 * 24); // Days
        
        // Calculate rewards based on APY and stake
        const dailyRewardRate = farm.rewardApy / 365 / 100;
        const rewardsEarned = position.staked * dailyRewardRate * timeElapsed;

        position.rewards += rewardsEarned;
        position.lastUpdate = Date.now();

        console.log(`Time Elapsed: ${timeElapsed.toFixed(2)} days`);
        console.log(`Rewards Earned: ${rewardsEarned.toFixed(6)} ${farm.rewardTokens[0]}`);
        console.log(`Total Pending: ${position.rewards.toFixed(6)} ${farm.rewardTokens[0]}`);
        console.log(`Daily Rate: ${(dailyRewardRate * 100).toFixed(4)}%`);

        return rewardsEarned;
    }

    harvestRewards(user, farmId) {
        console.log(`\n🚁 HARVESTING REWARDS`);
        console.log("=====================");

        const positionKey = `${user}_${farmId}`;
        const position = this.userPositions.get(positionKey);
        const farm = this.farms.get(farmId);

        if (!position) throw new Error("No position found");

        // Update rewards before harvest
        this.updateRewards(positionKey);

        const harvestedAmount = position.rewards;
        position.rewards = 0;

        console.log(`Harvested: ${harvestedAmount.toFixed(6)} ${farm.rewardTokens[0]}`);
        console.log(`Value: ~$${(harvestedAmount * 0.85).toFixed(2)}`); // Assuming OSMO price
        console.log(`✅ Rewards claimed successfully`);

        return harvestedAmount;
    }

    updateRewards(positionKey) {
        const position = this.userPositions.get(positionKey);
        const farm = this.farms.get(position.farmId);
        
        const timeElapsed = (Date.now() - position.lastUpdate) / (1000 * 60 * 60 * 24);
        const dailyRewardRate = farm.rewardApy / 365 / 100;
        const rewardsEarned = position.staked * dailyRewardRate * timeElapsed;
        
        position.rewards += rewardsEarned;
        position.lastUpdate = Date.now();
    }

    // Advanced: Liquidity mining with emissions schedule
    demonstrateEmissions() {
        console.log(`\n📈 EMISSIONS SCHEDULE`);
        console.log("====================");

        const emissions = {
            phase1: { duration: "Months 1-6", rate: "1000 OSMO/day", multiplier: 3.0 },
            phase2: { duration: "Months 7-12", rate: "750 OSMO/day", multiplier: 2.0 },
            phase3: { duration: "Months 13-18", rate: "500 OSMO/day", multiplier: 1.5 },
            phase4: { duration: "Months 19+", rate: "250 OSMO/day", multiplier: 1.0 }
        };

        console.log("Reward emission schedule:");
        Object.entries(emissions).forEach(([phase, config]) => {
            console.log(`${phase}: ${config.duration} - ${config.rate} (${config.multiplier}x multiplier)`);
        });

        console.log("\nFeatures:");
        console.log("• Declining emissions for sustainability");
        console.log("• Multipliers for early participants");
        console.log("• Governance-adjustable parameters");
        console.log("• Revenue-sharing mechanisms");
    }
}

// =============================================
// 6. SECURITY AND RISK MANAGEMENT
// =============================================

class DeFiSecurity {
    constructor() {
        this.riskFactors = new Map();
        this.securityMeasures = new Map();
        this.setupSecurity();
    }

    setupSecurity() {
        const risks = [
            { type: "Smart Contract", severity: "High", mitigation: "Audits, formal verification" },
            { type: "Oracle Manipulation", severity: "High", mitigation: "Multiple oracles, time delays" },
            { type: "Flash Loan Attacks", severity: "Medium", mitigation: "Same-block protection" },
            { type: "Governance Attacks", severity: "Medium", mitigation: "Timelocks, emergency pause" },
            { type: "Liquidity Risk", severity: "Low", mitigation: "Diversified sources" }
        ];

        risks.forEach(risk => this.riskFactors.set(risk.type, risk));
    }

    demonstrateSecurity() {
        console.log("\n🛡️  DeFi SECURITY MEASURES");
        console.log("==========================");

        console.log("Risk Assessment:");
        this.riskFactors.forEach((risk, type) => {
            console.log(`• ${type}: ${risk.severity} risk - ${risk.mitigation}`);
        });

        this.demonstrateSecurityFeatures();
        this.demonstrateRiskParameters();
    }

    demonstrateSecurityFeatures() {
        console.log("\n🔒 SECURITY FEATURES");
        console.log("====================");

        const features = {
            "Circuit Breakers": "Automatic pause on anomalous activity",
            "Rate Limiting": "Limit large operations per block",
            "Timelock Governance": "Delay for parameter changes",
            "Emergency Pause": "Admin ability to halt operations", 
            "Oracle Validation": "Multiple price feed verification",
            "Slippage Protection": "Maximum acceptable price impact"
        };

        Object.entries(features).forEach(([feature, description]) => {
            console.log(`• ${feature}: ${description}`);
        });

        console.log("\nImplementation example:");
        console.log(`
// Circuit breaker for large withdrawals
if (withdrawAmount > totalLiquidity * 0.1) {
    require(block.timestamp > lastLargeWithdrawal + 1 hours);
    lastLargeWithdrawal = block.timestamp;
}

// Oracle price validation
require(
    abs(oraclePrice - chainlinkPrice) / oraclePrice < 0.05,
    "Price deviation too high"
);
        `);
    }

    demonstrateRiskParameters() {
        console.log("\n⚖️  RISK PARAMETERS");
        console.log("===================");

        const parameters = {
            "Collateral Factor": "Maximum LTV ratio for borrowing",
            "Liquidation Threshold": "LTV at which liquidation occurs",
            "Liquidation Penalty": "Bonus paid to liquidators",
            "Reserve Factor": "Percentage of interest to protocol",
            "Borrow Cap": "Maximum borrowable amount per asset",
            "Supply Cap": "Maximum suppliable amount per asset"
        };

        console.log("Key risk parameters:");
        Object.entries(parameters).forEach(([param, description]) => {
            console.log(`• ${param}: ${description}`);
        });

        console.log("\nExample parameter values:");
        const exampleParams = {
            "ATOM": { cf: "75%", lt: "80%", lp: "5%", rc: "10%" },
            "OSMO": { cf: "70%", lt: "75%", lp: "8%", rc: "15%" },
            "USDC": { cf: "90%", lt: "92%", lp: "3%", rc: "5%" }
        };

        Object.entries(exampleParams).forEach(([asset, params]) => {
            console.log(`${asset}: CF=${params.cf}, LT=${params.lt}, LP=${params.lp}, Reserve=${params.rc}`);
        });
    }

    simulateStressTest() {
        console.log("\n📊 STRESS TESTING");
        console.log("=================");

        const scenarios = [
            { name: "Market Crash", description: "50% price drop across assets" },
            { name: "Bank Run", description: "Mass withdrawals from protocol" },
            { name: "Oracle Failure", description: "Price feed manipulation" },
            { name: "Flash Loan Attack", description: "Large single-block operation" }
        ];

        console.log("Stress test scenarios:");
        scenarios.forEach((scenario, i) => {
            console.log(`${i + 1}. ${scenario.name}: ${scenario.description}`);
        });

        console.log("\nProtocol resilience measures:");
        console.log("• Liquidation mechanisms maintain solvency");
        console.log("• Emergency pause prevents further damage");
        console.log("• Insurance funds cover shortfalls");
        console.log("• Gradual parameter adjustments reduce risk");
    }
}

// =============================================
// MAIN EXECUTION
// =============================================

function runDeFiModule() {
    console.log("Starting DeFi on Cosmos Tutorial...\n");

    // Ecosystem Overview
    const ecosystem = new CosmosDeFiEcosystem();
    ecosystem.demonstrateEcosystem();
    ecosystem.explainAdvantages();

    // AMM Implementation
    const amm = new CosmosAMM();
    const poolId = amm.createPool("OSMO", "ATOM", 1000000, 100000);
    amm.executeSwap(poolId, "OSMO", 10000);
    amm.addLiquidity(poolId, 50000, 5000);
    amm.createStableSwap(["USDC", "USDT", "DAI"], [1000000, 1000000, 1000000]);

    // Lending Protocol
    const lending = new CosmosLending();
    lending.demonstrateLending();
    lending.supply("alice", "ATOM", 1000);
    lending.borrow("alice", "USDC", 8000);
    lending.calculateBorrowCapacity("alice");

    // Cross-Chain DeFi
    const crossChain = new CrossChainDeFi();
    crossChain.demonstrateCrossChainDefi();
    crossChain.demonstrateICA();

    // Yield Farming
    const farming = new YieldFarming();
    farming.demonstrateYieldFarming();
    farming.demonstrateEmissions();

    // Security Measures
    const security = new DeFiSecurity();
    security.demonstrateSecurity();
    security.simulateStressTest();

    console.log("\n🎓 MODULE 4 COMPLETE!");
    console.log("====================");
    console.log("You've mastered:");
    console.log("✅ Cosmos DeFi ecosystem and advantages");
    console.log("✅ AMM implementation with multiple models");
    console.log("✅ Lending and borrowing protocols");
    console.log("✅ Cross-chain DeFi with IBC and ICA");
    console.log("✅ Yield farming and liquidity mining");
    console.log("✅ Security measures and risk management");
    console.log("✅ Protocol deployment and optimization");
    console.log("\n🔜 Next: Module 5 - Governance and DAOs");
}

// Run the module
runDeFiModule();
