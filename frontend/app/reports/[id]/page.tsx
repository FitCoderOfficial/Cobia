'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Layout } from '@/components/layout/Layout';
import api from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Chart.js default font settings
ChartJS.defaults.font.family = 'Inter, system-ui, sans-serif';
ChartJS.defaults.font.size = 14;
ChartJS.defaults.color = '#6B7280'; // Tailwind gray-500

// Custom tooltip style
const customTooltip = {
  backgroundColor: '#111827', // Tailwind gray-900
  titleColor: '#F9FAFB', // Tailwind gray-50
  bodyColor: '#F9FAFB', // Tailwind gray-50
  borderColor: '#4F46E5', // Tailwind indigo-600
  borderWidth: 1,
  padding: 12,
  cornerRadius: 6,
  displayColors: false,
  callbacks: {
    label: function(context: any) {
      return `${context.dataset.label}: ${context.parsed.y} BTC`;
    }
  }
};

// Chart colors
const CHART_COLORS = {
  indigo: '#6366F1',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
};

interface MetricChange {
  value: number;
  isPositive: boolean;
}

interface Report {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
  updated_at: string;
  tag?: string;
  metrics?: {
    totalBtcMoved: number;
    totalBtcMovedChange: MetricChange;
    topExchange: string;
    topExchangeChange: MetricChange;
    transactionCount: number;
    transactionCountChange: MetricChange;
    averageTransactionSize: number;
    averageTransactionSizeChange: MetricChange;
  };
  whaleTransactions?: {
    time: string;
    amount: number;
    type: string;
  }[];
  whaleTransactionsWeekly?: {
    time: string;
    amount: number;
    type: string;
  }[];
  whaleTransactionsMonthly?: {
    time: string;
    amount: number;
    type: string;
  }[];
  assetDistribution?: {
    name: string;
    value: number;
  }[];
  recommendations?: string[];
}

