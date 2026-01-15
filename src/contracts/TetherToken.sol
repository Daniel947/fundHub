// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Standard ERC20 token
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Ownable {
    address public owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Pausable: not paused");
        _;
    }

    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit Pause();
    }

    function unpause() public onlyOwner whenPaused {
        paused = false;
        emit Unpause();
    }
}

contract BlackList is Ownable {
    mapping(address => bool) public isBlackListed;

    event AddedBlackList(address user);
    event RemovedBlackList(address user);
    event DestroyedBlackFunds(address blackListedUser, uint256 balance);

    function getBlackListStatus(address _maker) external view returns (bool) {
        return isBlackListed[_maker];
    }

    function addBlackList(address _evilUser) public onlyOwner {
        isBlackListed[_evilUser] = true;
        emit AddedBlackList(_evilUser);
    }

    function removeBlackList(address _clearedUser) public onlyOwner {
        isBlackListed[_clearedUser] = false;
        emit RemovedBlackList(_clearedUser);
    }
}

contract TetherToken is Pausable, BlackList, IERC20 {
    string public name;
    string public symbol;
    uint256 public decimals;
    uint256 private _totalSupply;

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowed;

    uint256 public basisPointsRate = 0;
    uint256 public maximumFee = 0;

    event Issue(uint256 amount);
    event Redeem(uint256 amount);
    event Params(uint256 feeBasisPoints, uint256 maxFee);

    constructor(
        uint256 _initialSupply,
        string memory _name,
        string memory _symbol,
        uint256 _decimals
    ) {
        _totalSupply = _initialSupply;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        balances[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address who) public view override returns (uint256) {
        return balances[who];
    }

    function transfer(
        address _to,
        uint256 _value
    ) public override whenNotPaused returns (bool) {
        require(
            !isBlackListed[msg.sender],
            "TetherToken: sender is blacklisted"
        );

        uint256 fee = (_value * basisPointsRate) / 10000;
        if (fee > maximumFee) {
            fee = maximumFee;
        }

        uint256 sendAmount = _value - fee;
        require(
            balances[msg.sender] >= _value,
            "TetherToken: insufficient balance"
        );

        balances[msg.sender] -= _value;
        balances[_to] += sendAmount;

        if (fee > 0) {
            balances[owner] += fee;
            emit Transfer(msg.sender, owner, fee);
        }

        emit Transfer(msg.sender, _to, sendAmount);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public override whenNotPaused returns (bool) {
        require(!isBlackListed[_from], "TetherToken: origin is blacklisted");

        uint256 _allowance = allowed[_from][msg.sender];
        require(_allowance >= _value, "TetherToken: insufficient allowance");

        uint256 fee = (_value * basisPointsRate) / 10000;
        if (fee > maximumFee) {
            fee = maximumFee;
        }

        if (_allowance < type(uint256).max) {
            allowed[_from][msg.sender] -= _value;
        }

        uint256 sendAmount = _value - fee;
        require(balances[_from] >= _value, "TetherToken: insufficient balance");

        balances[_from] -= _value;
        balances[_to] += sendAmount;

        if (fee > 0) {
            balances[owner] += fee;
            emit Transfer(_from, owner, fee);
        }

        emit Transfer(_from, _to, sendAmount);
        return true;
    }

    function approve(
        address _spender,
        uint256 _value
    ) public override returns (bool) {
        require(
            !((_value != 0) && (allowed[msg.sender][_spender] != 0)),
            "TetherToken: reset allowance to 0 first"
        );

        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(
        address _owner,
        address _spender
    ) public view override returns (uint256) {
        return allowed[_owner][_spender];
    }

    function issue(uint256 amount) public onlyOwner {
        _totalSupply += amount;
        balances[owner] += amount;
        emit Issue(amount);
    }

    function redeem(uint256 amount) public onlyOwner {
        require(
            _totalSupply >= amount,
            "TetherToken: redeeem exceeds total supply"
        );
        require(
            balances[owner] >= amount,
            "TetherToken: redeem exceeds owner balance"
        );

        _totalSupply -= amount;
        balances[owner] -= amount;
        emit Redeem(amount);
    }

    function setParams(
        uint256 newBasisPoints,
        uint256 newMaxFee
    ) public onlyOwner {
        require(newBasisPoints < 20, "TetherToken: fee too high");
        require(newMaxFee < 50, "TetherToken: max fee too high");

        basisPointsRate = newBasisPoints;
        maximumFee = newMaxFee * (10 ** decimals);

        emit Params(basisPointsRate, maximumFee);
    }

    function destroyBlackFunds(address _blackListedUser) public onlyOwner {
        require(
            isBlackListed[_blackListedUser],
            "TetherToken: user is not blacklisted"
        );
        uint256 dirtyFunds = balances[_blackListedUser];
        balances[_blackListedUser] = 0;
        _totalSupply -= dirtyFunds;
        emit DestroyedBlackFunds(_blackListedUser, dirtyFunds);
    }
}
