#!/usr/bin/env node

/**
 * Polkadot Mastery - Module 5: Advanced Pallets
 * 
 * This module demonstrates advanced pallet development including
 * DeFi protocols, NFT systems, governance, and oracle integration.
 */

console.log("🧩 Advanced Pallets Mastery");
console.log("===========================\n");

// === 1. Base Pallet Framework ===

class BasePallet {
    constructor(name, version = "1.0.0") {
        this.name = name;
        this.version = version;
        this.storage = new Map();
        this.events = [];
        this.errors = new Map();
        this.hooks = new Map();
        this.config = {};
    }

    // Storage helpers
    get(key) {
        return this.storage.get(key);
    }

    set(key, value) {
        this.storage.set(key, value);
    }

    has(key) {
        return this.storage.has(key);
    }

    delete(key) {
        return this.storage.delete(key);
    }

    // Event emission
    emit(event, data) {
        this.events.push({
            pallet: this.name,
            event,
            data,
            timestamp: Date.now()
        });
    }

    // Error handling
    throwError(errorCode, message) {
        const error = new Error(message);
        error.code = errorCode;
        error.pallet = this.name;
        throw error;
    }

    // Hook system
    addHook(event, callback) {
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(callback);
    }

    executeHooks(event, data) {
        if (this.hooks.has(event)) {
            this.hooks.get(event).forEach(callback => callback(data));
        }
    }
}

// === 2. AMM (Automated Market Maker) Pallet ===

class AMMPallet extends BasePallet {
    constructor() {
        super("AMM", "2.1.0");
        this.pools = new Map();
        this.nextPoolId = 1;
        this.tradingFee = 0.003; // 0.3%
        this.protocolFee = 0.0005; // 0.05%
    }

    // Create a new liquidity pool
    createPool(tokenA, tokenB, initialA, initialB, creator) {
        const poolId = this.nextPoolId++;
        
        if (tokenA === tokenB) {
            this.throwError("IDENTICAL_TOKENS", "Cannot create pool with identical tokens");
        }

        if (initialA <= 0 || initialB <= 0) {
            this.throwError("INVALID_AMOUNTS", "Initial amounts must be positive");
        }

        // Calculate initial LP tokens (geometric mean)
        const lpTokens = Math.sqrt(initialA * initialB);

        const pool = {
            id: poolId,
            tokenA,
            tokenB,
            reserveA: initialA,
            reserveB: initialB,
            totalSupply: lpTokens,
            creator,
            feeRate: this.tradingFee,
            created: Date.now()
        };

        this.pools.set(poolId, pool);
        this.set(`pool_${poolId}`, pool);
        this.set(`lp_balance_${poolId}_${creator}`, lpTokens);

        this.emit("PoolCreated", {
            poolId,
            tokenA,
            tokenB,
            initialA,
            initialB,
            lpTokens,
            creator
        });

        console.log(`💧 Pool ${poolId} created: ${tokenA}/${tokenB}`);
        return poolId;
    }

    // Add liquidity to existing pool
    addLiquidity(poolId, amountA, amountB, user) {
        const pool = this.pools.get(poolId);
        if (!pool) {
            this.throwError("POOL_NOT_FOUND", `Pool ${poolId} does not exist`);
        }

        // Calculate optimal amounts based on current ratio
        const ratio = pool.reserveA / pool.reserveB;
        const optimalB = amountA / ratio;
        const optimalA = amountB * ratio;

        // Use the smaller amount to maintain ratio
        const actualA = Math.min(amountA, optimalA);
        const actualB = Math.min(amountB, optimalB);

        // Calculate LP tokens to mint
        const lpTokens = Math.min(
            (actualA * pool.totalSupply) / pool.reserveA,
            (actualB * pool.totalSupply) / pool.reserveB
        );

        // Update pool state
        pool.reserveA += actualA;
        pool.reserveB += actualB;
        pool.totalSupply += lpTokens;

        // Update user LP balance
        const currentBalance = this.get(`lp_balance_${poolId}_${user}`) || 0;
        this.set(`lp_balance_${poolId}_${user}`, currentBalance + lpTokens);

        this.emit("LiquidityAdded", {
            poolId,
            user,
            amountA: actualA,
            amountB: actualB,
            lpTokens
        });

        console.log(`➕ Liquidity added to pool ${poolId}: ${actualA} ${pool.tokenA}, ${actualB} ${pool.tokenB}`);
        return { amountA: actualA, amountB: actualB, lpTokens };
    }

