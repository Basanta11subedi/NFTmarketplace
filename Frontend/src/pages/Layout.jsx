import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';

export default function Layout() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
     const checkConnection = async () => {
       const connected = isConnected();
       setIsWalletConnected(connected);

      if (connected) {
        const storage = getLocalStorage();
         const address = storage?.addresses?.stx?.[0]?.address;
         if (address) {
          setWalletAddress(address);
        }
       }
    };

     checkConnection();
   }, []);

  const handleConnectWallet = async () => {
    try {
      await connect();
      setIsWalletConnected(true);
      const storage = getLocalStorage();
      const address = storage?.addresses?.stx?.[0]?.address;
      if (address) {
        setWalletAddress(address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setIsWalletConnected(false);
    setWalletAddress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            NFT Marketplace
          </Link>
          
          <div className="flex items-center space-x-4">
            {isWalletConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block px-3 py-1 bg-gray-700 rounded-lg text-sm text-gray-200 font-mono truncate max-w-xs">
                  {walletAddress}
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center"
                >
                  <span className="hidden sm:inline mr-1">Disconnect</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all flex items-center"
              >
                <span className="hidden sm:inline mr-1">Connect Wallet</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto px-4 flex space-x-1">
          <Link 
            to="/" 
            className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors font-medium"
          >
            Marketplace
          </Link>
          <Link 
            to="/mint" 
            className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors font-medium"
          >
            Mint
          </Link>
          <Link 
            to="/transfer" 
            className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors font-medium"
          >
            Transfer 
          </Link>
          <Link 
             to="/profile" 
            className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors font-medium"
            >
             Profile
            </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/80 border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} NFT Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}