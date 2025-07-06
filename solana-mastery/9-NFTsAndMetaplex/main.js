/**
 * Module 9: NFTs and Metaplex
 * 
 * This module covers comprehensive NFT development on Solana including:
 * - Metaplex Protocol and ecosystem
 * - NFT creation, collection management
 * - Marketplace development
 * - Dynamic NFTs and gaming applications
 * - Creator economics and royalty systems
 */

const {
    Connection,
    PublicKey,
    Keypair,
    SystemProgram,
    LAMPORTS_PER_SOL
} = require('@solana/web3.js');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

console.log('=== NFTs and Metaplex Protocol ===\n');

// Part 1: NFT Basics and Solana Advantages
function demonstrateNFTBasics() {
    console.log('🎨 Part 1: NFT Fundamentals on Solana');
    console.log('Understanding the Solana NFT ecosystem:\n');
    
    console.log('Solana vs Ethereum NFTs:');
    console.log('┌─────────────────┬─────────────┬─────────────┐');
    console.log('│ Feature         │ Solana      │ Ethereum    │');
    console.log('├─────────────────┼─────────────┼─────────────┤');
    console.log('│ Mint Cost       │ ~$0.00025   │ $50-200+    │');
    console.log('│ Transfer Speed  │ <1 second   │ 15+ seconds │');
    console.log('│ Transfer Cost   │ ~$0.00025   │ $10-50+     │');
    console.log('│ Throughput      │ 65,000 TPS  │ 15 TPS      │');
    console.log('│ Energy Usage    │ Very Low    │ High        │');
    console.log('│ Metadata        │ On/Off-chain│ Off-chain   │');
    console.log('└─────────────────┴─────────────┴─────────────┘\n');
    
    console.log('Solana NFT Standards:');
    console.log('  📋 Token Metadata Program - On-chain metadata storage');
    console.log('  🎯 Master Edition - Controls NFT supply (1 for unique)');
    console.log('  👥 Creator Verification - Cryptographic creator proof');
    console.log('  💰 Royalty Enforcement - Automatic creator compensation');
    console.log('  🔗 Collection Support - Organized NFT groupings');
    console.log('  🤖 Programmable NFTs - Smart contract functionality\n');
}

// Part 2: Metaplex Ecosystem
function demonstrateMetaplexEcosystem() {
    console.log('🏗️ Part 2: Metaplex Protocol Stack');
    console.log('The complete NFT infrastructure:\n');
    
    console.log('Core Programs:');
    console.log('  📋 Token Metadata Program');
    console.log('     • Stores NFT metadata on-chain');
    console.log('     • Manages creator verification');
    console.log('     • Handles collection relationships');
    console.log('     • Enforces royalty payments\n');
    
    console.log('  🍭 Candy Machine V3');
    console.log('     • Fair launch distribution');
    console.log('     • Configurable minting rules');
    console.log('     • Whitelist and presale support');
    console.log('     • Bot protection mechanisms\n');
    
    console.log('  🏛️ Auction House');
    console.log('     • Decentralized marketplace');
    console.log('     • Custom fee structures');
    console.log('     • Escrow and bidding system');
    console.log('     • Multi-currency support\n');
    
    console.log('  🛡️ Token Auth Rules');
    console.log('     • Transfer restrictions');
    console.log('     • Utility-based permissions');
    console.log('     • Time-locked transfers');
    console.log('     • Soulbound token support\n');
}

