// MEV Fundamentals - Practical Examples
// This module demonstrates basic MEV concepts with code examples

const Web3 = require('web3');
const axios = require('axios');

// Simulated DEX price data for educational purposes
class DEXPriceSimulator {
    constructor() {
        this.dexes = {
            'Uniswap': { ETH_USDC: 3000 },
            'SushiSwap': { ETH_USDC: 3010 },
            'Curve': { ETH_USDC: 2995 },
            'Balancer': { ETH_USDC: 3005 }
        };
    }

    // Simulate price updates
    updatePrices() {
        Object.keys(this.dexes).forEach(dex => {
            // Add random price variation (±1%)
            const currentPrice = this.dexes[dex].ETH_USDC;
            const variation = (Math.random() - 0.5) * 0.02; // ±1%
            this.dexes[dex].ETH_USDC = currentPrice * (1 + variation);
        });
    }

    getAllPrices() {
        return this.dexes;
    }

    findArbitrageOpportunities() {
        const prices = Object.entries(this.dexes).map(([dex, prices]) => ({
            dex,
            price: prices.ETH_USDC
        }));

        const sortedPrices = prices.sort((a, b) => a.price - b.price);
        const cheapest = sortedPrices[0];
        const mostExpensive = sortedPrices[sortedPrices.length - 1];

        const profitPerETH = mostExpensive.price - cheapest.price;
        const profitPercentage = (profitPerETH / cheapest.price) * 100;

        return {
            opportunity: profitPerETH > 5, // Profitable if > $5 difference
            buyFrom: cheapest.dex,
            sellTo: mostExpensive.dex,
            buyPrice: cheapest.price,
            sellPrice: mostExpensive.price,
            profitPerETH: profitPerETH,
            profitPercentage: profitPercentage.toFixed(4)
        };
    }
}

// MEV Bot Simulator
class MEVBotSimulator {
    constructor() {
        this.balance = { ETH: 10, USDC: 30000 };
        this.gasCost = 50; // $50 average gas cost
        this.totalProfit = 0;
        this.tradesExecuted = 0;
    }

    executeArbitrage(opportunity, amount = 1) {
        if (!opportunity.opportunity) {
            console.log('❌ No profitable arbitrage opportunity');
            return false;
        }

        const grossProfit = opportunity.profitPerETH * amount;
        const netProfit = grossProfit - this.gasCost;

        if (netProfit <= 0) {
            console.log('❌ Arbitrage not profitable after gas costs');
            console.log(`   Gross profit: $${grossProfit.toFixed(2)}`);
            console.log(`   Gas cost: $${this.gasCost}`);
            console.log(`   Net profit: $${netProfit.toFixed(2)}`);
            return false;
        }

        // Execute the trade
        console.log('✅ Executing arbitrage trade:');
        console.log(`   Buy ${amount} ETH on ${opportunity.buyFrom} at $${opportunity.buyPrice.toFixed(2)}`);
        console.log(`   Sell ${amount} ETH on ${opportunity.sellTo} at $${opportunity.sellPrice.toFixed(2)}`);
        console.log(`   Gross profit: $${grossProfit.toFixed(2)}`);
        console.log(`   Gas cost: $${this.gasCost}`);
        console.log(`   Net profit: $${netProfit.toFixed(2)}`);

        this.totalProfit += netProfit;
        this.tradesExecuted++;

        return true;
    }

    // Simulate sandwich attack (educational purposes only)
    simulateSandwichAttack(userTrade) {
        console.log('\n🥪 Sandwich Attack Simulation (Educational Only):');
        console.log(`User wants to buy ${userTrade.amount} ETH`);
        
        // Front-run: Buy ETH to increase price
        const frontRunAmount = userTrade.amount * 0.1; // 10% of user trade
        console.log(`1. Front-run: Bot buys ${frontRunAmount} ETH (increases price)`);
        
        // User trade executes at higher price
        const priceImpact = userTrade.amount * 0.001; // 0.1% price impact per ETH
        const newPrice = 3000 * (1 + priceImpact);
        console.log(`2. User's trade executes at higher price: $${newPrice.toFixed(2)}`);
        
        // Back-run: Sell ETH immediately after
        console.log(`3. Back-run: Bot sells ${frontRunAmount} ETH at higher price`);
        
        const profit = frontRunAmount * priceImpact * 3000;
        console.log(`4. Bot profit: $${profit.toFixed(2)}`);
        console.log(`5. User pays extra: $${(userTrade.amount * priceImpact * 3000).toFixed(2)}`);
        
        console.log('⚠️  This demonstrates why MEV can be harmful to users');
    }

