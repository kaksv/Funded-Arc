import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import CampaignGrid from '../components/CampaignGrid';
import { Zap, Shield, Users, DollarSign } from 'lucide-react';
import Final from '../assets/Final.jpg'

const HomePage: React.FC = () => {
  const { campaigns } = useCampaigns();
  
  // Get featured campaigns (for this demo, we'll just use the most funded ones)
  const featuredCampaigns = [...campaigns]
    .sort((a, b) => b.currentAmount - a.currentAmount)
    .slice(0, 3);
  
  // Calculate platform stats
    const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.currentAmount, 0);
    const totalCampaigns = campaigns.filter((campaign) => campaign.status === 'Active').length;
  const totalContributors = new Set(
      campaigns.flatMap(campaign => campaign.contributors.map(contributor => contributor.address))
  ).size;
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Fund Your Dreams, Change The World
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-100">
                Funded is a decentralized crowdfunding platform that empowers creators and supports innovation through transparent, secure fundraising.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/create" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium bg-white text-blue-600 hover:bg-blue-50"
                >
                  Start a Campaign
                </Link>
                <a 
                  href="#featured" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-white rounded-md text-base font-medium text-white hover:bg-blue-700"
                >
                  Explore Campaigns
                </a>
              </div>
            </div>
            <div className="hidden md:block relative">
              <img 
                src={Final} 
                alt="People collaborating" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4">
                <p className="font-mono text-xl font-bold tabular-nums text-orange-800">{totalRaised.toLocaleString()} USDC</p>
                <p className="text-gray-600">Total Funds Raised</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-6 flex items-center">
              <div className="bg-blue-100 p-4 rounded-full mr-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalRaised.toLocaleString()} USDC</p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-gray-900">{totalRaised.toLocaleString()} USDC</p>
                <p className="text-gray-600">Total Funded</p>
                              Claim your funds once the campaign reaches its goal. Failed campaigns let supporters claim a full refund.
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 flex items-center">
              <div className="bg-blue-100 p-4 rounded-full mr-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
                <p className="text-gray-600">Active Campaigns</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 flex items-center">
              <div className="bg-blue-100 p-4 rounded-full mr-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalContributors}</p>
                <p className="text-gray-600">Contributors</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform makes crowdfunding simple, transparent, and secure through blockchain technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                1
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Create a Campaign</h3>
              <p className="text-gray-600">
                Set up your fundraising campaign with details, images, and funding goals in minutes.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                2
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Get Funded</h3>
              <p className="text-gray-600">
                Share your campaign and receive contributions directly to your smart contract.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                3
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Receive Funds</h3>
              <p className="text-gray-600">
                Once your goal is met, funds are automatically disbursed to your wallet. No waiting!
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              to="/create"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Start Your Campaign
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Campaigns Section */}
      <section id="featured" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Campaigns</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Discover innovative projects that are changing the world with the help of our community.
            </p>
          </div>
          
          <CampaignGrid campaigns={featuredCampaigns} showFilters={false} title="" />
          
          <div className="mt-12 text-center">
            <Link
              to="/campaigns"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              View All Campaigns
            </Link>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose Funded</h2>
            <p className="mt-4 text-lg text-blue-100 max-w-3xl mx-auto">
              Our platform offers unique advantages through blockchain technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Secure & Transparent</h3>
              <p className="text-blue-100">
                All transactions are recorded on the blockchain for complete transparency.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 mb-4">
                {/* <DollarSign className="h-8 w-8 text-white" /> */}
              </div>
              <h3 className="text-xl font-medium mb-2">Lower Fees</h3>
              <p className="text-blue-100">
                Only 5% platform fee, compared to 8-10% on traditional platforms.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Fast Disbursement</h3>
              <p className="text-blue-100">
                Receive funds automatically when your campaign reaches its goal.
                              Creators can claim a successful campaign after the goal is reached.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Global Community</h3>
              <p className="text-blue-100">
                Access contributors from around the world without currency limitations.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Launch Your Idea?</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Join thousands of creators who have successfully funded their projects on our platform. It takes just a few minutes to get started.
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create Your Campaign
                </Link>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 md:p-12 text-white">
                <h3 className="text-2xl font-bold mb-4">Successful Funding</h3>
                <div className="space-y-4">
                  <div className="bg-blue-600 bg-opacity-50 p-4 rounded-lg">
                    <p className="font-bold">73%</p>
                    <p>of campaigns reach their funding goal</p>
                  </div>
                  <div className="bg-blue-600 bg-opacity-50 p-4 rounded-lg">
                    <p className="font-bold">$10K+</p>
                    <p>average amount raised per successful campaign</p>
                  </div>
                  <div className="bg-blue-600 bg-opacity-50 p-4 rounded-lg">
                    <p className="font-bold">48 hours</p>
                    <p>average time to receive first contribution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;