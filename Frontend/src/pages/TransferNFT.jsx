import { useState } from 'react';
import { request } from '@stacks/connect';
import { Cl, principalCV, uintCV } from '@stacks/transactions';

export default function TransferNFT() {
  const [tokenId, setTokenId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const transfer = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!tokenId || !recipientAddress) {
        throw new Error('Please fill all fields');
      }

      const response = await request('stx_callContract', {
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
      setError(error.message || 'Failed to transfer NFT');
      console.error("Error transferring:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <div className="h-10 w-1 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full mr-4"></div>
        <h1 className="text-3xl font-bold text-white">Transfer NFT</h1>
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

      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
        <div className="space-y-6">
          <div>
            <label htmlFor="tokenId" className="block text-sm font-medium text-gray-300 mb-2">
              Token ID
            </label>
            <input
              type="number"
              id="tokenId"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
              placeholder="Enter Token ID"
            />
          </div>
          
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
              placeholder="Enter Recipient STX Address"
            />
          </div>

          <button
            onClick={transfer}
            disabled={loading || !tokenId || !recipientAddress}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Transferring...
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transfer NFT
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}