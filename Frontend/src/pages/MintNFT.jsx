import { useState, useEffect } from 'react';
import { request } from '@stacks/connect';
import { Cl } from '@stacks/transactions';
import axios from 'axios';

export default function MintNFT() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');

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

  const handleMint = async () => {
    try {
      setError('');
      setSuccess('');
      setStatus('Preparing upload...');
      setLoading(true);

      if (!selectedFile) {
        throw new Error('Please select an image first');
      }

      // Upload to IPFS
      setStatus('Uploading to IPFS...');
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

      const ipfsHash = ipfsRes.data.IpfsHash;
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      setIpfsUrl(gatewayUrl);
      setStatus(`Uploaded to IPFS! Minting NFT...`);

      // Mint NFT with IPFS hash
      const response = await request('stx_callContract', {
        contract: 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.SimpleNFT',
        functionName: 'mint',
        functionArgs: [Cl.stringAscii(ipfsHash)],
        network: 'testnet',
      });

      setSuccess('NFT minted successfully!');
      setStatus('');
    } catch (err) {
      setError(err.message || 'Failed to mint NFT');
      setStatus('');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <div className="h-10 w-1 bg-gradient-to-b from-green-400 to-teal-500 rounded-full mr-4"></div>
        <h1 className="text-3xl font-bold text-white">Mint Your NFT</h1>
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

      {status && (
        <div className="mb-6 p-4 bg-blue-900/50 text-blue-100 rounded-xl border border-blue-700/50">
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span>{status}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/50 text-green-100 rounded-xl border border-green-700/50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
          {ipfsUrl && (
            <div className="mt-3">
              <a 
                href={ipfsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-300 hover:text-green-100 underline text-sm"
              >
                View on IPFS
              </a>
              <p className="text-xs text-green-400 mt-1 break-all">
                CID: {ipfsUrl.split('/ipfs/')[1]}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Upload Your Artwork</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-gray-500 transition-colors bg-gray-700/20">
              {preview ? (
                <div className="relative group w-full">
                  <img
                    src={preview}
                    alt="NFT preview"
                    className="mb-4 max-h-80 w-full object-contain rounded-lg shadow-lg group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <svg className="w-10 h-10 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-500"
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
                  <p className="mt-2 text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </div>
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
                className="mt-6 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {selectedFile ? 'Change Image' : 'Select Image'}
              </label>
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={!selectedFile || loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Minting NFT...
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Mint NFT
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}