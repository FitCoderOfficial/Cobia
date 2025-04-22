'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Modal } from '@/components/common/Modal';

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(true);

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/pricing');
  };

  const handleRetry = () => {
    setShowModal(false);
    router.push('/pricing');
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={handleCloseModal}
            title="Payment Failed"
            description={
              searchParams.get('message') ||
              'There was an error processing your payment. Please try again.'
            }
            confirmText="Try Again"
            cancelText="Close"
            onConfirm={handleRetry}
          />
        )}
      </div>
    </Layout>
  );
} 