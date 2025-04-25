'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

export const Navbar = () => {
  const { isAuthenticated, subscription, logout } = useAuth();
  const pathname = usePathname() || '/';

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
      : `${baseClass} text-gray-600 hover:text-indigo-600 transition-colors`;
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Cobia
            </Link>
          </div>

          {/* Main Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            {isAuthenticated ? (
              <div className="flex items-center space-x-8">
                <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                  대시보드
                </Link>
                <Link href="/wallets" className={navLinkClass('/wallets')}>
                  지갑
                </Link>
                <Link href="/reports" className={navLinkClass('/reports')}>
                  리포트
                </Link>
                <Link href="/whales" className={navLinkClass('/whales')}>
                  고래
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-8">
                <Link href="/pricing" className={navLinkClass('/pricing')}>
                  요금제
                </Link>
                <Link href="/auth/login" className={navLinkClass('/auth/login')}>
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/20 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4 relative z-50">
              <NotificationDropdown />
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none">
                  <UserCircleIcon className="h-8 w-8" />
                  <ChevronDownIcon className="h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/account"
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                          >
                            계정 설정
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/pricing"
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                          >
                            구독 관리
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/help"
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                          >
                            도움말
                          </Link>
                        )}
                      </Menu.Item>
                      <div className="border-t border-gray-100 my-1" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } block w-full text-left px-4 py-2 text-sm text-red-600`}
                          >
                            로그아웃
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}; 