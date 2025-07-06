const {
  Connection,
  PublicKey,
  Keypair,
  clusterApiUrl,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');

console.log('=== DeFi Basics Demo ===\n');

// Create connection to devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// --- Part 1: DeFi Fundamentals ---
console.log('💰 Part 1: DeFi Fundamentals\n');

function explainDeFiConcepts() {
  console.log('What is DeFi?');
  console.log('• Decentralized Finance: Financial services without banks');
  console.log('• Smart contracts replace traditional intermediaries');
  console.log('• Permissionless: Anyone can participate');
  console.log('• Composable: Protocols can build on each other');
  console.log('• Transparent: All transactions on-chain');
  console.log();
  
  console.log('Traditional Finance vs DeFi:');
  console.log('┌─────────────────┬──────────────────┬──────────────────┐');
  console.log('│ Aspect          │ Traditional      │ DeFi             │');
  console.log('├─────────────────┼──────────────────┼──────────────────┤');
  console.log('│ Control         │ Banks/Brokers    │ Smart Contracts  │');
  console.log('│ Access          │ KYC Required     │ Permissionless   │');
  console.log('│ Hours           │ Business Hours   │ 24/7             │');
  console.log('│ Transparency    │ Limited          │ Fully Open       │');
  console.log('│ Fees            │ High             │ Usually Lower    │');
  console.log('│ Speed           │ Days             │ Minutes/Seconds  │');
  console.log('└─────────────────┴──────────────────┴──────────────────┘');
  console.log();
}

// --- Part 2: Automated Market Makers (AMMs) ---
console.log('🤖 Part 2: Automated Market Makers (AMMs)\n');

class SimpleAMM {
  constructor(tokenA, tokenB, reserveA, reserveB) {
    this.tokenA = tokenA;
    this.tokenB = tokenB;
    this.reserveA = reserveA;
    this.reserveB = reserveB;
    this.k = reserveA * reserveB; // Constant product formula: x * y = k
  }
  
  // Calculate output amount for given input (with 0.3% fee)
  getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * 997; // 0.3% fee (997/1000)
    const numerator = amountInWithFee * reserveOut;
    const denominator = (reserveIn * 1000) + amountInWithFee;
    return numerator / denominator;
  }
  
  // Simulate a swap
  swap(tokenIn, amountIn) {
    let amountOut;
    
    if (tokenIn === this.tokenA) {
      amountOut = this.getAmountOut(amountIn, this.reserveA, this.reserveB);
      this.reserveA += amountIn;
      this.reserveB -= amountOut;
      console.log(`Swapped ${amountIn} ${this.tokenA} → ${amountOut.toFixed(6)} ${this.tokenB}`);
    } else {
      amountOut = this.getAmountOut(amountIn, this.reserveB, this.reserveA);
      this.reserveB += amountIn;
      this.reserveA -= amountOut;
      console.log(`Swapped ${amountIn} ${this.tokenB} → ${amountOut.toFixed(6)} ${this.tokenA}`);
    }
    
    const newPrice = this.reserveB / this.reserveA;
    console.log(`New price: 1 ${this.tokenA} = ${newPrice.toFixed(6)} ${this.tokenB}`);
    console.log(`Reserves: ${this.reserveA.toFixed(2)} ${this.tokenA}, ${this.reserveB.toFixed(2)} ${this.tokenB}`);
    console.log();
    
    return amountOut;
  }
  
  // Add liquidity
  addLiquidity(amountA, amountB) {
    console.log(`Adding liquidity: ${amountA} ${this.tokenA} + ${amountB} ${this.tokenB}`);
    this.reserveA += amountA;
    this.reserveB += amountB;
    
    // In real AMMs, you'd get LP tokens representing your share
    const lpTokens = Math.sqrt(amountA * amountB);
    console.log(`Received ${lpTokens.toFixed(6)} LP tokens`);
    console.log(`New reserves: ${this.reserveA} ${this.tokenA}, ${this.reserveB} ${this.tokenB}`);
    console.log();
    
    return lpTokens;
  }
  
  // Get current price
  getPrice() {
    return this.reserveB / this.reserveA;
  }
}

