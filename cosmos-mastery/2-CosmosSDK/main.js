// Cosmos SDK Development - Module 2
// Master blockchain development with the Cosmos SDK

console.log("🌌 Cosmos SDK Development - Module 2");
console.log("=====================================");

// =============================================
// 1. COSMOS SDK ARCHITECTURE OVERVIEW
// =============================================

class CosmosSDKArchitecture {
    constructor() {
        this.components = {
            baseapp: "ABCI implementation and transaction routing",
            modules: "Self-contained functionality units",
            stores: "State persistence layer",
            codecs: "Serialization/deserialization",
            interfaces: "CLI and REST APIs"
        };
    }

    explainArchitecture() {
        console.log("\n🏗️  COSMOS SDK ARCHITECTURE");
        console.log("============================");
        
        console.log("The Cosmos SDK follows a modular architecture:");
        Object.entries(this.components).forEach(([component, description]) => {
            console.log(`• ${component.toUpperCase()}: ${description}`);
        });

        console.log("\nModule Interaction Flow:");
        console.log("User → CLI/REST → BaseApp → Module → Keeper → Store");
    }

    demonstrateModuleSystem() {
        console.log("\n📦 MODULE SYSTEM");
        console.log("================");

        const coreModules = {
            "x/auth": "Account authentication and management",
            "x/bank": "Token transfers and balances",
            "x/staking": "Proof-of-stake consensus participation",
            "x/gov": "On-chain governance and proposals",
            "x/distribution": "Fee and reward distribution",
            "x/slashing": "Validator penalty mechanisms"
        };

        console.log("Core SDK Modules:");
        Object.entries(coreModules).forEach(([module, purpose]) => {
            console.log(`• ${module}: ${purpose}`);
        });
    }
}

// =============================================
// 2. BUILDING CUSTOM MODULES
// =============================================

class CustomTokenModule {
    constructor() {
        this.moduleName = "token";
        this.tokens = new Map();
        this.balances = new Map();
    }

    // Module Definition Structure
    getModuleStructure() {
        console.log("\n🛠️  CUSTOM MODULE STRUCTURE");
        console.log("============================");

        const structure = {
            "types/": {
                "msg.go": "Message type definitions",
                "types.go": "Data structures and interfaces",
                "keys.go": "Store keys and prefixes",
                "codec.go": "Amino/protobuf codecs"
            },
            "keeper/": {
                "keeper.go": "State access and business logic",
                "msg_server.go": "Message handler implementation",
                "query.go": "Query handler implementation"
            },
            "client/": {
                "cli/": "Command-line interface",
                "rest/": "REST API endpoints"
            },
            "": {
                "module.go": "Module definition and lifecycle",
                "genesis.go": "Genesis state initialization",
                "handler.go": "Message routing (legacy)"
            }
        };

        this.printStructure(structure);
    }

    printStructure(structure, indent = 0) {
        Object.entries(structure).forEach(([path, content]) => {
            const spacing = "  ".repeat(indent);
            if (typeof content === "string") {
                console.log(`${spacing}${path} - ${content}`);
            } else {
                console.log(`${spacing}${path}`);
                this.printStructure(content, indent + 1);
            }
        });
    }

    // Message Types Example
    demonstrateMessages() {
        console.log("\n📨 MESSAGE TYPES");
        console.log("================");

        const messages = {
            "MsgCreateToken": {
                creator: "string",
                name: "string", 
                symbol: "string",
                totalSupply: "uint64",
                decimals: "uint32"
            },
            "MsgMintToken": {
                minter: "string",
                denom: "string",
                amount: "uint64",
                recipient: "string"
            },
            "MsgBurnToken": {
                burner: "string",
                denom: "string", 
                amount: "uint64"
            }
        };

        Object.entries(messages).forEach(([msgType, fields]) => {
            console.log(`\n${msgType}:`);
            Object.entries(fields).forEach(([field, type]) => {
                console.log(`  ${field}: ${type}`);
            });
        });
    }

