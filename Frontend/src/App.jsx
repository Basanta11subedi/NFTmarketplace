import { useState, useEffect } from 'react';
import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { Cl, principalCV, stringAsciiCV, uintCV } from '@stacks/transactions';
import axios from 'axios';


function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [price, setPrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [newprice, setNewprice] = useState('');
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


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

   // Handle image preview
  useEffect(() => {
    if (!selectedFile) {
      setPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Combined mint function with IPFS upload
  const handleMint = async () => {
    try {
      setError('');
      setLoading(true);

      if (!selectedFile) {
        throw new Error('Please select an image first');
      }

      // Upload to IPFS
      const formData = new FormData();
      formData.append('file', selectedFile);

      const ipfsRes = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
            pinata_secret_api_key: import.meta.env.VITE_PINATA_API_SECRET,
          },
        }
      );
       console.log("[DEBUG] Pinata Response:", ipfsRes.data); 
      console.log("[DEBUG] IPFS Hash (Raw):", ipfsRes.data.IpfsHash); 
      

      const ipfsHash = ipfsRes.data.IpfsHash;
      console.log("[DEBUG] Full IPFS URI:", ipfsHash); 

      // Mint NFT with IPFS hash
      const response = await request('stx_callContract', {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.SimpleNFT',
        functionName: 'mint',
        functionArgs: [Cl.stringAscii(ipfsHash)],
        network: 'testnet',
      });

    } catch (err) {
      setError(err.message || 'Failed to mint NFT');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const transfer = async() => {
    try {
      const response = await request('stx_callContract' , {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.SimpleNFT',
        functionName: 'transfer',
        functionArgs: [
          uintCV(parseInt(tokenId)),
          principalCV(walletAddress),
          principalCV(recipientAddress),
        ],
        network: 'testnet',
      });
    } catch (error) {
      console.error("Error transferring:", error);
    }
  };

  const checkOwnership = async () => {
  try {
    const response = await request({
      contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.SimpleNFT',
      functionName: 'get-owner',
      functionArgs: [uintCV(parseInt(tokenId))],
      network: 'testnet',
    });
    
    if (response.result === `(some ${walletAddress})`) {
      console.log('You own this NFT');
    }
    } catch (error) {
     console.error("Ownership check failed:", error);
   }
  };

  const listnft = async() => {
    try {
      const response = await request('stx_callContract' , {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
        functionName: 'list-nft',
        functionArgs: [
          uintCV(parseInt(tokenId)),
          uintCV(parseInt(price)),
          uintCV(parseInt(expiry)),
        ],
        network: 'testnet',
      });
    } catch (error) {
      console.error("Error listing NFT:", error);
    }
  };

  const cancelListing = async() => {
    try {
      const response = await request('stx_callContract' , {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
        functionName: 'cancle-listing',
        functionArgs: [
          uintCV(parseInt(tokenId))
        ],
        network: 'testnet',
      
      });
    } catch (error) {
      console.error("Error canceling:", error);
    }
  };

  const buynft = async() => {
    try {
      const response = await request('stx_callContract' , {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
        functionName: 'buy-nft',
        functionArgs: [
          uintCV(parseInt(tokenId))
        ],
        network: 'testnet',
      
      });
    } catch (error) {
      console.error("Error buying:", error);
    }
  };

  const updateListingprice = async() => {
    try {
      const response = await request('stx_callContract' , {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
        functionName: 'update-listing-price',
        functionArgs: [
          uintCV(parseInt(tokenId)),
          uintCV(parseInt(newprice))
        ],
        network: 'testnet',
      
      });
    } catch (error) {
      console.error("Error update:", error);
    }
  };


   return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">NFT Marketplace</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-8">
          {!isWalletConnected ? (
            <button
              onClick={handleConnectWallet}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NFT Image
              </label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                {preview ? (
                  <img
                    src={preview}
                    alt="NFT preview"
                    className="mb-4 max-h-48 object-cover rounded-lg"
                  />
                ) : (
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                  accept="image/*"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                >
                  {selectedFile ? 'Change Image' : 'Upload Image'}
                </label>
              </div>
            </div>

            <button
              onClick={handleMint}
              disabled={!selectedFile || loading}
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Minting...' : 'Mint NFT'}
            </button>

            {mintedTokenId && (
              <div className="mt-2 p-2 bg-green-100 rounded-lg">
                <p className="text-sm text-green-700 text-center">
                  Successfully minted NFT! Token ID: {mintedTokenId}
                </p>
              </div>
            )}
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
               {/* Marketplace Section */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Marketplace Actions</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="marketTokenId" className="block text-sm font-medium text-gray-700 mb-2">
                      Token ID
                    </label>
                    <input
                      type="number"
                      id="marketTokenId"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter Token ID"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Price (µSTX)
                      </label>
                      <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Listing price"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Block
                      </label>
                      <input
                        type="number"
                        id="expiry"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Block height"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newprice" className="block text-sm font-medium text-gray-700 mb-2">
                      New Price (µSTX)
                    </label>
                    <input
                      type="number"
                      id="newprice"
                      value={newprice}
                      onChange={(e) => setNewprice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Updated price"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={listnft}
                      className="py-2 px-4 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      List NFT
                    </button>
                    <button
                      onClick={cancelListing}
                      className="py-2 px-4 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      Cancel Listing
                    </button>
                    <button
                      onClick={buynft}
                      className="py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Buy NFT
                    </button>
                    <button
                      onClick={updateListingprice}
                      className="py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      Update Price
                    </button>
                  </div>
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