    // Remove liquidity from pool
    removeLiquidity(poolId, lpTokens, user) {
        const pool = this.pools.get(poolId);
        if (!pool) {
            this.throwError("POOL_NOT_FOUND", `Pool ${poolId} does not exist`);
        }

        const userBalance = this.get(`lp_balance_${poolId}_${user}`) || 0;
        if (userBalance < lpTokens) {
            this.throwError("INSUFFICIENT_LP_TOKENS", "Insufficient LP token balance");
        }

        // Calculate amounts to return
        const amountA = (lpTokens * pool.reserveA) / pool.totalSupply;
        const amountB = (lpTokens * pool.reserveB) / pool.totalSupply;

        // Update pool state
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalSupply -= lpTokens;

        // Update user balance
        this.set(`lp_balance_${poolId}_${user}`, userBalance - lpTokens);

        this.emit("LiquidityRemoved", {
            poolId,
            user,
            amountA,
            amountB,
            lpTokens
        });

        console.log(`➖ Liquidity removed from pool ${poolId}: ${amountA} ${pool.tokenA}, ${amountB} ${pool.tokenB}`);
        return { amountA, amountB };
    }

    // Swap tokens
    swapExactTokensForTokens(poolId, tokenIn, amountIn, minAmountOut, user) {
        const pool = this.pools.get(poolId);
        if (!pool) {
            this.throwError("POOL_NOT_FOUND", `Pool ${poolId} does not exist`);
        }

        let reserveIn, reserveOut, tokenOut;
        
        if (tokenIn === pool.tokenA) {
            reserveIn = pool.reserveA;
            reserveOut = pool.reserveB;
            tokenOut = pool.tokenB;
        } else if (tokenIn === pool.tokenB) {
            reserveIn = pool.reserveB;
            reserveOut = pool.reserveA;
            tokenOut = pool.tokenA;
        } else {
            this.throwError("INVALID_TOKEN", "Token not in pool");
        }

        // Calculate output amount using constant product formula
        // amountOut = (amountIn * reserveOut) / (reserveIn + amountIn) - fees
        const amountInWithFee = amountIn * (1 - this.tradingFee);
        const amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);

        if (amountOut < minAmountOut) {
            this.throwError("SLIPPAGE_EXCEEDED", `Output ${amountOut} less than minimum ${minAmountOut}`);
        }

        // Update reserves
        if (tokenIn === pool.tokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }

        this.emit("Swap", {
            poolId,
            user,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            fee: amountIn * this.tradingFee
        });

        console.log(`🔄 Swap in pool ${poolId}: ${amountIn} ${tokenIn} → ${amountOut} ${tokenOut}`);
        return amountOut;
    }

    // Get pool information
    getPool(poolId) {
        return this.pools.get(poolId);
    }

    // Calculate price impact
    calculatePriceImpact(poolId, tokenIn, amountIn) {
        const pool = this.pools.get(poolId);
        if (!pool) return 0;

        let reserveIn, reserveOut;
        if (tokenIn === pool.tokenA) {
            reserveIn = pool.reserveA;
            reserveOut = pool.reserveB;
        } else {
            reserveIn = pool.reserveB;
            reserveOut = pool.reserveA;
        }

        const spotPrice = reserveOut / reserveIn;
        const amountInWithFee = amountIn * (1 - this.tradingFee);
        const amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
        const executionPrice = amountOut / amountIn;

        return Math.abs((executionPrice - spotPrice) / spotPrice);
    }
}

// === 3. Lending Pallet ===