// Part 3: NFT Creation Patterns
function demonstrateNFTCreation() {
    console.log('🎯 Part 3: NFT Creation Patterns');
    console.log('From simple mints to complex collections:\n');
    
    console.log('Basic NFT Minting Flow:');
    console.log(`
// Using Metaplex JS SDK
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet))
  .use(bundlrStorage());

// 1. Upload metadata to Arweave
const { uri } = await metaplex.nfts().uploadMetadata({
  name: "My Awesome NFT",
  description: "A unique digital collectible",
  image: "https://example.com/my-nft.png",
  attributes: [
    { trait_type: "Color", value: "Blue" },
    { trait_type: "Rarity", value: "Legendary" },
    { trait_type: "Power", value: "9000" }
  ],
});

// 2. Mint NFT with metadata
const { nft } = await metaplex.nfts().create({
  uri,
  name: "My Awesome NFT",
  sellerFeeBasisPoints: 750, // 7.5% royalty
  creators: [
    {
      address: wallet.publicKey,
      verified: true,
      share: 100,
    },
  ],
});
`);

    console.log('Collection NFT Pattern:');
    console.log(`
// 1. Create collection NFT (parent)
const { nft: collectionNft } = await metaplex.nfts().create({
  uri: collectionMetadataUri,
  name: "Awesome Art Collection",
  isCollection: true,
  sellerFeeBasisPoints: 500,
});

// 2. Mint items in collection
const { nft } = await metaplex.nfts().create({
  uri: itemMetadataUri,
  name: "Collection Item #1",
  collection: collectionNft.address,
  collectionAuthority: keypairIdentity(wallet),
});

// 3. Verify collection membership
await metaplex.nfts().verifyCollection({
  mintAddress: nft.address,
  collectionMintAddress: collectionNft.address,
  collectionAuthority: keypairIdentity(wallet),
});
`);

    console.log('Creation Cost Analysis:');
    const creationCosts = {
        simple: 0.00228288 + 0.00000005, // Rent exemption + transaction
        collection: 0.00228288 * 2 + 0.00000010, // Parent + item + txs
        large_collection: 0.00228288 + (0.00228288 * 10000) + (0.00000005 * 10000)
    };
    
    console.log(`  Simple NFT: ~${creationCosts.simple.toFixed(8)} SOL (~$${(creationCosts.simple * 20).toFixed(4)})`);
    console.log(`  Collection NFT: ~${creationCosts.collection.toFixed(8)} SOL (~$${(creationCosts.collection * 20).toFixed(4)})`);
    console.log(`  10K Collection: ~${creationCosts.large_collection.toFixed(2)} SOL (~$${(creationCosts.large_collection * 20).toFixed(0)})\n`);
}

// Part 4: Advanced NFT Features
function demonstrateAdvancedFeatures() {
    console.log('🚀 Part 4: Advanced NFT Features');
    console.log('Next-generation NFT capabilities:\n');
    
    console.log('Programmable NFTs (pNFTs):');
    console.log(`
// Create NFT with programmable features
const { nft } = await metaplex.nfts().create({
  uri,
  name: "Gaming Character",
  tokenStandard: TokenStandard.ProgrammableNonFungible,
  ruleSet: customRuleSet, // Define usage rules
  creators: [{ address: wallet.publicKey, verified: true, share: 100 }],
});

// Transfer with rule enforcement
await metaplex.nfts().transfer({
  nftOrSft: nft,
  toOwner: newOwner.publicKey,
  authorizationData: authData, // Required for pNFTs
});
`);

    console.log('Dynamic NFTs with State:');
    console.log(`
// On-chain game character state
#[account]
pub struct GameCharacter {
    pub nft_mint: Pubkey,
    pub level: u16,
    pub experience: u64,
    pub strength: u16,
    pub agility: u16,
    pub intelligence: u16,
    pub equipment: Vec<Pubkey>, // Equipped items
    pub last_battle: i64,
}

// Level up character and update metadata
pub fn level_up_character(ctx: Context<LevelUpCharacter>) -> Result<()> {
    let character = &mut ctx.accounts.character;
    
    require!(
        character.experience >= experience_for_level(character.level + 1),
        GameError::InsufficientExperience
    );
    
    character.level += 1;
    character.strength += 2;
    character.agility += 1;
    
    // Update NFT metadata to reflect new stats
    update_nft_metadata(ctx, character)?;
    Ok(())
}
`);

    console.log('Utility NFT Examples:');
    console.log('  🎮 Gaming Assets - Evolving weapons, characters, land');
    console.log('  🎵 Music NFTs - Streaming rights, concert access');
    console.log('  🏠 Real Estate - Fractional property ownership');
    console.log('  🎓 Certificates - Educational credentials, achievements');
    console.log('  🎫 Event Tickets - Verifiable access tokens');
    console.log('  💳 Membership Cards - DAO governance, exclusive access\n');
}

