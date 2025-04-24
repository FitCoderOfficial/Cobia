'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Layout } from '@/components/layout/Layout';
import api from '@/lib/api';
import { AdBanner } from '@/components/ads/AdBanner';

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
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            {/* 왼쪽 광고 */}
            <div className="hidden lg:block lg:w-[300px]">
              <div className="sticky top-8 h-[calc(100vh-8rem)]">
                <AdBanner position="report" className="h-full" />
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 max-w-4xl mx-auto w-full">
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
                  분석 리포트
                </h1>
                <p className="mt-4 text-xl text-gray-600">
                  암호화폐 시장 동향에 대한 상세 분석과 인사이트를 확인하세요
                </p>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Whale Activity Report */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        웨일 알림
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">웨일 활동 요약</h3>
                    </div>
                    <span className="text-sm text-gray-500">2024. 3. 15.</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    지난 24시간 동안의 대형 지갑 이동 분석. 주요 거래소로의 500 BTC 이체 등 주목할 만한 거래 포함.
                  </p>
                  <button
                    onClick={() => router.push('/reports/1')}
                    className="w-full px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                  >
                    리포트 보기
                  </button>
                </div>

                {/* Market Trend Report */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        AI 생성
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">시장 동향 분석</h3>
                    </div>
                    <span className="text-sm text-gray-500">2024. 3. 15.</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    AI 기반의 현재 시장 동향 분석과 과거 패턴 및 웨일 행동을 기반으로 한 잠재적 가격 움직임 예측.
                  </p>
                  <button
                    onClick={() => router.push('/reports/2')}
                    className="w-full px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                  >
                    리포트 보기
                  </button>
                </div>

                {/* Risk Assessment Report */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        리스크 분석
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">리스크 평가 리포트</h3>
                    </div>
                    <span className="text-sm text-gray-500">2024. 3. 15.</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    변동성 지표와 시장 조작 가능성 지표를 포함한 현재 시장 상황의 종합적인 리스크 분석.
                  </p>
                  <button
                    onClick={() => router.push('/reports/3')}
                    className="w-full px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                  >
                    리포트 보기
                  </button>
                </div>

                {/* Exchange Flow Report */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        거래소 데이터
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">거래소 자금 흐름 분석</h3>
                    </div>
                    <span className="text-sm text-gray-500">2024. 3. 14.</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    주요 거래소 간의 암호화폐 자금 흐름에 대한 상세 분석. 잠재적 차익거래 기회 하이라이트.
                  </p>
                  <button
                    onClick={() => router.push('/reports/4')}
                    className="w-full px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                  >
                    리포트 보기
                  </button>
                </div>

                {/* Whale Portfolio Report */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        웨일 알림
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">웨일 포트폴리오 업데이트</h3>
                    </div>
                    <span className="text-sm text-gray-500">2024. 3. 14.</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    상위 10개 웨일 지갑의 최신 포트폴리오 변경 사항. 신규 매수와 주요 매도 포함.
                  </p>
                  <button
                    onClick={() => router.push('/reports/5')}
                    className="w-full px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                  >
                    리포트 보기
                  </button>
                </div>

                {/* Market Sentiment Report */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        AI 생성
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">시장 심리 리포트</h3>
                    </div>
                    <span className="text-sm text-gray-500">2024. 3. 14.</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    소셜 미디어 심리와 시장 지표 분석을 통한 전반적인 시장 분위기와 잠재적 가격 영향 분석.
                  </p>
                  <button
                    onClick={() => router.push('/reports/6')}
                    className="w-full px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                  >
                    리포트 보기
                  </button>
                </div>
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

            {/* 오른쪽 광고 */}
            <div className="hidden lg:block lg:w-[300px]">
              <div className="sticky top-8 h-[calc(100vh-8rem)]">
                <AdBanner position="report" className="h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ReportsPage; 