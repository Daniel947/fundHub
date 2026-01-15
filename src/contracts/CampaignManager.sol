// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CampaignManager
 * @author DanielHub Team
 * @notice Manages the lifecycle of crowdfunding campaigns, including creation, donations, and milestone-based fund releases.
 * @dev This contract acts as a controller for the FundEscrow contract, which holds the actual assets.
 */

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IVerificationRegistry.sol";

interface IFundEscrow {
    function registerCampaign(bytes32 campaignId, address owner) external;
    function lockFunds(
        address token,
        address donor,
        bytes32 campaignId,
        uint256 amount
    ) external payable returns (bool);
    function releaseFunds(
        address token,
        bytes32 campaignId,
        uint256 amount
    ) external returns (bool);
    function whitelistToken(address token, bool status) external;
    function isCampaignRegistered(
        bytes32 campaignId
    ) external view returns (bool);
    function lockedFunds(
        bytes32 campaignId,
        address token
    ) external view returns (uint256);
}

contract CampaignManager is ReentrancyGuard {
    address public owner;
    IFundEscrow public fundEscrow;
    IVerificationRegistry public verificationRegistry;
    uint256 public campaignCount;

    uint256 public constant MAX_GOAL = 1000000 ether;
    uint256 public constant CAMPAIGN_COOLDOWN = 1 days;
    uint256 public constant MAX_CAMPAIGNS_PER_USER = 5;

    /**
     * @notice Data structure representing a crowdfunding campaign.
     * @param id The global campaign counter ID.
     * @param internalId A unique hash identifying the campaign across different networks.
     * @param creator The address (EOA or Multisig) that created the campaign.
     * @param title The public-facing name of the project.
     * @param description A detailed explanation of the project's goals.
     * @param category The thematic area (e.g., Tech, Charity).
     * @param image IPFS CID or URL for the campaign's hero image.
     * @param goal The target funding amount in the specified currency.
     * @param pledged Total amount raised from donors.
     * @param currency The symbol of the token used for funding (e.g., "S", "ETH", "USDC").
     * @param endAt Unix timestamp when the campaign raising period ends.
     * @param active Boolean indicating if the campaign is currently accepting donations.
     */
    struct Campaign {
        uint256 id;
        bytes32 internalId;
        address creator;
        string title;
        string description;
        string category;
        string image;
        uint256 goal;
        uint256 pledged;
        string currency;
        uint256 endAt;
        bool active;
    }

    /**
     * @notice Data structure for campaign delivery milestones.
     * @param title Brief name of the milestone.
     * @param fundingPercentage The portion of the goal (0-100) to be released upon completion of this milestone.
     * @param description Detailed criteria for milestone fulfillment.
     * @param released Boolean indicating if the funds for this milestone have been disbursed to the creator.
     */
    struct Milestone {
        string title;
        uint256 fundingPercentage;
        string description;
        bool released;
    }

    mapping(bytes32 => Campaign) public campaigns;
    bytes32[] public campaignIds;
    mapping(bytes32 => Milestone[]) public milestones;
    mapping(address => uint256) public lastCreatedAt;
    mapping(address => uint256) public activeCampaignCount;

    // Backer Tracking
    mapping(bytes32 => address[]) public campaignBackers;
    mapping(bytes32 => mapping(address => uint256)) public backerContributions;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyCampaignCreator(bytes32 id) {
        require(msg.sender == campaigns[id].creator, "Not campaign creator");
        _;
    }

    event CampaignCreated(bytes32 indexed id, address indexed creator);
    event FundsLocked(bytes32 indexed id, address token, uint256 amount);
    event FundsReleased(bytes32 indexed id, address token, uint256 amount);
    event MilestoneReleased(bytes32 indexed id, uint256 milestoneIndex);
    event CampaignDisabled(bytes32 indexed id);
    event TokenWhitelisted(address indexed token, bool status);

    constructor(address _escrowAddress, address _verificationRegistry) {
        require(_escrowAddress != address(0), "Invalid escrow address");
        require(
            _verificationRegistry != address(0),
            "Invalid verification registry"
        );
        owner = msg.sender;
        fundEscrow = IFundEscrow(_escrowAddress);
        verificationRegistry = IVerificationRegistry(_verificationRegistry);
    }

    /**
     * @notice Deploys a new campaign with detailed metadata and milestones.
     * @param _title Project title.
     * @param _description Project description.
     * @param _category Project category.
     * @param _image Hero image link/CID.
     * @param _goal Target funding amount.
     * @param _currency Token symbol for funding.
     * @param _endDate Final raisin period timestamp.
     * @param _milestones Array of milestones that must sum to 100% funding.
     * @dev Registers the campaign in the attached FundEscrow contract.
     */
    function createCampaign(
        string calldata _title,
        string calldata _description,
        string calldata _category,
        string calldata _image,
        uint256 _goal,
        string calldata _currency,
        uint256 _endDate,
        Milestone[] calldata _milestones
    ) external {
        // Check KYC verification status (only if registry is configured)
        if (address(verificationRegistry) != address(0)) {
            require(
                verificationRegistry.isVerified(msg.sender),
                "Creator must complete KYC verification"
            );
        }

        require(
            activeCampaignCount[msg.sender] < MAX_CAMPAIGNS_PER_USER,
            "Limit: 5 active campaigns reached"
        );
        require(bytes(_title).length > 0, "Title is mandatory");
        require(bytes(_description).length > 0, "Description is mandatory");
        require(bytes(_category).length > 0, "Category is mandatory");
        require(bytes(_currency).length > 0, "Currency is mandatory");
        require(_goal > 0, "Goal must be > 0");
        require(_goal <= MAX_GOAL, "Goal exceeds 1M limit");
        require(_endDate > block.timestamp, "End date must be in future");
        require(_milestones.length > 0, "Milestones are mandatory");

        uint256 totalPercent;
        for (uint i = 0; i < _milestones.length; i++) {
            require(
                bytes(_milestones[i].title).length > 0,
                "Milestone title required"
            );
            totalPercent += _milestones[i].fundingPercentage;
        }
        require(totalPercent == 100, "Milestone percentages must sum to 100");

        uint256 idNum = ++campaignCount;
        bytes32 internalId = keccak256(
            abi.encodePacked(address(this), msg.sender, idNum)
        );

        campaigns[internalId] = Campaign({
            id: idNum,
            internalId: internalId,
            creator: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            image: _image,
            goal: _goal,
            pledged: 0,
            currency: _currency,
            endAt: _endDate,
            active: true
        });
        campaignIds.push(internalId);

        for (uint i = 0; i < _milestones.length; i++) {
            milestones[internalId].push(_milestones[i]);
        }

        fundEscrow.registerCampaign(internalId, msg.sender);
        emit CampaignCreated(internalId, msg.sender);

        lastCreatedAt[msg.sender] = block.timestamp;
        activeCampaignCount[msg.sender]++;
    }

    /**
     * @notice Contributes funds to a specific campaign.
     * @param campaignId Unique internal ID of the target campaign.
     * @param token Address of the token being donated (use address(0) for native).
     * @param amount The amount to donate (must match msg.value if native).
     * @dev Interacts with FundEscrow to lock the assets securely.
     */
    function donate(
        bytes32 campaignId,
        address token,
        uint256 amount
    ) external payable nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.active, "Inactive campaign");
        require(amount > 0, "Amount must be > 0");
        require(
            fundEscrow.isCampaignRegistered(campaignId),
            "Not registered in escrow"
        );

        bool success = fundEscrow.lockFunds{value: msg.value}(
            token,
            msg.sender,
            campaignId,
            amount
        );
        require(success, "Lock failed");

        // Backer Tracking Logic
        if (backerContributions[campaignId][msg.sender] == 0) {
            campaignBackers[campaignId].push(msg.sender);
        }
        backerContributions[campaignId][msg.sender] += amount;

        c.pledged += amount;
        emit FundsLocked(campaignId, token, amount);
    }

    /**
     * @notice Retrieves all campaigns registered in the manager.
     * @return An array of Campaign structs.
     */
    function getCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](campaignIds.length);
        for (uint i = 0; i < campaignIds.length; i++) {
            allCampaigns[i] = campaigns[campaignIds[i]];
        }
        return allCampaigns;
    }

    /**
     * @notice Releases funds for a specific milestone once criteria are met.
     * @param campaignId Unique campaign ID.
     * @param token The token address to release.
     * @param milestoneIndex Index of the completed milestone in the array.
     * @dev Can only be called by the campaign creator. Requires sufficient funds in escrow.
     */
    function releaseMilestoneFunds(
        bytes32 campaignId,
        address token,
        uint256 milestoneIndex
    ) external onlyCampaignCreator(campaignId) nonReentrant {
        Milestone storage m = milestones[campaignId][milestoneIndex];
        require(!m.released, "Milestone already released");

        Campaign storage c = campaigns[campaignId];
        uint256 amount = (c.goal * m.fundingPercentage) / 100;

        bool success = fundEscrow.releaseFunds(token, campaignId, amount);
        require(success, "Release failed");

        m.released = true;

        emit FundsReleased(campaignId, token, amount);
        emit MilestoneReleased(campaignId, milestoneIndex);
    }

    /**
     * @dev Allows the creator to withdraw any funds exceeding the goal
     * once all milestones have been released.
     */
    function withdrawSurplus(
        bytes32 campaignId,
        address token
    ) external onlyCampaignCreator(campaignId) nonReentrant {
        Milestone[] storage mList = milestones[campaignId];
        for (uint i = 0; i < mList.length; i++) {
            require(mList[i].released, "Milestones not all released");
        }

        // FundEscrow.releaseFunds handles the actual transfer and balance check
        // but we need to know the remaining balance for that token
        uint256 balance = fundEscrow.lockedFunds(campaignId, token);
        require(balance > 0, "No surplus to withdraw");

        bool success = fundEscrow.releaseFunds(token, campaignId, balance);
        require(success, "Surplus withdrawal failed");

        emit FundsReleased(campaignId, token, balance);
    }

    /**
     * @notice Prevents new donations to a campaign.
     * @param id The campaign's unique internal ID.
     * @dev Only callable by the creator. Decrements active campaign count for cooling off.
     */
    function disableCampaign(bytes32 id) external onlyCampaignCreator(id) {
        campaigns[id].active = false;
        activeCampaignCount[msg.sender]--;
        emit CampaignDisabled(id);
    }

    /**
     * @notice Fetches the milestone array for a specific campaign.
     * @param campaignId Campaign ID.
     * @return Array of Milestone structs.
     */
    function getMilestones(
        bytes32 campaignId
    ) external view returns (Milestone[] memory) {
        return milestones[campaignId];
    }

    /**
     * @notice Toggles the acceptance status of a specific ERC20 token for donations.
     * @param token The token address.
     * @param status True to enable, false to disable.
     * @dev Only callable by platform owner.
     */
    function whitelistToken(address token, bool status) external onlyOwner {
        require(token != address(0), "Invalid token");
        fundEscrow.whitelistToken(token, status);
        emit TokenWhitelisted(token, status);
    }

    /**
     * @dev Allows the platform owner (Oracle) to record external contributions (like BTC)
     * This updates the pledged amount on-chain without locking EVM funds.
     */
    function recordExternalContribution(
        bytes32 campaignId,
        uint256 amount
    ) external onlyOwner {
        Campaign storage c = campaigns[campaignId];
        require(c.active, "Inactive campaign");
        require(amount > 0, "Invalid amount");

        c.pledged += amount;
        emit FundsLocked(campaignId, address(0), amount); // Emit event for UI consistency
    }

    // --- Backer Getters ---

    /**
     * @notice Get all unique wallet addresses that contributed to a campaign.
     * @param campaignId Unique campaign ID.
     * @return address array of backers.
     */
    function getBackers(
        bytes32 campaignId
    ) external view returns (address[] memory) {
        return campaignBackers[campaignId];
    }

    function getBackerCount(
        bytes32 campaignId
    ) external view returns (uint256) {
        return campaignBackers[campaignId].length;
    }

    function getBackerContribution(
        bytes32 campaignId,
        address backer
    ) external view returns (uint256) {
        return backerContributions[campaignId][backer];
    }
}
