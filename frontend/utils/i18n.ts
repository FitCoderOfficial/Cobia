'use client';

import { usePathname } from 'next/navigation';
import commonKo from '@/locales/ko/common.json';
import commonEn from '@/locales/en/common.json';
import dashboardKo from '@/locales/ko/dashboard.json';
import dashboardEn from '@/locales/en/dashboard.json';
import walletKo from '@/locales/ko/wallet.json';
import walletEn from '@/locales/en/wallet.json';
import reportKo from '@/locales/ko/report.json';
import reportEn from '@/locales/en/report.json';

const translations = {
  ko: {
    ...commonKo,
    ...dashboardKo,
    ...walletKo,
    ...reportKo,
  },
  en: {
    ...commonEn,
    ...dashboardEn,
    ...walletEn,
    ...reportEn,
  },
};

export const useTranslation = () => {
  const pathname = usePathname();
  const locale = pathname.startsWith('/en') ? 'en' : 'ko';

  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];

    for (const k of keys) {
      value = value?.[k];
    }

    if (!value) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((acc, [key, val]) => {
        return acc.replace(`{{${key}}}`, String(val));
      }, value);
    }

    return value;
  };

  return {
    t,
    locale,
  };
}; 