    // Keeper Implementation Example
    demonstrateKeeper() {
        console.log("\n🔐 KEEPER IMPLEMENTATION");
        console.log("========================");

        console.log("Keepers manage module state and business logic:");
        console.log(`
// Keeper struct
type Keeper struct {
    cdc      codec.BinaryCodec
    storeKey sdk.StoreKey
    memKey   sdk.StoreKey
    
    bankKeeper    bankkeeper.Keeper
    accountKeeper authkeeper.AccountKeeper
}

// Create token method
func (k Keeper) CreateToken(ctx sdk.Context, msg *types.MsgCreateToken) error {
    store := ctx.KVStore(k.storeKey)
    
    token := types.Token{
        Creator:     msg.Creator,
        Name:        msg.Name,
        Symbol:      msg.Symbol,
        TotalSupply: msg.TotalSupply,
        Decimals:    msg.Decimals,
    }
    
    tokenBytes := k.cdc.MustMarshal(&token)
    store.Set(types.TokenKey(msg.Symbol), tokenBytes)
    
    return nil
}
        `);
    }

    // Simulate token operations
    createToken(symbol, name, totalSupply) {
        const token = {
            symbol,
            name,
            totalSupply,
            decimals: 6,
            creator: "cosmos1...",
            createdAt: new Date().toISOString()
        };

        this.tokens.set(symbol, token);
        this.balances.set(`${symbol}_${token.creator}`, totalSupply);

        console.log(`✅ Created token: ${name} (${symbol})`);
        console.log(`   Total Supply: ${totalSupply.toLocaleString()}`);
        return token;
    }

    mintToken(symbol, amount, recipient) {
        if (!this.tokens.has(symbol)) {
            throw new Error(`Token ${symbol} does not exist`);
        }

        const balanceKey = `${symbol}_${recipient}`;
        const currentBalance = this.balances.get(balanceKey) || 0;
        this.balances.set(balanceKey, currentBalance + amount);

        console.log(`✅ Minted ${amount.toLocaleString()} ${symbol} to ${recipient}`);
        console.log(`   New balance: ${(currentBalance + amount).toLocaleString()}`);
    }

    getTokenInfo(symbol) {
        return this.tokens.get(symbol);
    }

    getBalance(symbol, address) {
        return this.balances.get(`${symbol}_${address}`) || 0;
    }
}

// =============================================
// 3. STATE MANAGEMENT
// =============================================

class StateManagement {
    constructor() {
        this.storeTypes = {
            "KVStore": "Primary key-value storage for persistent state",
            "TransientStore": "Temporary storage cleared at block end",
            "MemoryStore": "In-memory cache for computed values"
        };
    }

    explainStores() {
        console.log("\n🗄️  STATE MANAGEMENT");
        console.log("===================");

        console.log("Cosmos SDK Store Types:");
        Object.entries(this.storeTypes).forEach(([store, description]) => {
            console.log(`• ${store}: ${description}`);
        });

        console.log("\nStore Access Pattern:");
        console.log(`
func (k Keeper) SetToken(ctx sdk.Context, token types.Token) {
    store := ctx.KVStore(k.storeKey)
    key := types.TokenKey(token.Symbol)
    value := k.cdc.MustMarshal(&token)
    store.Set(key, value)
}

func (k Keeper) GetToken(ctx sdk.Context, symbol string) (types.Token, bool) {
    store := ctx.KVStore(k.storeKey)
    key := types.TokenKey(symbol)
    
    if !store.Has(key) {
        return types.Token{}, false
    }
    
    var token types.Token
    k.cdc.MustUnmarshal(store.Get(key), &token)
    return token, true
}
        `);
    }

