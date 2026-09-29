import React, { useState } from 'react';
import { useCampaigns } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';
import { arc } from '../contexts/Fundedconfig';

interface ContributionFormProps {
  campaignId: string;
}

const ContributionForm: React.FC<ContributionFormProps> = ({ campaignId }) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { contributeToCampaign } = useCampaigns();
  const { account, chainId } = useWallet();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!account) return setError('Connect your wallet to contribute.');
    if (chainId !== arc.id) return setError('Switch your wallet to Arc Mainnet first.');
    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(amount) || Number(amount) <= 0) {
      return setError('Enter an amount greater than zero with up to 6 decimal places.');
    }

    setIsProcessing(true);
    try {
      await contributeToCampaign(campaignId, amount);
      setAmount('');
      setMessage('Contribution confirmed on Arc.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Contribution failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Support this campaign</h3>
      <label htmlFor="contribution-amount" className="mb-1 block text-sm font-medium text-gray-700">Amount (USDC)</label>
      <input
        id="contribution-amount"
        name="amount"
        type="number"
        min="0.000001"
        step="0.000001"
        inputMode="decimal"
        required
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        disabled={isProcessing}
        className="min-h-11 w-full rounded-md border border-gray-300 px-3 font-mono tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700"
      />
      <p className="mt-2 text-sm text-gray-600">No platform fee is charged on failed campaigns. Successful payouts include a 5% fee.</p>
      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
      {message && <p className="mt-3 text-sm text-green-800" role="status">{message}</p>}
      <button type="submit" disabled={isProcessing || !amount} className="mt-4 min-h-11 w-full rounded-md bg-orange-700 px-4 py-2 font-medium text-white hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
        {isProcessing ? 'Waiting for Arc confirmation…' : 'Contribute'}
      </button>
    </form>
  );
};

export default ContributionForm;