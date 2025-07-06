# Module 9: NFTs and Metaplex 🎨

## 🎯 Learning Objectives
- Master NFT creation and management on Solana
- Understand Metaplex Protocol and ecosystem
- Build NFT marketplaces and trading platforms
- Implement dynamic NFTs and metadata updates
- Handle royalties and creator economics
- Deploy scalable NFT collections

## 🎨 What are Solana NFTs?

**Non-Fungible Tokens (NFTs)** on Solana are unique digital assets with:
- **Unique identifiers** - Each token is one-of-a-kind
- **Metadata standards** - JSON metadata with attributes
- **Creator royalties** - Automatic creator compensation
- **Low minting costs** - ~$0.00025 per mint vs $50+ on Ethereum
- **Fast transactions** - Instant minting and transfers

## 🏗️ Metaplex Protocol Stack

### **Token Metadata Program** 📋
- **Metadata accounts** - Store NFT information on-chain
- **Master editions** - Control NFT supply and printing
- **Update authority** - Who can modify metadata
- **Creator verification** - Cryptographic creator signatures

### **Candy Machine** 🍭
- **Fair launch mechanics** - Randomized minting
- **Configurable pricing** - SOL, SPL tokens, or free
- **Whitelist support** - Presale and early access
- **Bot protection** - Captcha and rate limiting

### **Auction House** 🏛️
- **Decentralized marketplace** - No middleman fees
- **Custom fee structures** - Flexible revenue models
- **Escrow mechanics** - Secure trading system
- **Bid management** - Automated auction logic

## 🛠️ NFT Creation Patterns

### **Basic NFT Minting** 🎯
```typescript
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
const wallet = Keypair.generate();

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet))
  .use(bundlrStorage());

// Upload metadata to Arweave
const { uri } = await metaplex.nfts().uploadMetadata({
  name: "My First NFT",
  description: "A unique digital collectible",
  image: "https://example.com/my-nft.png",
  attributes: [
    { trait_type: "Color", value: "Blue" },
    { trait_type: "Rarity", value: "Legendary" },
  ],
});

// Mint NFT
const { nft } = await metaplex.nfts().create({
  uri,
  name: "My First NFT",
  sellerFeeBasisPoints: 500, // 5% royalty
  creators: [
    {
      address: wallet.publicKey,
      verified: true,
      share: 100,
    },
  ],
});
```

### **Collection NFTs** 📚
```typescript
// Create collection NFT
const { nft: collectionNft } = await metaplex.nfts().create({
  uri: collectionMetadataUri,
  name: "My NFT Collection",
  isCollection: true,
  sellerFeeBasisPoints: 0,
});

// Mint NFT in collection
const { nft } = await metaplex.nfts().create({
  uri: nftMetadataUri,
  name: "Collection Item #1",
  collection: collectionNft.address,
  collectionAuthority: keypairIdentity(wallet),
});

// Verify collection membership
await metaplex.nfts().verifyCollection({
  mintAddress: nft.address,
  collectionMintAddress: collectionNft.address,
  collectionAuthority: keypairIdentity(wallet),
});
```

### **Programmable NFTs (pNFTs)** 🤖
```typescript
// Create programmable NFT with utility
const { nft } = await metaplex.nfts().create({
  uri,
  name: "Utility NFT",
  tokenStandard: TokenStandard.ProgrammableNonFungible,
  ruleSet: myCustomRuleSet, // Define transfer/usage rules
  creators: [
    {
      address: wallet.publicKey,
      verified: true,
      share: 100,
    },
  ],
});

// Transfer with rule enforcement
await metaplex.nfts().transfer({
  nftOrSft: nft,
  toOwner: newOwner.publicKey,
  authorizationData: authData, // Required for pNFTs
});
```

## 🏪 NFT Marketplace Development

### **Auction House Setup** 🏛️
```typescript
// Create custom auction house
const { auctionHouse } = await metaplex.auctionHouse().create({
  sellerFeeBasisPoints: 200, // 2% marketplace fee
  authority: wallet,
  treasuryMint: NATIVE_MINT, // SOL payments
});

// List NFT for sale
const { listing } = await metaplex.auctionHouse().list({
  auctionHouse,
  mintAccount: nft.address,
  price: sol(1.5), // 1.5 SOL
});

// Create bid
const { bid } = await metaplex.auctionHouse().bid({
  auctionHouse,
  mintAccount: nft.address,
  price: sol(1.2), // 1.2 SOL bid
});

// Execute sale
const { purchase } = await metaplex.auctionHouse().executeSale({
  auctionHouse,
  listing,
  bid,
});
```

