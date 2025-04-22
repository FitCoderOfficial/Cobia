import { Inter } from 'next/font/google';
import { AuthProvider } from '../components/providers/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Cobia - Track Whale Wallets',
  description: 'Track whale wallets, analyze market trends, and make informed investment decisions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
