import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import CampaignGrid from '../components/CampaignGrid';
import { PlusCircle, Wallet, Zap, TrendingUp, Clock } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const DashboardPage: React.FC = () => {
  const { userCampaigns } = useCampaigns();
  const { account, connectWallet, chainId } = useWallet();
  const userCampaignsList = account ? userCampaigns(account) : [];
  
  // Calculate total funds raised from user campaigns
  const totalRaised = userCampaignsList.reduce((sum, campaign) => sum + campaign.currentAmount, 0);
  
  // Count active campaigns (deadline in the future)
  const activeCampaigns = userCampaignsList.filter(
    campaign => new Date(campaign.deadline) > new Date()
  ).length;
  
  // Count successful campaigns (reached goal)
  const successfulCampaigns = userCampaignsList.filter(
    campaign => campaign.currentAmount >= campaign.goalAmount
  ).length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your campaigns and track your funding progress
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Connected Wallet</p>
              <p className="font-medium truncate" title={account ?? 'No wallet connected'}>
                {account ? `${account.substring(0, 8)}…${account.substring(account.length - 6)}` : 'No wallet connected'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-blue-100 rounded-md">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Raised</p>
                  <p className="font-mono text-lg font-bold tabular-nums">{totalRaised.toLocaleString()} USDC</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-green-100 rounded-md">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Campaigns</p>
                  <p className="text-lg font-bold">{activeCampaigns}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-purple-100 rounded-md">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Successful Campaigns</p>
                  <p className="text-lg font-bold">{successfulCampaigns}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Your Campaigns</h2>
          <Link 
            to="/create" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Campaign
          </Link>
        </div>
        
        {!account ? (
          <div className="rounded-md border border-gray-200 bg-white p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">Connect your wallet</h3>
            <p className="mt-2 text-gray-600">Connect the creator wallet to view its campaigns on Arc.</p>
            <button onClick={() => void connectWallet()} className="mt-5 min-h-11 rounded-md bg-orange-700 px-4 py-2 font-medium text-white hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2">Connect wallet</button>
          </div>
        ) : chainId !== 5042 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-amber-900" role="status">Switch your wallet to Arc Mainnet to manage campaigns.</div>
        ) : userCampaignsList.length > 0 ? (
          <CampaignGrid campaigns={userCampaignsList} title="" />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <Wallet className="h-full w-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No campaigns yet</h3>
            <p className="mt-2 text-gray-500">
              You haven't created any campaigns yet. Start your first campaign to begin raising funds.
            </p>
            <div className="mt-6">
              <Link 
                to="/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Campaign
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;