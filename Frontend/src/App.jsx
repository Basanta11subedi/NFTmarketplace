
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Marketplace from './pages/Marketplace';
import MintNFT from './pages/MintNFT';
import TransferNFT from './pages/TransferNFT';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Marketplace />} />
        <Route path="mint" element={<MintNFT />} />
        <Route path="transfer" element={<TransferNFT />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;





// import { useState, useEffect } from 'react';
// import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
// import { Cl, principalCV, stringAsciiCV, uintCV, fetchCallReadOnlyFunction } from '@stacks/transactions';
// import axios from 'axios';
// import { STACKS_TESTNET } from '@stacks/network';

// function App() {
//   const [walletAddress, setWalletAddress] = useState('');
//   const [isWalletConnected, setIsWalletConnected] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [preview, setPreview] = useState('');
//   const [ipfsHash, setIpfsHash] = useState('');
//   const [tokenId, setTokenId] = useState('');
//   const [recipientAddress, setRecipientAddress] = useState('');
//   const [price, setPrice] = useState('');
//   const [expiry, setExpiry] = useState('');
//   const [newprice, setNewprice] = useState('');
//   const [mintedTokenId, setMintedTokenId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');


//   // Check wallet and deployment status on component mount
//   useEffect(() => {
//     const checkConnection = async () => {
//       const connected = isConnected();
//       setIsWalletConnected(connected);

//       if (connected) {
//         const storage = getLocalStorage();
//         const address = storage?.addresses?.stx?.[0]?.address;
//         if (address) {
//           setWalletAddress(address);
//         }
//       }
//     };

//     checkConnection();
//   }, []);

//   // Connect wallet
//   const handleConnectWallet = async () => {
//     try {
//       await connect();
//       setIsWalletConnected(true);

//       const storage = getLocalStorage();
//       const address = storage?.addresses?.stx?.[0]?.address;
//       if (address) {
//         setWalletAddress(address);
//       }
//     } catch (error) {
//       console.error('Error connecting wallet:', error);
//     }
//   };

//   // Disconnect wallet
//   const handleDisconnectWallet = () => {
//     disconnect();
//     setIsWalletConnected(false);
//     setWalletAddress('');
//   };

//    // Handle image preview
//   useEffect(() => {
//     if (!selectedFile) {
//       setPreview('');
//       return;
//     }

//     const objectUrl = URL.createObjectURL(selectedFile);
//     setPreview(objectUrl);

//     return () => URL.revokeObjectURL(objectUrl);
//   }, [selectedFile]);

//   // Combined mint function with IPFS upload
//   const handleMint = async () => {
//     try {
//       setError('');
//       setLoading(true);

//       if (!selectedFile) {
//         throw new Error('Please select an image first');
//       }

//       // Upload to IPFS
//       const formData = new FormData();
//       formData.append('file', selectedFile);

//       const ipfsRes = await axios.post(
//         'https://api.pinata.cloud/pinning/pinFileToIPFS',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
//             pinata_secret_api_key: import.meta.env.VITE_PINATA_API_SECRET,
//           },
//         }
//       );
//        console.log("[DEBUG] Pinata Response:", ipfsRes.data); 
//       console.log("[DEBUG] IPFS Hash (Raw):", ipfsRes.data.IpfsHash); 
      

//       const ipfsHash = ipfsRes.data.IpfsHash;
//       console.log("[DEBUG] Full IPFS URI:", ipfsHash); 

//       // Mint NFT with IPFS hash
//       const response = await request('stx_callContract', {
//         contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.SimpleNFT',
//         functionName: 'mint',
//         functionArgs: [Cl.stringAscii(ipfsHash)],
//         network: 'testnet',
//       });

//     } catch (err) {
//       setError(err.message || 'Failed to mint NFT');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const transfer = async() => {
//     try {
//       const response = await request('stx_callContract' , {
//         contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.SimpleNFT',
//         functionName: 'transfer',
//         functionArgs: [
//           uintCV(parseInt(tokenId)),
//           principalCV(walletAddress),
//           principalCV(recipientAddress),
//         ],
//         network: 'testnet',
//       });
//     } catch (error) {
//       console.error("Error transferring:", error);
//     }
//   };

//   const checkOwnership = async () => {
//   try {
//     const response = await request({
//       contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.SimpleNFT',
//       functionName: 'get-owner',
//       functionArgs: [uintCV(parseInt(tokenId))],
//       network: 'testnet',
//     });
    
//     if (response.result === `(some ${walletAddress})`) {
//       console.log('You own this NFT');
//     }
//     } catch (error) {
//      console.error("Ownership check failed:", error);
//    }
//   };

//   const listnft = async() => {
//     try {
//       const response = await request('stx_callContract' , {
//         contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
//         functionName: 'list-nft',
//         functionArgs: [
//           uintCV(parseInt(tokenId)),
//           uintCV(parseInt(price)),
//           uintCV(parseInt(expiry)),
//         ],
//         network: 'testnet',
//       });
//     } catch (error) {
//       console.error("Error listing NFT:", error);
//     }
//   };

//   const cancelListing = async() => {
//     try {
//       const response = await request('stx_callContract' , {
//         contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
//         functionName: 'cancle-listing',
//         functionArgs: [
//           uintCV(parseInt(tokenId))
//         ],
//         network: 'testnet',
      
//       });
//     } catch (error) {
//       console.error("Error canceling:", error);
//     }
//   };

//   const buynft = async() => {
//     try {
//       const response = await request('stx_callContract' , {
//         contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
//         functionName: 'buy-nft',
//         functionArgs: [
//           uintCV(parseInt(tokenId))
//         ],
//         network: 'testnet',
      
//       });
//     } catch (error) {
//       console.error("Error buying:", error);
//     }
//   };

//   const updateListingprice = async() => {
//     try {
//       const response = await request('stx_callContract' , {
//         contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketPlace',
//         functionName: 'update-listing-price',
//         functionArgs: [
//           uintCV(parseInt(tokenId)),
//           uintCV(parseInt(newprice))
//         ],
//         network: 'testnet',
      
//       });
//     } catch (error) {
//       console.error("Error update:", error);
//     }
//   };

//   const getlasttokenid = async() => {

//       const options = {
//       contractAddress:'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX' ,
//       contractName: 'SimpleNFT' ,
//       functionName: 'get-last-token-id',
//       functionArgs: [],
//       network: STACKS_TESTNET,
//       senderAddress: walletAddress,
//       };
//     const result = await fetchCallReadOnlyFunction(options);
//     console.log(result);
//   };

//   const gettokenuri = async() => {

//       const options = {
//       contractAddress:'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX' ,
//       contractName: 'SimpleNFT' ,
//       functionName: 'get-token-uri',
//       functionArgs: [Cl.uint(3)],
//       network: STACKS_TESTNET,
//       senderAddress: walletAddress,
//       };
//     const result = await fetchCallReadOnlyFunction(options);
//     console.log(result);
//   };

//    const gettotalsupply = async() => {

//       const options = {
//       contractAddress:'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX' ,
//       contractName: 'SimpleNFT' ,
//       functionName: 'get-total-supply',
//       functionArgs: [],
//       network: STACKS_TESTNET,
//       senderAddress: walletAddress,
//       };
//     const result = await fetchCallReadOnlyFunction(options);
//     console.log(result);
//   };


 


//    return (
//   <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center py-12 px-4">
//     <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-90">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
//           NFT Marketplace
//         </h1>
//         {isWalletConnected && (
//           <div className="flex items-center space-x-2">
//             <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
//             <span className="text-sm text-gray-300">Connected</span>
//           </div>
//         )}
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-900/50 text-red-100 rounded-xl border border-red-700/50">
//           <div className="flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <span>{error}</span>
//           </div>
//         </div>
//       )}

//       <div className="mb-8">
//         {!isWalletConnected ? (
//           <button
//             onClick={handleConnectWallet}
//             disabled={loading}
//             className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition-all duration-200 transform hover:-translate-y-0.5"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center space-x-2">
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 <span>Connecting...</span>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center space-x-2">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//                 <span>Connect Wallet</span>
//               </div>
//             )}
//           </button>
//         ) : (
//           <div className="space-y-8">
//             <div className="border border-gray-700 rounded-xl p-6 bg-gray-700/30 backdrop-blur-sm">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-100">Wallet Info</h2>
//                 <button
//                   onClick={handleDisconnectWallet}
//                   className="py-1 px-3 bg-red-600/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-600/30 transition-colors flex items-center"
//                 >
//                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                   </svg>
//                   Disconnect
//                 </button>
//               </div>
//               <div className="p-4 bg-gray-800 rounded-lg">
//                 <p className="text-xs text-gray-400 mb-1">Wallet Address:</p>
//                 <p className="font-mono text-sm text-blue-300 break-all">{walletAddress}</p>
//               </div>
//             </div>

//             {/* Mint Section */}
//             <div className="pt-6 border-t border-gray-700">
//               <div className="flex items-center mb-6">
//                 <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full mr-3"></div>
//                 <h2 className="text-xl font-semibold text-gray-100">Mint NFT</h2>
//               </div>
              
//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-3">
//                     NFT Image
//                   </label>
//                   <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-gray-500 transition-colors bg-gray-700/20">
//                     {preview ? (
//                       <div className="relative group">
//                         <img
//                           src={preview}
//                           alt="NFT preview"
//                           className="mb-4 max-h-64 w-full object-cover rounded-lg shadow-lg group-hover:opacity-90 transition-opacity"
//                         />
//                         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
//                           <svg className="w-10 h-10 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                           </svg>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="text-center">
//                         <svg
//                           className="mx-auto h-16 w-16 text-gray-500"
//                           stroke="currentColor"
//                           fill="none"
//                           viewBox="0 0 48 48"
//                         >
//                           <path
//                             d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                         <p className="mt-2 text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
//                       </div>
//                     )}
//                     <input
//                       type="file"
//                       onChange={(e) => setSelectedFile(e.target.files[0])}
//                       className="hidden"
//                       id="file-upload"
//                       accept="image/*"
//                     />
//                     <label
//                       htmlFor="file-upload"
//                       className="mt-4 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-medium transition-colors flex items-center"
//                     >
//                       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                       </svg>
//                       {selectedFile ? 'Change Image' : 'Select Image'}
//                     </label>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <button
//                     onClick={handleMint}
//                     disabled={!selectedFile || loading}
//                     className="py-3 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
//                   >
//                     {loading ? (
//                       <div className="flex items-center">
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                         Minting...
//                       </div>
//                     ) : (
//                       <>
//                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                         </svg>
//                         Mint NFT
//                       </>
//                     )}
//                   </button>

//                   <button
//                     onClick={getlasttokenid}
//                     className="py-3 px-6 bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium rounded-xl transition-colors flex items-center justify-center"
//                   >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Last Token ID
//                   </button>

//                   <button
//                     onClick={gettotalsupply}
//                     className="py-3 px-6 bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium rounded-xl transition-colors flex items-center justify-center"
//                   >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                     </svg>
//                     Total Supply
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Transfer Section */}
//             <div className="pt-6 border-t border-gray-700">
//               <div className="flex items-center mb-6">
//                 <div className="h-8 w-1 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full mr-3"></div>
//                 <h2 className="text-xl font-semibold text-gray-100">Transfer NFT</h2>
//               </div>
              
