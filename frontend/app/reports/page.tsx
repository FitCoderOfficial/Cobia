'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Layout } from '@/components/layout/Layout';
import api from '@/lib/api';

interface Report {
  id: number;
  title: string;
  summary: string;
  created_at: string;
  tag?: string;
}

// Example reports data
const exampleReports: Report[] = [
  {
    id: 1,
    title: "Whale Activity Summary",
    summary: "Analysis of large wallet movements in the past 24 hours. Notable transactions include a 500 BTC transfer to a major exchange.",
    created_at: "2024-03-15T10:30:00Z",
    tag: "Whale Alert"
  },
  {
    id: 2,
    title: "Market Trend Analysis",
    summary: "AI-powered analysis of current market trends and potential price movements based on historical patterns and whale behavior.",
    created_at: "2024-03-15T09:15:00Z",
    tag: "AI Generated"
  },
  {
    id: 3,
    title: "Risk Assessment Report",
    summary: "Comprehensive risk analysis of current market conditions, including volatility metrics and potential market manipulation indicators.",
    created_at: "2024-03-14T16:45:00Z",
    tag: "Risk Analysis"
  },
  {
    id: 4,
    title: "Exchange Flow Analysis",
    summary: "Detailed breakdown of cryptocurrency flows between major exchanges, highlighting potential arbitrage opportunities.",
    created_at: "2024-03-14T14:20:00Z",
    tag: "Exchange Data"
  },
  {
    id: 5,
    title: "Whale Portfolio Update",
    summary: "Latest portfolio changes of top 10 whale wallets, including new acquisitions and significant disposals.",
    created_at: "2024-03-14T11:00:00Z",
    tag: "Whale Alert"
  },
  {
    id: 6,
    title: "Market Sentiment Report",
    summary: "Analysis of social media sentiment and market indicators to gauge overall market mood and potential price impact.",
    created_at: "2024-03-14T08:30:00Z",
    tag: "AI Generated"
  }
];

function ReportsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!isAuthenticated) return;

      try {
        // Simulate API call with example data
        // const response = await api.get('/reports/');
        // setReports(response.data.data);
        
        // Use example data instead
        setTimeout(() => {
          setReports(exampleReports);
          setIsLoadingReports(false);
        }, 1000); // Simulate loading delay
      } catch (err) {
        setError('Failed to fetch reports');
        setIsLoadingReports(false);
      }
    };

    fetchReports();
  }, [isAuthenticated]);

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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Analysis Reports
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              View detailed analysis and insights about cryptocurrency market trends
            </p>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingReports ? (
              // Loading state
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="mt-4 h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))
            ) : reports.length === 0 ? (
              // Empty state
              <div className="col-span-full text-center py-12">
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
                <p className="mt-4 text-gray-600">No reports available yet</p>
                <p className="mt-2 text-sm text-gray-500">
                  Check back later for new analysis reports
                </p>
              </div>
            ) : (
              // Reports list
              reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {report.title}
                    </h3>
                    {report.tag && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {report.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {report.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => router.push(`/reports/${report.id}`)}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View Report
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="mt-6 text-center">
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
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ReportsPage; 