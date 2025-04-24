'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { AdBanner } from '@/components/ads/AdBanner';
import { formatNumber, shortenAddress } from '@/lib/utils';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

interface WhaleData {
  id: number;
  address: string;
  balances: {
    btc: number;
    eth: number;
  };
  flows: {
    inflow: number;
    outflow: number;
  };
  profitabilityRank: number;
}

// Mock data generator
const generateMockWhales = async (): Promise<WhaleData[]> => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    address: `0x${Math.random().toString(16).slice(2, 42)}`,
    balances: {
      btc: Math.random() * 1000,
      eth: Math.random() * 10000,
    },
    flows: {
      inflow: Math.random() * 100,
      outflow: Math.random() * 100,
    },
    profitabilityRank: i + 1,
  }));
};

export default function WhalesPage() {
  const router = useRouter();
  const [whales, setWhales] = useState<WhaleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production, this would be an API call
    const fetchData = async () => {
      try {
        const data = await generateMockWhales();
        setWhales(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching whales data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWhaleClick = (whaleId: number) => {
    router.push(`/whales/${whaleId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">고래 순위를 불러오는 중...</p>
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
                <AdBanner position="dashboard" className="h-full" />
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 max-w-4xl mx-auto w-full">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="h-6 w-6 text-yellow-500" />
                    <h1 className="text-2xl font-bold text-gray-900">상위 10 고래</h1>
                  </div>
                  <p className="mt-2 text-gray-600">
                    암호화폐 시장의 큰손들을 추적하세요
                  </p>
                </div>

                <div className="divide-y divide-gray-200">
                  {whales.map((whale) => (
                    <div
                      key={whale.id}
                      onClick={() => handleWhaleClick(whale.id)}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-lg font-bold text-indigo-600">
                                #{whale.profitabilityRank}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h2 className="text-lg font-medium text-gray-900">
                              {shortenAddress(whale.address)}
                            </h2>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatNumber(whale.balances.btc)} BTC</span>
                              <span>•</span>
                              <span>{formatNumber(whale.balances.eth)} ETH</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">24시간 순매수</p>
                            <p className="text-base font-medium text-green-600">
                              +${formatNumber(whale.flows.inflow)}M
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">24시간 순매도</p>
                            <p className="text-base font-medium text-red-600">
                              -${formatNumber(whale.flows.outflow)}M
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 오른쪽 광고 */}
            <div className="hidden lg:block lg:w-[300px]">
              <div className="sticky top-8 h-[calc(100vh-8rem)]">
                <AdBanner position="dashboard" className="h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 