class LendingPallet extends BasePallet {
    constructor() {
        super("Lending", "1.5.0");
        this.markets = new Map();
        this.userPositions = new Map();
        this.interestRateModel = {
            baseRate: 0.02, // 2% base rate
            multiplier: 0.1, // 10% multiplier
            jumpMultiplier: 2.0, // 200% jump multiplier
            kink: 0.8 // 80% utilization kink
        };
    }

    // Create a lending market for an asset
    createMarket(asset, collateralFactor, liquidationThreshold, admin) {
        if (this.markets.has(asset)) {
            this.throwError("MARKET_EXISTS", `Market for ${asset} already exists`);
        }

        const market = {
            asset,
            collateralFactor, // e.g., 0.75 for 75% collateral factor
            liquidationThreshold, // e.g., 0.85 for 85% liquidation threshold
            totalSupply: 0,
            totalBorrow: 0,
            supplyRate: 0,
            borrowRate: 0,
            utilization: 0,
            lastUpdate: Date.now(),
            admin
        };

        this.markets.set(asset, market);
        this.set(`market_${asset}`, market);

        this.emit("MarketCreated", {
            asset,
            collateralFactor,
            liquidationThreshold,
            admin
        });

        console.log(`🏦 Lending market created for ${asset}`);
        return market;
    }

    // Supply assets to earn interest
    supply(asset, amount, user) {
        const market = this.markets.get(asset);
        if (!market) {
            this.throwError("MARKET_NOT_FOUND", `Market for ${asset} not found`);
        }

        this.updateMarketRates(asset);

        // Calculate supply tokens to mint (similar to cTokens in Compound)
        const exchangeRate = this.calculateExchangeRate(asset);
        const supplyTokens = amount / exchangeRate;

        // Update market state
        market.totalSupply += amount;

        // Update user position
        const userKey = `${user}_${asset}`;
        if (!this.userPositions.has(userKey)) {
            this.userPositions.set(userKey, {
                user,
                asset,
                supplied: 0,
                borrowed: 0,
                supplyTokens: 0,
                lastInterestIndex: 1
            });
        }

        const position = this.userPositions.get(userKey);
        position.supplied += amount;
        position.supplyTokens += supplyTokens;

        this.emit("AssetSupplied", {
            user,
            asset,
            amount,
            supplyTokens,
            newTotal: position.supplied
        });

        console.log(`💰 ${user} supplied ${amount} ${asset}`);
        return supplyTokens;
    }

    // Borrow assets using collateral
    borrow(asset, amount, user) {
        const market = this.markets.get(asset);
        if (!market) {
            this.throwError("MARKET_NOT_FOUND", `Market for ${asset} not found`);
        }

        // Check borrowing power
        const borrowingPower = this.calculateBorrowingPower(user);
        const currentBorrowValue = this.calculateBorrowValue(user);
        
        if (currentBorrowValue + amount > borrowingPower) {
            this.throwError("INSUFFICIENT_COLLATERAL", "Insufficient collateral to borrow");
        }

        this.updateMarketRates(asset);

        // Update market state
        market.totalBorrow += amount;

        // Update user position
        const userKey = `${user}_${asset}`;
        if (!this.userPositions.has(userKey)) {
            this.userPositions.set(userKey, {
                user,
                asset,
                supplied: 0,
                borrowed: 0,
                supplyTokens: 0,
                lastInterestIndex: 1
            });
        }

        const position = this.userPositions.get(userKey);
        position.borrowed += amount;

        this.emit("AssetBorrowed", {
            user,
            asset,
            amount,
            newTotal: position.borrowed
        });

        console.log(`📋 ${user} borrowed ${amount} ${asset}`);
        return amount;
    }

