'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { AdBanner } from '@/components/ads/AdBanner';
import { formatNumber, shortenAddress } from '@/lib/utils';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  BellIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Transaction {
  id: number;
  type: 'in' | 'out';
  amount: number;
  token: string;
  timestamp: string;
  hash: string;
}

interface WhaleData {
  id: number;
  address: string;
  balances: {
    btc: number;
    eth: number;
    usdt: number;
    usdc: number;
  };
  flows: {
    inflow: number;
    outflow: number;
  };
  profitabilityRank: number;
  profitability: number;
  transactions: Transaction[];
  btcMovement: {
    dates: string[];
    values: number[];
  };
}

// Mock data generator
const generateMockData = (id: string): WhaleData => {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return {
    id: parseInt(id),
    address: `0x${Math.random().toString(16).slice(2, 42)}`,
    balances: {
      btc: Math.random() * 1000,
      eth: Math.random() * 10000,
      usdt: Math.random() * 5000000,
      usdc: Math.random() * 5000000,
    },
    flows: {
      inflow: Math.random() * 100,
      outflow: Math.random() * 100,
    },
    profitabilityRank: Math.floor(Math.random() * 100) + 1,
    profitability: Math.random() * 100,
    transactions: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      type: Math.random() > 0.5 ? 'in' : 'out',
      amount: Math.random() * 100,
      token: Math.random() > 0.5 ? 'BTC' : 'ETH',
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      hash: `0x${Math.random().toString(16).slice(2, 64)}`,
    })),
    btcMovement: {
      dates,
      values: Array.from({ length: 7 }, () => Math.random() * 100),
    },
  };
};

export default function WhalePage() {
  const router = useRouter();
  const params = useParams();
  const [whale, setWhale] = useState<WhaleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.id) return;
      
      try {
        // params.id는 string | string[] 타입일 수 있으므로 처리
        const whaleId = Array.isArray(params.id) ? params.id[0] : params.id;
        const data = generateMockData(whaleId);
        setWhale(data);
      } catch (error) {
        console.error('Error fetching whale data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params?.id]);

  const chartData = {
    labels: whale?.btcMovement.dates || [],
    datasets: [
      {
        label: 'BTC 변동',
        data: whale?.btcMovement.values || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(tickValue: any) {
            return formatNumber(Number(tickValue)) + ' BTC';
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  } as const;

  if (isLoading || !whale) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">고래 데이터를 불러오는 중...</p>
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
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {shortenAddress(whale.address)}
                      </h1>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">
                        #{whale.profitabilityRank}위
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">24시간 순매수</p>
                        <p className="text-lg font-medium text-green-600">
                          +${formatNumber(whale.flows.inflow)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">24시간 순매도</p>
                        <p className="text-lg font-medium text-red-600">
                          -${formatNumber(whale.flows.outflow)}M
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <BellIcon className="h-5 w-5 mr-2" />
                    {isFollowing ? '팔로잉' : '팔로우'}
                  </button>
                </div>
              </div>

              {/* Balance Overview */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">잔액 현황</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">BTC 잔액</p>
                    <p className="text-lg font-medium">{formatNumber(whale.balances.btc)} BTC</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ETH 잔액</p>
                    <p className="text-lg font-medium">{formatNumber(whale.balances.eth)} ETH</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">USDT 잔액</p>
                    <p className="text-lg font-medium">${formatNumber(whale.balances.usdt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">USDC 잔액</p>
                    <p className="text-lg font-medium">${formatNumber(whale.balances.usdc)}</p>
                  </div>
                </div>
              </div>

              {/* BTC Movement Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">7일간 BTC 변동</h2>
                <div className="h-[400px] w-full">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 거래</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          유형
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          금액
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          토큰
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          시간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          트랜잭션 해시
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {whale.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                tx.type === 'in'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {tx.type === 'in' ? (
                                <ArrowUpIcon className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownIcon className="h-3 w-3 mr-1" />
                              )}
                              {tx.type === 'in' ? '매수' : '매도'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatNumber(tx.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{tx.token}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                            {shortenAddress(tx.hash)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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