// Example reports data with visual data
const exampleReports: Record<string, Report> = {
  '1': {
    id: 1,
    title: "Whale Activity Summary",
    summary: "Analysis of large wallet movements in the past 24 hours. Notable transactions include a 500 BTC transfer to a major exchange.",
    content: `# Whale Activity Analysis Report

## Overview
In the past 24 hours, we've observed significant whale movements across major cryptocurrencies. The most notable transaction was a 500 BTC transfer to a major exchange, potentially indicating a large holder's intention to sell.

## Key Findings

### Bitcoin (BTC)
- Large transfer of 500 BTC to Binance
- Multiple smaller transfers (50-100 BTC) to various exchanges
- New whale wallet accumulation of 200 BTC

### Ethereum (ETH)
- Significant movement of 10,000 ETH to a new wallet
- Multiple DEX interactions from whale wallets
- Increased staking activity from large holders

## Market Impact
These movements suggest:
1. Potential selling pressure in the short term
2. Increased institutional interest
3. Growing adoption of DeFi by whale wallets

## Risk Assessment
- High volatility expected in the next 24-48 hours
- Potential price impact from the large BTC transfer
- Monitor exchange inflows for selling pressure

## Recommendations
1. Monitor exchange order books for large sell walls
2. Watch for follow-up transactions from the same wallets
3. Consider hedging positions in anticipation of volatility`,
    created_at: "2024-03-15T10:30:00Z",
    updated_at: "2024-03-15T10:30:00Z",
    tag: "Whale Alert",
    metrics: {
      totalBtcMoved: 1250,
      totalBtcMovedChange: { value: 12.5, isPositive: true },
      topExchange: "Binance",
      topExchangeChange: { value: 5.2, isPositive: true },
      transactionCount: 15,
      transactionCountChange: { value: 7.2, isPositive: true },
      averageTransactionSize: 83.33,
      averageTransactionSizeChange: { value: 3.8, isPositive: false }
    },
    whaleTransactions: [
      { time: "00:00", amount: 500, type: "Exchange" },
      { time: "04:00", amount: 200, type: "Accumulation" },
      { time: "08:00", amount: 150, type: "Exchange" },
      { time: "12:00", amount: 100, type: "Accumulation" },
      { time: "16:00", amount: 200, type: "Exchange" },
      { time: "20:00", amount: 100, type: "Accumulation" }
    ],
    whaleTransactionsWeekly: [
      { time: "Mon", amount: 1200, type: "Exchange" },
      { time: "Tue", amount: 800, type: "Accumulation" },
      { time: "Wed", amount: 1500, type: "Exchange" },
      { time: "Thu", amount: 900, type: "Accumulation" },
      { time: "Fri", amount: 1100, type: "Exchange" },
      { time: "Sat", amount: 700, type: "Accumulation" },
      { time: "Sun", amount: 1300, type: "Exchange" }
    ],
    whaleTransactionsMonthly: [
      { time: "Week 1", amount: 5000, type: "Exchange" },
      { time: "Week 2", amount: 3500, type: "Accumulation" },
      { time: "Week 3", amount: 4200, type: "Exchange" },
      { time: "Week 4", amount: 3800, type: "Accumulation" }
    ],
    assetDistribution: [
      { name: "BTC", value: 60 },
      { name: "ETH", value: 25 },
      { name: "USDT", value: 10 },
      { name: "Others", value: 5 }
    ],
    recommendations: [
      "Monitor exchange order books for large sell walls",
      "Watch for follow-up transactions from the same wallets",
      "Consider hedging positions in anticipation of volatility"
    ]
  },
  '2': {
    id: 2,
    title: "Market Trend Analysis",
    summary: "AI-powered analysis of current market trends and potential price movements based on historical patterns and whale behavior.",
    content: `# Market Trend Analysis Report

## Executive Summary
Our AI models have identified several emerging trends in the cryptocurrency market, with particular focus on Bitcoin and Ethereum price movements.

## Technical Analysis

### Bitcoin (BTC)
- Breaking key resistance level at $65,000
- Strong support at $62,000
- RSI indicating overbought conditions
- Volume profile showing increasing institutional interest

### Ethereum (ETH)
- Consolidating above $3,500
- Strong buying pressure from whale wallets
- Network activity at all-time highs
- Gas fees stabilizing at lower levels

## AI Predictions
Based on historical patterns and current market conditions:
1. 70% probability of BTC reaching $70,000 within 7 days
2. 60% probability of ETH breaking $4,000 resistance
3. 80% probability of increased volatility

## Risk Factors
- Macroeconomic uncertainty
- Regulatory developments
- Market sentiment shifts
- Technical resistance levels

## Action Items
1. Monitor key price levels
2. Watch for institutional buying patterns
3. Track on-chain metrics for early signals`,
    created_at: "2024-03-15T09:15:00Z",
    updated_at: "2024-03-15T09:15:00Z",
    tag: "AI Generated"
  },
  '3': {
    id: 3,
    title: "Risk Assessment Report",
    summary: "Comprehensive risk analysis of current market conditions, including volatility metrics and potential market manipulation indicators.",
    content: `# Risk Assessment Report

## Market Risk Overview
Current market conditions present several risk factors that require careful monitoring and management.

## Key Risk Indicators

### Volatility Metrics
- 30-day volatility at 45%
- Implied volatility increasing
- Options market showing bearish bias
- Funding rates elevated

### Market Manipulation Indicators
- Unusual order book patterns
- Suspicious trading volume spikes
- Wash trading detected on minor exchanges
- Price manipulation attempts identified

## Risk Categories

### High Risk
- Exchange liquidity concerns
- Regulatory uncertainty
- Market manipulation attempts
- Technical vulnerabilities

### Medium Risk
- Volatility spikes
- Whale wallet movements
- Network congestion
- Gas fee fluctuations

### Low Risk
- Minor exchange issues
- Social media sentiment
- Retail trading patterns
- Mining difficulty adjustments

## Recommendations
1. Implement strict risk management protocols
2. Monitor exchange order books
3. Track whale wallet movements
4. Stay informed on regulatory developments`,
    created_at: "2024-03-14T16:45:00Z",
    updated_at: "2024-03-14T16:45:00Z",
    tag: "Risk Analysis"
  }
};

