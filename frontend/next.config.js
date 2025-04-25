/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
    localeDetection: true,
    domains: [
      {
        domain: 'cobia.io',
        defaultLocale: 'ko',
      },
      {
        domain: 'en.cobia.io',
        defaultLocale: 'en',
      },
    ],
  },
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig 