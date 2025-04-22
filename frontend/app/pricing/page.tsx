'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/auth/useAuth';
import api from '@/lib/api';

const calculateMonthlyFromYearly = (yearlyPrice: string) => {
  const price = parseInt(yearlyPrice.replace(',', ''));
  return Math.floor(price / 12).toLocaleString();
};

const plans = [
  {
    name: 'FREE',
    price: '0',
    yearlyPrice: '0',
    monthlyPriceInYearly: '0',
    description: '개인 투자자를 위한 기본 플랜',
    subtitle: '암호화폐 투자를 시작하는 분들을 위한 플랜',
    features: [
      { text: '1개의 지갑 모니터링', included: true },
      { text: '월 1회 리포트 조회', included: true },
      { text: '광고 포함', included: true },
      { text: '알림 없음', included: true },
      { text: '웨일 알림', included: false },
      { text: 'AI 인사이트', included: false },
      { text: '광고 제거', included: false },
      { text: '우선 지원', included: false },
    ],
    buttonText: '무료로 시작하기',
    buttonSubtext: '신용카드가 필요하지 않습니다',
    buttonClass: 'bg-gray-100 text-gray-500',
    isPopular: false,
    gradientClass: 'from-gray-500/10 to-gray-500/20',
  },
  {
    name: 'BASIC',
    price: '4,900',
    yearlyPrice: '49,000',
    monthlyPriceInYearly: '4,083',
    description: '적극적인 투자자를 위한 플랜',
    subtitle: '더 많은 기능이 필요한 활발한 투자자를 위한 플랜',
    features: [
      { text: '3개의 지갑 모니터링', included: true },
      { text: '월 5회 리포트 조회', included: true },
      { text: '제한된 웨일 알림', included: true },
      { text: '광고 포함', included: true },
      { text: 'AI 인사이트', included: false },
      { text: '광고 제거', included: false },
      { text: '우선 지원', included: false },
      { text: '얼리 액세스', included: false },
    ],
    buttonText: '7일 무료 체험 시작하기',
    buttonSubtext: '언제든지 해지 가능',
    buttonClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
    isPopular: false,
    gradientClass: 'from-indigo-500/10 to-indigo-500/20',
  },
  {
    name: 'PRO',
    price: '9,900',
    yearlyPrice: '99,000',
    monthlyPriceInYearly: '8,250',
    description: '전문 투자자를 위한 프리미엄 플랜',
    subtitle: '전문적인 분석과 인사이트가 필요한 분들을 위한 플랜',
    features: [
      { text: '무제한 지갑 모니터링', included: true },
      { text: '무제한 리포트 조회', included: true },
      { text: '실시간 웨일 알림', included: true },
      { text: 'AI 인사이트', included: true },
      { text: '광고 제거', included: true },
      { text: '우선 지원', included: false },
      { text: '얼리 액세스', included: false },
      { text: '실시간 트래킹', included: false },
    ],
    buttonText: '7일 무료 체험 시작하기',
    buttonSubtext: '언제든지 해지 가능',
    buttonClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
    isPopular: true,
    gradientClass: 'from-purple-500/10 to-purple-500/20',
  },
  {
    name: 'PREMIUM',
    price: '19,900',
    yearlyPrice: '199,000',
    monthlyPriceInYearly: '16,583',
    description: '기관 투자자를 위한 엔터프라이즈 플랜',
    subtitle: '대규모 포트폴리오 관리와 전문 분석이 필요한 기관을 위한 플랜',
    features: [
      { text: '무제한 지갑 모니터링', included: true },
      { text: '무제한 리포트 조회', included: true },
      { text: '실시간 웨일 알림', included: true },
      { text: 'AI 인사이트', included: true },
      { text: '광고 제거', included: true },
      { text: '우선 지원', included: true },
      { text: '얼리 액세스', included: true },
      { text: '실시간 트래킹', included: true },
    ],
    buttonText: '7일 무료 체험 시작하기',
    buttonSubtext: '언제든지 해지 가능',
    buttonClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
    isPopular: false,
    gradientClass: 'from-pink-500/10 to-pink-500/20',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, subscription } = useAuth();
  const [isYearly, setIsYearly] = useState(false);

  const handleUpgrade = async (planName: string, amount: number) => {
    try {
      const response = await api.post('/api/payments/initiate', {
        amount,
        planType: planName,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        orderName: `Cobia ${planName} ${isYearly ? 'Yearly' : 'Monthly'} Subscription`,
      });
      
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90rem] mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
              당신에게 맞는 플랜을 선택하세요
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              모든 플랜은 7일 무료 체험이 가능하며, 언제든지 취소할 수 있습니다.
            </p>

            {/* Billing Toggle */}
            <div className="mt-12 flex justify-center items-center space-x-3">
              <span className={`text-sm ${!isYearly ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>월간 결제</span>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isYearly ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
                onClick={() => setIsYearly(!isYearly)}
              >
                <span className="sr-only">요금제 전환</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isYearly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                연간 결제 <span className="text-indigo-600 font-semibold">(17% 할인)</span>
              </span>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 min-w-[300px] ${
                  plan.isPopular ? 'ring-2 ring-indigo-500 scale-105 lg:scale-110' : ''
                }`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradientClass} opacity-50`} />
                
                {/* Content */}
                <div className="relative p-10 flex flex-col h-full">
                  {/* Header Section */}
                  <div className="mb-8">
                    {plan.isPopular && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          가장 인기
                        </span>
                      </div>
                    )}
                    <div className="min-h-[100px] pt-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-500 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center whitespace-nowrap">
                      <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 mr-1">₩</span>
                      <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                        {isYearly ? plan.monthlyPriceInYearly : plan.price}
                      </span>
                      <span className="ml-2 text-xl font-normal text-gray-500">/월</span>
                    </div>
                    {plan.price !== '0' && (
                      <p className="mt-2 text-sm text-gray-500">
                        {isYearly ? (
                          <>연 ₩{plan.yearlyPrice}원</>
                        ) : (
                          <>연간 결제 시 월 ₩{plan.monthlyPriceInYearly}원</>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Features Section */}
                  <div className="flex-grow">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className="flex items-start">
                          {feature.included ? (
                            <svg
                              className="flex-shrink-0 h-5 w-5 text-green-500 mt-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="flex-shrink-0 h-5 w-5 text-gray-300 mt-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span className={`ml-3 ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Button Section */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleUpgrade(plan.name, parseInt(isYearly ? plan.yearlyPrice : plan.price.replace(',', '')))}
                      className={`w-full px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                        plan.name === subscription?.tier
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.buttonClass
                      }`}
                      disabled={plan.name === subscription?.tier}
                    >
                      {plan.name === subscription?.tier ? '현재 플랜' : plan.buttonText}
                    </button>
                    <p className="mt-2 text-sm text-center text-gray-500">{plan.buttonSubtext}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-500 max-w-3xl mx-auto">
              모든 플랜은 언제든지 해지할 수 있으며, 숨겨진 비용이 없습니다.
              문의사항이 있으신가요? <a href="/contact" className="text-indigo-600 hover:text-indigo-500">고객센터</a>에 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 