function MetricCard({ 
  title, 
  value, 
  unit = '', 
  change,
  isText = false
}: { 
  title: string; 
  value: number | string; 
  unit?: string;
  change?: MetricChange;
  isText?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2">
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-semibold text-gray-900">
            {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}{unit}
          </p>
          {change && (
            <div className={`flex items-center space-x-2 ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <span className="text-base font-medium">
                {change.isPositive ? '▲' : '▼'}
              </span>
              <span className="text-base font-medium">
                {Math.abs(change.value)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'24h' | '1w' | '1m'>('24h');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!isAuthenticated) return;

      try {
        // Simulate API call with example data
        setTimeout(() => {
          const reportData = exampleReports[params.id as string];
          if (reportData) {
            setReport(reportData);
          }
          setIsLoadingReport(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch report details');
        setIsLoadingReport(false);
      }
    };

    fetchReport();
  }, [isAuthenticated, params.id]);

  const getChartData = () => {
    if (!report) return null;

    let transactions;
    switch (timeRange) {
      case '24h':
        transactions = report.whaleTransactions;
        break;
      case '1w':
        transactions = report.whaleTransactionsWeekly;
        break;
      case '1m':
        transactions = report.whaleTransactionsMonthly;
        break;
      default:
        transactions = report.whaleTransactions;
    }

    const barChartData = {
      labels: transactions?.map(t => t.time) || [],
      datasets: [
        {
          label: 'BTC Amount',
          data: transactions?.map(t => t.amount) || [],
          backgroundColor: CHART_COLORS.indigo,
          borderColor: CHART_COLORS.indigo,
          borderWidth: 0,
          borderRadius: 6,
          barThickness: 30,
        },
      ],
    };

    const pieChartData = {
      labels: report.assetDistribution?.map(a => a.name) || [],
      datasets: [
        {
          data: report.assetDistribution?.map(a => a.value) || [],
          backgroundColor: [
            CHART_COLORS.indigo,
            CHART_COLORS.emerald,
            CHART_COLORS.amber,
            CHART_COLORS.rose,
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2,
        },
      ],
    };

    return { barChartData, pieChartData };
  };

  const chartData = getChartData();

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: customTooltip,
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB', // Tailwind gray-200
          drawBorder: false,
        },
        ticks: {
          padding: 10,
          font: {
            size: 14,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 10,
          font: {
            size: 14,
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
    },
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: customTooltip,
    },
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
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-8"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Reports
          </button>

          {isLoadingReport ? (
            // Loading state
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-100 text-red-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
          ) : report ? (
            // Report content
            <div className="space-y-8">
              {/* Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {report.title}
                  </h1>
                  {report.tag && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {report.tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>
                    Created: {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    Last updated: {new Date(report.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Key Metrics */}
              {report.metrics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total BTC Moved"
                    value={report.metrics.totalBtcMoved}
                    unit=" BTC"
                    change={report.metrics.totalBtcMovedChange}
                  />
                  <MetricCard
                    title="Top Exchange"
                    value={report.metrics.topExchange}
                    isText={true}
                    change={report.metrics.topExchangeChange}
                  />
                  <MetricCard
                    title="Transaction Count"
                    value={report.metrics.transactionCount}
                    change={report.metrics.transactionCountChange}
                  />
                  <MetricCard
                    title="Avg. Transaction Size"
                    value={report.metrics.averageTransactionSize}
                    unit=" BTC"
                    change={report.metrics.averageTransactionSizeChange}
                  />
                </div>
              )}

              {/* Charts */}
              {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Whale Transactions Chart */}
                  {report.whaleTransactions && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Whale Transactions</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setTimeRange('24h')}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              timeRange === '24h'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            24h
                          </button>
                          <button
                            onClick={() => setTimeRange('1w')}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              timeRange === '1w'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            1w
                          </button>
                          <button
                            onClick={() => setTimeRange('1m')}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              timeRange === '1m'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            1m
                          </button>
                        </div>
                      </div>
                      <div className="h-80">
                        <Bar
                          data={chartData.barChartData}
                          options={barChartOptions}
                        />
                      </div>
                    </div>
                  )}

                  {/* Asset Distribution Chart */}
                  {report.assetDistribution && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution</h3>
                      <div className="h-80">
                        <Pie
                          data={chartData.pieChartData}
                          options={pieChartOptions}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {report.recommendations && (
                <div className="bg-indigo-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4">Key Recommendations</h3>
                  <ul className="space-y-3">
                    {report.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {index + 1}
                        </span>
                        <span className="ml-3 text-indigo-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Report Content */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="prose prose-indigo max-w-none">
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Summary
                    </h2>
                    <p className="text-gray-600">{report.summary}</p>
                  </div>

                  <div className="text-gray-700 whitespace-pre-wrap">
                    {report.content}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Not found state
            <div className="text-center">
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-4 text-gray-600">Report not found</p>
              <p className="mt-2 text-sm text-gray-500">
                The report you're looking for doesn't exist or has been removed
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ReportPage; 