### **Custom Marketplace Logic** 💼
```typescript
import { Program } from "@coral-xyz/anchor";

// Custom marketplace program
#[program]
pub mod nft_marketplace {
    pub fn list_nft(
        ctx: Context<ListNFT>,
        price: u64,
        duration: i64,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.nft_mint = ctx.accounts.nft_mint.key();
        listing.price = price;
        listing.expires_at = Clock::get()?.unix_timestamp + duration;
        listing.is_active = true;
        
        // Transfer NFT to escrow
        transfer_nft_to_escrow(ctx)?;
        Ok(())
    }
    
    pub fn buy_nft(ctx: Context<BuyNFT>) -> Result<()> {
        let listing = &ctx.accounts.listing;
        
        require!(listing.is_active, MarketplaceError::ListingNotActive);
        require!(
            Clock::get()?.unix_timestamp <= listing.expires_at,
            MarketplaceError::ListingExpired
        );
        
        // Transfer payment to seller
        transfer_payment(ctx, listing.price)?;
        
        // Transfer NFT to buyer
        transfer_nft_to_buyer(ctx)?;
        
        // Update listing status
        listing.is_active = false;
        Ok(())
    }
}
```

## 🎲 Dynamic and Evolving NFTs

### **Metadata Updates** 🔄
```typescript
// Update NFT metadata
const updatedMetadata = {
  ...nft.json,
  attributes: [
    ...nft.json.attributes,
    { trait_type: "Level", value: "2" },
  ],
};

const { uri: newUri } = await metaplex.nfts().uploadMetadata(updatedMetadata);

await metaplex.nfts().update({
  nftOrSft: nft,
  uri: newUri,
});
```

### **Gaming NFTs with State** 🎮
```typescript
// On-chain game state account
#[account]
pub struct GameCharacter {
    pub nft_mint: Pubkey,
    pub level: u16,
    pub experience: u64,
    pub strength: u16,
    pub agility: u16,
    pub intelligence: u16,
    pub equipment: Vec<Pubkey>, // Equipped NFT items
    pub last_battle: i64,
}

pub fn level_up_character(
    ctx: Context<LevelUpCharacter>,
) -> Result<()> {
    let character = &mut ctx.accounts.character;
    
    require!(
        character.experience >= experience_required_for_next_level(character.level),
        GameError::InsufficientExperience
    );
    
    character.level += 1;
    character.strength += 2;
    character.agility += 1;
    character.intelligence += 1;
    
    // Update NFT metadata to reflect new stats
    update_nft_metadata(ctx, character)?;
    
    Ok(())
}
```

## 🏭 Large-Scale NFT Operations

### **Candy Machine V3** 🍭
```typescript
// Create candy machine for 10,000 NFT collection
const { candyMachine } = await metaplex.candyMachines().create({
  itemsAvailable: toBigNumber(10000),
  sellerFeeBasisPoints: 750, // 7.5% royalties
  collection: {
    address: collectionNft.address,
    updateAuthority: wallet,
  },
  creators: [
    {
      address: wallet.publicKey,
      verified: true,
      percentageShare: 100,
    },
  ],
  guards: {
    // Launch configurations
    solPayment: {
      amount: sol(0.1), // 0.1 SOL per mint
      destination: treasuryWallet.publicKey,
    },
    startDate: {
      date: toDateTime("2024-01-01T00:00:00Z"),
    },
    mintLimit: {
      id: 1,
      limit: 5, // Max 5 per wallet
    },
    allowList: {
      merkleRoot: whitelistMerkleRoot,
    },
  },
});

// Add items to candy machine
await metaplex.candyMachines().insertItems({
  candyMachine,
  items: [
    { name: "NFT #1", uri: "https://..." },
    { name: "NFT #2", uri: "https://..." },
    // ... 10,000 items
  ],
});

// Mint from candy machine
const { nft } = await metaplex.candyMachines().mint({
  candyMachine,
  collectionUpdateAuthority: wallet.publicKey,
});
```

### **Batch Operations** 📦
```typescript
// Batch mint multiple NFTs
const mintPromises = metadataList.map(async (metadata, index) => {
  return metaplex.nfts().create({
    uri: metadata.uri,
    name: `Collection Item #${index + 1}`,
    collection: collectionNft.address,
  });
});

const nfts = await Promise.all(mintPromises);

// Batch transfer NFTs
const transferPromises = nfts.map(nft => 
  metaplex.nfts().transfer({
    nftOrSft: nft,
    toOwner: recipient.publicKey,
  })
);