    // Repay borrowed assets
    repay(asset, amount, user) {
        const market = this.markets.get(asset);
        if (!market) {
            this.throwError("MARKET_NOT_FOUND", `Market for ${asset} not found`);
        }

        const userKey = `${user}_${asset}`;
        const position = this.userPositions.get(userKey);
        
        if (!position || position.borrowed === 0) {
            this.throwError("NO_BORROW_POSITION", "No outstanding borrow to repay");
        }

        const repayAmount = Math.min(amount, position.borrowed);

        this.updateMarketRates(asset);

        // Update market state
        market.totalBorrow -= repayAmount;

        // Update user position
        position.borrowed -= repayAmount;

        this.emit("AssetRepaid", {
            user,
            asset,
            amount: repayAmount,
            remaining: position.borrowed
        });

        console.log(`💳 ${user} repaid ${repayAmount} ${asset}`);
        return repayAmount;
    }

    // Calculate borrowing power based on supplied collateral
    calculateBorrowingPower(user) {
        let totalBorrowingPower = 0;

        for (const [asset, market] of this.markets) {
            const userKey = `${user}_${asset}`;
            const position = this.userPositions.get(userKey);
            
            if (position && position.supplied > 0) {
                totalBorrowingPower += position.supplied * market.collateralFactor;
            }
        }

        return totalBorrowingPower;
    }

    // Calculate total borrow value
    calculateBorrowValue(user) {
        let totalBorrowValue = 0;

        for (const [asset, market] of this.markets) {
            const userKey = `${user}_${asset}`;
            const position = this.userPositions.get(userKey);
            
            if (position && position.borrowed > 0) {
                totalBorrowValue += position.borrowed; // Simplified: assuming 1:1 price
            }
        }

        return totalBorrowValue;
    }

    // Update interest rates based on utilization
    updateMarketRates(asset) {
        const market = this.markets.get(asset);
        if (!market) return;

        // Calculate utilization rate
        market.utilization = market.totalSupply > 0 
            ? market.totalBorrow / market.totalSupply 
            : 0;

        // Calculate borrow rate using interest rate model
        const { baseRate, multiplier, jumpMultiplier, kink } = this.interestRateModel;
        
        if (market.utilization <= kink) {
            market.borrowRate = baseRate + (multiplier * market.utilization);
        } else {
            market.borrowRate = baseRate + (multiplier * kink) + 
                (jumpMultiplier * (market.utilization - kink));
        }

        // Calculate supply rate (borrow rate * utilization * (1 - reserve factor))
        const reserveFactor = 0.1; // 10% reserve factor
        market.supplyRate = market.borrowRate * market.utilization * (1 - reserveFactor);

        market.lastUpdate = Date.now();
    }

    // Calculate exchange rate for supply tokens
    calculateExchangeRate(asset) {
        const market = this.markets.get(asset);
        if (!market || market.totalSupply === 0) return 1;

        // Simplified exchange rate calculation
        return (market.totalSupply + market.totalBorrow) / market.totalSupply;
    }

    // Check if a position can be liquidated
    isLiquidatable(user) {
        const borrowingPower = this.calculateBorrowingPower(user);
        const borrowValue = this.calculateBorrowValue(user);
        
        // Check against liquidation threshold
        let liquidationThreshold = 0;
        let totalCollateral = 0;

        for (const [asset, market] of this.markets) {
            const userKey = `${user}_${asset}`;
            const position = this.userPositions.get(userKey);
            
            if (position && position.supplied > 0) {
                totalCollateral += position.supplied;
                liquidationThreshold += position.supplied * market.liquidationThreshold;
            }
        }

        if (totalCollateral > 0) {
            liquidationThreshold /= totalCollateral;
        }

        return borrowValue > (totalCollateral * liquidationThreshold);
    }
}

// === 4. NFT Collection Pallet ===

class NFTPallet extends BasePallet {
    constructor() {
        super("NFT", "3.0.0");
        this.collections = new Map();
        this.items = new Map();
        this.nextCollectionId = 1;
        this.nextItemId = 1;
        this.marketplaces = new Map();
    }