    getStats() {
        return {
            totalProfit: this.totalProfit.toFixed(2),
            tradesExecuted: this.tradesExecuted,
            avgProfitPerTrade: this.tradesExecuted > 0 ? (this.totalProfit / this.tradesExecuted).toFixed(2) : 0
        };
    }
}

// Demonstration
async function demonstrateMEVConcepts() {
    console.log('🏦 MEV Fundamentals Demonstration\n');

    const dexSimulator = new DEXPriceSimulator();
    const mevBot = new MEVBotSimulator();

    console.log('📊 Current DEX Prices:');
    console.log(dexSimulator.getAllPrices());

    // Run simulation for 10 rounds
    for (let round = 1; round <= 10; round++) {
        console.log(`\n--- Round ${round} ---`);
        
        // Update prices to simulate market movement
        dexSimulator.updatePrices();
        
        // Find arbitrage opportunities
        const opportunity = dexSimulator.findArbitrageOpportunities();
        
        console.log('🔍 Arbitrage Analysis:');
        console.log(`   ${opportunity.buyFrom}: $${opportunity.buyPrice.toFixed(2)}`);
        console.log(`   ${opportunity.sellTo}: $${opportunity.sellPrice.toFixed(2)}`);
        console.log(`   Profit potential: $${opportunity.profitPerETH.toFixed(2)} (${opportunity.profitPercentage}%)`);
        
        // Try to execute arbitrage
        mevBot.executeArbitrage(opportunity, 1);
        
        // Wait briefly between rounds
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📈 MEV Bot Performance:');
    const stats = mevBot.getStats();
    console.log(`Total Profit: $${stats.totalProfit}`);
    console.log(`Trades Executed: ${stats.tradesExecuted}`);
    console.log(`Average Profit per Trade: $${stats.avgProfitPerTrade}`);

    // Demonstrate sandwich attack concept
    mevBot.simulateSandwichAttack({ amount: 50 });

    console.log('\n🎓 Key Learnings:');
    console.log('1. MEV opportunities exist due to price differences across DEXs');
    console.log('2. Gas costs significantly impact MEV profitability');
    console.log('3. MEV can provide market efficiency but at cost to users');
    console.log('4. Understanding MEV is crucial for both exploitation and protection');
}

// Educational MEV metrics calculator
function calculateMEVMetrics() {
    console.log('\n📊 MEV Market Metrics Calculator\n');

    // Simulate daily MEV data
    const dailyMEVData = {
        totalBlocks: 7200, // ~7200 blocks per day
        blocksWithMEV: 3600, // ~50% of blocks contain MEV
        averageMEVPerBlock: 0.15, // ETH
        ethPrice: 3000
    };

    const totalDailyMEV = dailyMEVData.blocksWithMEV * dailyMEVData.averageMEVPerBlock;
    const totalDailyMEVUSD = totalDailyMEV * dailyMEVData.ethPrice;
    const annualMEVUSD = totalDailyMEVUSD * 365;

    console.log('Daily MEV Statistics:');
    console.log(`- Total blocks: ${dailyMEVData.totalBlocks}`);
    console.log(`- Blocks with MEV: ${dailyMEVData.blocksWithMEV}`);
    console.log(`- MEV extraction rate: ${((dailyMEVData.blocksWithMEV / dailyMEVData.totalBlocks) * 100).toFixed(1)}%`);
    console.log(`- Average MEV per block: ${dailyMEVData.averageMEVPerBlock} ETH`);
    console.log(`- Total daily MEV: ${totalDailyMEV.toFixed(2)} ETH ($${totalDailyMEVUSD.toLocaleString()})`);
    console.log(`- Projected annual MEV: $${(annualMEVUSD / 1000000).toFixed(0)}M`);
}

// Run the demonstration
if (require.main === module) {
    demonstrateMEVConcepts()
        .then(() => calculateMEVMetrics())
        .catch(console.error);
}

module.exports = {
    DEXPriceSimulator,
    MEVBotSimulator,
    demonstrateMEVConcepts,
    calculateMEVMetrics
};
