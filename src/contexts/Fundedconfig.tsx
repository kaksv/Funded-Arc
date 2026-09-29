import { defineChain, parseAbi } from 'viem';

export const arc = defineChain({
  id: 5042,
  name: 'Arc',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mainnet.arc.io'] } },
  blockExplorers: { default: { name: 'Arc Explorer', url: 'https://explorer.arc.io' } },
});

export const FundedAddress = '0x5950FcC9Df77655e675c4bD959342a3c06ef905a';

export const FundedABI = parseAbi([
  'function campaignCount() view returns (uint256)',
  'function nextCampaignId() view returns (uint256)',
  'function getCampaign(uint256 campaignId) view returns ((address creator,string title,string description,string longDescription,string creatorName,uint256 goalAmount,uint64 deadline,string imageUrl,string category,uint256 totalRaised,uint64 createdAt,uint256 contributorCount,uint8 status) campaign)',
  'function getCampaignIds(uint256 offset,uint256 limit) view returns (uint256[] ids)',
  'function getContributors(uint256 campaignId,uint256 offset,uint256 limit) view returns (address[] accounts,uint256[] amounts,bool[] refunded)',
  'function contributions(uint256 campaignId,address contributor) view returns (uint256)',
  'function refundClaimed(uint256 campaignId,address contributor) view returns (bool)',
  'function registerCampaign(string title,string description,string longDescription,string creatorName,uint256 goalAmount,uint64 deadline,string imageUrl,string category) returns (uint256 campaignId)',
  'function contribute(uint256 campaignId) payable',
  'function finalizeCampaign(uint256 campaignId)',
  'function withdrawCampaignFunds(uint256 campaignId,address recipient)',
  'function claimRefund(uint256 campaignId,address recipient)',
  'event CampaignCreated(uint256 indexed campaignId,address indexed creator,uint256 goalAmount,uint64 deadline)',
] as const);

export const ARC_NATIVE_DECIMALS = 18;
export const ARC_USDC_DISPLAY_DECIMALS = 6;
export const ARC_NATIVE_SCALE = 10n ** 12n;