    // Create a new NFT collection
    createCollection(metadata, maxItems, settings, creator) {
        const collectionId = this.nextCollectionId++;

        const collection = {
            id: collectionId,
            owner: creator,
            metadata: metadata,
            maxItems: maxItems,
            itemCount: 0,
            settings: {
                transferable: settings.transferable ?? true,
                burnable: settings.burnable ?? true,
                mintable: settings.mintable ?? true,
                ...settings
            },
            created: Date.now()
        };

        this.collections.set(collectionId, collection);
        this.set(`collection_${collectionId}`, collection);

        this.emit("CollectionCreated", {
            collectionId,
            owner: creator,
            metadata,
            maxItems
        });

        console.log(`🎨 NFT Collection ${collectionId} created by ${creator}`);
        return collectionId;
    }

    // Mint a new NFT item
    mintItem(collectionId, to, metadata, attributes) {
        const collection = this.collections.get(collectionId);
        if (!collection) {
            this.throwError("COLLECTION_NOT_FOUND", `Collection ${collectionId} not found`);
        }

        if (!collection.settings.mintable) {
            this.throwError("MINTING_DISABLED", "Minting is disabled for this collection");
        }

        if (collection.maxItems && collection.itemCount >= collection.maxItems) {
            this.throwError("MAX_ITEMS_REACHED", "Maximum items reached for collection");
        }

        const itemId = this.nextItemId++;

        const item = {
            id: itemId,
            collection: collectionId,
            owner: to,
            metadata: metadata,
            attributes: attributes || [],
            created: Date.now(),
            transferable: collection.settings.transferable
        };

        this.items.set(itemId, item);
        this.set(`item_${itemId}`, item);

        // Update collection count
        collection.itemCount++;

        this.emit("ItemMinted", {
            itemId,
            collectionId,
            owner: to,
            metadata
        });

        console.log(`🖼️ NFT Item ${itemId} minted in collection ${collectionId}`);
        return itemId;
    }

    // Transfer NFT item
    transferItem(itemId, from, to) {
        const item = this.items.get(itemId);
        if (!item) {
            this.throwError("ITEM_NOT_FOUND", `Item ${itemId} not found`);
        }

        if (item.owner !== from) {
            this.throwError("NOT_OWNER", "Only owner can transfer item");
        }

        if (!item.transferable) {
            this.throwError("NOT_TRANSFERABLE", "Item is not transferable");
        }

        item.owner = to;

        this.emit("ItemTransferred", {
            itemId,
            from,
            to
        });

        console.log(`📤 NFT Item ${itemId} transferred from ${from} to ${to}`);
    }

    // Burn NFT item
    burnItem(itemId, owner) {
        const item = this.items.get(itemId);
        if (!item) {
            this.throwError("ITEM_NOT_FOUND", `Item ${itemId} not found`);
        }

        if (item.owner !== owner) {
            this.throwError("NOT_OWNER", "Only owner can burn item");
        }

        const collection = this.collections.get(item.collection);
        if (!collection.settings.burnable) {
            this.throwError("NOT_BURNABLE", "Item is not burnable");
        }

        // Remove item
        this.items.delete(itemId);
        this.delete(`item_${itemId}`);

        // Update collection count
        collection.itemCount--;

        this.emit("ItemBurned", {
            itemId,
            owner,
            collection: item.collection
        });

        console.log(`🔥 NFT Item ${itemId} burned by ${owner}`);
    }

    // Create marketplace listing
    listForSale(itemId, price, seller) {
        const item = this.items.get(itemId);
        if (!item) {
            this.throwError("ITEM_NOT_FOUND", `Item ${itemId} not found`);
        }

        if (item.owner !== seller) {
            this.throwError("NOT_OWNER", "Only owner can list item");
        }

        const listing = {
            itemId,
            seller,
            price,
            listed: Date.now(),
            active: true
        };

        this.marketplaces.set(itemId, listing);

        this.emit("ItemListed", {
            itemId,
            seller,
            price
        });

        console.log(`🏪 NFT Item ${itemId} listed for ${price}`);
    }