// Part 5: NFT Marketplace Development
function demonstrateMarketplace() {
    console.log('🏪 Part 5: NFT Marketplace Development');
    console.log('Building decentralized trading platforms:\n');
    
    console.log('Auction House Integration:');
    console.log(`
// Create custom auction house
const { auctionHouse } = await metaplex.auctionHouse().create({
  sellerFeeBasisPoints: 250, // 2.5% marketplace fee
  authority: marketplaceWallet,
  treasuryMint: NATIVE_MINT, // Accept SOL
});

// List NFT for sale
const { listing } = await metaplex.auctionHouse().list({
  auctionHouse,
  mintAccount: nft.address,
  price: sol(2.5), // 2.5 SOL asking price
});

// Place bid
const { bid } = await metaplex.auctionHouse().bid({
  auctionHouse,
  mintAccount: nft.address,
  price: sol(2.0), // 2.0 SOL bid
});

// Execute sale when prices match
const { purchase } = await metaplex.auctionHouse().executeSale({
  auctionHouse,
  listing,
  bid,
});
`);

    console.log('Custom Marketplace Features:');
    console.log(`
// Advanced marketplace program
#[program]
pub mod nft_marketplace {
    pub fn create_auction(
        ctx: Context<CreateAuction>,
        starting_price: u64,
        duration: i64,
        reserve_price: Option<u64>,
    ) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        auction.nft_mint = ctx.accounts.nft_mint.key();
        auction.seller = ctx.accounts.seller.key();
        auction.starting_price = starting_price;
        auction.current_bid = starting_price;
        auction.reserve_price = reserve_price;
        auction.ends_at = Clock::get()?.unix_timestamp + duration;
        auction.is_active = true;
        
        // Transfer NFT to escrow
        transfer_nft_to_escrow(ctx)?;
        Ok(())
    }
    
    pub fn place_bid(
        ctx: Context<PlaceBid>,
        bid_amount: u64,
    ) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        
        require!(auction.is_active, MarketplaceError::AuctionEnded);
        require!(
            bid_amount > auction.current_bid,
            MarketplaceError::BidTooLow
        );
        
        // Refund previous bidder
        if auction.current_bidder != Pubkey::default() {
            refund_previous_bidder(ctx, auction.current_bid)?;
        }
        
        // Update auction state
        auction.current_bid = bid_amount;
        auction.current_bidder = ctx.accounts.bidder.key();
        
        // Extend auction if bid placed near end
        extend_auction_if_needed(auction)?;
        
        Ok(())
    }
}
`);

    console.log('Marketplace Features:');
    console.log('  💰 Fixed price sales and auctions');
    console.log('  📊 Real-time price discovery');
    console.log('  🔄 Automatic royalty distribution');
    console.log('  📈 Historical price tracking');
    console.log('  🎯 Collection floor price monitoring');
    console.log('  🤝 Escrow and dispute resolution\n');
}

