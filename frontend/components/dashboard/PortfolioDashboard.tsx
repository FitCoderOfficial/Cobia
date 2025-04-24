import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { formatNumber } from '@/lib/utils';
import {
  WalletIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface TokenData {
  name: string;
  symbol: string;
  amount: number;
  evaluationPrice: number;
  avgBuyPrice?: number;
  totalValue: number;
  profitLoss?: {
    amount: number;
    percentage: number;
  };
}

interface PortfolioData {
  totalAssets: number;
  totalCoins: number;
  totalPurchaseAmount: number;
  totalEvaluationAmount: number;
  profitLoss: {
    amount: number;
    percentage: number;
  };
  tokens: TokenData[];
}

// Mock data generator (replace with actual API calls in production)
const generateMockData = (): PortfolioData => {
  const tokens: TokenData[] = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: 2.5,
      evaluationPrice: 45000000,
      avgBuyPrice: 42000000,
      totalValue: 112500000,
      profitLoss: {
        amount: 7500000,
        percentage: 7.14,
      },
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      amount: 15,
      evaluationPrice: 3000000,
      avgBuyPrice: 2800000,
      totalValue: 45000000,
      profitLoss: {
        amount: 3000000,
        percentage: 7.14,
      },
    },
    // Add more mock tokens as needed
  ];

  const totalEvaluation = tokens.reduce((sum, token) => sum + token.totalValue, 0);
  const totalPurchase = tokens.reduce((sum, token) => sum + (token.avgBuyPrice || 0) * token.amount, 0);

  return {
    totalAssets: totalEvaluation,
    totalCoins: tokens.length,
    totalPurchaseAmount: totalPurchase,
    totalEvaluationAmount: totalEvaluation,
    profitLoss: {
      amount: totalEvaluation - totalPurchase,
      percentage: ((totalEvaluation - totalPurchase) / totalPurchase) * 100,
    },
    tokens,
  };
};

export function PortfolioDashboard() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Replace with actual API call in production
    const fetchData = async () => {
      try {
        const mockData = generateMockData();
        setData(mockData);
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">포트폴리오 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const doughnutData = {
    labels: data.tokens.map(token => token.symbol),
    datasets: [
      {
        data: data.tokens.map(token => token.totalValue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(16, 185, 129, 0.8)', // green
          'rgba(245, 158, 11, 0.8)', // yellow
          'rgba(239, 68, 68, 0.8)',  // red
          'rgba(139, 92, 246, 0.8)', // purple
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: data.tokens.slice(0, 5).map(token => token.symbol),
    datasets: [
      {
        label: '보유 자산 (KRW)',
        data: data.tokens.slice(0, 5).map(token => token.totalValue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `₩${formatNumber(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `₩${formatNumber(value)}`,
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `₩${formatNumber(context.raw)}`,
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">내 암호화폐 포트폴리오 요약</h2>
        <p className="mt-1 text-gray-500">실시간 포트폴리오 현황</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow h-full min-h-[140px]">
          <div className="flex flex-col justify-center items-center h-full space-y-2">
            <WalletIcon className="h-10 w-10 text-blue-600" />
            <p className="text-sm font-medium text-gray-500">총 자산</p>
            <p className="text-2xl font-bold text-gray-900">
              ₩{formatNumber(data.totalAssets)}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow h-full min-h-[140px]">
          <div className="flex flex-col justify-center items-center h-full space-y-2">
            <ChartBarIcon className="h-10 w-10 text-green-600" />
            <p className="text-sm font-medium text-gray-500">보유 코인 수</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.totalCoins}개
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow h-full min-h-[140px]">
          <div className="flex flex-col justify-center items-center h-full space-y-2">
            <CurrencyDollarIcon className="h-10 w-10 text-purple-600" />
            <p className="text-sm font-medium text-gray-500">총 매수금액</p>
            <p className="text-2xl font-bold text-gray-900">
              ₩{formatNumber(data.totalPurchaseAmount)}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow h-full min-h-[140px]">
          <div className="flex flex-col justify-center items-center h-full space-y-2">
            <ScaleIcon className="h-10 w-10 text-orange-600" />
            <p className="text-sm font-medium text-gray-500">총 평가금액</p>
            <p className="text-2xl font-bold text-gray-900">
              ₩{formatNumber(data.totalEvaluationAmount)}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow h-full min-h-[140px]">
          <div className="flex flex-col justify-center items-center h-full space-y-2">
            <ArrowTrendingUpIcon className="h-10 w-10 text-gray-600" />
            <p className="text-sm font-medium text-gray-500">평가손익</p>
            <div className="flex flex-col items-center">
              <p className={`text-2xl font-bold ${data.profitLoss.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.profitLoss.amount >= 0 ? '+' : ''}₩{formatNumber(data.profitLoss.amount)}
              </p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                data.profitLoss.amount >= 0 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {data.profitLoss.amount >= 0 ? '+' : ''}{data.profitLoss.percentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">자산 분포</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">상위 5개 토큰</h3>
          <div className="h-[300px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Asset Details Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">토큰</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보유수량</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가금액</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균매수가</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가손익</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.tokens.map((token) => (
              <tr key={token.symbol} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium text-gray-900">{token.name}</div>
                      <div className="text-sm text-gray-500">{token.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{token.amount}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">₩{formatNumber(token.totalValue)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {token.avgBuyPrice ? `₩${formatNumber(token.avgBuyPrice)}` : '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {token.profitLoss && (
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      token.profitLoss.amount >= 0 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="truncate">
                        {token.profitLoss.amount >= 0 ? '+' : ''}₩{formatNumber(token.profitLoss.amount)}
                        <span className="ml-1">
                          ({token.profitLoss.amount >= 0 ? '+' : ''}{token.profitLoss.percentage.toFixed(2)}%)
                        </span>
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 