'use client';

import { Layout } from '@/components/layout/Layout';
import { PortfolioDashboard } from '@/components/dashboard/PortfolioDashboard';
import { AdBanner } from '@/components/ads/AdBanner';

export default function PortfolioPage() {
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
            <div className="flex-1 max-w-5xl mx-auto w-full">
              <PortfolioDashboard />
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