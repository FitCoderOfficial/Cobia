'use client';

import { InsightCardDemo } from "@/components/demo/InsightCardDemo";

export default function InsightsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          지갑 인사이트
        </h1>
        <p className="text-muted-foreground">
          실시간으로 지갑 활동을 모니터링하고 중요한 변화를 확인하세요
        </p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">최근 활동</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            모니터링 중인 지갑의 주요 활동과 인사이트를 확인할 수 있습니다
          </p>
        </div>
        <div className="p-6">
          <InsightCardDemo />
        </div>
      </section>
    </div>
  );
} 