    demonstrateKeyGeneration() {
        console.log("\n🔑 KEY GENERATION PATTERNS");
        console.log("===========================");

        const keyPatterns = {
            "TokenKey": (symbol) => `token/${symbol}`,
            "BalanceKey": (address, denom) => `balance/${address}/${denom}`,
            "SupplyKey": (denom) => `supply/${denom}`,
            "MetadataKey": (denom) => `metadata/${denom}`
        };

        console.log("Common key generation patterns:");
        Object.entries(keyPatterns).forEach(([pattern, generator]) => {
            const example = pattern === "TokenKey" ? generator("ATOM") :
                           pattern === "BalanceKey" ? generator("cosmos1abc...", "ATOM") :
                           generator("ATOM");
            console.log(`• ${pattern}: ${example}`);
        });
    }
}

// =============================================
// 4. CLI AND REST INTERFACES
// =============================================

class UserInterfaces {
    constructor() {
        this.commands = new Map();
        this.queries = new Map();
    }

    demonstrateCLI() {
        console.log("\n💻 CLI INTERFACE");
        console.log("================");

        const cliCommands = {
            "tx token create-token": {
                description: "Create a new token",
                flags: "--name --symbol --supply --decimals",
                example: "appd tx token create-token --name 'My Token' --symbol MTK --supply 1000000"
            },
            "tx token mint": {
                description: "Mint tokens to an address",
                flags: "--denom --amount --to",
                example: "appd tx token mint --denom MTK --amount 1000 --to cosmos1..."
            },
            "query token show": {
                description: "Query token information",
                flags: "--symbol",
                example: "appd query token show --symbol MTK"
            },
            "query token balance": {
                description: "Query token balance",
                flags: "--address --denom",
                example: "appd query token balance --address cosmos1... --denom MTK"
            }
        };

        Object.entries(cliCommands).forEach(([command, details]) => {
            console.log(`\n${command}`);
            console.log(`  Description: ${details.description}`);
            console.log(`  Flags: ${details.flags}`);
            console.log(`  Example: ${details.example}`);
        });
    }

    demonstrateREST() {
        console.log("\n🌐 REST API");
        console.log("===========");

        const restEndpoints = {
            "GET /custom/token/tokens": "List all tokens",
            "GET /custom/token/tokens/{symbol}": "Get token by symbol",
            "GET /custom/token/balances/{address}": "Get all balances for address",
            "GET /custom/token/balances/{address}/{denom}": "Get specific balance",
            "POST /custom/token/create": "Create new token",
            "POST /custom/token/mint": "Mint tokens"
        };

        Object.entries(restEndpoints).forEach(([endpoint, description]) => {
            console.log(`${endpoint} - ${description}`);
        });

        console.log("\nExample REST Response:");
        console.log(JSON.stringify({
            token: {
                symbol: "MTK",
                name: "My Token",
                total_supply: "1000000",
                decimals: 6,
                creator: "cosmos1..."
            }
        }, null, 2));
    }
}

// =============================================
// 5. ADVANCED FEATURES
// =============================================

class AdvancedFeatures {
    constructor() {
        this.hooks = [];
        this.invariants = [];
    }

    demonstrateHooks() {
        console.log("\n🪝 HOOKS SYSTEM");
        console.log("===============");

        console.log("Hooks allow modules to react to events from other modules:");
        console.log(`
// BeforeTokenTransfer hook
func (h Hooks) BeforeTokenTransfer(
    ctx sdk.Context,
    from, to sdk.AccAddress,
    amount sdk.Coins,
) error {
    // Custom logic before transfer
    return nil
}

// AfterTokenTransfer hook  
func (h Hooks) AfterTokenTransfer(
    ctx sdk.Context,
    from, to sdk.AccAddress,
    amount sdk.Coins,
) {
    // Custom logic after transfer
}
        `);

        console.log("Common hook types:");
        const hookTypes = [
            "BeforeValidatorCreated",
            "AfterValidatorCreated", 
            "BeforeDelegationCreated",
            "AfterDelegationModified",
            "BeforeTokenTransfer",
            "AfterTokenTransfer"
        ];

        hookTypes.forEach(hook => console.log(`• ${hook}`));
    }

