require('dotenv').config();
const { ethers } = require('ethers');

class NFTDevelopment {
    constructor() {
        console.log('🎨 NFT Development Module Initialized');
        console.log('🖼️ Non-Fungible Token Creation and Management');
        
        // Initialize NFT concepts and implementations
        this.nftContracts = this.initializeNFTContracts();
        this.metadataExamples = this.initializeMetadataExamples();
    }

    initializeNFTContracts() {
        return {
            basicNFT: {
                name: "Basic ERC-721 NFT Contract",
                code: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BasicNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    uint256 public maxSupply;
    uint256 public mintPrice;
    bool public saleActive;
    
    mapping(address => uint256) public mintedPerAddress;
    uint256 public maxMintsPerAddress = 5;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event SaleStateChanged(bool active);
    event PriceChanged(uint256 newPrice);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721(name, symbol) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        saleActive = false;
    }
    
    function mint(address to, string memory tokenURI) public payable {
        require(saleActive, "Sale is not active");
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(mintedPerAddress[to] < maxMintsPerAddress, "Max mints per address reached");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        mintedPerAddress[to]++;
        
        emit NFTMinted(to, newTokenId, tokenURI);
    }
    
    function mintOwner(address to, string memory tokenURI) public onlyOwner {
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        emit NFTMinted(to, newTokenId, tokenURI);
    }
    
    function batchMint(address[] memory recipients, string[] memory tokenURIs) public onlyOwner {
        require(recipients.length == tokenURIs.length, "Arrays length mismatch");
        require(_tokenIds.current() + recipients.length <= maxSupply, "Would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            
            _safeMint(recipients[i], newTokenId);
            _setTokenURI(newTokenId, tokenURIs[i]);
            
            emit NFTMinted(recipients[i], newTokenId, tokenURIs[i]);
        }
    }
    
    function setSaleState(bool _active) public onlyOwner {
        saleActive = _active;
        emit SaleStateChanged(_active);
    }
    
    function setMintPrice(uint256 _price) public onlyOwner {
        mintPrice = _price;
        emit PriceChanged(_price);
    }
    
    function setMaxMintsPerAddress(uint256 _max) public onlyOwner {
        maxMintsPerAddress = _max;
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }
    
    function walletOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`,
                explanation: "Complete ERC-721 NFT with minting, batch operations, and marketplace features."
            },
            
            generativeNFT: {
                name: "Generative NFT Collection",
                code: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GenerativeNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    struct Traits {
        uint8 background;
        uint8 body;
        uint8 head;
        uint8 eyes;
        uint8 accessory;
        uint8 rarity;
    }
    
    mapping(uint256 => Traits) public tokenTraits;
    mapping(bytes32 => bool) public existingCombinations;
    
    string public baseURI;
    uint256 public maxSupply = 10000;
    uint256 public mintPrice = 0.05 ether;
    bool public saleActive = false;
    bool public revealed = false;
    string public placeholderURI;
    
    // Trait probabilities (out of 100)
    uint8[] public backgroundRarities = [30, 25, 20, 15, 7, 3]; // Common to Legendary
    uint8[] public bodyRarities = [35, 30, 20, 10, 4, 1];
    uint8[] public headRarities = [40, 25, 20, 10, 4, 1];
    uint8[] public eyesRarities = [35, 30, 20, 10, 4, 1];
    uint8[] public accessoryRarities = [50, 25, 15, 7, 2, 1];
    
    event TraitsGenerated(uint256 indexed tokenId, Traits traits);
    event Revealed();
    
    constructor(
        string memory name,
        string memory symbol,
        string memory _placeholderURI
    ) ERC721(name, symbol) {
        placeholderURI = _placeholderURI;
    }
    
    function mint(uint256 quantity) public payable {
        require(saleActive, "Sale not active");
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        require(_tokenIds.current() + quantity <= maxSupply, "Exceeds max supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            
            _safeMint(msg.sender, newTokenId);
            
            // Generate unique traits
            Traits memory traits = generateTraits(newTokenId);
            tokenTraits[newTokenId] = traits;
            
            emit TraitsGenerated(newTokenId, traits);
        }
    }
    
    function generateTraits(uint256 tokenId) internal returns (Traits memory) {
        uint256 maxAttempts = 50;
        
        for (uint256 attempt = 0; attempt < maxAttempts; attempt++) {
            uint256 randomSeed = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.difficulty,
                tokenId,
                attempt,
                msg.sender
            )));
            
            Traits memory traits = Traits({
                background: selectTrait(randomSeed, backgroundRarities, 0),
                body: selectTrait(randomSeed, bodyRarities, 1),
                head: selectTrait(randomSeed, headRarities, 2),
                eyes: selectTrait(randomSeed, eyesRarities, 3),
                accessory: selectTrait(randomSeed, accessoryRarities, 4),
                rarity: 0
            });
            
            // Calculate overall rarity
            traits.rarity = calculateRarity(traits);
            
            // Check if combination already exists
            bytes32 combination = keccak256(abi.encodePacked(
                traits.background,
                traits.body,
                traits.head,
                traits.eyes,
                traits.accessory
            ));
            
            if (!existingCombinations[combination]) {
                existingCombinations[combination] = true;
                return traits;
            }
        }
        
        // Fallback if no unique combination found
        revert("Unable to generate unique traits");
    }
    
    function selectTrait(
        uint256 randomSeed,
        uint8[] memory rarities,
        uint8 offset
    ) internal pure returns (uint8) {
        uint256 random = (randomSeed >> (offset * 8)) % 100;
        uint256 cumulativeRarity = 0;
        
        for (uint8 i = 0; i < rarities.length; i++) {
            cumulativeRarity += rarities[i];
            if (random < cumulativeRarity) {
                return i;
            }
        }
        
        return uint8(rarities.length - 1);
    }
    
    function calculateRarity(Traits memory traits) internal pure returns (uint8) {
        uint256 totalRarity = uint256(traits.background) +
                             uint256(traits.body) +
                             uint256(traits.head) +
                             uint256(traits.eyes) +
                             uint256(traits.accessory);
        
        // Higher rarity index means rarer (5 = legendary)
        if (totalRarity >= 20) return 5; // Legendary
        if (totalRarity >= 15) return 4; // Epic
        if (totalRarity >= 10) return 3; // Rare
        if (totalRarity >= 5) return 2;  // Uncommon
        return 1; // Common
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        if (!revealed) {
            return placeholderURI;
        }
        
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }
    
    function getTokenTraits(uint256 tokenId) public view returns (Traits memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenTraits[tokenId];
    }
    
    function reveal() public onlyOwner {
        revealed = true;
        emit Revealed();
    }
    
    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }
    
    function setSaleState(bool _active) public onlyOwner {
        saleActive = _active;
    }
    
    function setMintPrice(uint256 _price) public onlyOwner {
        mintPrice = _price;
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
    
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }
}`,
                explanation: "Generative NFT with trait-based rarity system and unique combination guarantee."
            },
            
            nftMarketplace: {
                name: "NFT Marketplace with Royalties",
                code: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract NFTMarketplace is ReentrancyGuard, Ownable, IERC721Receiver {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
        uint256 listingTime;
    }
    
    struct Offer {
        address offerer;
        uint256 amount;
        uint256 expiration;
        bool active;
    }
    
    mapping(bytes32 => Listing) public listings;
    mapping(bytes32 => mapping(address => Offer)) public offers;
    mapping(address => uint256) public pendingWithdrawals;
    
    uint256 public marketplaceFee = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event ItemListed(
        bytes32 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    
    event ItemSold(
        bytes32 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    
    event OfferMade(
        bytes32 indexed listingId,
        address indexed offerer,
        uint256 amount,
        uint256 expiration
    );
    
    event OfferAccepted(
        bytes32 indexed listingId,
        address indexed offerer,
        uint256 amount
    );
    
    event ListingCancelled(bytes32 indexed listingId);
    
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || 
                nft.getApproved(tokenId) == address(this), "Not approved");
        
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));
        
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true,
            listingTime: block.timestamp
        });
        
        // Transfer NFT to marketplace
        nft.safeTransferFrom(msg.sender, address(this), tokenId);
        
        emit ItemListed(listingId, msg.sender, nftContract, tokenId, price);
    }
    
    function buyItem(bytes32 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        listing.active = false;
        
        IERC721 nft = IERC721(listing.nftContract);
        
        // Calculate fees and royalties
        uint256 totalPayment = listing.price;
        uint256 marketplaceFeeAmount = (totalPayment * marketplaceFee) / FEE_DENOMINATOR;
        uint256 royaltyAmount = 0;
        address royaltyRecipient = address(0);
        
        // Check for EIP-2981 royalties
        if (IERC165(listing.nftContract).supportsInterface(type(IERC2981).interfaceId)) {
            (royaltyRecipient, royaltyAmount) = IERC2981(listing.nftContract).royaltyInfo(
                listing.tokenId,
                totalPayment
            );
        }
        
        uint256 sellerProceeds = totalPayment - marketplaceFeeAmount - royaltyAmount;
        
        // Transfer NFT to buyer
        nft.safeTransferFrom(address(this), msg.sender, listing.tokenId);
        
        // Distribute payments
        pendingWithdrawals[listing.seller] += sellerProceeds;
        pendingWithdrawals[owner()] += marketplaceFeeAmount;
        
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            pendingWithdrawals[royaltyRecipient] += royaltyAmount;
        }
        
        // Refund excess payment
        if (msg.value > listing.price) {
            pendingWithdrawals[msg.sender] += msg.value - listing.price;
        }
        
        emit ItemSold(listingId, msg.sender, listing.seller, listing.price);
    }
    
    function makeOffer(bytes32 listingId, uint256 expiration) external payable nonReentrant {
        require(msg.value > 0, "Offer must be greater than 0");
        require(expiration > block.timestamp, "Expiration must be in the future");
        require(listings[listingId].active, "Listing not active");
        
        Offer storage existingOffer = offers[listingId][msg.sender];
        if (existingOffer.active) {
            // Refund previous offer
            pendingWithdrawals[msg.sender] += existingOffer.amount;
        }
        
        offers[listingId][msg.sender] = Offer({
            offerer: msg.sender,
            amount: msg.value,
            expiration: expiration,
            active: true
        });
        
        emit OfferMade(listingId, msg.sender, msg.value, expiration);
    }
    
    function acceptOffer(bytes32 listingId, address offerer) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        
        Offer storage offer = offers[listingId][offerer];
        require(offer.active, "Offer not active");
        require(offer.expiration > block.timestamp, "Offer expired");
        
        listing.active = false;
        offer.active = false;
        
        IERC721 nft = IERC721(listing.nftContract);
        
        // Calculate fees (similar to buyItem)
        uint256 totalPayment = offer.amount;
        uint256 marketplaceFeeAmount = (totalPayment * marketplaceFee) / FEE_DENOMINATOR;
        uint256 royaltyAmount = 0;
        address royaltyRecipient = address(0);
        
        if (IERC165(listing.nftContract).supportsInterface(type(IERC2981).interfaceId)) {
            (royaltyRecipient, royaltyAmount) = IERC2981(listing.nftContract).royaltyInfo(
                listing.tokenId,
                totalPayment
            );
        }
        
        uint256 sellerProceeds = totalPayment - marketplaceFeeAmount - royaltyAmount;
        
        // Transfer NFT to offerer
        nft.safeTransferFrom(address(this), offerer, listing.tokenId);
        
        // Distribute payments
        pendingWithdrawals[listing.seller] += sellerProceeds;
        pendingWithdrawals[owner()] += marketplaceFeeAmount;
        
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            pendingWithdrawals[royaltyRecipient] += royaltyAmount;
        }
        
        emit OfferAccepted(listingId, offerer, offer.amount);
    }
    
    function cancelListing(bytes32 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");
        
        listing.active = false;
        
        // Return NFT to seller
        IERC721(listing.nftContract).safeTransferFrom(
            address(this),
            listing.seller,
            listing.tokenId
        );
        
        emit ListingCancelled(listingId);
    }
    
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
    
    function setMarketplaceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = _fee;
    }
    
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}`,
                explanation: "Complete NFT marketplace with listings, offers, royalties, and fee distribution."
            }
        };
    }

    initializeMetadataExamples() {
        return {
            basicMetadata: {
                name: "Basic NFT Metadata",
                schema: {
                    name: "Awesome NFT #1",
                    description: "This is an awesome NFT from our collection",
                    image: "ipfs://QmHash.../image.png",
                    external_url: "https://example.com/nft/1",
                    attributes: [
                        {
                            trait_type: "Background",
                            value: "Blue"
                        },
                        {
                            trait_type: "Rarity",
                            value: "Rare"
                        },
                        {
                            trait_type: "Power Level",
                            value: 85,
                            max_value: 100
                        }
                    ]
                }
            },
            
            gamingMetadata: {
                name: "Gaming NFT Metadata",
                schema: {
                    name: "Legendary Sword",
                    description: "A powerful legendary sword with fire enchantment",
                    image: "ipfs://QmHash.../sword.png",
                    animation_url: "ipfs://QmHash.../sword_animation.mp4",
                    attributes: [
                        {
                            trait_type: "Weapon Type",
                            value: "Sword"
                        },
                        {
                            trait_type: "Rarity",
                            value: "Legendary"
                        },
                        {
                            trait_type: "Attack Power",
                            value: 95,
                            max_value: 100
                        },
                        {
                            trait_type: "Enchantment",
                            value: "Fire"
                        },
                        {
                            trait_type: "Durability",
                            value: 100,
                            max_value: 100
                        }
                    ],
                    properties: {
                        level: 10,
                        experience: 0,
                        upgradeable: true
                    }
                }
            }
        };
    }

    // Explain NFT standards
    explainNFTStandards() {
        console.log('\n📜 NFT Standards and Specifications');
        console.log('===================================');
        
        const standards = {
            'ERC-721': {
                description: 'Non-Fungible Token Standard - each token is unique',
                keyFunctions: ['ownerOf()', 'transferFrom()', 'approve()', 'setApprovalForAll()'],
                useCases: ['Digital art', 'Collectibles', 'Domain names', 'Identity tokens']
            },
            'ERC-1155': {
                description: 'Multi-Token Standard - supports both fungible and non-fungible tokens',
                keyFunctions: ['balanceOf()', 'balanceOfBatch()', 'safeTransferFrom()', 'safeBatchTransferFrom()'],
                useCases: ['Gaming items', 'Multi-edition art', 'Event tickets', 'Certificates']
            },
            'ERC-2981': {
                description: 'NFT Royalty Standard - enables royalty payments to creators',
                keyFunctions: ['royaltyInfo()', 'supportsInterface()'],
                useCases: ['Artist royalties', 'Creator monetization', 'Platform fees']
            },
            'ERC-4907': {
                description: 'Rental NFT Standard - enables NFT rentals with time-limited usage',
                keyFunctions: ['setUser()', 'userOf()', 'userExpires()'],
                useCases: ['NFT rentals', 'Gaming subscriptions', 'Temporary access rights']
            }
        };
        
        Object.entries(standards).forEach(([standard, details]) => {
            console.log(`\n🔸 ${standard}:`);
            console.log(`   📝 ${details.description}`);
            console.log(`   🔧 Key Functions: ${details.keyFunctions.join(', ')}`);
            console.log(`   💼 Use Cases: ${details.useCases.join(', ')}`);
        });
    }

    // Display NFT contracts
    displayNFTContracts() {
        console.log('\n📋 NFT Contract Implementations');
        console.log('===============================');
        
        Object.entries(this.nftContracts).forEach(([key, contract]) => {
            console.log(`\n🔹 ${contract.name}`);
            console.log(`   ${contract.explanation}`);
            console.log(`   Lines of code: ${contract.code.split('\n').length}`);
        });
    }

    // Explain metadata standards
    explainMetadataStandards() {
        console.log('\n📊 NFT Metadata Standards');
        console.log('=========================');
        
        const metadataConcepts = [
            {
                aspect: 'Required Fields',
                fields: ['name', 'description', 'image'],
                description: 'Essential fields that should be present in all NFT metadata'
            },
            {
                aspect: 'Optional Fields',
                fields: ['external_url', 'animation_url', 'youtube_url', 'background_color'],
                description: 'Additional fields that enhance the NFT experience'
            },
            {
                aspect: 'Attributes Array',
                fields: ['trait_type', 'value', 'max_value', 'display_type'],
                description: 'Structured traits that marketplaces can filter and display'
            },
            {
                aspect: 'Storage Options',
                fields: ['IPFS', 'Arweave', 'Centralized servers'],
                description: 'Different approaches to storing NFT metadata and assets'
            }
        ];
        
        metadataConcepts.forEach((concept, index) => {
            console.log(`\n${index + 1}. ${concept.aspect}:`);
            console.log(`   📝 ${concept.description}`);
            console.log(`   🔧 Fields: ${concept.fields.join(', ')}`);
        });
        
        console.log('\n📄 Example Metadata Schemas:');
        Object.entries(this.metadataExamples).forEach(([key, example]) => {
            console.log(`\n🔹 ${example.name}:`);
            console.log(JSON.stringify(example.schema, null, 2));
        });
    }

    // Explain IPFS integration
    explainIPFSIntegration() {
        console.log('\n🌐 IPFS Integration for NFTs');
        console.log('============================');
        
        const ipfsConcepts = [
            {
                concept: 'Content Addressing',
                description: 'Files identified by their content hash, ensuring immutability',
                example: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/image.png'
            },
            {
                concept: 'Pinning Services',
                description: 'Services that keep your IPFS content available',
                example: 'Pinata, NFT.Storage, Fleek, Infura IPFS'
            },
            {
                concept: 'Metadata Storage',
                description: 'Store metadata JSON files on IPFS for true decentralization',
                example: 'Upload metadata JSON, get IPFS hash, use in tokenURI'
            },
            {
                concept: 'Image Storage',
                description: 'Store NFT images and animations on IPFS',
                example: 'Upload assets, reference IPFS URLs in metadata'
            }
        ];
        
        ipfsConcepts.forEach((item, index) => {
            console.log(`\n${index + 1}. ${item.concept}:`);
            console.log(`   📝 ${item.description}`);
            console.log(`   💡 Example: ${item.example}`);
        });
        
        console.log('\n🔧 IPFS Upload Process:');
        const uploadSteps = [
            'Install IPFS client or use pinning service',
            'Upload image/animation files to IPFS',
            'Create metadata JSON with IPFS URLs',
            'Upload metadata JSON to IPFS',
            'Use metadata IPFS hash in smart contract',
            'Ensure content is pinned for availability'
        ];
        
        uploadSteps.forEach((step, index) => {
            console.log(`   ${index + 1}. ${step}`);
        });
    }

    // Explain NFT marketplaces
    explainNFTMarketplaces() {
        console.log('\n🏪 NFT Marketplace Development');
        console.log('==============================');
        
        const marketplaceFeatures = {
            'Core Functionality': [
                'List NFTs for sale with fixed price',
                'Make and accept offers on NFTs',
                'Auction mechanisms (English, Dutch)',
                'Bundle sales (multiple NFTs together)',
                'Search and filter capabilities'
            ],
            'Fee Structure': [
                'Marketplace fees (typically 2.5%)',
                'Creator royalties (0-10%)',
                'Gas fee optimization',
                'Payment processing',
                'Revenue sharing models'
            ],
            'Advanced Features': [
                'Lazy minting (mint on first sale)',
                'Multi-currency support',
                'Cross-chain compatibility',
                'Social features (profiles, following)',
                'Analytics and reporting'
            ]
        };
        
        Object.entries(marketplaceFeatures).forEach(([category, features]) => {
            console.log(`\n🔸 ${category}:`);
            features.forEach(feature => console.log(`   • ${feature}`));
        });
    }

    // Explain generative NFTs
    explainGenerativeNFTs() {
        console.log('\n🎨 Generative NFT Development');
        console.log('=============================');
        
        const generativeProcess = [
            {
                phase: 'Art Creation',
                steps: [
                    'Design base layers (background, body, accessories)',
                    'Create variations for each layer',
                    'Define rarity distributions',
                    'Ensure visual compatibility between layers'
                ]
            },
            {
                phase: 'Metadata Generation',
                steps: [
                    'Define trait categories and values',
                    'Implement rarity weighting system',
                    'Generate unique combinations',
                    'Create metadata JSON files'
                ]
            },
            {
                phase: 'Smart Contract',
                steps: [
                    'Implement trait generation logic',
                    'Ensure unique combinations',
                    'Handle reveal mechanics',
                    'Optimize for gas efficiency'
                ]
            },
            {
                phase: 'Deployment',
                steps: [
                    'Upload art assets to IPFS',
                    'Deploy smart contract',
                    'Configure minting parameters',
                    'Test minting process thoroughly'
                ]
            }
        ];
        
        generativeProcess.forEach((phase, index) => {
            console.log(`\n${index + 1}. ${phase.phase}:`);
            phase.steps.forEach(step => console.log(`   • ${step}`));
        });
    }

    // NFT development checklist
    generateNFTChecklist() {
        console.log('\n✅ NFT Development Checklist');
        console.log('============================');
        
        const checklist = {
            'Planning': [
                '□ Define NFT collection concept and utility',
                '□ Choose appropriate NFT standard (ERC-721/1155)',
                '□ Plan metadata structure and attributes',
                '□ Design rarity distribution and tokenomics'
            ],
            'Art and Assets': [
                '□ Create or commission artwork',
                '□ Optimize file sizes for web display',
                '□ Generate variations for generative collections',
                '□ Create placeholder/preview images'
            ],
            'Smart Contract': [
                '□ Implement minting logic and access controls',
                '□ Add marketplace compatibility features',
                '□ Implement royalty standards (ERC-2981)',
                '□ Test with comprehensive unit tests'
            ],
            'Metadata and Storage': [
                '□ Create metadata JSON files',
                '□ Upload assets to IPFS or Arweave',
                '□ Verify metadata accessibility',
                '□ Implement reveal mechanics if needed'
            ],
            'Deployment': [
                '□ Deploy to testnet and verify functionality',
                '□ Conduct security audit',
                '□ Verify contract on block explorer',
                '□ Deploy to mainnet with proper configuration'
            ],
            'Launch and Marketing': [
                '□ Create project website and documentation',
                '□ List on NFT marketplaces',
                '□ Engage with community and collectors',
                '□ Monitor and respond to feedback'
            ]
        };
        
        Object.entries(checklist).forEach(([phase, items]) => {
            console.log(`\n🔸 ${phase}:`);
            items.forEach(item => console.log(`   ${item}`));
        });
    }

    // Educational summary
    printEducationalSummary() {
        console.log('\n🎓 NFT Development Mastery Summary');
        console.log('=================================');
        console.log('You have mastered:');
        console.log('• NFT standards (ERC-721, ERC-1155, ERC-2981)');
        console.log('• Smart contract development for NFTs');
        console.log('• Metadata standards and IPFS integration');
        console.log('• Generative NFT creation and trait systems');
        console.log('• NFT marketplace development and features');
        console.log('• Royalty systems and fee distribution');
        console.log('• Best practices for NFT project launches');
        console.log('• Storage solutions and decentralization');
        console.log('\n🚀 Ready for Module 6: Security and Auditing!');
    }
}

// Main execution function
async function main() {
    console.log('🚀 Ethereum Mastery - Module 5: NFT Development');
    console.log('===============================================\n');
    
    const nft = new NFTDevelopment();
    
    try {
        // NFT standards explanation
        nft.explainNFTStandards();
        
        // Contract implementations
        nft.displayNFTContracts();
        
        // Metadata standards
        nft.explainMetadataStandards();
        
        // IPFS integration
        nft.explainIPFSIntegration();
        
        // Marketplace development
        nft.explainNFTMarketplaces();
        
        // Generative NFTs
        nft.explainGenerativeNFTs();
        
        // Development checklist
        nft.generateNFTChecklist();
        
        // Educational summary
        nft.printEducationalSummary();
        
    } catch (error) {
        console.error('❌ Error in main execution:', error.message);
    }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error.message);
});

// Run the main function
if (require.main === module) {
    main();
}

module.exports = NFTDevelopment;
