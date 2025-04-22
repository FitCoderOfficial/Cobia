'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Layout } from '@/components/layout/Layout';
import api from '@/lib/api';

interface Token {
  symbol: string;
  balance: number;
}

interface Wallet {
  id: number;
  address: string;
  alias: string;
  created_at: string;
  tokens?: Token[];
}

function WalletsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [error, setError] = useState('');
  const [newWallet, setNewWallet] = useState({
    address: '',
    alias: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchWallets = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await api.get('/wallets/');
        setWallets(response.data.data);
      } catch (err) {
        setError('Failed to fetch wallets');
      } finally {
        setIsLoadingWallets(false);
      }
    };

    fetchWallets();
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/wallets/', newWallet);
      setWallets((prev) => [...prev, response.data.data]);
      setNewWallet({ address: '', alias: '' });
    } catch (err) {
      setError('Failed to add wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWallet((prev) => ({ ...prev, [name]: value }));
  };

  const obfuscateAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              My Wallets
            </h1>
            <p className="mt-4 text-xl text-gray-600 whitespace-nowrap">
              Track your cryptocurrency wallets and monitor their balances in real-time
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Wallets List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Your Wallets</h3>
                
                {isLoadingWallets ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading wallets...</p>
                  </div>
                ) : wallets.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <p className="mt-4 text-gray-600">No wallets added yet</p>
                    <p className="mt-2 text-sm text-gray-500">
                      Add your first wallet to start tracking
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {wallet.alias || 'Unnamed Wallet'}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500 font-mono">
                              {obfuscateAddress(wallet.address)}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            Added {new Date(wallet.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {/* Token Balances */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Token Balances</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {wallet.tokens?.map((token, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{token.symbol}</span>
                                <span className="font-medium text-gray-900">{token.balance}</span>
                              </div>
                            )) || (
                              <div className="col-span-2 text-sm text-gray-500">
                                No tokens found
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Wallet Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Add a New Wallet</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Enter your wallet details to start tracking
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      value={newWallet.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                      placeholder="Enter wallet address"
                    />
                  </div>

                  <div>
                    <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Alias (Optional)
                    </label>
                    <input
                      type="text"
                      id="alias"
                      name="alias"
                      value={newWallet.alias}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                      placeholder="Enter wallet alias"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Wallet'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default WalletsPage; 