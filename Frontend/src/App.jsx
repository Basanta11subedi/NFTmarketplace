import { useState, useEffect } from 'react';
import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { principalCV, stringAsciiCV, uintCV, someCV, noneCV } from '@stacks/transactions';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [nftMetadata, setNftMetadata] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');


  // Check wallet and deployment status on component mount
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

  // Connect wallet
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

  // Disconnect wallet
  const handleDisconnectWallet = () => {
    disconnect();
    setIsWalletConnected(false);
    setWalletAddress('');
  };

  const mint = async() => {
    try {
      const response = await request('stx_callContract' , {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.SimpleNFT',
        functionName: 'mint',
        functionArgs: [stringAsciiCV(nftMetadata)],
        network: 'testnet',
      });
    } catch (error){
      console.error("Error minting:" , error);
    }
  }

  const transfer = async() => {
    try {
      const response = await request('stx_callContract' , {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.SimpleNFT',
        functionName: 'transfer',
        functionArgs: [
          uintCV(parseInt(tokenId)),
          principalCV(address),
          principalCV(address),
        ],
        network: 'testnet',
      });
    } catch (error){
      console.error("Error transferring: " , error);
    }
  }


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Stacks Wallet Connection</h1>

        {/* Wallet Section */}
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

              {/* Mint Section */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Mint NFT</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-2">
                      NFT Metadata
                    </label>
                    <input
                      type="text"
                      id="metadata"
                      value={nftMetadata}
                      onChange={(e) => setNftMetadata(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter NFT metadata"
                    />
                  </div>
                  <button
                    onClick={mint}
                    className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Mint NFT
                  </button>
                </div>
              </div>
              {/* Transfer Section */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Transfer NFT</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
                      Token ID
                    </label>
                    <input
                      type="number"
                      id="tokenId"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter Token ID"
                    />
                  </div>
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      id="recipient"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter Recipient Address"
                    />
                  </div>
                  <button
                    onClick={transfer}
                    className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Transfer NFT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;