import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createPublicClient,
  decodeEventLog,
  http,
  parseUnits,
  type Address,
  type Hex,
} from 'viem';
import { arc, ARC_NATIVE_DECIMALS, ARC_NATIVE_SCALE, FundedABI, FundedAddress } from './Fundedconfig';
import { useWallet } from './WalletContext';
import type { Campaign, CampaignStatus, Contributor, NewCampaign } from '../types/Campaign';

const publicClient = createPublicClient({ chain: arc, transport: http() });
const PAGE_SIZE = 100n;
const CONTRIBUTOR_PREVIEW_SIZE = 20n;
const CAMPAIGN_CREATED_TOPIC = '0x20e578c266c0c45f0311c4e0f835cb47e4482c0c447ff4654f7c3936960a08e5';

interface CampaignRecord {
  creator: Address;
  title: string;
  description: string;
  longDescription: string;
  creatorName: string;
  goalAmount: bigint;
  deadline: bigint;
  imageUrl: string;
  category: string;
  totalRaised: bigint;
  createdAt: bigint;
  contributorCount: bigint;
  status: number;
}

interface CampaignContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string;
  refreshCampaigns: () => Promise<void>;
  createCampaign: (campaign: NewCampaign) => Promise<string>;
  contributeToCampaign: (campaignId: string, amount: string) => Promise<void>;
  finalizeCampaign: (campaignId: string) => Promise<void>;
  withdrawCampaignFunds: (campaignId: string, recipient: string) => Promise<void>;
  claimRefund: (campaignId: string, recipient: string) => Promise<void>;
  getUserContribution: (campaignId: string, account: string) => Promise<bigint>;
  userCampaigns: (address: string) => Campaign[];
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

function amountToUsdc(value: bigint): number {
  return Number(value / ARC_NATIVE_SCALE) + Number(value % ARC_NATIVE_SCALE) / Number(ARC_NATIVE_SCALE);
}

function getCampaignStatus(status: number): CampaignStatus {
  switch (status) {
    case 1: return 'Active';
    case 2: return 'Successful';
    case 3: return 'Failed';
    case 4: return 'Withdrawn';
    default: throw new Error(`Unknown campaign status ${status}`);
  }
}