    // Purchase NFT from marketplace
    buyItem(itemId, buyer, paymentAmount) {
        const listing = this.marketplaces.get(itemId);
        if (!listing || !listing.active) {
            this.throwError("NOT_FOR_SALE", "Item is not listed for sale");
        }

        if (paymentAmount < listing.price) {
            this.throwError("INSUFFICIENT_PAYMENT", "Payment amount insufficient");
        }

        const item = this.items.get(itemId);
        const seller = item.owner;

        // Transfer ownership
        item.owner = buyer;

        // Remove listing
        listing.active = false;
        this.marketplaces.delete(itemId);

        this.emit("ItemSold", {
            itemId,
            seller,
            buyer,
            price: listing.price
        });

        console.log(`💰 NFT Item ${itemId} sold from ${seller} to ${buyer} for ${listing.price}`);
    }

    // Get collection information
    getCollection(collectionId) {
        return this.collections.get(collectionId);
    }

    // Get item information
    getItem(itemId) {
        return this.items.get(itemId);
    }

    // Get items owned by user
    getItemsByOwner(owner) {
        return Array.from(this.items.values()).filter(item => item.owner === owner);
    }
}

// === 5. Oracle Pallet ===

class OraclePallet extends BasePallet {
    constructor() {
        super("Oracle", "1.0.0");
        this.dataFeeds = new Map();
        this.operators = new Map();
        this.requests = new Map();
        this.nextRequestId = 1;
    }

    // Register oracle operator
    registerOperator(operator, stake, endpoint) {
        if (this.operators.has(operator)) {
            this.throwError("OPERATOR_EXISTS", "Operator already registered");
        }

        const operatorInfo = {
            address: operator,
            stake,
            endpoint,
            reputation: 100,
            totalSubmissions: 0,
            accurateSubmissions: 0,
            registered: Date.now(),
            active: true
        };

        this.operators.set(operator, operatorInfo);

        this.emit("OperatorRegistered", {
            operator,
            stake,
            endpoint
        });

        console.log(`🔮 Oracle operator ${operator} registered`);
    }

    // Create data feed
    createDataFeed(feedId, description, updateFrequency, threshold) {
        if (this.dataFeeds.has(feedId)) {
            this.throwError("FEED_EXISTS", "Data feed already exists");
        }

        const feed = {
            id: feedId,
            description,
            updateFrequency, // in seconds
            threshold, // minimum operators needed
            currentValue: null,
            lastUpdate: 0,
            submissions: new Map(),
            history: []
        };

        this.dataFeeds.set(feedId, feed);

        this.emit("DataFeedCreated", {
            feedId,
            description,
            updateFrequency,
            threshold
        });

        console.log(`📊 Data feed ${feedId} created`);
    }

    // Submit data to feed
    submitData(feedId, value, operator) {
        const feed = this.dataFeeds.get(feedId);
        if (!feed) {
            this.throwError("FEED_NOT_FOUND", `Data feed ${feedId} not found`);
        }

        const operatorInfo = this.operators.get(operator);
        if (!operatorInfo || !operatorInfo.active) {
            this.throwError("OPERATOR_NOT_ACTIVE", "Operator not active");
        }

        const submissionTime = Date.now();
        
        // Store submission
        feed.submissions.set(operator, {
            value,
            timestamp: submissionTime,
            operator
        });

        operatorInfo.totalSubmissions++;

        this.emit("DataSubmitted", {
            feedId,
            operator,
            value,
            timestamp: submissionTime
        });

        // Check if we can aggregate
        if (feed.submissions.size >= feed.threshold) {
            this.aggregateData(feedId);
        }

        console.log(`📈 Data submitted to ${feedId} by ${operator}: ${value}`);
    }

    // Aggregate submitted data using median
    aggregateData(feedId) {
        const feed = this.dataFeeds.get(feedId);
        if (!feed) return;

        const submissions = Array.from(feed.submissions.values());
        if (submissions.length < feed.threshold) return;

        // Calculate median value
        const values = submissions.map(s => s.value).sort((a, b) => a - b);
        const median = values.length % 2 === 0
            ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
            : values[Math.floor(values.length / 2)];

        // Update feed
        const oldValue = feed.currentValue;
        feed.currentValue = median;
        feed.lastUpdate = Date.now();

        // Add to history
        feed.history.push({
            value: median,
            timestamp: feed.lastUpdate,
            submissions: submissions.length
        });

        // Clear submissions for next round
        feed.submissions.clear();

        // Update operator reputations based on accuracy
        this.updateOperatorReputations(feedId, submissions, median);

        this.emit("DataAggregated", {
            feedId,
            oldValue,
            newValue: median,
            submissions: submissions.length
        });

        console.log(`🎯 Data aggregated for ${feedId}: ${median}`);
    }