function demonstrateAMM() {
  console.log('Understanding AMMs:');
  console.log('• Constant Product Formula: x * y = k');
  console.log('• Larger trades = higher price impact (slippage)');
  console.log('• Trading fees go to liquidity providers');
  console.log('• No order books - algorithmic pricing');
  console.log();
  
  // Create a simple SOL/USDC pool
  const pool = new SimpleAMM('SOL', 'USDC', 1000, 50000); // 1 SOL = 50 USDC initially
  
  console.log('📊 Initial Pool State:');
  console.log(`Reserves: ${pool.reserveA} SOL, ${pool.reserveB} USDC`);
  console.log(`Price: 1 SOL = ${pool.getPrice()} USDC`);
  console.log();
  
  console.log('🔄 Trading Examples:');
  
  // Small trade - minimal slippage
  console.log('Small trade (10 SOL):');
  pool.swap('SOL', 10);
  
  // Larger trade - more slippage
  console.log('Larger trade (100 SOL):');
  pool.swap('SOL', 100);
  
  // Trade back
  console.log('Trading back (5000 USDC):');
  pool.swap('USDC', 5000);
  
  // Add liquidity
  console.log('💧 Adding Liquidity:');
  pool.addLiquidity(100, 3000);
}

// --- Part 3: Liquidity Provision and Yield Farming ---
console.log('🌾 Part 3: Liquidity Provision & Yield Farming\n');

function explainLiquidityProvision() {
  console.log('Liquidity Provision:');
  console.log('• Provide equal dollar amounts of two tokens');
  console.log('• Receive LP (Liquidity Provider) tokens as receipt');
  console.log('• Earn trading fees (typically 0.25-0.3%)');
  console.log('• Risk: Impermanent loss if prices diverge');
  console.log();
  
  console.log('Yield Farming:');
  console.log('• Stake LP tokens in additional reward programs');
  console.log('• Earn extra tokens (governance tokens, etc.)');
  console.log('• Higher rewards = higher risk usually');
  console.log('• Multiple reward tokens possible');
  console.log();
  
  console.log('Example Yield Calculation:');
  const liquidityProvided = 10000; // $10,000
  const tradingFeeAPR = 8; // 8% from trading fees
  const farmingRewardAPR = 15; // 15% from additional rewards
  const totalAPR = tradingFeeAPR + farmingRewardAPR;
  
  console.log(`Liquidity provided: $${liquidityProvided.toLocaleString()}`);
  console.log(`Trading fee APR: ${tradingFeeAPR}%`);
  console.log(`Farming reward APR: ${farmingRewardAPR}%`);
  console.log(`Total APR: ${totalAPR}%`);
  console.log(`Annual earnings: $${(liquidityProvided * totalAPR / 100).toLocaleString()}`);
  console.log();
}

// --- Part 4: Slippage and Price Impact ---
console.log('📉 Part 4: Slippage & Price Impact\n');

function demonstrateSlippage() {
  console.log('Understanding Slippage:');
  console.log('• Difference between expected and executed price');
  console.log('• Caused by price movement during transaction');
  console.log('• Higher for larger trades or smaller pools');
  console.log('• Can be controlled with slippage tolerance');
  console.log();
  
  // Demonstrate price impact in different sized pools
  const smallPool = new SimpleAMM('TOKEN', 'USDC', 100, 10000); // Small pool
  const largePool = new SimpleAMM('TOKEN', 'USDC', 10000, 1000000); // Large pool
  
  console.log('Price Impact Comparison:');
  console.log('Trade: 10 TOKEN in different pool sizes');
  console.log();
  
  console.log('Small Pool (100 TOKEN liquidity):');
  const initialPriceSmall = smallPool.getPrice();
  smallPool.swap('TOKEN', 10);
  const finalPriceSmall = smallPool.getPrice();
  const priceImpactSmall = ((finalPriceSmall - initialPriceSmall) / initialPriceSmall) * 100;
  console.log(`Price impact: ${priceImpactSmall.toFixed(2)}%`);
  console.log();
  
  console.log('Large Pool (10,000 TOKEN liquidity):');
  const initialPriceLarge = largePool.getPrice();
  largePool.swap('TOKEN', 10);
  const finalPriceLarge = largePool.getPrice();
  const priceImpactLarge = ((finalPriceLarge - initialPriceLarge) / initialPriceLarge) * 100;
  console.log(`Price impact: ${priceImpactLarge.toFixed(2)}%`);
  console.log();
  
  console.log('💡 Key Insight: Larger pools = lower slippage');
  console.log();
}

// --- Part 5: Major Solana DeFi Protocols ---
console.log('🏛️  Part 5: Major Solana DeFi Protocols\n');