await Promise.all(transferPromises);
```

## 💰 Creator Economics and Royalties

### **Royalty Enforcement** 👑
```typescript
// Enforce royalties on secondary sales
pub fn enforce_royalty_transfer(
    ctx: Context<EnforceRoyaltyTransfer>,
    sale_price: u64,
) -> Result<()> {
    let metadata = &ctx.accounts.metadata;
    let creators = &metadata.data.creators.as_ref().unwrap();
    
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
                ctx.accounts.creator.to_account_info(),
                royalty_amount,
            )?;
        }
    }
    
    Ok(())
}
```

### **Revenue Sharing** 💸
```typescript
// Multi-creator revenue sharing
const creators = [
  { address: artist.publicKey, share: 60 },
  { address: developer.publicKey, share: 25 },
  { address: marketing.publicKey, share: 15 },
];

const { nft } = await metaplex.nfts().create({
  uri,
  name: "Collaborative NFT",
  sellerFeeBasisPoints: 1000, // 10% total royalties
  creators: creators.map(creator => ({
    address: creator.address,
    verified: false, // Will be verified by each creator
    share: creator.share,
  })),
});

// Each creator verifies their participation
for (const creator of creators) {
  await metaplex.nfts().verifyCreator({
    mintAddress: nft.address,
    creator: keypairIdentity(creator.keypair),
  });
}
```

## 🔒 Advanced NFT Security

### **Transfer Restrictions** 🛡️
```typescript
// Soulbound NFTs (non-transferable)
#[derive(Accounts)]
pub struct TransferRestricted<'info> {
    #[account(
        constraint = nft_account.owner == current_owner.key(),
        constraint = !metadata.data.is_transferable @ NFTError::TransferRestricted
    )]
    pub nft_account: Account<'info, TokenAccount>,
    
    pub current_owner: Signer<'info>,
    pub metadata: Account<'info, MetadataAccount>,
}

// Time-locked transfers
pub fn time_locked_transfer(
    ctx: Context<TimeLockedTransfer>,
    unlock_timestamp: i64,
) -> Result<()> {
    require!(
        Clock::get()?.unix_timestamp >= unlock_timestamp,
        NFTError::TransferLocked
    );
    
    // Execute transfer
    transfer_nft(ctx)?;
    Ok(())
}
```

### **Anti-Bot Measures** 🤖
```typescript
// CAPTCHA verification for minting
pub fn verified_mint(
    ctx: Context<VerifiedMint>,
    captcha_solution: String,
    proof: Vec<[u8; 32]>, // Merkle proof for whitelist
) -> Result<()> {
    // Verify CAPTCHA solution
    require!(
        verify_captcha(&captcha_solution, &ctx.accounts.user.key()),
        MintError::InvalidCaptcha
    );
    
    // Verify whitelist proof
    require!(
        verify_merkle_proof(
            &proof,
            &ctx.accounts.whitelist.merkle_root,
            &ctx.accounts.user.key().to_bytes()
        ),
        MintError::NotWhitelisted
    );
    
    // Enforce rate limiting
    let last_mint = ctx.accounts.user_state.last_mint_timestamp;
    require!(
        Clock::get()?.unix_timestamp - last_mint >= MIN_MINT_INTERVAL,
        MintError::TooFrequentMinting
    );
    
    // Proceed with mint
    mint_nft(ctx)?;
    ctx.accounts.user_state.last_mint_timestamp = Clock::get()?.unix_timestamp;
    
    Ok(())
}
```

## 📊 Analytics and Tracking

### **On-Chain Analytics** 📈
```typescript
// Track NFT metrics
#[account]
pub struct NFTMetrics {
    pub mint: Pubkey,
    pub total_transfers: u64,
    pub total_volume: u64, // In lamports
    pub last_sale_price: u64,
    pub holder_count: u32,
    pub created_at: i64,
    pub last_updated: i64,
}

pub fn track_transfer(
    ctx: Context<TrackTransfer>,
    sale_price: Option<u64>,
) -> Result<()> {
    let metrics = &mut ctx.accounts.metrics;
    
    metrics.total_transfers += 1;
    
    if let Some(price) = sale_price {
        metrics.total_volume += price;
        metrics.last_sale_price = price;
    }
    
    metrics.last_updated = Clock::get()?.unix_timestamp;
    
    emit!(NFTTransferEvent {
        mint: metrics.mint,
        from: ctx.accounts.from.key(),
        to: ctx.accounts.to.key(),
        price: sale_price,
        timestamp: metrics.last_updated,
    });
    
    Ok(())
}
```

## 🚀 Real-World Applications

This module demonstrates:

1. **PFP Collection** - 10K generative avatar project
2. **Gaming Items** - Evolving weapons and characters
3. **Art Marketplace** - High-end digital art platform
4. **Music NFTs** - Streaming rights and royalties
5. **Event Tickets** - Verifiable access tokens
6. **Real Estate** - Fractional property ownership
7. **Certificates** - Educational and professional credentials

---

**🎨 Ready to dominate the Solana NFT ecosystem?**

Run `node main.js` to explore cutting-edge NFT development!