    // Update operator reputations based on submission accuracy
    updateOperatorReputations(feedId, submissions, finalValue) {
        const tolerance = 0.05; // 5% tolerance

        submissions.forEach(submission => {
            const operator = this.operators.get(submission.operator);
            if (!operator) return;

            const accuracy = Math.abs(submission.value - finalValue) / finalValue;
            
            if (accuracy <= tolerance) {
                operator.accurateSubmissions++;
                operator.reputation = Math.min(100, operator.reputation + 1);
            } else {
                operator.reputation = Math.max(0, operator.reputation - 2);
            }
        });
    }

    // Request external data
    requestData(description, parameters, callback, requester) {
        const requestId = this.nextRequestId++;

        const request = {
            id: requestId,
            description,
            parameters,
            callback,
            requester,
            status: "pending",
            created: Date.now(),
            responses: new Map()
        };

        this.requests.set(requestId, request);

        this.emit("DataRequested", {
            requestId,
            description,
            requester
        });

        console.log(`📡 Data request ${requestId} created by ${requester}`);
        return requestId;
    }

    // Get current data feed value
    getDataValue(feedId) {
        const feed = this.dataFeeds.get(feedId);
        return feed ? feed.currentValue : null;
    }

    // Get feed history
    getFeedHistory(feedId, limit = 10) {
        const feed = this.dataFeeds.get(feedId);
        if (!feed) return [];

        return feed.history.slice(-limit);
    }
}

// === 6. Demonstration Functions ===

function demonstrateAMM() {
    console.log("💧 AMM Pallet Demo");
    console.log("==================");

    const amm = new AMMPallet();

    // Create pools
    const pool1 = amm.createPool("DOT", "USDT", 1000, 5000, "alice");
    const pool2 = amm.createPool("DOT", "KSM", 1000, 2000, "bob");

    // Add liquidity
    amm.addLiquidity(pool1, 500, 2500, "charlie");

    // Perform swaps
    const output = amm.swapExactTokensForTokens(pool1, "DOT", 100, 450, "david");
    console.log(`Swap output: ${output} USDT`);

    // Calculate price impact
    const impact = amm.calculatePriceImpact(pool1, "DOT", 100);
    console.log(`Price impact: ${(impact * 100).toFixed(2)}%`);

    console.log("\nPool state after operations:");
    console.log(amm.getPool(pool1));
}

function demonstrateLending() {
    console.log("\n🏦 Lending Pallet Demo");
    console.log("======================");

    const lending = new LendingPallet();

    // Create markets
    lending.createMarket("DOT", 0.75, 0.85, "admin");
    lending.createMarket("USDT", 0.8, 0.9, "admin");

    // Supply assets
    lending.supply("DOT", 1000, "alice");
    lending.supply("USDT", 5000, "bob");

    // Borrow assets
    lending.borrow("USDT", 3000, "alice"); // Using DOT as collateral

    // Check borrowing power
    const borrowingPower = lending.calculateBorrowingPower("alice");
    console.log(`Alice's borrowing power: ${borrowingPower}`);

    // Check if liquidatable
    const liquidatable = lending.isLiquidatable("alice");
    console.log(`Alice liquidatable: ${liquidatable}`);

    // Repay loan
    lending.repay("USDT", 1000, "alice");
}

