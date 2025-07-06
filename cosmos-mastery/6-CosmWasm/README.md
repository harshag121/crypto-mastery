# Module 6: CosmWasm Smart Contracts 🦀

## 🎯 Learning Objectives

By the end of this module, you will:
- **Master CosmWasm architecture** and WebAssembly integration
- **Build smart contracts in Rust** for the Cosmos ecosystem
- **Implement cross-chain contract calls** using IBC
- **Design contract migration** and upgrade strategies
- **Create complex DeFi protocols** with CosmWasm
- **Deploy and optimize** production smart contracts

## 📋 Prerequisites

- Completion of Modules 1-5 (Fundamentals through Governance)
- Basic Rust programming knowledge
- Understanding of WebAssembly concepts
- Experience with smart contract development
- Development environment with Rust and wasm-pack

## 🦀 CosmWasm Overview

### What is CosmWasm?

**CosmWasm** (Cosmos WebAssembly) is a smart contract platform built for the Cosmos ecosystem that leverages WebAssembly for secure, efficient contract execution.

### Key Features

1. **Multi-chain Deployment**: Same contract on multiple Cosmos chains
2. **IBC Integration**: Native cross-chain contract communication
3. **Actor Model**: Secure contract interaction patterns
4. **Gas Efficiency**: Optimized WebAssembly execution
5. **Upgrade Safety**: Built-in migration mechanisms

### Architecture Stack

```
┌─────────────────────────────────────────────┐
│            Smart Contracts (Rust)          │
├─────────────────────────────────────────────┤
│          CosmWasm Runtime (Go)             │
├─────────────────────────────────────────────┤
│            Wasmer Engine                   │
├─────────────────────────────────────────────┤
│          Cosmos SDK Modules                │
├─────────────────────────────────────────────┤
│           Tendermint Core                  │
└─────────────────────────────────────────────┘
```

## 🏗️ Contract Development

### Contract Structure

```rust
use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, 
    MessageInfo, Response, StdResult,
};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Contract initialization
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    // Handle contract execution
}

#[entry_point]
pub fn query(
    deps: Deps,
    env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    // Handle contract queries
}
```

### State Management

```rust
use cw_storage_plus::{Item, Map};

pub const CONFIG: Item<Config> = Item::new("config");
pub const BALANCES: Map<&Addr, Uint128> = Map::new("balances");
pub const ALLOWANCES: Map<(&Addr, &Addr), Uint128> = Map::new("allowances");
```

## 🔗 IBC Integration

### Cross-Chain Contracts

CosmWasm contracts can communicate across chains using IBC:

```rust
#[entry_point]
pub fn ibc_channel_open(
    deps: DepsMut,
    env: Env,
    msg: IbcChannelOpenMsg,
) -> StdResult<IbcChannelOpenResponse> {
    // Handle IBC channel opening
}

#[entry_point]
pub fn ibc_packet_receive(
    deps: DepsMut,
    env: Env,
    msg: IbcPacketReceiveMsg,
) -> StdResult<IbcReceiveResponse> {
    // Handle incoming IBC packets
}
```

### IBC Applications

- **Cross-chain DEX**: Trade assets across different chains
- **Multi-chain DAOs**: Governance spanning multiple networks
- **Interchain NFTs**: Transfer NFTs between chains
- **Cross-chain Lending**: Collateral on one chain, borrow on another

## 🔄 Contract Migration

### Migration Patterns

```rust
#[entry_point]
pub fn migrate(
    deps: DepsMut,
    env: Env,
    msg: MigrateMsg,
) -> StdResult<Response> {
    // Handle contract upgrades
    let old_version = get_contract_version(deps.storage)?;
    let new_version = CONTRACT_VERSION;
    
    migrate_state(deps.storage, &old_version, &new_version)?;
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    
    Ok(Response::default())
}
```

### Upgrade Strategies

1. **Admin-controlled**: Contract admin can upgrade
2. **Governance-controlled**: DAO votes on upgrades  
3. **Time-locked**: Delayed upgrades for security
4. **Immutable**: No upgrades allowed

## 💡 Advanced Patterns

### Factory Contracts

```rust
pub fn instantiate_child_contract(
    deps: DepsMut,
    env: Env,
    code_id: u64,
    instantiate_msg: Binary,
) -> StdResult<Response> {
    let msg = WasmMsg::Instantiate {
        admin: Some(env.contract.address.to_string()),
        code_id,
        msg: instantiate_msg,
        funds: vec![],
        label: "Child Contract".to_string(),
    };
    
    Ok(Response::new().add_message(msg))
}
```

### Proxy Patterns

```rust
pub fn execute_on_behalf(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    target: String,
    msg: Binary,
) -> StdResult<Response> {
    // Verify authorization
    ensure_authorized(&deps, &info.sender)?;
    
    let exec_msg = WasmMsg::Execute {
        contract_addr: target,
        msg,
        funds: vec![],
    };
    
    Ok(Response::new().add_message(exec_msg))
}
```

## 🛡️ Security Best Practices

### Common Vulnerabilities

1. **Reentrancy**: Multiple contract calls in single transaction
2. **Integer Overflow**: Unchecked arithmetic operations
3. **Access Control**: Improper permission management
4. **State Consistency**: Race conditions in multi-contract calls

### Security Measures

```rust
// Reentrancy protection
pub const REENTRANCY_GUARD: Item<bool> = Item::new("reentrancy_guard");

pub fn with_reentrancy_guard<F>(
    deps: DepsMut,
    f: F,
) -> StdResult<Response>
where
    F: FnOnce(DepsMut) -> StdResult<Response>,
{
    let guard = REENTRANCY_GUARD.may_load(deps.storage)?.unwrap_or(false);
    if guard {
        return Err(StdError::generic_err("Reentrancy detected"));
    }
    
    REENTRANCY_GUARD.save(deps.storage, &true)?;
    let result = f(deps);
    REENTRANCY_GUARD.save(deps.storage, &false)?;
    
    result
}
```

## 🎓 Module Outcomes

After completing this module, you'll be able to:
- ✅ Build production-ready CosmWasm smart contracts
- ✅ Implement complex business logic in Rust
- ✅ Create cross-chain applications using IBC
- ✅ Design secure contract upgrade mechanisms
- ✅ Optimize contracts for gas efficiency
- ✅ Deploy and manage contract ecosystems

## 📚 Additional Resources

- [CosmWasm Documentation](https://docs.cosmwasm.com/)
- [CosmWasm Book](https://book.cosmwasm.com/)
- [Rust Programming Language](https://doc.rust-lang.org/book/)
- [WebAssembly Concepts](https://webassembly.org/getting-started/developers-guide/)

## 🔗 Next Steps

Proceed to **Module 7: Interchain Security** to learn about shared security models and validator economics in the Cosmos ecosystem.

---

**🎯 Ready to Code Smart Contracts?** Open `main.js` and start your CosmWasm development journey!
