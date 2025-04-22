'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';

const errorMessages = {
  cancel: "Payment was cancelled",
  error: "Payment could not be processed",
  default: "We couldn't complete your subscription",
};

const errorDescriptions = {
  cancel: "You've cancelled the payment process. No worries, you can try again whenever you're ready.",
  error: "There was an issue processing your payment. Please try again or contact support if the problem persists.",
  default: "Something went wrong with your payment. Please try again or contact our support team for assistance.",
};

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const reason = searchParams.get('reason') as keyof typeof errorMessages || 'default';

  return (
    <Layout>
      <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="flex-1 bg-gradient-to-br from-red-50 via-gray-50 to-red-50 relative overflow-hidden flex">
          <div className="absolute inset-0 opacity-30">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[...Array(10)].map((_, i) => (
                <motion.line
                  key={i}
                  x1={i * 10}
                  y1="0"
                  x2={i * 10 + 10}
                  y2="100"
                  strokeWidth="0.5"
                  stroke="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                  className="text-red-200"
                />
              ))}
            </svg>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 relative overflow-hidden mx-auto"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  style={{
                    background: 'linear-gradient(to bottom right, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {/* Error Icon */}
                  <motion.div
                    className="text-center mb-8"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: [-5, 5, -5, 5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        delay: 0.3,
                      }}
                      className="inline-block"
                    >
                      <span className="text-7xl sm:text-8xl">😢</span>
                    </motion.div>
                  </motion.div>

                  {/* Error Message */}
                  <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                      Payment Failed
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-2">
                      {errorMessages[reason]}
                    </p>
                    <p className="text-base text-gray-500">
                      {errorDescriptions[reason]}
                    </p>
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/pricing')}
                      className="w-full px-6 py-4 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 hover:shadow-xl"
                    >
                      Try Again
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/dashboard')}
                      className="w-full px-6 py-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-all duration-200"
                    >
                      Go to Dashboard
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </Layout>
  );
} 