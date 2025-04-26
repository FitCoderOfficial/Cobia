'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Modal } from '@/components/common/Modal';
import api from '@/lib/api';
import { Plus } from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PortfolioDashboard } from '@/components/dashboard/PortfolioDashboard';
import { isAddress } from 'viem';

// Utility function to format date
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Invalid Date';
  try {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

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
  const [addressError, setAddressError] = useState('');
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletAlias, setWalletAlias] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    walletId: number | null;
    walletAlias: string;
  }>({
    isOpen: false,
    walletId: null,
    walletAlias: '',
  });

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

  const validateAddress = (address: string) => {
    if (!address) {
      setAddressError('');
      return;
    }
    
    if (!isAddress(address)) {
      setAddressError('유효하지 않은 지갑 주소입니다');
      return;
    }

    // Check for duplicate wallet address
    const normalizedAddress = address.toLowerCase();
    const isDuplicate = wallets.some(wallet => 
      wallet?.address?.toLowerCase() === normalizedAddress
    );
    
    if (isDuplicate) {
      setAddressError('이미 등록된 지갑 주소입니다');
      return;
    }
    
    setAddressError('');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setWalletAddress(address);
    validateAddress(address);
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (addressError) {
      return;
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const isDuplicate = wallets.some(wallet => 
      wallet?.address?.toLowerCase() === normalizedAddress
    );
    
    if (isDuplicate) {
      setAddressError('이미 등록된 지갑 주소입니다');
      return;
    }
    
    try {
      interface WalletRequest {
        address: string;
        alias?: string;
      }

      const requestData: WalletRequest = {
        address: walletAddress,
      };

      if (walletAlias.trim()) {
        requestData.alias = walletAlias.trim();
      }

      console.log('Sending wallet request:', requestData);

      const response = await api.post('/wallets/', requestData);
      console.log('Wallet API Response:', response.data);

      if (!response.data?.data?.id) {
        throw new Error('Invalid response: Missing wallet ID');
      }

      // Fetch the complete wallet data including tokens
      const detailsResponse = await api.get(`/wallets/${response.data.data.id}/`);
      console.log('Wallet details response:', detailsResponse.data);

      const newWallet: Wallet = {
        id: response.data.data.id,
        address: response.data.data.address,
        alias: response.data.data.alias || walletAlias.trim() || '이름 없는 지갑',
        created_at: response.data.data.created_at,
        tokens: detailsResponse.data.data.tokens || []
      };

      console.log('Final wallet data with tokens:', newWallet);

      // Update the wallets list with the new wallet
      setWallets(prev => [...prev, newWallet]);
      
      // Close modal and reset form
      setIsAddWalletOpen(false);
      setWalletAddress('');
      setWalletAlias('');
      
    } catch (err: any) {
      console.error('Wallet addition error:', err.response?.data);
      
      if (err.response?.data?.error?.code === 'INVALID_ADDRESS') {
        setError('유효하지 않은 지갑 주소입니다.');
      } else if (err.response?.data?.error?.code === 'DUPLICATE_ADDRESS') {
        setError('이미 등록된 지갑 주소입니다.');
      } else {
        setError('지갑 추가에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // Add useEffect to fetch wallet details periodically
  useEffect(() => {
    const fetchWalletDetails = async () => {
      if (!isAuthenticated || wallets.length === 0) return;

      try {
        const updatedWallets = await Promise.all(
          wallets.map(async (wallet) => {
            try {
              const response = await api.get(`/wallets/${wallet.id}/`);
              return {
                ...wallet,
                tokens: response.data.data.tokens || []
              };
            } catch (err) {
              console.error(`Failed to fetch details for wallet ${wallet.id}:`, err);
              return wallet;
            }
          })
        );

        setWallets(updatedWallets);
      } catch (err) {
        console.error('Failed to fetch wallet details:', err);
      }
    };

    // Fetch initially
    fetchWalletDetails();

    // Set up periodic refresh
    const intervalId = setInterval(fetchWalletDetails, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [isAuthenticated, wallets.length]);

  const handleDelete = async (walletId: number) => {
    setIsDeleting(walletId);
    try {
      await api.delete(`/wallets/${walletId}/`);
      setWallets((prev) => prev.filter((wallet) => wallet.id !== walletId));
      setDeleteModal({ isOpen: false, walletId: null, walletAlias: '' });
    } catch (err) {
      setError('Failed to delete wallet');
    } finally {
      setIsDeleting(null);
    }
  };

  const obfuscateAddress = (address: string | undefined | null): string => {
    if (!address) return '';
    
    // Ensure the address is a string and has the minimum length
    const normalizedAddress = address.toString().trim();
    if (!normalizedAddress || normalizedAddress.length < 10) return normalizedAddress;
    
    // Show first 6 and last 4 characters
    return `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`;
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
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            {/* 왼쪽 광고 */}
            <div className="hidden lg:block lg:w-[300px]">
              <div className="sticky top-8 h-[calc(100vh-8rem)]">
                <AdBanner position="wallet" className="h-full" />
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 max-w-4xl mx-auto w-full">
              {/* 포트폴리오 대시보드 */}
              <div className="mb-8">
                <PortfolioDashboard />
              </div>

              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">내 지갑</h1>
                <button
                  onClick={() => setIsAddWalletOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  지갑 추가하기
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 지갑 목록 */}
                <div className="lg:col-span-3">
                  {wallets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">아직 추가된 지갑이 없습니다.</p>
                      <p className="text-gray-500">새로운 지갑을 추가하여 시작하세요.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wallets.map((wallet) => {
                        const walletKey = `wallet-${wallet.address}`;
                        return (
                          <div
                            key={walletKey}
                            className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors relative"
                          >
                            <button
                              onClick={() => setDeleteModal({
                                isOpen: true,
                                walletId: wallet.id,
                                walletAlias: wallet.alias || '이름 없는 지갑',
                              })}
                              disabled={isDeleting === wallet.id}
                              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="지갑 삭제"
                            >
                              {isDeleting === wallet.id ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              )}
                            </button>

                            <div className="flex items-start justify-between pr-8">
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">
                                  {wallet.alias || '이름 없는 지갑'}
                                </h4>
                                <p className="mt-1 text-sm text-gray-500 font-mono">
                                  {wallet.address ? obfuscateAddress(wallet.address) : '주소 없음'}
                                </p>
                              </div>
                              <div className="text-sm text-gray-500">
                                추가됨 {formatDate(wallet.created_at)}
                              </div>
                            </div>
                            
                            {/* Token Balances */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">토큰 잔액</h5>
                              <div className="space-y-1">
                                {wallet.tokens && wallet.tokens.length > 0 ? (
                                  (() => {
                                    // Sort tokens by balance in descending order
                                    const sortedTokens = [...wallet.tokens].sort((a, b) => b.balance - a.balance);
                                    const primaryToken = sortedTokens[0];
                                    
                                    return (
                                      <>
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-gray-600">{primaryToken.symbol}</span>
                                          <span className="font-medium text-gray-900">
                                            {primaryToken.balance.toLocaleString()}
                                          </span>
                                        </div>
                                        {sortedTokens.length > 1 && (
                                          <div className="text-sm text-gray-500">
                                            (그 외 {sortedTokens.length - 1}개의 토큰)
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    토큰을 찾을 수 없습니다
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽 광고 */}
            <div className="hidden lg:block lg:w-[300px]">
              <div className="sticky top-8 h-[calc(100vh-8rem)]">
                <AdBanner position="wallet" className="h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Wallet Modal */}
      <Transition appear show={isAddWalletOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsAddWalletOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 backdrop-blur-sm bg-black/10" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-8">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-gray-900"
                    >
                      새 지갑 추가
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={() => setIsAddWalletOpen(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-gray-500 mb-8">
                    추적하고 싶은 지갑의 주소를 입력하세요. 별칭을 설정하면 쉽게 구분할 수 있습니다.
                  </p>

                  <form onSubmit={handleAddWallet} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                      <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                        <div>
                          <label htmlFor="walletAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                            지갑 주소
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="walletAddress"
                              value={walletAddress}
                              onChange={handleAddressChange}
                              className={`block w-full rounded-lg border-gray-300 pl-4 pr-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 ${
                                addressError ? 'border-red-500' : ''
                              }`}
                              placeholder="0x..."
                              required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <svg
                                className={`h-5 w-5 ${addressError ? 'text-red-500' : 'text-gray-400'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                />
                              </svg>
                            </div>
                          </div>
                          {addressError ? (
                            <p className="mt-2 text-sm text-red-600">
                              {addressError}
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-gray-500">
                              0x로 시작하는 42자리 이더리움 지갑 주소를 입력해주세요
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="walletAlias" className="block text-sm font-semibold text-gray-700 mb-2">
                            별칭 (선택)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="walletAlias"
                              value={walletAlias}
                              onChange={(e) => setWalletAlias(e.target.value)}
                              className="block w-full rounded-lg border-gray-300 pl-4 pr-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3"
                              placeholder="내 메인 지갑"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            지갑을 쉽게 구분할 수 있는 이름을 입력하세요
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsAddWalletOpen(false)}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        <svg
                          className="mr-2 -ml-1 h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        지갑 추가하기
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, walletId: null, walletAlias: '' })}
        onConfirm={() => deleteModal.walletId && handleDelete(deleteModal.walletId)}
        title="지갑 삭제"
        description={`"${deleteModal.walletAlias}" 지갑을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
      />
    </Layout>
  );
}

export default WalletsPage; 