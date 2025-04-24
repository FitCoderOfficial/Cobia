import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Set default locale to Korean if not set
    if (!router.locale) {
      router.push(router.pathname, router.asPath, { locale: 'ko' });
    }
  }, [router]);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
} 