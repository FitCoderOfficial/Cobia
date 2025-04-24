'use client';

import { useAuth } from '../../hooks/auth/useAuth';
import Image from 'next/image';

interface AdBannerProps {
  position: 'dashboard' | 'report' | 'wallet';
  className?: string;
}

export function AdBanner({ position, className }: AdBannerProps) {
  const { subscription } = useAuth();

  // PRO나 PREMIUM 구독자에게는 광고를 표시하지 않음
  if (subscription?.tier === 'PRO' || subscription?.tier === 'PREMIUM') {
    return null;
  }

  // 실제 광고 구현 시 이 부분을 광고 서비스 로직으로 대체
  const dummyAdImage = '/images/ad-placeholder.png';

  const getAdContent = () => {
    switch (position) {
      case 'dashboard':
        return {
          image: '/images/ads/dashboard-banner.jpg',
          alt: '프리미엄 구독으로 업그레이드하고 더 많은 기능을 사용해보세요',
          link: '/pricing'
        };
      case 'report':
        return {
          image: '/images/ads/report-banner.jpg',
          alt: 'AI 기반 리포트로 더 정확한 분석을 경험해보세요',
          link: '/pricing'
        };
      case 'wallet':
        return {
          image: '/images/ads/wallet-banner.jpg',
          alt: '실시간 지갑 모니터링으로 투자 기회를 놓치지 마세요',
          link: '/pricing'
        };
      default:
        return {
          image: '/images/ads/default-banner.jpg',
          alt: '코비아 프리미엄 구독',
          link: '/pricing'
        };
    }
  };

  const adContent = getAdContent();

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden bg-gray-100 ${className || ''}`}>
      <Image
        src={dummyAdImage}
        alt="Advertisement"
        fill
        className="object-cover"
        sizes="(max-width: 300px) 100vw, 300px"
        priority={false}
      />
    </div>
  );
} 