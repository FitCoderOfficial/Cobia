'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from '@/utils/i18n';

export const LanguageSwitcher = () => {
  const pathname = usePathname();
  const { locale } = useTranslation();

  const switchLanguage = (newLocale: string) => {
    const currentPath = pathname;
    const newPath = currentPath.startsWith('/en') 
      ? currentPath.replace('/en', '')
      : `/en${currentPath}`;
    
    window.location.href = newPath;
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => switchLanguage('ko')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          locale === 'ko'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        한국어
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          locale === 'en'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        English
      </button>
    </div>
  );
}; 