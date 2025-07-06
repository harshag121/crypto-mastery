require('dotenv').config();
const { ethers } = require('ethers');

class SolidityFundamentals {
    constructor() {
        // We'll use a local provider for testing
        this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
        console.log('📝 Solidity Fundamentals Module Initialized');
        console.log('📚 Learning smart contract programming concepts');
        
        // Contract examples and explanations
        this.contractExamples = this.initializeContractExamples();
    }

    initializeContractExamples() {
        return {
            basic: {
                name: "Basic Storage Contract",
                code: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BasicStorage {
    // State variables
    uint256 private storedNumber;
    address public owner;
    bool public isActive;
    
    // Events
    event NumberUpdated(uint256 oldValue, uint256 newValue);
    event ContractToggled(bool isActive);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier whenActive() {
        require(isActive, "Contract is not active");
        _;
    }
    
    // Constructor
    constructor(uint256 _initialNumber) {
        storedNumber = _initialNumber;
        owner = msg.sender;
        isActive = true;
    }
    
    // Public function to store a number
    function store(uint256 _number) public onlyOwner whenActive {
        uint256 oldValue = storedNumber;
        storedNumber = _number;
        emit NumberUpdated(oldValue, _number);
    }
    
    // Public function to retrieve the number
    function retrieve() public view returns (uint256) {
        return storedNumber;
    }
    
    // Function to toggle contract active state
    function toggleActive() public onlyOwner {
        isActive = !isActive;
        emit ContractToggled(isActive);
    }
    
    // Payable function to receive Ether
    function deposit() public payable {
        // Ether is automatically added to contract balance
    }
    
    // Function to withdraw Ether
    function withdraw(uint256 _amount) public onlyOwner {
        require(address(this).balance >= _amount, "Insufficient balance");
        payable(owner).transfer(_amount);
    }
    
    // Get contract balance
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`,
                explanation: "Demonstrates basic Solidity concepts: state variables, functions, modifiers, events, and Ether handling."
            },
            
            token: {
                name: "Simple Token Contract",
                code: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    // Token details
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    // Balances mapping
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // Constructor
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * 10**_decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    // Transfer function
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    // Approve function
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    // Transfer from function
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_from != address(0), "Invalid from address");
        require(_to != address(0), "Invalid to address");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
}`,
                explanation: "Implements basic ERC20 token functionality: transfer, approve, allowances, and events."
            },
            
            voting: {
                name: "Voting Contract",
                code: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    // Structs
    struct Proposal {
        string description;
        uint256 voteCount;
        bool executed;
        uint256 deadline;
    }
    
    struct Voter {
        bool hasVoted;
        uint256 votedProposal;
        bool isRegistered;
    }
    
    // State variables
    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    uint256 public votingDuration;
    
    // Events
    event ProposalCreated(uint256 proposalId, string description);
    event VoteCast(address voter, uint256 proposalId);
    event VoterRegistered(address voter);
    
    // Modifiers
    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Only chairperson can call this");
        _;
    }
    
    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "Voter not registered");
        _;
    }
    
    // Constructor
    constructor(uint256 _votingDurationInMinutes) {
        chairperson = msg.sender;
        votingDuration = _votingDurationInMinutes * 1 minutes;
    }
    
    // Register a voter
    function registerVoter(address _voter) public onlyChairperson {
        require(!voters[_voter].isRegistered, "Voter already registered");
        voters[_voter].isRegistered = true;
        emit VoterRegistered(_voter);
    }
    
    // Create a proposal
    function createProposal(string memory _description) public onlyChairperson {
        proposals.push(Proposal({
            description: _description,
            voteCount: 0,
            executed: false,
            deadline: block.timestamp + votingDuration
        }));
        
        emit ProposalCreated(proposals.length - 1, _description);
    }
    
    // Cast a vote
    function vote(uint256 _proposalId) public onlyRegisteredVoter {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(block.timestamp <= proposals[_proposalId].deadline, "Voting period ended");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposal = _proposalId;
        proposals[_proposalId].voteCount++;
        
        emit VoteCast(msg.sender, _proposalId);
    }
    
    // Get proposal count
    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }
    
