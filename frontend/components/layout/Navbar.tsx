'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';

export const Navbar = () => {
  const { isAuthenticated, subscription, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const navLinkClass = (path: string) => {
    const baseClass = "px-3 py-2 text-sm font-medium";
    return isActive(path) 
      ? `${baseClass} text-indigo-600 font-semibold`
      : `${baseClass} text-gray-600`;
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Cobia
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-end space-x-8">
            {isAuthenticated ? (
              <>
                <Link href="/" className={navLinkClass('/')}>
                  Dashboard
                </Link>
                <Link href="/wallets" className={navLinkClass('/wallets')}>
                  Wallets
                </Link>
                <Link href="/reports" className={navLinkClass('/reports')}>
                  Reports
                </Link>
                <Link href="/pricing" className={navLinkClass('/pricing')}>
                  Pricing
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/20 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={navLinkClass('/auth/login')}>
                  Sign In
                </Link>
                <Link href="/pricing" className={navLinkClass('/pricing')}>
                  Pricing
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/20 transition-colors"
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