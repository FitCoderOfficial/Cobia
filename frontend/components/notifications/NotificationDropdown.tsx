'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/auth/useAuth';

interface Notification {
  id: string;
  type: 'subscription' | 'report' | 'wallet' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// 임시 알림 데이터
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'subscription',
    title: '구독 갱신 안내',
    message: '구독이 7일 후 만료됩니다. 지금 갱신하세요.',
    timestamp: new Date(),
    read: false,
  },
  {
    id: '2',
    type: 'report',
    title: '새로운 리포트',
    message: '관심 있는 지갑의 새로운 분석 리포트가 생성되었습니다.',
    timestamp: new Date(Date.now() - 3600000),
    read: true,
  },
  {
    id: '3',
    type: 'wallet',
    title: '지갑 트랜잭션 감지',
    message: '모니터링 중인 지갑에서 대규모 거래가 발생했습니다.',
    timestamp: new Date(Date.now() - 7200000),
    read: false,
  },
];

export const NotificationDropdown = () => {
  const { subscription } = useAuth();

  // 구독 등급에 따른 알림 필터링
  const filteredNotifications = mockNotifications.filter(notification => {
    if (subscription?.tier === 'FREE') {
      // FREE 등급은 구독 관련 알림만 표시
      return notification.type === 'subscription' || notification.type === 'system';
    }
    // PRO/PREMIUM은 모든 알림 표시
    return true;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative flex items-center text-gray-600 hover:text-gray-900 focus:outline-none">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-xs text-white">{unreadCount}</span>
          </span>
        )}
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
        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">알림</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500">
                  읽지 않은 알림 {unreadCount}개
                </span>
              )}
            </div>
            <div className="space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <div
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } ${
                          !notification.read ? 'bg-indigo-50/50' : ''
                        } p-3 rounded-lg cursor-pointer`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </Menu.Item>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">새로운 알림이 없습니다</p>
                </div>
              )}
            </div>
            {filteredNotifications.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  모든 알림 보기
                </button>
              </div>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}; 