import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Marketing */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="mb-12">
            <Link href="/" className="inline-block">
              <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-colors">
                Cobia
              </h1>
            </Link>
            <p className="text-xl text-gray-600 max-w-md">
              Follow the whales, predict your profit. Track large cryptocurrency wallets and make informed investment decisions.
            </p>
          </div>
          <div className="mt-auto">
            <div className="relative w-full h-72">
              <Image
                src="/images/auth-illustration.svg"
                alt="Cryptocurrency illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:hidden">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-colors mb-2">
                Cobia
              </h1>
            </Link>
            <p className="text-gray-600">Follow the whales, predict your profit</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 mb-8">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}; 