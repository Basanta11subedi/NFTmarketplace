import { useState, useEffect } from 'react';
import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { stringCV } from '@stacks/transactions';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [deployStatus, setDeployStatus] = useState('');

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = isConnected();
      setIsWalletConnected(connected);
      
      if (connected) {
        const storage = getLocalStorage();
        if (storage?.addresses?.stx?.[0]?.address) {
          setWalletAddress(storage.addresses.stx[0].address);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Function to connect wallet
  const handleConnectWallet = async () => {
    try {
      await connect();
      setIsWalletConnected(true);
      
      // Get the wallet address from local storage
      const storage = getLocalStorage();
      if (storage?.addresses?.stx?.[0]?.address) {
        setWalletAddress(storage.addresses.stx[0].address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Function to disconnect wallet
  const handleDisconnectWallet = () => {
    disconnect();
    setIsWalletConnected(false);
    setWalletAddress('');
  };

  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Stacks Wallet Connection</h1>
        
        {/* Wallet Connection Section */}
        <div className="mb-8">
          {!isWalletConnected ? (
            <button
              onClick={handleConnectWallet}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-500">Wallet Address:</p>
                <p className="font-mono text-sm break-all">{walletAddress}</p>
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;