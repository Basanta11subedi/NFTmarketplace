
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchContractMapEntry, uintCV, principalCV ,fetchCallReadOnlyFunction} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { getLocalStorage } from '@stacks/connect';

export default function Profile() {
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
   const [dataFetched, setDataFetched] = useState(false);

  // Your Pinata gateway
  const PINATA_GATEWAY = 'https://pink-decent-badger-499.mypinata.cloud/ipfs/';

  useEffect(() => {
    const storage = getLocalStorage();
    const address = storage?.addresses?.stx?.[0]?.address;
    if (address) setWalletAddress(address);
  }, []);

  useEffect(() => {
    if (walletAddress) fetchOwnedNFTs();
  }, [walletAddress]);

  
  const fetchOwnedNFTs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First we need to find all token IDs owned by this user
      // Since we can't directly query by owner, we'll need to:
      // 1. Find the last token ID (from the data-var)
      // 2. Check each token ID to see if owned by this user
      
      const lastTokenIdResponse =  {
        contractAddress: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX',
        contractName: 'SimpleNFT',
        functionName: 'get-last-token-id',
        functionArgs: [],
        network: STACKS_TESTNET,
        senderAddress: walletAddress,
      };
      const result = await fetchCallReadOnlyFunction(lastTokenIdResponse);
      const lastTokenId = parseInt(result.value.value);
      console.log("last token id is:", lastTokenId);
      
      // Step 2: Check each token ID for ownership
      const nfts = [];
      for (let tokenId = 1; tokenId <= lastTokenId; tokenId++) {
        try {
          // Check ownership from token-owners map
          const ownerresponse = {
            contractAddress: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX',
            contractName: 'SimpleNFT',
            mapName: 'token-owners',
            mapKey: uintCV(parseInt(tokenId)),
            network: STACKS_TESTNET,
             senderAddress: walletAddress,
          };
          const owner = await fetchContractMapEntry(ownerresponse);
          console.log("owner is :", owner);

          if (owner && owner.type === 'some' && 
              owner.value.value === walletAddress) {
            const cidEntryResponse = {
              contractAddress: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX',
              contractName: 'SimpleNFT',
              mapName: 'token-uris',
              mapKey: uintCV(parseInt(tokenId)),
              network: STACKS_TESTNET
            };

            const cidEntry = await fetchContractMapEntry(cidEntryResponse);
            console.log("the cid entry is :", cidEntry);

            if (cidEntry) {
              const cid = cidEntry.value.value;
              const imageUrl = `${PINATA_GATEWAY}${cid}`;

              nfts.push({
                id: tokenId,
                cid,
                imageUrl
              });
            }
          }
        } catch (err) {
          console.error(`Error checking NFT ${tokenId}:`, err);
        }
      }
      
      setOwnedNFTs(nfts);
    } catch (err) {
      setError('Failed to load NFTs. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="h-10 w-1 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full mr-4"></div>
        <h1 className="text-3xl font-bold text-white">Your NFT Collection</h1>
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
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-4 text-gray-300">Loading your NFTs...</span>
        </div>
      ) : ownedNFTs.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center border border-gray-700">
          <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">No NFTs found</h3>
          <p className="mt-2 text-gray-400">You don't own any NFTs yet. Mint one to get started!</p>
          <div className="mt-6">
            <Link 
              to="/mint" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Mint NFT
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-400">
            Showing {ownedNFTs.length} NFTs for address: <span className="font-mono text-sm">{walletAddress}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedNFTs.map((nft) => (
              <div key={nft.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors group">
                <div className="relative aspect-square bg-gray-700">
                  <img
                    src={nft.imageUrl}
                    alt={`NFT #${nft.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x600?text=Image+Not+Found';
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">NFT #{nft.id}</h3>
                      <p className="text-xs text-gray-600 mt-1 truncate">CID: {nft.cid}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200">
                      Owned
                    </span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/transfer?tokenId=${nft.id}`}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                    >
                      Transfer
                    </Link>
                    <Link
                      to={`/marketplace?tokenId=${nft.id}`}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                    >
                      Sell
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}