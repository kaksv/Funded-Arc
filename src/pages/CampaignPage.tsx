import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import ContributionForm from '../components/ContributionForm';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, Users, AlertCircle, Check, CircleDollarSign } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { arc } from '../contexts/Fundedconfig';

const CampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { campaigns, isLoading, error: loadError, finalizeCampaign, withdrawCampaignFunds, claimRefund, getUserContribution } = useCampaigns();
  const { account, chainId } = useWallet();
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const campaign = campaigns.find((item) => item.id === id);
  
  if (isLoading && !campaign) {
    return <div className="mx-auto max-w-7xl px-4 py-12" role="status">Loading campaign from Arc…</div>;
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Campaign not found</h3>
              <p className="mt-2 text-sm text-yellow-700">
                The campaign you're looking for doesn't exist or has been removed.
              </p>
              <div className="mt-4">
                <Link to="/" className="text-sm font-medium text-yellow-800 hover:text-yellow-700">
                  Go back to homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const progressPercentage = Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100);
  const daysLeft = Math.max(
    Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    0
  );
  
  const isSuccessful = campaign.status === 'Successful' || campaign.status === 'Withdrawn';
  const hasEnded = campaign.status !== 'Active' || daysLeft === 0;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          &larr; Back to campaigns
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/3">
            <img 
              src={campaign.imageUrl} 
              alt={campaign.title} 
              className="h-64 w-full object-cover md:h-96"
            />
          </div>
          
          <div className="md:w-1/3 p-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {campaign.category}
              </span>
              
              {hasEnded ? (
                isSuccessful ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Check className="mr-1 h-4 w-4" />
                    Successful
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    Ended
                  </span>
                )
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="mr-1 h-4 w-4" />
                  Active
                </span>
              )}
            </div>
            
            <div className="mt-8">
              <p className="font-mono text-2xl font-bold tabular-nums text-gray-900">
                {campaign.currentAmount.toLocaleString()} USDC
              </p>
              <p className="text-sm text-gray-500">
                raised of {campaign.goalAmount.toLocaleString()} USDC goal
              </p>
              
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between mt-4 text-gray-500 text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{campaign.contributorCount} contributors</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {daysLeft > 0 
                      ? `${daysLeft} days left` 
                      : 'Campaign ended'
                    }
                  </span>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                Campaign ends on {format(new Date(campaign.deadline), 'PPP')}
              </div>
            </div>
            
            <div className="mt-8">
              {campaign.status === 'Active' && !hasEnded && <ContributionForm campaignId={campaign.id} />}

              {campaign.status === 'Active' && hasEnded && (
                <div className={`p-4 rounded-md ${isSuccessful ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <p className="font-medium text-gray-800">The deadline has passed. Finalize this campaign to enable payout or refunds.</p>
                  <button disabled={!account || chainId !== arc.id || isProcessing} onClick={async () => {
                    setIsProcessing(true); setActionError(''); setActionMessage('');
                    try { await finalizeCampaign(campaign.id); setActionMessage('Campaign finalized on Arc.'); }
                    catch (finalizeError) { setActionError(finalizeError instanceof Error ? finalizeError.message : 'Could not finalize campaign.'); }
                    finally { setIsProcessing(false); }
                  }} className="mt-3 min-h-11 rounded-md bg-orange-700 px-4 py-2 font-medium text-white hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2 disabled:opacity-60">{isProcessing ? 'Waiting for confirmation…' : 'Finalize campaign'}</button>
                </div>
              )}

              {campaign.status === 'Successful' && account?.toLowerCase() === campaign.creator.toLowerCase() && (
                <button disabled={chainId !== arc.id || isProcessing} onClick={async () => {
                  setIsProcessing(true); setActionError(''); setActionMessage('');
                  try { await withdrawCampaignFunds(campaign.id, account); setActionMessage('Payout confirmed on Arc.'); }
                  catch (withdrawError) { setActionError(withdrawError instanceof Error ? withdrawError.message : 'Could not withdraw campaign funds.'); }
                  finally { setIsProcessing(false); }
                }} className="min-h-11 w-full rounded-md bg-orange-700 px-4 py-2 font-medium text-white hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2 disabled:opacity-60">{isProcessing ? 'Waiting for confirmation…' : 'Withdraw campaign funds'}</button>
              )}

              {campaign.status === 'Failed' && account && (
                <button disabled={chainId !== arc.id || isProcessing} onClick={async () => {
                  setIsProcessing(true); setActionError(''); setActionMessage('');
                  try {
                    const amount = await getUserContribution(campaign.id, account);
                    if (amount === 0n) throw new Error('This wallet has no contribution to refund.');
                    await claimRefund(campaign.id, account); setActionMessage('Refund confirmed on Arc.');
                  } catch (refundError) { setActionError(refundError instanceof Error ? refundError.message : 'Could not claim refund.'); }
                  finally { setIsProcessing(false); }
                }} className="min-h-11 w-full rounded-md bg-orange-700 px-4 py-2 font-medium text-white hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2 disabled:opacity-60">{isProcessing ? 'Waiting for confirmation…' : 'Claim full refund'}</button>
              )}

              {(actionError || loadError) && <p className="mt-3 text-sm text-red-700" role="alert">{actionError || loadError}</p>}
              {actionMessage && <p className="mt-3 text-sm text-green-800" role="status">{actionMessage}</p>}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
            <p className="text-gray-600">By {campaign.creatorName}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">About This Campaign</h2>
              <div className="prose max-w-none">
                {campaign.longDescription.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-gray-700">{paragraph}</p>
                ))}
              </div>
              
              {isSuccessful && (
                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CircleDollarSign className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Successful Campaign</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          {campaign.status === 'Withdrawn'
                            ? 'The creator has claimed the funds after the 5% platform fee.'
                            : 'The creator can claim the funds after the 5% platform fee.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Campaign Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(campaign.createdAt))} ago
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Creator</p>
                    <p className="font-medium truncate" title={campaign.creator}>
                      {campaign.creator.substr(0, 8)}...{campaign.creator.substr(-6)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Platform Fee</p>
                    <p className="font-medium">5% of funds raised</p>
                  </div>
                  
                  {campaign.contributors.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Top Contributors</p>
                      <ul className="space-y-2">
                        {[...campaign.contributors]
                          .sort((a, b) => b.amount - a.amount)
                          .slice(0, 3)
                          .map((contributor, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span className="text-sm truncate" title={contributor.address}>
                                {contributor.address.substr(0, 6)}...{contributor.address.substr(-4)}
                              </span>
                              <span className="font-mono font-medium tabular-nums">{contributor.amount.toLocaleString()} USDC</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPage;