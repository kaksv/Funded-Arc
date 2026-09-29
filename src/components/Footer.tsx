import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Twitter, Facebook, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">Funded</span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">
              Empowering creators through decentralized crowdfunding. Our platform helps innovators raise funds and bring their ideas to life.
            </p>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/" className="text-base text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/create" className="text-base text-gray-300 hover:text-white">Create Campaign</Link></li>
              <li><Link to="/dashboard" className="text-base text-gray-300 hover:text-white">Dashboard</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">FAQ</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">How it Works</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Fees</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Support</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
            <div className="flex space-x-6 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Mail className="h-6 w-6" />
              </a>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              Subscribe to our newsletter for updates
            </p>
            <div className="mt-2 flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-3 py-2 placeholder-gray-500 text-gray-900 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button 
                type="button" 
                className="bg-blue-500 px-4 py-2 border border-transparent rounded-r-md font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-base text-gray-400 md:mt-0">
            &copy; {new Date().getFullYear()} Funded. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-400 hover:text-white mr-4">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white mr-4">Terms of Service</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">Legal</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;