// Part 6: Creator Economics
function demonstrateCreatorEconomics() {
    console.log('💰 Part 6: Creator Economics & Royalties');
    console.log('Sustainable creator compensation systems:\n');
    
    console.log('Royalty System Design:');
    console.log(`
// Multi-creator revenue sharing
const creators = [
  { address: artist.publicKey, share: 60 },    // Artist: 60%
  { address: developer.publicKey, share: 25 }, // Developer: 25%
  { address: marketing.publicKey, share: 15 }, // Marketing: 15%
];

const { nft } = await metaplex.nfts().create({
  uri,
  name: "Collaborative Artwork",
  sellerFeeBasisPoints: 1000, // 10% total royalties
  creators: creators.map(creator => ({
    address: creator.address,
    verified: false, // Each creator must verify
    share: creator.share,
  })),
});

// Each creator verifies participation
for (const creator of creators) {
  await metaplex.nfts().verifyCreator({
    mintAddress: nft.address,
    creator: keypairIdentity(creator.keypair),
  });
}
`);

    console.log('Royalty Enforcement Mechanisms:');
    console.log(`
// On-chain royalty enforcement
pub fn enforce_royalty_payment(
    ctx: Context<EnforceRoyalty>,
    sale_price: u64,
) -> Result<()> {
    let metadata = &ctx.accounts.metadata;
    let creators = metadata.data.creators.as_ref().unwrap();
    
    for creator in creators {
        if creator.verified {
            let royalty_amount = sale_price
                .checked_mul(creator.share as u64)
                .unwrap()
                .checked_mul(metadata.data.seller_fee_basis_points as u64)
                .unwrap()
                .checked_div(10000)
                .unwrap();
            
            // Transfer royalty to creator
            transfer_lamports(
                ctx.accounts.buyer.to_account_info(),
                creator.address,
                royalty_amount,
            )?;
        }
    }
    Ok(())
}
`);

    console.log('Revenue Models:');
    console.log('  👑 Primary Sales - Initial mint revenue');
    console.log('  🔄 Secondary Royalties - Ongoing revenue from resales');
    console.log('  🎯 Utility Access - Premium features and content');
    console.log('  📈 Staking Rewards - Yield generation for holders');
    console.log('  🎮 Gaming Integration - In-game purchases and upgrades');
    console.log('  🤝 Community Governance - DAO participation fees\n');
    
    // Calculate revenue example
    const primarySales = 10000 * 0.1; // 10K NFTs at 0.1 SOL each
    const secondaryVolume = primarySales * 10; // 10x trading volume
    const royaltyRate = 0.075; // 7.5%
    const secondaryRoyalties = secondaryVolume * royaltyRate;
    
    console.log('Revenue Example (10K Collection):');
    console.log(`  Primary Sales: ${primarySales.toLocaleString()} SOL`);
    console.log(`  Secondary Volume: ${secondaryVolume.toLocaleString()} SOL`);
    console.log(`  Royalty Revenue: ${secondaryRoyalties.toLocaleString()} SOL`);
    console.log(`  Total Creator Revenue: ${(primarySales + secondaryRoyalties).toLocaleString()} SOL\n`);
}

// Part 7: Large-Scale Operations
function demonstrateLargeScaleOperations() {
    console.log('🏭 Part 7: Large-Scale NFT Operations');
    console.log('Enterprise-level NFT deployment strategies:\n');
    
    console.log('Candy Machine V3 Configuration:');
    console.log(`
// 10,000 NFT collection setup
const { candyMachine } = await metaplex.candyMachines().create({
  itemsAvailable: toBigNumber(10000),
  sellerFeeBasisPoints: 750, // 7.5% royalties
  collection: {
    address: collectionNft.address,
    updateAuthority: wallet,
  },
  guards: {
    // Payment configuration
    solPayment: {
      amount: sol(0.1),
      destination: treasuryWallet.publicKey,
    },
    
    // Launch timing
    startDate: {
      date: toDateTime("2024-03-01T00:00:00Z"),
    },
    
    // Purchase limits
    mintLimit: {
      id: 1,
      limit: 5, // Max 5 per wallet
    },
    
    // Whitelist access
    allowList: {
      merkleRoot: whitelistMerkleRoot,
    },
    
    // Bot protection
    nftBurn: {
      requiredCollection: antiSpamCollection.address,
    },
  },
});
`);

    console.log('Batch Operations:');
    console.log(`
// Batch mint for airdrops
const batchMint = async (recipients, metadataUris) => {
  const mintPromises = recipients.map(async (recipient, index) => {
    return metaplex.nfts().create({
      uri: metadataUris[index],
      name: \`Airdrop NFT #\${index + 1}\`,
      collection: collectionNft.address,
      creators: [{ address: wallet.publicKey, verified: true, share: 100 }],
    }).then(({ nft }) => 
      metaplex.nfts().transfer({
        nftOrSft: nft,
        toOwner: recipient,
      })
    );
  });
  
  return Promise.all(mintPromises);
};

// Execute in batches to avoid rate limits
const batchSize = 50;
for (let i = 0; i < recipients.length; i += batchSize) {
  const batch = recipients.slice(i, i + batchSize);
  await batchMint(batch, metadataUris.slice(i, i + batchSize));
  await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
}
`);

    console.log('Scaling Considerations:');
    console.log('  ⚡ Rate limiting - Avoid RPC throttling');
    console.log('  💾 Metadata storage - IPFS vs Arweave vs centralized');
    console.log('  🔄 Batch processing - Group operations efficiently');
    console.log('  📊 Analytics tracking - Monitor mint and trading data');
    console.log('  🛡️ Security measures - Anti-bot and fraud protection');
    console.log('  💰 Treasury management - Multi-sig and time-locks\n');
}

