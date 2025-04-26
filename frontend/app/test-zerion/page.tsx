'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestZerionPage() {
  const [address, setAddress] = useState('');
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchZerionData = async () => {
    setLoading(true);
    setError('');
    setDebugInfo(null);
    
    try {
      console.log('🔌 Connecting to Zerion API...', {
        address,
        hasApiKey: !!process.env.NEXT_PUBLIC_ZERION_API_KEY
      });

      // Use local API route as proxy
      const response = await axios.get(`/api/zerion?address=${address}`);
      console.log('✅ Zerion API Response:', response.data);

      setDebugInfo({
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from API');
      }

      // Transform token data
      const tokenList = response.data.data.map((position: any) => ({
        symbol: position.attributes.symbol,
        quantity: position.attributes.quantity,
        price: position.attributes.price?.value || 0,
        value: (parseFloat(position.attributes.quantity) * (position.attributes.price?.value || 0)),
        name: position.attributes.name
      }));

      setTokens(tokenList);
    } catch (err: any) {
      console.error('❌ Error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to fetch wallet data';
      setError(errorMessage);
      
      setDebugInfo({
        error: true,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Zerion API Test</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter wallet address (e.g., 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)"
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={fetchZerionData}
        disabled={loading || !address}
        className={`px-4 py-2 rounded ${
          loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {loading ? 'Loading...' : 'Fetch Wallet Data'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <h3 className="font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {tokens.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Token Balances</h2>
          <div className="space-y-2">
            {tokens.map((token, index) => (
              <div key={index} className="p-4 border rounded">
                <div className="font-medium">{token.name} ({token.symbol})</div>
                <div className="text-sm text-gray-600">
                  Balance: {parseFloat(token.quantity).toFixed(6)}
                </div>
                <div className="text-sm text-gray-600">
                  Value: ${token.value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {`API Key Status: ${process.env.NEXT_PUBLIC_ZERION_API_KEY ? 'Configured' : 'Not configured'}
Current Address: ${address || 'Not set'}
API Endpoint: /api/zerion?address=${address || '[not set]'}`}
        </pre>
        {debugInfo && (
          <div className="mt-2 p-2 bg-white rounded">
            <h3 className="font-semibold">Response Details:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 