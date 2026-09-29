import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
// import {UserButton} from '@civic/auth-web3/react'
import Img from '../pages/lg.png'

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { account, connectWallet, isConnecting, chainId, error, disconnectWallet, switchToArc } = useWallet();
  const location = useLocation();

  const handleConnectWallet = async () => connectWallet();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 text-blue-500">
              <img src={Img} alt="" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Funded</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/campaigns" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/campaigns') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Campaigns
              </Link>
              <Link 
                to="/create" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/create') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Campaign
              </Link>
              <Link 
                to="/dashboard" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/dashboard') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {account && <span className={`text-xs ${chainId === 5042 ? 'text-green-700' : 'text-red-700'}`}>{chainId === 5042 ? 'Arc Mainnet' : 'Switch to Arc'}</span>}
            <button 
              onClick={account ? chainId === 5042 ? disconnectWallet : () => void switchToArc() : handleConnectWallet}
              disabled={isConnecting}
              className={`ml-4 px-4 py-2 rounded-md ${
                account 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white font-medium transition duration-150 ease-in-out`}
            >
              {isConnecting ? 'Connecting...' : account 
                ? chainId === 5042 ? `${account.slice(0, 6)}…${account.slice(-4)} · Disconnect` : 'Switch to Arc'
                : 'Connect Wallet'
              }
            </button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {error && <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">{error}</p>}

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/campaigns" 
              onClick={() => setIsMenuOpen(false)}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/campaigns') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Campaigns
            </Link>
            <Link 
              to="/create" 
              onClick={() => setIsMenuOpen(false)}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/create') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Create Campaign
            </Link>
            <Link 
              to="/dashboard" 
              onClick={() => setIsMenuOpen(false)}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/dashboard') 
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Dashboard
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <input
                type="text"
                placeholder="Search campaigns..."
                className="py-1 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
              <Search className="absolute left-7 h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-3 px-2">
              <button 
                onClick={account ? chainId === 5042 ? disconnectWallet : () => void switchToArc() : handleConnectWallet}
                disabled={isConnecting}
                className={`w-full px-4 py-2 rounded-md ${
                  account 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white font-medium transition duration-150 ease-in-out`}
              >
                {isConnecting ? 'Connecting...' : account 
                  ? chainId === 5042 ? `${account.slice(0, 6)}…${account.slice(-4)} · Disconnect` : 'Switch to Arc'
                  : 'Connect Wallet'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;