    demonstrateInvariants() {
        console.log("\n⚖️  INVARIANTS");
        console.log("==============");

        console.log("Invariants ensure state consistency:");
        console.log(`
func TokenSupplyInvariant(k Keeper) sdk.Invariant {
    return func(ctx sdk.Context) (string, bool) {
        var msg string
        var broken bool
        
        k.IterateTokens(ctx, func(token types.Token) bool {
            totalBalance := k.GetTotalBalance(ctx, token.Symbol)
            
            if !totalBalance.Equal(token.TotalSupply) {
                broken = true
                msg += fmt.Sprintf(
                    "token %s: supply mismatch %s != %s\\n",
                    token.Symbol, totalBalance, token.TotalSupply,
                )
            }
            return false
        })
        
        return sdk.FormatInvariant(
            types.ModuleName, "token-supply",
            msg,
        ), broken
    }
}
        `);
    }

    demonstrateParameters() {
        console.log("\n⚙️  MODULE PARAMETERS");
        console.log("=====================");

        const parameters = {
            "MaxTokenNameLength": {
                type: "uint64",
                default: "50",
                description: "Maximum length for token names"
            },
            "MaxTokenSymbolLength": {
                type: "uint64", 
                default: "10",
                description: "Maximum length for token symbols"
            },
            "CreationFee": {
                type: "sdk.Coins",
                default: "1000000uatom",
                description: "Fee required to create new tokens"
            },
            "EnableMinting": {
                type: "bool",
                default: "true", 
                description: "Whether minting is allowed"
            }
        };

        console.log("Configurable module parameters:");
        Object.entries(parameters).forEach(([param, config]) => {
            console.log(`\n${param}:`);
            console.log(`  Type: ${config.type}`);
            console.log(`  Default: ${config.default}`);
            console.log(`  Description: ${config.description}`);
        });
    }
}

// =============================================
// 6. TESTING FRAMEWORK
// =============================================

class TestingFramework {
    constructor() {
        this.testSuite = [];
    }

    demonstrateTesting() {
        console.log("\n🧪 TESTING FRAMEWORK");
        console.log("====================");

        console.log("Test structure for Cosmos SDK modules:");
        console.log(`
func TestTokenCreation(t *testing.T) {
    app := simapp.Setup(false)
    ctx := app.BaseApp.NewContext(false, tmproto.Header{})
    
    // Create test accounts
    creator := sdk.AccAddress("creator")
    
    // Test token creation
    msg := &types.MsgCreateToken{
        Creator:     creator.String(),
        Name:        "Test Token",
        Symbol:      "TEST",
        TotalSupply: 1000000,
        Decimals:    6,
    }
    
    _, err := app.TokenKeeper.CreateToken(ctx, msg)
    require.NoError(t, err)
    
    // Verify token was created
    token, found := app.TokenKeeper.GetToken(ctx, "TEST")
    require.True(t, found)
    require.Equal(t, "Test Token", token.Name)
}
        `);

        console.log("\nTest categories:");
        const testCategories = [
            "Unit tests - Individual keeper methods",
            "Integration tests - Module interactions", 
            "Simulation tests - Random state transitions",
            "End-to-end tests - Full application scenarios"
        ];

        testCategories.forEach(category => console.log(`• ${category}`));
    }

    runBasicTests() {
        console.log("\n🔄 RUNNING BASIC TESTS");
        console.log("======================");

        const tests = [
            {
                name: "Token Creation",
                test: () => {
                    const module = new CustomTokenModule();
                    const token = module.createToken("TEST", "Test Token", 1000000);
                    return token.symbol === "TEST" && token.name === "Test Token";
                }
            },
            {
                name: "Token Minting", 
                test: () => {
                    const module = new CustomTokenModule();
                    module.createToken("TEST", "Test Token", 1000000);
                    module.mintToken("TEST", 500000, "cosmos1recipient");
                    return module.getBalance("TEST", "cosmos1recipient") === 500000;
                }
            },
            {
                name: "Token Query",
                test: () => {
                    const module = new CustomTokenModule();
                    module.createToken("TEST", "Test Token", 1000000);
                    const token = module.getTokenInfo("TEST");
                    return token && token.totalSupply === 1000000;
                }
            }
        ];

        tests.forEach(({name, test}) => {
            try {
                const result = test();
                console.log(`✅ ${name}: ${result ? 'PASSED' : 'FAILED'}`);
            } catch (error) {
                console.log(`❌ ${name}: ERROR - ${error.message}`);
            }
        });
    }
}

