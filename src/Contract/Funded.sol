// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract Funded {
    uint256 public constant FEE_BPS = 500;
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant NATIVE_USDC_PRECISION = 1e12;
    uint256 public constant MAX_PAGE_SIZE = 100;

    address public immutable proprietor;
    uint256 public nextCampaignId = 1;
    uint256 public totalContributions;
    uint256 public platformRevenue;

    enum CampaignStatus {
        None,
        Active,
        Successful,
        Failed,
        Withdrawn
    }

    struct Campaign {
        address creator;
        string title;
        string description;
        string longDescription;
        string creatorName;
        uint256 goalAmount;
        uint64 deadline;
        string imageUrl;
        string category;
        uint256 totalRaised;
        uint64 createdAt;
        uint256 contributorCount;
        CampaignStatus status;
    }

    mapping(uint256 campaignId => Campaign campaign) private campaigns;
    mapping(uint256 campaignId => mapping(address contributor => uint256 amount)) public contributions;
    mapping(uint256 campaignId => mapping(address contributor => bool claimed)) public refundClaimed;
    mapping(uint256 campaignId => address[] contributors) private campaignContributors;

    error Unauthorized();
    error CampaignNotFound();
    error InvalidStatus();
    error InvalidGoal();
    error InvalidDeadline();
    error InvalidTextLength();
    error InvalidAmountPrecision();
    error ZeroContribution();
    error ContributionExceedsGoal();
    error DeadlinePassed();
    error CampaignStillActive();
    error InvalidRecipient();
    error NothingToWithdraw();
    error NothingToRefund();
    error RefundAlreadyClaimed();
    error TransferFailed();
    error InvalidPage();
    error DirectTransfersDisabled();

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 goalAmount,
        uint64 deadline
    );
    event ContributionReceived(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount,
        uint256 totalRaised
    );
    event CampaignFinalized(uint256 indexed campaignId, CampaignStatus status);
    event CampaignWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        address indexed recipient,
        uint256 grossAmount,
        uint256 feeAmount
    );
    event RefundClaimed(
        uint256 indexed campaignId,
        address indexed contributor,
        address indexed recipient,
        uint256 amount
    );
    event PlatformRevenueWithdrawn(address indexed recipient, uint256 amount);

    constructor() {
        proprietor = msg.sender;
    }

    modifier onlyProprietor() {
        if (msg.sender != proprietor) revert Unauthorized();
        _;
    }

    function registerCampaign(
        string calldata title,
        string calldata description,
        string calldata longDescription,
        string calldata creatorName,
        uint256 goalAmount,
        uint64 deadline,
        string calldata imageUrl,
        string calldata category
    ) external returns (uint256 campaignId) {
        if (goalAmount == 0 || goalAmount % NATIVE_USDC_PRECISION != 0) revert InvalidGoal();
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (
            bytes(title).length == 0 || bytes(title).length > 120 ||
            bytes(description).length > 300 ||
            bytes(longDescription).length > 5_000 ||
            bytes(creatorName).length > 80 ||
            bytes(imageUrl).length > 500 ||
            bytes(category).length > 40
        ) revert InvalidTextLength();

        campaignId = nextCampaignId++;
        Campaign storage campaign = campaigns[campaignId];
        campaign.creator = msg.sender;
        campaign.title = title;
        campaign.description = description;
        campaign.longDescription = longDescription;
        campaign.creatorName = creatorName;
        campaign.goalAmount = goalAmount;
        campaign.deadline = deadline;
        campaign.imageUrl = imageUrl;
        campaign.category = category;
        campaign.createdAt = uint64(block.timestamp);
        campaign.status = CampaignStatus.Active;

        emit CampaignCreated(campaignId, msg.sender, goalAmount, deadline);
    }

    function contribute(uint256 campaignId) external payable {
        Campaign storage campaign = _campaign(campaignId);
        if (campaign.status != CampaignStatus.Active) revert InvalidStatus();
        if (block.timestamp >= campaign.deadline) revert DeadlinePassed();
        if (msg.value == 0) revert ZeroContribution();
        if (msg.value % NATIVE_USDC_PRECISION != 0) revert InvalidAmountPrecision();
        if (msg.value > campaign.goalAmount - campaign.totalRaised) revert ContributionExceedsGoal();

        if (contributions[campaignId][msg.sender] == 0) {
            campaignContributors[campaignId].push(msg.sender);
            campaign.contributorCount++;
        }

        contributions[campaignId][msg.sender] += msg.value;
        campaign.totalRaised += msg.value;
        totalContributions += msg.value;

        emit ContributionReceived(campaignId, msg.sender, msg.value, campaign.totalRaised);

        if (campaign.totalRaised == campaign.goalAmount) {
            campaign.status = CampaignStatus.Successful;
            emit CampaignFinalized(campaignId, CampaignStatus.Successful);
        }
    }

    function finalizeCampaign(uint256 campaignId) external {
        Campaign storage campaign = _campaign(campaignId);
        if (campaign.status != CampaignStatus.Active) revert InvalidStatus();

        if (campaign.totalRaised == campaign.goalAmount) {
            campaign.status = CampaignStatus.Successful;
        } else {
            if (block.timestamp < campaign.deadline) revert CampaignStillActive();
            campaign.status = CampaignStatus.Failed;
        }

        emit CampaignFinalized(campaignId, campaign.status);
    }

    function withdrawCampaignFunds(uint256 campaignId, address payable recipient) external {
        Campaign storage campaign = _campaign(campaignId);
        if (msg.sender != campaign.creator) revert Unauthorized();
        if (campaign.status != CampaignStatus.Successful) revert InvalidStatus();
        if (recipient == address(0)) revert InvalidRecipient();

        uint256 grossAmount = campaign.totalRaised;
        uint256 feeAmount = (grossAmount * FEE_BPS) / BPS_DENOMINATOR;
        uint256 creatorAmount = grossAmount - feeAmount;

        campaign.status = CampaignStatus.Withdrawn;
        platformRevenue += feeAmount;

        (bool success,) = recipient.call{value: creatorAmount}("");
        if (!success) revert TransferFailed();

        emit CampaignWithdrawn(campaignId, campaign.creator, recipient, grossAmount, feeAmount);
    }

    function claimRefund(uint256 campaignId, address payable recipient) external {
        _campaign(campaignId);
        if (campaigns[campaignId].status != CampaignStatus.Failed) revert InvalidStatus();
        if (recipient == address(0)) revert InvalidRecipient();

        uint256 amount = contributions[campaignId][msg.sender];
        if (amount == 0) revert NothingToRefund();
        if (refundClaimed[campaignId][msg.sender]) revert RefundAlreadyClaimed();

        refundClaimed[campaignId][msg.sender] = true;

        (bool success,) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit RefundClaimed(campaignId, msg.sender, recipient, amount);
    }

    function withdrawPlatformRevenue(uint256 amount, address payable recipient) external onlyProprietor {
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0 || amount > platformRevenue) revert NothingToWithdraw();

        platformRevenue -= amount;

        (bool success,) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PlatformRevenueWithdrawn(recipient, amount);
    }

    function campaignCount() external view returns (uint256) {
        return nextCampaignId - 1;
    }

    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        _campaign(campaignId);
        return campaigns[campaignId];
    }

    function getCampaignIds(uint256 offset, uint256 limit) external view returns (uint256[] memory ids) {
        uint256 count = nextCampaignId - 1;
        if (limit == 0 || limit > MAX_PAGE_SIZE || offset > count) revert InvalidPage();

        uint256 remaining = count - offset;
        uint256 resultLength = limit < remaining ? limit : remaining;
        ids = new uint256[](resultLength);

        for (uint256 index; index < resultLength; index++) {
            ids[index] = offset + index + 1;
        }
    }

    function getContributors(
        uint256 campaignId,
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory accounts, uint256[] memory amounts, bool[] memory refunded) {
        _campaign(campaignId);
        address[] storage allContributors = campaignContributors[campaignId];
        if (limit == 0 || limit > MAX_PAGE_SIZE || offset > allContributors.length) revert InvalidPage();

        uint256 remaining = allContributors.length - offset;
        uint256 resultLength = limit < remaining ? limit : remaining;
        accounts = new address[](resultLength);
        amounts = new uint256[](resultLength);
        refunded = new bool[](resultLength);

        for (uint256 index; index < resultLength; index++) {
            address contributor = allContributors[offset + index];
            accounts[index] = contributor;
            amounts[index] = contributions[campaignId][contributor];
            refunded[index] = refundClaimed[campaignId][contributor];
        }
    }

    function _campaign(uint256 campaignId) private view returns (Campaign storage campaign) {
        campaign = campaigns[campaignId];
        if (campaign.creator == address(0)) revert CampaignNotFound();
    }

    receive() external payable {
        revert DirectTransfersDisabled();
    }
}