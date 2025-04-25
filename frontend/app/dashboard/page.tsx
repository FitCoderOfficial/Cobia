'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { Layout } from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import { AdBanner } from '@/components/ads/AdBanner';
import { InsightCardDemo } from '@/components/dashboard/InsightCardDemo';

export default function DashboardPage() {
  const { user, subscription } = useAuth();
  const router = useRouter();

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
              {/* Welcome Section */}
              <section id="dashboard-welcome" className="mb-12">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                    환영합니다, {user?.name || '사용자'}님!
                  </h1>
                  <p className="mt-4 text-xl text-gray-600">
                    현재 구독: {subscription?.tier}
                  </p>
                  <p className="mt-2 text-lg text-gray-500">
                    유효기간: {new Date(subscription?.validUntil || '').toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </section>

              {/* Quick Actions Section */}
              <section id="dashboard-actions" className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">지갑 보기</h2>
                    <p className="text-gray-600 mb-6">암호화폐 지갑을 추적하고 잔액을 실시간으로 모니터링하세요</p>
                    <button
                      onClick={() => router.push('/wallets')}
                      className="w-full px-6 py-3 text-white bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                      지갑 관리하기
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">리포트 보기</h2>
                    <p className="text-gray-600 mb-6">분석 리포트와 인사이트에 접근하세요</p>
                    <button
                      onClick={() => router.push('/reports')}
                      className="w-full px-6 py-3 text-white bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                      리포트 보기
                    </button>
                  </div>
                </div>
              </section>

              {/* Insights Section */}
              <section id="dashboard-insights">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">최근 지갑 인사이트</h2>
                  <p className="mt-2 text-gray-600">실시간으로 모니터링된 주요 지갑 활동을 요약합니다.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InsightCardDemo />
                </div>
              </section>
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