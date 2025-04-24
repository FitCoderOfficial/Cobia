'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSubscriptionLimits } from '@/hooks/subscription/useSubscriptionLimits';
import { UpgradeModal } from '@/components/modals/UpgradeModal';
import api from '@/lib/api';

export default function ReportPage() {
  const [reportCount, setReportCount] = useState(0);
  const {
    checkReportAccess,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    upgradeModalType,
    currentCount,
    limits,
  } = useSubscriptionLimits();

  useEffect(() => {
    const fetchReportCount = async () => {
      try {
        const response = await api.get('/api/reports/count');
        setReportCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch report count:', error);
      }
    };

    fetchReportCount();
  }, []);

  const handleGenerateReport = async () => {
    if (!checkReportAccess(reportCount)) {
      return;
    }

    try {
      // Generate report logic here
      await api.post('/api/reports/generate');
      setReportCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">리포트</h1>
        
        <div className="mb-4">
          <p className="text-gray-600">
            현재 리포트 사용량: {reportCount} / {limits.reportLimit === Infinity ? '무제한' : limits.reportLimit}
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          리포트 생성하기
        </button>

        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          limitType={upgradeModalType}
          currentCount={currentCount}
          limit={limits.reportLimit}
        />
      </div>
    </Layout>
  );
} 