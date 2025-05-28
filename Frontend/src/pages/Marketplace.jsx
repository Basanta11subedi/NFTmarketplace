import { useState } from 'react';
import { request} from '@stacks/connect';
import { Cl, uintCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

export default function Marketplace() {
  const [tokenId, setTokenId] = useState('');
  const [price, setPrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [newprice, setNewprice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  const listnft = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!tokenId || !price || !expiry) {
        throw new Error('Please fill all required fields');
      }

      const response = await request('stx_callContract', {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
        functionName: 'list-nft',
        functionArgs: [
          uintCV(parseInt((tokenId))),
          uintCV(parseInt((price*1000000))),
          uintCV(parseInt((expiry))),
        ],
        network: 'testnet',
      });

    } catch (error) {
      setError(error.message || 'Failed to list NFT');
      console.error("Error listing NFT:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelListing = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!tokenId) {
        throw new Error('Please enter Token ID');
      }

      const response = await request('stx_callContract', {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
        functionName: 'cancle-listing',
        functionArgs: [uintCV(parseInt(tokenId))],
        network: 'testnet',
      });

    } catch (error) {
      setError(error.message || 'Failed to cancel listing');
      console.error("Error canceling:", error);
    } finally {
      setLoading(false);
    }
  };

  const buynft = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!tokenId) {
        throw new Error('Please enter Token ID');
      }

      const response = await request('stx_callContract', {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
        functionName: 'buy-nft',
        functionArgs: [uintCV(parseInt(tokenId))],
        network: 'testnet',
      });

    } catch (error) {
      setError(error.message || 'Failed to buy NFT');
      console.error("Error buying:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateListingprice = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!tokenId || !newprice) {
        throw new Error('Please fill all fields');
      }

      const response = await request('stx_callContract', {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
        functionName: 'update-listing-price',
        functionArgs: [
          uintCV(parseInt(tokenId)),
          uintCV(parseInt(newprice))
        ],
        network: 'testnet',
      });

    } catch (error) {
      setError(error.message || 'Failed to update price');
      console.error("Error update:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="h-10 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-4"></div>
          <h1 className="text-3xl font-bold text-white">NFT Marketplace</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-100 rounded-xl border border-red-700/50">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'list' 
                  ? 'text-white bg-gray-700/50 border-b-2 border-yellow-400' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              List NFT
            </button>
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'buy' 
                  ? 'text-white bg-gray-700/50 border-b-2 border-green-400' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              Buy NFT
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'manage' 
                  ? 'text-white bg-gray-700/50 border-b-2 border-purple-400' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              Manage Listing
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Token ID Field (Common for all tabs) */}
            <div className="mb-6">
              <label htmlFor="marketTokenId" className="block text-sm font-medium text-gray-300 mb-2">
                Token ID
              </label>
              <input
                type="number"
                id="marketTokenId"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all duration-200"
                placeholder="Enter Token ID"
              />
            </div>

            {/* List NFT Tab */}
            {activeTab === 'list' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                      Price (µSTX)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 pl-12 transition-all duration-200"
                        placeholder="1000000"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-sm">µSTX</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-300 mb-2">
                      Expiry Block
                    </label>
                    <input
                      type="number"
                      id="expiry"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all duration-200"
                      placeholder="25000"
                    />
                  </div>
                </div>

                <button
                  onClick={listnft}
                  disabled={loading || !tokenId || !price || !expiry}
                  className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:from-yellow-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Listing NFT...
                    </div>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      List NFT
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Buy NFT Tab */}
            {activeTab === 'buy' && (
              <div>
                <button
                  onClick={buynft}
                  disabled={loading || !tokenId}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Processing Purchase...
                    </div>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Buy NFT
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Manage Listing Tab */}
            {activeTab === 'manage' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={cancelListing}
                    disabled={loading || !tokenId}
                    className="py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Canceling...
                      </div>
                    ) : (
                      <>
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Cancel Listing
                      </>
                    )}
                  </button>

                  <div>
                    <label htmlFor="newprice" className="block text-sm font-medium text-gray-300 mb-2">
                      New Price (µSTX)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="newprice"
                        value={newprice}
                        onChange={(e) => setNewprice(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 pl-12 transition-all duration-200"
                        placeholder="New price"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-sm">µSTX</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={updateListingprice}
                  disabled={loading || !tokenId || !newprice}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update Price
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}