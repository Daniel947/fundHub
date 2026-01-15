// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FundEscrow
 * @author DanielHub Team
 * @notice Secure vault for holding and releasing campaign assets (S, ETH, ERC20).
 * @dev Controlled by CampaignManager for business logic, but stores raw balances and handles transfers.
 */

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FundEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public owner;
    address public campaignManager;

    mapping(bytes32 => address) public campaignOwners;
    mapping(address => bool) public whitelistedTokens;
    mapping(bytes32 => mapping(address => uint256)) public lockedFunds;

    event CampaignRegistered(bytes32 indexed id, address indexed owner);
    event FundsLocked(
        bytes32 indexed id,
        address indexed token,
        address indexed donor,
        uint256 amount
    );
    event FundsReleased(
        bytes32 indexed id,
        address indexed token,
        uint256 amount
    );
    event TokenWhitelisted(address indexed token, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyCampaignManager() {
        require(msg.sender == campaignManager, "Only CampaignManager");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setCampaignManager(address _campaignManager) external onlyOwner {
        require(_campaignManager != address(0), "Invalid address");
        campaignManager = _campaignManager;
    }

    /**
     * @notice Links a unique campaign ID to its creator's wallet.
     * @param id The campaign's unique internal ID.
     * @param creator The wallet address authorized to manage this campaign.
     * @dev Ensures a campaign can only be registered once.
     */
    function registerCampaign(bytes32 id, address creator) external {
        // Can be called by anyone but only first time per ID
        require(
            campaignOwners[id] == address(0),
            "Campaign already registered"
        );
        require(creator != address(0), "Invalid creator");
        campaignOwners[id] = creator;
        emit CampaignRegistered(id, creator);
    }

    /**
     * @notice Locks funds for a specific campaign.
     * @param token Address of the token (address(0) for native assets).
     * @param donor Address of the contributor.
     * @param campaignId Unique campaign target ID.
     * @param amount The value to lock in decimals of the specified token.
     * @return Boolean indicating success.
     * @dev Requires whitelisting for ERC20 tokens. Native assets must match msg.value.
     */
    function lockFunds(
        address token,
        address donor,
        bytes32 campaignId,
        uint256 amount
    ) external payable nonReentrant returns (bool) {
        require(
            campaignOwners[campaignId] != address(0),
            "Unregistered campaign"
        );
        require(amount > 0, "Invalid amount");

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect S amount");
        } else {
            require(whitelistedTokens[token], "Token not allowed");
            IERC20(token).safeTransferFrom(donor, address(this), amount);
        }

        lockedFunds[campaignId][token] += amount;

        emit FundsLocked(campaignId, token, donor, amount);
        return true;
    }

    /**
     * @notice Disburses locked assets to an authorized recipient.
     * @param token Address of the token to release.
     * @param campaignId Unique campaign source ID.
     * @param amount Value to release.
     * @return Boolean indicating success.
     * @dev Only callable by the creator, platform owner, or CampaignManager.
     */
    function releaseFunds(
        address token,
        bytes32 campaignId,
        uint256 amount
    ) external nonReentrant returns (bool) {
        require(
            campaignOwners[campaignId] == msg.sender ||
                msg.sender == owner ||
                msg.sender == campaignManager,
            "Not authorized"
        );
        require(amount > 0, "Invalid amount");
        uint256 balance = lockedFunds[campaignId][token];
        require(balance >= amount, "Insufficient funds");

        lockedFunds[campaignId][token] -= amount;

        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "S transfer failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit FundsReleased(campaignId, token, amount);
        return true;
    }

    function whitelistToken(address token, bool status) external {
        require(
            msg.sender == owner || msg.sender == campaignManager,
            "Not authorized"
        );
        require(token != address(0), "Invalid token");
        whitelistedTokens[token] = status;
        emit TokenWhitelisted(token, status);
    }

    function isCampaignRegistered(
        bytes32 campaignId
    ) external view returns (bool) {
        return campaignOwners[campaignId] != address(0);
    }
}
