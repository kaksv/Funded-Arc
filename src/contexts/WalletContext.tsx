import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createWalletClient, custom, type Address, type JsonRpcAccount, type Transport, type WalletClient } from 'viem';
import { arc } from './Fundedconfig';

interface WalletContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  chainId: number | null;
  error: string;
  switchToArc: () => Promise<void>;
  getWalletClient: () => WalletClient<Transport, typeof arc, JsonRpcAccount>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('No browser wallet found. Install a wallet that supports Arc Mainnet.');
      return;
    }

    setIsConnecting(true);
    setError('');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0] ?? null);
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(Number(currentChainId));
      if (Number(currentChainId) !== arc.id) await switchToArc();
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Wallet connection failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToArc = async () => {
    const provider = window.ethereum;
    if (!provider) throw new Error('No browser wallet found.');

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13b2' }],
      });
    } catch (switchError) {
      if (typeof switchError === 'object' && switchError !== null && 'code' in switchError && switchError.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x13b2',
            chainName: 'Arc',
            nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
            rpcUrls: ['https://rpc.mainnet.arc.io'],
            blockExplorerUrls: ['https://explorer.arc.io'],
          }],
        });
      } else {
        throw switchError;
      }
    }

    setChainId(arc.id);
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
  };

  const getWalletClient = useCallback((): WalletClient<Transport, typeof arc, JsonRpcAccount> => {
    if (!window.ethereum || !account) throw new Error('Connect a wallet before submitting a transaction.');
    if (chainId !== arc.id) throw new Error('Switch your wallet to Arc Mainnet before submitting.');
    return createWalletClient({ chain: arc, account: { address: account as Address, type: 'json-rpc' }, transport: custom(window.ethereum) });
  }, [account, chainId]);

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;

    const onAccountsChanged = (accounts: Address[]) => setAccount(accounts[0] ?? null);
    const onChainChanged = (changedChainId: string) => setChainId(Number(changedChainId));
    provider.on('accountsChanged', onAccountsChanged);
    provider.on('chainChanged', onChainChanged);
    void provider.request({ method: 'eth_accounts' }).then((accounts) => setAccount(accounts[0] ?? null)).catch(() => undefined);
    void provider.request({ method: 'eth_chainId' }).then((currentChainId) => setChainId(Number(currentChainId))).catch(() => undefined);

    return () => {
      provider.removeListener('accountsChanged', onAccountsChanged);
      provider.removeListener('chainChanged', onChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider value={{
      account,
      connectWallet,
      disconnectWallet,
      isConnecting,
      chainId,
      error,
      switchToArc,
      getWalletClient,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};