// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "../src/Contract/Funded.sol";

interface Vm {
    function deal(address account, uint256 newBalance) external;
    function prank(address sender) external;
    function warp(uint256 timestamp) external;
    function expectRevert(bytes4 selector) external;
}

contract RejectNative {
    receive() external payable {
        revert();
    }
}

contract FundedTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    Funded private funded;
    address private constant donor = address(0xD0A0);
    address private constant creator = address(0xC0DE);
    uint64 private campaignDeadline;
    uint256 private reentrantCampaignId;
    bool private attemptReentry;
    bool private reentryBlocked;

    receive() external payable {
        if (attemptReentry) {
            attemptReentry = false;
            (bool success,) = address(funded).call(
                abi.encodeWithSelector(
                    funded.withdrawCampaignFunds.selector,
                    reentrantCampaignId,
                    payable(address(this))
                )
            );
            reentryBlocked = !success;
        }
    }

    function setUp() public {
        funded = new Funded();
        campaignDeadline = uint64(block.timestamp + 7 days);
        vm.deal(donor, 100 ether);
        vm.deal(creator, 100 ether);
    }

    function testCreatesCampaignWithoutSeedPayment() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        Funded.Campaign memory campaign = funded.getCampaign(campaignId);

        require(campaignId == 1, "first campaign id should be one");
        require(campaign.creator == creator, "creator not stored");
        require(campaign.totalRaised == 0, "creation must not accept a seed contribution");
        require(campaign.status == Funded.CampaignStatus.Active, "campaign should start active");
    }

    function testRejectsInvalidGoalPrecision() public {
        vm.expectRevert(Funded.InvalidGoal.selector);
        _createCampaign(creator, 1 ether + 1, campaignDeadline);
    }

    function testRejectsZeroContribution() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        vm.prank(donor);
        vm.expectRevert(Funded.ZeroContribution.selector);
        funded.contribute{value: 0}(campaignId);
    }

    function testRejectsContributionBelowUSDCPrecision() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        vm.prank(donor);
        vm.expectRevert(Funded.InvalidAmountPrecision.selector);
        funded.contribute{value: 1}(campaignId);
    }

    function testRejectsContributionPastDeadline() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        vm.warp(campaignDeadline);
        vm.prank(donor);
        vm.expectRevert(Funded.DeadlinePassed.selector);
        funded.contribute{value: 1 ether}(campaignId);
    }

    function testRejectsContributionAboveGoal() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        vm.prank(donor);
        vm.expectRevert(Funded.ContributionExceedsGoal.selector);
        funded.contribute{value: 11 ether}(campaignId);
    }

    function testSuccessfulCampaignPaysCreatorAndCollectsFivePercent() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        vm.prank(donor);
        funded.contribute{value: 10 ether}(campaignId);

        require(
            funded.getCampaign(campaignId).status == Funded.CampaignStatus.Successful,
            "reaching the goal should finalize successfully"
        );

        uint256 creatorBalanceBefore = creator.balance;
        vm.prank(creator);
        funded.withdrawCampaignFunds(campaignId, payable(creator));

        require(creator.balance - creatorBalanceBefore == 9.5 ether, "creator payout should net 5 percent");
        require(funded.platformRevenue() == 0.5 ether, "platform fee should equal five percent");
        require(
            funded.getCampaign(campaignId).status == Funded.CampaignStatus.Withdrawn,
            "campaign should be marked withdrawn"
        );
    }

    function testCreatorCannotWithdrawBeforeGoal() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        vm.prank(donor);
        funded.contribute{value: 1 ether}(campaignId);

        vm.prank(creator);
        vm.expectRevert(Funded.InvalidStatus.selector);
        funded.withdrawCampaignFunds(campaignId, payable(creator));
    }

    function testRefundsFailedCampaignInFull() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        vm.prank(donor);
        funded.contribute{value: 4 ether}(campaignId);
        vm.warp(campaignDeadline);
        funded.finalizeCampaign(campaignId);

        uint256 donorBalanceBefore = donor.balance;
        vm.prank(donor);
        funded.claimRefund(campaignId, payable(donor));

        require(donor.balance - donorBalanceBefore == 4 ether, "failed campaign refund should be full");
        require(funded.refundClaimed(campaignId, donor), "refund should be marked claimed");
        require(funded.platformRevenue() == 0, "failed campaigns must not incur a platform fee");
    }

    function testRefundCanRetryWithAnotherRecipientAfterTransferFailure() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        vm.prank(donor);
        funded.contribute{value: 4 ether}(campaignId);
        vm.warp(campaignDeadline);
        funded.finalizeCampaign(campaignId);
        RejectNative recipient = new RejectNative();

        vm.prank(donor);
        vm.expectRevert(Funded.TransferFailed.selector);
        funded.claimRefund(campaignId, payable(address(recipient)));

        require(!funded.refundClaimed(campaignId, donor), "failed transfer must leave the claim available");
        vm.prank(donor);
        funded.claimRefund(campaignId, payable(donor));
        require(funded.refundClaimed(campaignId, donor), "alternate recipient should be claimable");
    }

    function testWithdrawReentrancyIsBlockedByStatusUpdate() public {
        uint256 campaignId = _createCampaign(address(this), 10 ether, campaignDeadline);
        vm.prank(donor);
        funded.contribute{value: 10 ether}(campaignId);
        reentrantCampaignId = campaignId;
        attemptReentry = true;

        funded.withdrawCampaignFunds(campaignId, payable(address(this)));

        require(reentryBlocked, "reentrant withdrawal should fail");
        require(
            funded.getCampaign(campaignId).status == Funded.CampaignStatus.Withdrawn,
            "outer withdrawal should complete once"
        );
    }

    function testOnlyProprietorCanWithdrawPlatformRevenue() public {
        uint256 campaignId = _createCampaign(creator, 10 ether, campaignDeadline);
        vm.prank(donor);
        funded.contribute{value: 10 ether}(campaignId);
        vm.prank(creator);
        funded.withdrawCampaignFunds(campaignId, payable(creator));

        vm.prank(donor);
        vm.expectRevert(Funded.Unauthorized.selector);
        funded.withdrawPlatformRevenue(0.1 ether, payable(donor));
    }

    function _createCampaign(address campaignCreator, uint256 goal, uint64 deadline)
        private
        returns (uint256 campaignId)
    {
        vm.prank(campaignCreator);
        campaignId = funded.registerCampaign(
            "Community garden",
            "A neighborhood project",
            "A detailed description of the project.",
            "Garden team",
            goal,
            deadline,
            "https://example.com/garden.jpg",
            "Community"
        );
    }
}