function demonstrateNFT() {
    console.log("\n🎨 NFT Pallet Demo");
    console.log("==================");

    const nft = new NFTPallet();

    // Create collection
    const collectionId = nft.createCollection(
        "My Art Collection",
        100,
        { transferable: true, burnable: true },
        "artist"
    );

    // Mint items
    const item1 = nft.mintItem(collectionId, "collector1", "Artwork #1", [
        { trait: "Background", value: "Blue" },
        { trait: "Rarity", value: "Rare" }
    ]);

    const item2 = nft.mintItem(collectionId, "collector1", "Artwork #2", [
        { trait: "Background", value: "Red" },
        { trait: "Rarity", value: "Common" }
    ]);

    // List for sale
    nft.listForSale(item1, 1000, "collector1");

    // Buy item
    nft.buyItem(item1, "collector2", 1000);

    // Transfer item
    nft.transferItem(item2, "collector1", "collector3");

    console.log(`\nCollector1's items:`, nft.getItemsByOwner("collector1"));
    console.log(`Collector2's items:`, nft.getItemsByOwner("collector2"));
}

function demonstrateOracle() {
    console.log("\n🔮 Oracle Pallet Demo");
    console.log("=====================");

    const oracle = new OraclePallet();

    // Register operators
    oracle.registerOperator("operator1", 10000, "https://api1.example.com");
    oracle.registerOperator("operator2", 15000, "https://api2.example.com");
    oracle.registerOperator("operator3", 12000, "https://api3.example.com");

    // Create data feed
    oracle.createDataFeed("DOT/USD", "DOT to USD price feed", 60, 2);

    // Submit data
    oracle.submitData("DOT/USD", 6.50, "operator1");
    oracle.submitData("DOT/USD", 6.55, "operator2");
    oracle.submitData("DOT/USD", 6.52, "operator3");

    // Get aggregated value
    const price = oracle.getDataValue("DOT/USD");
    console.log(`Current DOT/USD price: $${price}`);

    // Request external data
    const requestId = oracle.requestData(
        "Weather data for London",
        { city: "London", metric: "temperature" },
        (data) => console.log("Weather callback:", data),
        "weather_app"
    );

    console.log(`Data request created: ${requestId}`);
}

function analyzeAdvancedPallets() {
    console.log("\n📊 Advanced Pallet Analysis");
    console.log("============================");

    console.log("Pallet Comparison:");
    console.log("=================");
    
    const pallets = [
        { name: "AMM", complexity: "High", gas: "Medium", composability: "High" },
        { name: "Lending", complexity: "Very High", gas: "High", composability: "Medium" },
        { name: "NFT", complexity: "Medium", gas: "Low", composability: "High" },
        { name: "Oracle", complexity: "High", gas: "Medium", composability: "Very High" }
    ];

    pallets.forEach(pallet => {
        console.log(`${pallet.name}:`);
        console.log(`  Complexity: ${pallet.complexity}`);
        console.log(`  Gas Usage: ${pallet.gas}`);
        console.log(`  Composability: ${pallet.composability}`);
        console.log("");
    });

    console.log("Optimization Strategies:");
    console.log("• Use efficient storage patterns (maps vs vectors)");
    console.log("• Implement proper weight calculations");
    console.log("• Batch operations where possible");
    console.log("• Use events for off-chain indexing");
    console.log("• Implement proper error handling");
}

// === Main Execution ===

function main() {
    try {
        console.log("Starting Advanced Pallets Mastery demonstration...\n");

        demonstrateAMM();
        demonstrateLending();
        demonstrateNFT();
        demonstrateOracle();
        analyzeAdvancedPallets();

        console.log("\n🎉 Advanced Pallets Mastery Complete!");
        console.log("\nKey Takeaways:");
        console.log("• Pallets enable modular blockchain functionality");
        console.log("• DeFi pallets require careful economic modeling");
        console.log("• NFT systems need flexible metadata and transfer controls");
        console.log("• Oracles provide critical external data integration");
        console.log("• Composability enables powerful application ecosystems");

    } catch (error) {
        console.error("❌ Error in advanced pallets demonstration:", error.message);
    }
}

// Run the demonstration
if (require.main === module) {
    main();
}

module.exports = {
    AMMPallet,
    LendingPallet,
    NFTPallet,
    OraclePallet,
    BasePallet
};