// =============================================
// 7. DEPLOYMENT AND INTEGRATION
// =============================================

class DeploymentGuide {
    constructor() {
        this.steps = [];
    }

    demonstrateDeployment() {
        console.log("\n🚀 DEPLOYMENT PROCESS");
        console.log("=====================");

        const deploymentSteps = [
            "1. Build the application binary",
            "2. Initialize the blockchain configuration", 
            "3. Create genesis state with initial parameters",
            "4. Start the blockchain node",
            "5. Connect to other nodes (if applicable)",
            "6. Submit governance proposals for upgrades"
        ];

        deploymentSteps.forEach(step => console.log(step));

        console.log("\nExample deployment commands:");
        console.log(`
# Build application
go build -o appd ./cmd/appd

# Initialize chain
appd init mychain --chain-id mychain-1

# Add genesis account
appd add-genesis-account cosmos1... 1000000000utoken

# Generate genesis transaction
appd gentx myvalidator 1000000utoken --chain-id mychain-1

# Collect genesis transactions
appd collect-gentxs

# Start the chain
appd start
        `);
    }

    demonstrateIntegration() {
        console.log("\n🔗 ECOSYSTEM INTEGRATION");
        console.log("=========================");

        console.log("Integration with Cosmos ecosystem:");
        const integrations = {
            "IBC": "Connect to other Cosmos chains",
            "Keplr Wallet": "Browser wallet integration",
            "CosmJS": "JavaScript client library",
            "Telescope": "TypeScript code generation",
            "Cosmos SDK Upgrades": "In-place binary upgrades",
            "Gravity Bridge": "Ethereum interoperability"
        };

        Object.entries(integrations).forEach(([tool, description]) => {
            console.log(`• ${tool}: ${description}`);
        });
    }
}

// =============================================
// MAIN EXECUTION
// =============================================

function runCosmosSDKModule() {
    console.log("Starting Cosmos SDK Development Tutorial...\n");

    // Architecture Overview
    const architecture = new CosmosSDKArchitecture();
    architecture.explainArchitecture();
    architecture.demonstrateModuleSystem();

    // Custom Module Development
    const tokenModule = new CustomTokenModule();
    tokenModule.getModuleStructure();
    tokenModule.demonstrateMessages();
    tokenModule.demonstrateKeeper();

    // State Management
    const stateManager = new StateManagement();
    stateManager.explainStores();
    stateManager.demonstrateKeyGeneration();

    // User Interfaces
    const interfaces = new UserInterfaces();
    interfaces.demonstrateCLI();
    interfaces.demonstrateREST();

    // Advanced Features
    const advanced = new AdvancedFeatures();
    advanced.demonstrateHooks();
    advanced.demonstrateInvariants();
    advanced.demonstrateParameters();

    // Testing
    const testing = new TestingFramework();
    testing.demonstrateTesting();
    testing.runBasicTests();

    // Deployment
    const deployment = new DeploymentGuide();
    deployment.demonstrateDeployment();
    deployment.demonstrateIntegration();

    console.log("\n🎓 MODULE 2 COMPLETE!");
    console.log("====================");
    console.log("You've learned:");
    console.log("✅ Cosmos SDK architecture and module system");
    console.log("✅ Custom module development");
    console.log("✅ State management with keepers and stores");
    console.log("✅ CLI and REST API creation");
    console.log("✅ Advanced features like hooks and invariants");
    console.log("✅ Testing and deployment strategies");
    console.log("\n🔜 Next: Module 3 - IBC and Interoperability");
}

// Run the module
runCosmosSDKModule();