function explainSolanaDeFi() {
  console.log('Top Solana DeFi Protocols:');
  console.log();
  
  console.log('🌊 Raydium:');
  console.log('• Leading AMM on Solana');
  console.log('• Integrated with Serum order books');
  console.log('• Yield farming and liquidity mining');
  console.log('• RAY governance token');
  console.log();
  
  console.log('🐋 Orca:');
  console.log('• User-friendly DEX interface');
  console.log('• Concentrated liquidity (like Uniswap V3)');
  console.log('• Whirlpools for efficient capital use');
  console.log('• ORCA governance token');
  console.log();
  
  console.log('🪐 Jupiter:');
  console.log('• DEX aggregator for best prices');
  console.log('• Routes trades across multiple DEXs');
  console.log('• Limit orders and DCA features');
  console.log('• JUP governance token');
  console.log();
  
  console.log('🥭 Mango Markets:');
  console.log('• Decentralized trading platform');
  console.log('• Margin trading and perpetuals');
  console.log('• Cross-margin accounts');
  console.log('• MNGO governance token');
  console.log();
  
  console.log('⚡ Solana DeFi Advantages:');
  console.log('• High throughput: 65,000+ TPS');
  console.log('• Low fees: ~$0.00025 per transaction');
  console.log('• Fast finality: ~400ms slots');
  console.log('• Parallel execution: Multiple transactions simultaneously');
  console.log();
}

// --- Part 6: DeFi Risks and Considerations ---
console.log('⚠️  Part 6: DeFi Risks & Considerations\n');

function explainDeFiRisks() {
  console.log('DeFi Risks:');
  console.log();
  
  console.log('🔄 Impermanent Loss:');
  console.log('• Occurs when token prices diverge');
  console.log('• LPs may get less value than holding tokens');
  console.log('• Higher volatility = higher risk');
  console.log('• Mitigated by trading fees over time');
  console.log();
  
  console.log('🐛 Smart Contract Risk:');
  console.log('• Bugs in protocol code');
  console.log('• Unaudited or new protocols');
  console.log('• Admin key risks');
  console.log('• Use audited, established protocols');
  console.log();
  
  console.log('💧 Liquidity Risk:');
  console.log('• Low liquidity = high slippage');
  console.log('• May not be able to exit positions quickly');
  console.log('• Check pool depth before large trades');
  console.log();
  
  console.log('📈 Market Risk:');
  console.log('• Token prices can go to zero');
  console.log('• Leverage amplifies losses');
  console.log('• Regulatory changes');
  console.log('• Only invest what you can afford to lose');
  console.log();
  
  console.log('🛡️  Risk Mitigation:');
  console.log('• Start small and learn');
  console.log('• Use established protocols');
  console.log('• Diversify across protocols');
  console.log('• Monitor positions regularly');
  console.log('• Understand impermanent loss');
  console.log();
}

// --- Part 7: Getting Started with DeFi ---
console.log('🚀 Part 7: Getting Started with DeFi\n');

function explainGettingStarted() {
  console.log('Steps to Start with Solana DeFi:');
  console.log();
  
  console.log('1. 💳 Set up a Wallet:');
  console.log('   • Phantom, Solflare, or Backpack');
  console.log('   • Keep seed phrase secure');
  console.log('   • Start with small amounts');
  console.log();
  
  console.log('2. 💰 Get SOL:');
  console.log('   • Buy on centralized exchange');
  console.log('   • Transfer to your wallet');
  console.log('   • Keep SOL for transaction fees');
  console.log();
  
  console.log('3. 🔄 Start Simple:');
  console.log('   • Try token swaps first');
  console.log('   • Use established DEXs (Raydium, Orca)');
  console.log('   • Check slippage settings');
  console.log();
  
  console.log('4. 💧 Provide Liquidity:');
  console.log('   • Start with stablecoin pairs (lower IL risk)');
  console.log('   • Understand impermanent loss');
  console.log('   • Monitor pool performance');
  console.log();
  
  console.log('5. 🌾 Explore Yield Farming:');
  console.log('   • Research protocols thoroughly');
  console.log('   • Understand risks and rewards');
  console.log('   • Consider governance tokens carefully');
  console.log();
  
  console.log('6. 📚 Keep Learning:');
  console.log('   • Follow protocol documentation');
  console.log('   • Join community discussions');
  console.log('   • Stay updated on new features');
  console.log();
}

// --- Main Execution ---
async function runDemo() {
  explainDeFiConcepts();
  demonstrateAMM();
  explainLiquidityProvision();
  demonstrateSlippage();
  explainSolanaDeFi();
  explainDeFiRisks();
  explainGettingStarted();
  
  console.log('🎓 Module 5 Complete!');
  console.log('\n💡 Key Concepts Learned:');
  console.log('✅ DeFi fundamentals and benefits');
  console.log('✅ Automated Market Makers (AMMs)');
  console.log('✅ Liquidity provision and LP tokens');
  console.log('✅ Yield farming strategies');
  console.log('✅ Slippage and price impact');
  console.log('✅ Major Solana DeFi protocols');
  console.log('✅ Risk assessment and mitigation');
  console.log('✅ Getting started safely');
  console.log('\nNext: Learn about advanced Solana topics!');
}

// Run the demonstration
runDemo().catch(console.error);