//               <div className="space-y-4">
//                 <div>
//                   <label htmlFor="tokenId" className="block text-sm font-medium text-gray-300 mb-2">
//                     Token ID
//                   </label>
//                   <input
//                     type="number"
//                     id="tokenId"
//                     value={tokenId}
//                     onChange={(e) => setTokenId(e.target.value)}
//                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-400"
//                     placeholder="Enter Token ID"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="recipient" className="block text-sm font-medium text-gray-300 mb-2">
//                     Recipient Address
//                   </label>
//                   <input
//                     type="text"
//                     id="recipient"
//                     value={recipientAddress}
//                     onChange={(e) => setRecipientAddress(e.target.value)}
//                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-400"
//                     placeholder="Enter Recipient Address"
//                   />
//                 </div>
//                 <button
//                   onClick={transfer}
//                   className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
//                 >
//                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
//                   </svg>
//                   Transfer NFT
//                 </button>
//               </div>
//             </div>

//             {/* Marketplace Section */}
//             <div className="pt-6 border-t border-gray-700">
//               <div className="flex items-center mb-6">
//                 <div className="h-8 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-3"></div>
//                 <h2 className="text-xl font-semibold text-gray-100">Marketplace</h2>
//               </div>
              
//               <div className="space-y-6">
//                 <div>
//                   <label htmlFor="marketTokenId" className="block text-sm font-medium text-gray-300 mb-2">
//                     Token ID
//                   </label>
//                   <input
//                     type="number"
//                     id="marketTokenId"
//                     value={tokenId}
//                     onChange={(e) => setTokenId(e.target.value)}
//                     className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
//                     placeholder="Enter Token ID"
//                   />
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
//                       Price (µSTX)
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="number"
//                         id="price"
//                         value={price}
//                         onChange={(e) => setPrice(e.target.value)}
//                         className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 pl-12"
//                         placeholder="Listing price"
//                       />
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <span className="text-gray-400">µSTX</span>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <label htmlFor="expiry" className="block text-sm font-medium text-gray-300 mb-2">
//                       Expiry Block
//                     </label>
//                     <input
//                       type="number"
//                       id="expiry"
//                       value={expiry}
//                       onChange={(e) => setExpiry(e.target.value)}
//                       className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
//                       placeholder="Block height"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="newprice" className="block text-sm font-medium text-gray-300 mb-2">
//                     New Price (µSTX)
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="number"
//                       id="newprice"
//                       value={newprice}
//                       onChange={(e) => setNewprice(e.target.value)}
//                       className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 pl-12"
//                       placeholder="Updated price"
//                     />
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <span className="text-gray-400">µSTX</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <button
//                     onClick={listnft}
//                     className="py-3 px-6 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:from-yellow-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
//                   >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
//                     </svg>
//                     List NFT
//                   </button>
//                   <button
//                     onClick={cancelListing}
//                     className="py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
//                   >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                     </svg>
//                     Cancel Listing
//                   </button>
//                   <button
//                     onClick={buynft}
//                     className="py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
//                   >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                     Buy NFT
//                   </button>
//                   <button
//                     onClick={updateListingprice}
//                     className="py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
//                   >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                     </svg>
//                     Update Price
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// );
// }

// export default App;