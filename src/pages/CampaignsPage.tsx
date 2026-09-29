import React from 'react';
import { useCampaigns } from '../contexts/CampaignContext';
import CampaignGrid from '../components/CampaignGrid';

const CampaignsPage: React.FC = () => {
  const { campaigns } = useCampaigns();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Campaigns</h1>
      <CampaignGrid campaigns={campaigns} />
    </div>
  );
};

export default CampaignsPage;