async function waitForSuccess(hash: Hex): Promise<void> {
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== 'success') throw new Error('The Arc transaction reverted.');
}

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { account, chainId, getWalletClient } = useWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const count = await publicClient.readContract({ address: FundedAddress, abi: FundedABI, functionName: 'campaignCount' }) as bigint;
      const ids: bigint[] = [];
      for (let offset = 0n; offset < count; offset += PAGE_SIZE) {
        const page = await publicClient.readContract({
          address: FundedAddress,
          abi: FundedABI,
          functionName: 'getCampaignIds',
          args: [offset, PAGE_SIZE],
        }) as bigint[];
        ids.push(...page);
      }

      const results = await Promise.all(ids.map(async (id): Promise<Campaign> => {
        const record = await publicClient.readContract({ address: FundedAddress, abi: FundedABI, functionName: 'getCampaign', args: [id] }) as unknown as CampaignRecord;
        const [accounts, amounts, refunded] = await publicClient.readContract({
          address: FundedAddress,
          abi: FundedABI,
          functionName: 'getContributors',
          args: [id, 0n, CONTRIBUTOR_PREVIEW_SIZE],
        }) as unknown as [Address[], bigint[], boolean[]];
        const contributors: Contributor[] = accounts.map((contributor, index) => ({
          address: contributor,
          amount: amountToUsdc(amounts[index]),
          refunded: refunded[index],
        }));

        return {
          id: id.toString(),
          title: record.title,
          description: record.description,
          longDescription: record.longDescription,
          creator: record.creator,
          creatorName: record.creatorName,
          goalAmount: amountToUsdc(record.goalAmount),
          currentAmount: amountToUsdc(record.totalRaised),
          deadline: new Date(Number(record.deadline) * 1000).toISOString(),
          imageUrl: record.imageUrl,
          category: record.category,
          contributors,
          contributorCount: Number(record.contributorCount),
          status: getCampaignStatus(record.status),
          createdAt: new Date(Number(record.createdAt) * 1000).toISOString(),
        };
      }));
      setCampaigns(results.reverse());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load campaigns from Arc.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCampaigns();
  }, [refreshCampaigns]);

  const requireArcWallet = async () => {
    if (!account) throw new Error('Connect a wallet before submitting a transaction.');
    if (chainId !== arc.id) throw new Error('Switch your wallet to Arc Mainnet before submitting.');
    return getWalletClient();
  };

  const createCampaign = async (campaign: NewCampaign): Promise<string> => {
    const walletClient = await requireArcWallet();
    const hash = await walletClient.writeContract({
      address: FundedAddress,
      abi: FundedABI,
      functionName: 'registerCampaign',
      args: [
        campaign.title,
        campaign.description,
        campaign.longDescription,
        campaign.creatorName,
        parseUnits(campaign.goalAmount, ARC_NATIVE_DECIMALS),
        BigInt(Math.floor(new Date(campaign.deadline).getTime() / 1000)),
        campaign.imageUrl,
        campaign.category,
      ],
      account: account as Address,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('Campaign creation reverted on Arc.');
    const createdLog = receipt.logs.find((log) => log.topics[0] === CAMPAIGN_CREATED_TOPIC);
    const decodedEvent = createdLog
      ? decodeEventLog({ abi: FundedABI, data: createdLog.data, topics: createdLog.topics })
      : undefined;
    const campaignId = decodedEvent
      ? ((decodedEvent.args as unknown as { campaignId: bigint }).campaignId)
      : undefined;
    if (campaignId === undefined) throw new Error('Campaign was created, but its ID was not found in the transaction logs.');
    await refreshCampaigns();
    return campaignId.toString();
  };

  const contributeToCampaign = async (campaignId: string, amount: string) => {
    const walletClient = await requireArcWallet();
    const value = parseUnits(amount, ARC_NATIVE_DECIMALS);
    if (value % ARC_NATIVE_SCALE !== 0n) throw new Error('Contribution precision cannot exceed 6 USDC decimals.');
    const hash = await walletClient.writeContract({
      address: FundedAddress,
      abi: FundedABI,
      functionName: 'contribute',
      args: [BigInt(campaignId)],
      account: account as Address,
      value,
    });
    await waitForSuccess(hash);
    await refreshCampaigns();
  };

  const finalizeCampaign = async (campaignId: string) => {
    const walletClient = await requireArcWallet();
    const hash = await walletClient.writeContract({ address: FundedAddress, abi: FundedABI, functionName: 'finalizeCampaign', args: [BigInt(campaignId)], account: account as Address });
    await waitForSuccess(hash);
    await refreshCampaigns();
  };

  const withdrawCampaignFunds = async (campaignId: string, recipient: string) => {
    const walletClient = await requireArcWallet();
    const hash = await walletClient.writeContract({ address: FundedAddress, abi: FundedABI, functionName: 'withdrawCampaignFunds', args: [BigInt(campaignId), recipient as Address], account: account as Address });
    await waitForSuccess(hash);
    await refreshCampaigns();
  };

  const claimRefund = async (campaignId: string, recipient: string) => {
    const walletClient = await requireArcWallet();
    const hash = await walletClient.writeContract({ address: FundedAddress, abi: FundedABI, functionName: 'claimRefund', args: [BigInt(campaignId), recipient as Address], account: account as Address });
    await waitForSuccess(hash);
    await refreshCampaigns();
  };

  const getUserContribution = async (campaignId: string, contributor: string): Promise<bigint> => await publicClient.readContract({
      address: FundedAddress,
      abi: FundedABI,
      functionName: 'contributions',
      args: [BigInt(campaignId), contributor as Address],
    }) as bigint;

  const userCampaigns = (address: string) => campaigns.filter((campaign) => campaign.creator.toLowerCase() === address.toLowerCase());

  return (
    <CampaignContext.Provider value={{ campaigns, isLoading, error, refreshCampaigns, createCampaign, contributeToCampaign, finalizeCampaign, withdrawCampaignFunds, claimRefund, getUserContribution, userCampaigns }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) throw new Error('useCampaigns must be used within a CampaignProvider');
  return context;
};