import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentCount: number;
  limit: number;
}

export const UpgradeModal = ({ isOpen, onClose, feature, currentCount, limit }: UpgradeModalProps) => {
  const router = useRouter();

  const getFeatureName = () => {
    switch (feature) {
      case 'reports':
        return '리포트';
      case 'wallets':
        return '지갑';
      case 'alerts':
        return '알림';
      case 'aiInsights':
        return 'AI 인사이트';
      default:
        return '기능';
    }
  };

  const getLimitMessage = () => {
    const featureName = getFeatureName();
    if (feature === 'reports') {
      return `월 ${limit}회 ${featureName} 조회 한도를 초과했습니다.`;
    }
    return `${limit}개의 ${featureName} 모니터링 한도를 초과했습니다.`;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  업그레이드가 필요합니다
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {getLimitMessage()}
                    <br />
                    더 많은 기능을 사용하시려면 프리미엄 플랜으로 업그레이드하세요.
                  </p>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none"
                    onClick={onClose}
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                    onClick={() => router.push('/pricing')}
                  >
                    업그레이드하기
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 