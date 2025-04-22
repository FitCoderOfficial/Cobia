'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { Layout } from '@/components/layout/Layout';
import api from '@/lib/api';

interface SubscriptionStatus {
  tier: 'FREE' | 'PRO' | 'WHALE';
  is_active: boolean;
  end_date: string | null;
}

const features = [
  {
    title: 'Whale Wallet Tracking',
    description: 'Monitor large cryptocurrency wallets and their transactions in real-time.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'AI-Powered Predictions',
    description: 'Get accurate market predictions using advanced machine learning algorithms.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Real-time Alerts',
    description: 'Receive instant notifications about significant market movements.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/subscriptions/status/');
          setSubscription(response.data.subscription);
        } catch (error) {
          console.error('Failed to fetch subscription status:', error);
        }
      }
    };

    fetchSubscriptionStatus();
  }, [isAuthenticated]);

  if (isLoading) {
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

  if (isAuthenticated) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Welcome back, {user?.nickname || 'User'}!
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                Your current subscription: {subscription?.tier || 'FREE'}
              </p>
              {subscription?.end_date && (
                <p className="mt-2 text-sm text-gray-500">
                  Valid until: {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/wallets"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    View Wallets
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Track and manage your cryptocurrency wallets
                  </p>
                </div>
              </Link>

              <Link
                href="/reports"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
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
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    View Reports
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Access your analysis reports and insights
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white min-h-[calc(100vh-4rem)]">
        <div className="relative">
          {/* Hero section with gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Follow the whales,</span>
                <span className="block text-indigo-600">predict your profit</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                Track whale wallets, analyze market trends, and make informed investment decisions with our AI-powered platform.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/20 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/20 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Powerful Features
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Everything you need to make informed investment decisions
              </p>
            </div>

            <div className="mt-20">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                        {feature.icon}
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
