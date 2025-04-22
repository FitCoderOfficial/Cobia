'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Mock data - In real app, this would come from API/URL params
const mockSubscriptionData = {
  plan: 'PRO',
  amount: '9,900',
  startDate: '2025.04.22',
  endDate: '2025.05.22',
};

const Sparkles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          style={{
            filter: 'blur(1px)',
            boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}
    </div>
  );
};

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const shootConfetti = useCallback(() => {
    const count = 150;
    const defaults = {
      startVelocity: 90,
      spread: 25,
      ticks: 400,
      zIndex: 999,
      decay: 0.94,
      gravity: 0.3,
      scalar: 1.5,
    };

    // Left side diagonal
    confetti({
      ...defaults,
      particleCount: count,
      origin: { x: -0.2, y: 1.3 },
      angle: 45,
      colors: ['#FF69B4', '#FFD700', '#4CAF50', '#1E90FF'],
    });

    // Right side diagonal
    confetti({
      ...defaults,
      particleCount: count,
      origin: { x: 1.2, y: 1.3 },
      angle: 135,
      colors: ['#FF69B4', '#FFD700', '#4CAF50', '#1E90FF'],
    });

    // Additional diagonal streams with slight delays
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: count * 0.7,
        origin: { x: -0.1, y: 1.3 },
        angle: 45,
        colors: ['#FF69B4', '#FFD700'],
      });
    }, 200);

    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: count * 0.7,
        origin: { x: 1.1, y: 1.3 },
        angle: 135,
        colors: ['#4CAF50', '#1E90FF'],
      });
    }, 200);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      shootConfetti();
      // Increase interval for more impact
      const timer = setInterval(shootConfetti, 7000);
      return () => clearInterval(timer);
    }
  }, [shootConfetti]);

  if (!mounted) return null;

  return (
    <Layout>
      <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="flex-1 bg-gradient-radial from-white via-indigo-50 to-white relative overflow-hidden flex">
          <Sparkles />
          
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl"
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 lg:p-14 relative overflow-hidden mx-auto"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  style={{
                    background: 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.95))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(45deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))',
                      filter: 'blur(20px)',
                      opacity: 0.5,
                      zIndex: -1,
                    }}
                  />

                  {/* Success Icon */}
                  <motion.div
                    className="text-center mb-12"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.3,
                    }}
                  >
                    <span className="text-9xl sm:text-[150px] inline-block transform hover:scale-110 transition-transform duration-300">🥳</span>
                  </motion.div>

                  {/* Welcome Message */}
                  <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                      Welcome to {mockSubscriptionData.plan}!
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                      You're now a premium member. Enjoy all features with no limits!
                    </p>
                  </motion.div>

                  {/* Subscription Details */}
                  <motion.div
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-8 shadow-lg border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Summary</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-medium text-gray-900">{mockSubscriptionData.plan}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-medium text-gray-900">₩{mockSubscriptionData.amount}/월</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Period</span>
                        <span className="font-medium text-gray-900">
                          {mockSubscriptionData.startDate} ~ {mockSubscriptionData.endDate}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/dashboard')}
                      className="w-full px-6 py-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:shadow-xl"
                    >
                      Go to Dashboard
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/reports')}
                      className="w-full px-6 py-4 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-medium transition-all duration-200"
                    >
                      View My Reports
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