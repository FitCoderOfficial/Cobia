'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-colors">
              Cobia
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/wallets"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Wallets
                </Link>
                <Link
                  href="/reports"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Reports
                </Link>
                <button
                  onClick={logout}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/20 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/20 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 