    // Get winning proposal
    function getWinningProposal() public view returns (uint256 winningProposal) {
        uint256 winningVoteCount = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposal = i;
            }
        }
    }
}`,
                explanation: "Demonstrates structs, arrays, mappings, and complex state management in a voting system."
            },
            
            inheritance: {
                name: "Inheritance Example",
                code: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Base contract
abstract contract Ownable {
    address public owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

// Interface
interface IERC20Basic {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

// Library
library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
    
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }
}

// Inherited contract
contract ManagedToken is Ownable, IERC20Basic {
    using SafeMath for uint256;
    
    string public name;
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    
    constructor(string memory _name, uint256 _initialSupply) {
        name = _name;
        _totalSupply = _initialSupply;
        _balances[msg.sender] = _initialSupply;
    }
    
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        _balances[to] = _balances[to].add(amount);
        
        return true;
    }
    
    // Owner-only mint function
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Mint to zero address");
        
        _totalSupply = _totalSupply.add(amount);
        _balances[to] = _balances[to].add(amount);
    }
}`,
                explanation: "Shows inheritance, interfaces, libraries, and function overriding in Solidity."
            }
        };
    }

    // Explain Solidity basics
    explainSolidityBasics() {
        console.log('\n📝 Solidity Programming Language Fundamentals');
        console.log('=============================================');
        
        const concepts = {
            'Data Types': {
                'Value Types': ['bool', 'int/uint (8 to 256)', 'address', 'bytes', 'string', 'enum'],
                'Reference Types': ['arrays', 'structs', 'mappings'],
                'Data Locations': ['storage (persistent)', 'memory (temporary)', 'calldata (read-only)']
            },
            'Function Types': {
                'Visibility': ['public', 'private', 'internal', 'external'],
                'State Mutability': ['pure (no state read/write)', 'view (read-only)', 'payable (accepts Ether)'],
                'Special Functions': ['constructor', 'fallback', 'receive']
            },
            'Advanced Features': {
                'Modifiers': ['Custom access control', 'Input validation', 'Reentrancy protection'],
                'Events': ['Logging mechanism', 'Frontend notifications', 'Cheap storage alternative'],
                'Error Handling': ['require()', 'assert()', 'revert()', 'try/catch']
            }
        };
        
        Object.entries(concepts).forEach(([category, items]) => {
            console.log(`\n🔸 ${category}:`);
            Object.entries(items).forEach(([subcategory, details]) => {
                console.log(`   ${subcategory}:`);
                details.forEach(detail => console.log(`     • ${detail}`));
            });
        });
    }

    // Display contract examples with explanations
    displayContractExamples() {
        console.log('\n📋 Smart Contract Examples');
        console.log('==========================');
        
        Object.entries(this.contractExamples).forEach(([key, contract]) => {
            console.log(`\n🔹 ${contract.name}`);
            console.log(`   ${contract.explanation}`);
            console.log(`   Lines of code: ${contract.code.split('\n').length}`);
        });
    }

    // Explain specific contract in detail
    explainContract(contractKey) {
        const contract = this.contractExamples[contractKey];
        if (!contract) {
            console.log(`❌ Contract '${contractKey}' not found`);
            return;
        }
        
        console.log(`\n📖 Detailed Explanation: ${contract.name}`);
        console.log('='.repeat(50));
        console.log(contract.explanation);
        console.log('\n💻 Contract Code:');
        console.log(contract.code);
    }

    // Gas optimization tips
    explainGasOptimization() {
        console.log('\n⛽ Gas Optimization Techniques');
        console.log('=============================');
        
        const optimizations = [
            {
                technique: 'Use appropriate data types',
                description: 'uint256 is often cheaper than smaller types due to EVM word size',
                example: 'uint256 instead of uint8 for loop counters'
            },
            {
                technique: 'Pack struct variables',
                description: 'Arrange struct members to minimize storage slots',
                example: 'struct User { uint128 id; uint128 score; bool active; }'
            },
            {
                technique: 'Use events for data storage',
                description: 'Events are much cheaper than storage for historical data',
                example: 'emit DataLogged(timestamp, value) instead of storing in array'
            },
            {
                technique: 'Avoid dynamic arrays in storage',
                description: 'Use mappings instead of arrays when possible',
                example: 'mapping(uint => Item) instead of Item[] items'
            },
            {
                technique: 'Use unchecked blocks',
                description: 'Skip overflow checks when safe (Solidity 0.8+)',
                example: 'unchecked { i++; } in loops where overflow is impossible'
            },
            {
                technique: 'Minimize external calls',
                description: 'External calls are expensive, batch them when possible',
                example: 'Single multicall instead of multiple separate calls'
            }
        ];
        
        optimizations.forEach((opt, index) => {
            console.log(`\n${index + 1}. ${opt.technique}`);
            console.log(`   💡 ${opt.description}`);
            console.log(`   📝 Example: ${opt.example}`);
        });
    }

    // Security best practices
    explainSecurity() {
        console.log('\n🔒 Smart Contract Security Best Practices');
        console.log('=========================================');
        
        const securityPractices = [
            {
                practice: 'Reentrancy Protection',
                description: 'Prevent external calls from re-entering your contract',
                pattern: 'Checks-Effects-Interactions pattern, ReentrancyGuard'
            },
            {
                practice: 'Integer Overflow/Underflow',
                description: 'Use SafeMath or Solidity 0.8+ built-in checks',
                pattern: 'SafeMath library or native overflow protection'
            },
            {
                practice: 'Access Control',
                description: 'Implement proper permission systems',
                pattern: 'OpenZeppelin AccessControl, onlyOwner modifiers'
            },
            {
                practice: 'Input Validation',
                description: 'Always validate function parameters',
                pattern: 'require() statements, address != 0 checks'
            },
            {
                practice: 'External Call Safety',
                description: 'Be cautious with external contract calls',
                pattern: 'Low-level calls, pull over push pattern'
            },
            {
                practice: 'Front-running Protection',
                description: 'Protect against MEV and transaction ordering attacks',
                pattern: 'Commit-reveal schemes, time locks'
            }
        ];
        
        securityPractices.forEach((practice, index) => {
            console.log(`\n${index + 1}. ${practice.practice}`);
            console.log(`   🛡️  ${practice.description}`);
            console.log(`   🔧 Pattern: ${practice.pattern}`);
        });
    }

    // Development workflow explanation
    explainDevelopmentWorkflow() {
        console.log('\n🛠️ Smart Contract Development Workflow');
        console.log('======================================');
        
        const workflow = [
            {
                step: 'Planning & Design',
                activities: ['Define requirements', 'Choose design patterns', 'Plan gas optimization'],
                tools: ['Pen & paper', 'Architecture diagrams', 'Gas estimation']
            },
            {
                step: 'Development',
                activities: ['Write Solidity code', 'Implement security measures', 'Add comprehensive comments'],
                tools: ['VS Code + Solidity extension', 'Hardhat/Truffle', 'OpenZeppelin contracts']
            },
            {
                step: 'Testing',
                activities: ['Unit tests', 'Integration tests', 'Gas usage analysis'],
                tools: ['Mocha/Chai', 'Hardhat Network', 'Waffle']
            },
            {
                step: 'Security Audit',
                activities: ['Code review', 'Automated scanning', 'Manual audit'],
                tools: ['Slither', 'MythX', 'Trail of Bits']
            },
            {
                step: 'Deployment',
                activities: ['Testnet deployment', 'Final testing', 'Mainnet deployment'],
                tools: ['Hardhat Deploy', 'Remix IDE', 'Etherscan verification']
            },
            {
                step: 'Monitoring',
                activities: ['Event monitoring', 'Gas tracking', 'User interaction analysis'],
                tools: ['The Graph', 'Tenderly', 'Dune Analytics']
            }
        ];
        
        workflow.forEach((phase, index) => {
            console.log(`\n${index + 1}. ${phase.step}`);
            console.log(`   📋 Activities: ${phase.activities.join(', ')}`);
            console.log(`   🔧 Tools: ${phase.tools.join(', ')}`);
        });
    }

    // Interactive quiz
    async conductQuiz() {
        console.log('\n🧩 Solidity Knowledge Quiz');
        console.log('===========================');
        
        const questions = [
            {
                question: "What's the difference between 'memory' and 'storage' in Solidity?",
                answer: "Memory is temporary and erased between function calls. Storage is persistent and saved on the blockchain."
            },
            {
                question: "When should you use the 'payable' keyword?",
                answer: "When a function needs to receive Ether. Only payable functions can accept Ether transfers."
            },
            {
                question: "What is the purpose of function modifiers?",
                answer: "Modifiers allow you to add custom validation and access control logic that runs before function execution."
            },
            {
                question: "Why are events important in smart contracts?",
                answer: "Events provide a way to log information cheaply and notify external applications about contract state changes."
            }
        ];
        
        questions.forEach((q, index) => {
            console.log(`\n❓ Question ${index + 1}: ${q.question}`);
            console.log(`💡 Answer: ${q.answer}`);
        });
    }

    // Generate sample project structure
    generateProjectStructure() {
        console.log('\n📁 Recommended Project Structure');
        console.log('================================');
        
        const structure = {
            'contracts/': ['YourContract.sol', 'interfaces/', 'libraries/', 'mocks/'],
            'scripts/': ['deploy.js', 'interact.js', 'verify.js'],
            'test/': ['YourContract.test.js', 'helpers/', 'fixtures/'],
            'hardhat.config.js': 'Hardhat configuration',
            'package.json': 'Dependencies and scripts',
            '.env': 'Environment variables (private keys, API keys)',
            'README.md': 'Project documentation'
        };
        
        Object.entries(structure).forEach(([path, description]) => {
            if (Array.isArray(description)) {
                console.log(`📁 ${path}`);
                description.forEach(item => {
                    console.log(`   ${item.endsWith('/') ? '📁' : '📄'} ${item}`);
                });
            } else {
                console.log(`📄 ${path} - ${description}`);
            }
        });
    }

    // Educational summary
    printEducationalSummary() {
        console.log('\n🎓 Solidity Mastery Summary');
        console.log('===========================');
        console.log('You have learned:');
        console.log('• Solidity syntax and language features');
        console.log('• Smart contract structure and components');
        console.log('• Data types, functions, and modifiers');
        console.log('• Inheritance, interfaces, and libraries');
        console.log('• Gas optimization techniques');
        console.log('• Security best practices');
        console.log('• Development workflow and tooling');
        console.log('\n🚀 Ready for Module 3: Smart Contract Development!');
    }
}

// Main execution function
async function main() {
    console.log('🚀 Ethereum Mastery - Module 2: Solidity Fundamentals');
    console.log('=====================================================\n');
    
    const solidity = new SolidityFundamentals();
    
    try {
        // Explain Solidity basics
        solidity.explainSolidityBasics();
        
        // Display contract examples
        solidity.displayContractExamples();
        
        // Explain specific contracts
        console.log('\n🔍 Detailed Contract Explanations:');
        ['basic', 'token', 'voting', 'inheritance'].forEach(key => {
            solidity.explainContract(key);
        });
        
        // Gas optimization
        solidity.explainGasOptimization();
        
        // Security practices
        solidity.explainSecurity();
        
        // Development workflow
        solidity.explainDevelopmentWorkflow();
        
        // Project structure
        solidity.generateProjectStructure();
        
        // Interactive quiz
        await solidity.conductQuiz();
        
        // Educational summary
        solidity.printEducationalSummary();
        
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

module.exports = SolidityFundamentals;
