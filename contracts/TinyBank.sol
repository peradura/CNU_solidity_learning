// staking
// deposit(MyToken) / withdraw(MyToken)

// MyToken : token balance management
// - the balance of TinyBank address
// TinyBank : deposit / withdraw valut
// - users token management
// - user --> deposit --> TinyBank --> transfer(user --> TinyBank)

// SPDX-License-Identifier: MINT
pragma solidity ^0.8.28;

interface IMyToken {
    function transfer(uint256 amount, address to) external;

    function transferFrom(address from, address to, uint256 amount) external;

    function mint(uint256 amount, address owner) external;
}

contract TinyBank {
    event Staked(address, uint256);
    event Withdraw(uint256 amount, address to);

    IMyToken public stakingToken;

    mapping(address => uint256) public lastClainedBlock;
    address[] public stakedUsers;
    uint256 rewardPerblock = 1 * 10 ** 18;

    mapping(address => uint256) public staked;
    uint256 public totalStaked;

    constructor(IMyToken _stakingToken) {
        stakingToken = _stakingToken;
    }

    function distributeReward() internal {
        for (uint i = 0; i < stakedUsers.length; i++) {
            uint256 blocks = block.number - lastClainedBlock[stakedUsers[i]];
            uint256 reward = (block * rewardPerBlock * staked[stakedUsers[i]]) /
                totalStaked;
            IMyToken.mint(reward, stakedUsers[i]);
            lastClainedBlock[stakedUsers[i]] = block.number;
        }
    }

    function stake(uint256 _amount) external {
        require(_amount >= 0, "Amount must be bigger than zero");
        distributeReward();
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        stakedUsers.push(msg.sender);
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        require(staked[msg.sender] >= _amount, "Insufficient staked token");
        distributeReward();
        stakingToken.transfer(_amount, msg.sender);
        staked[msg.sender] -= _amount;
        totalStaked -= _amount;
        if (staked[msg.sender] == 0) {
            uint256 index;
            for (uint i = 0; i < stakedUsers.length; i++) {
                if (stakedUsers[i] == msg.sender) {
                    index = i;
                    break;
                }
            }
            stakedUsers[index] = stakedUsers[stakedUsers.length - 1];
            stakedUsers.pop();
        }
        emit Withdraw(_amount, msg.sender);
    }
}