// Part 8: Security and Best Practices
function demonstrateSecurity() {
    console.log('🛡️ Part 8: Security & Best Practices');
    console.log('Protecting creators and collectors:\n');
    
    console.log('Smart Contract Security:');
    console.log(`
// Secure NFT transfer with validation
pub fn secure_transfer(
    ctx: Context<SecureTransfer>,
    auth_data: Option<AuthorizationData>,
) -> Result<()> {
    let nft_account = &ctx.accounts.nft_account;
    let metadata = &ctx.accounts.metadata;
    
    // Verify ownership
    require!(
        nft_account.owner == ctx.accounts.current_owner.key(),
        SecurityError::NotOwner
    );
    
    // Check for transfer restrictions
    if let Some(rule_set) = &metadata.programmable_config {
        require!(
            validate_transfer_rules(rule_set, &ctx.accounts, auth_data)?,
            SecurityError::TransferRestricted
        );
    }
    
    // Verify recipient is not blacklisted
    require!(
        !is_blacklisted(&ctx.accounts.new_owner.key()),
        SecurityError::BlacklistedRecipient
    );
    
    // Execute transfer
    transfer_nft(ctx)?;
    Ok(())
}
`);

    console.log('Frontend Security Measures:');
    console.log(`
// Secure minting interface
const secureNFTMint = async (
  userWallet: PublicKey,
  captchaToken: string,
  whitelistProof?: string[]
) => {
  // Verify CAPTCHA
  const captchaValid = await verifyCaptcha(captchaToken);
  if (!captchaValid) throw new Error('Invalid CAPTCHA');
  
  // Check mint limits
  const mintCount = await getUserMintCount(userWallet);
  if (mintCount >= MAX_MINTS_PER_WALLET) {
    throw new Error('Mint limit exceeded');
  }
  
  // Verify whitelist if required
  if (whitelistProof) {
    const isValid = verifyMerkleProof(
      whitelistProof,
      getMerkleRoot(),
      userWallet.toBytes()
    );
    if (!isValid) throw new Error('Not whitelisted');
  }
  
  // Execute mint with rate limiting
  const tx = await program.methods
    .mintNft(captchaToken, whitelistProof)
    .accounts({
      user: userWallet,
      // ... other accounts
    })
    .rpc();
    
  return tx;
};
`);

    console.log('Security Checklist:');
    console.log('  ✅ Multi-signature treasury wallets');
    console.log('  ✅ Rate limiting and CAPTCHA protection');
    console.log('  ✅ Whitelist verification systems');
    console.log('  ✅ Smart contract auditing');
    console.log('  ✅ Metadata backup and redundancy');
    console.log('  ✅ Emergency pause mechanisms');
    console.log('  ✅ Creator verification processes');
    console.log('  ✅ Anti-money laundering compliance\n');
}

// Main execution function
async function runNFTDemo() {
    try {
        demonstrateNFTBasics();
        demonstrateMetaplexEcosystem();
        demonstrateNFTCreation();
        demonstrateAdvancedFeatures();
        demonstrateMarketplace();
        demonstrateCreatorEconomics();
        demonstrateLargeScaleOperations();
        demonstrateSecurity();
        
        console.log('🎓 Module 9 Complete!');
        console.log('\n🎨 NFT and Metaplex Mastery Achieved!');
        console.log('\nYou now understand:');
        console.log('• Solana NFT advantages and standards');
        console.log('• Complete Metaplex Protocol ecosystem');
        console.log('• NFT creation from simple to complex collections');
        console.log('• Advanced programmable and dynamic NFTs');
        console.log('• Marketplace development and trading systems');
        console.log('• Creator economics and royalty mechanisms');
        console.log('• Large-scale deployment strategies');
        console.log('• Security and best practices');
        console.log('\n💡 Ready to dominate the Solana NFT space!');
        console.log('\nNext: Module 10 - Advanced DeFi protocols and yield strategies');
        
    } catch (error) {
        console.error('Demo error:', error.message);
    }
}

// Run the demo
runNFTDemo();
