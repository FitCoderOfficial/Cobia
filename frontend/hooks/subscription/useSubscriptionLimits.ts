import { useState } from 'react';
import { useAuth } from '../auth/useAuth';

interface SubscriptionLimits {
  reportLimit: number;
  walletLimit: number;
}

const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  FREE: {
    reportLimit: 1,
    walletLimit: 1,
  },
  BASIC: {
    reportLimit: 5,
    walletLimit: 3,
  },
  PRO: {
    reportLimit: Infinity,
    walletLimit: Infinity,
  },
  PREMIUM: {
    reportLimit: Infinity,
    walletLimit: Infinity,
  },
};

export const useSubscriptionLimits = () => {
  const { subscription } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalType, setUpgradeModalType] = useState<'report' | 'wallet'>('report');
  const [currentCount, setCurrentCount] = useState(0);

  const getLimits = (): SubscriptionLimits => {
    return SUBSCRIPTION_LIMITS[subscription?.tier || 'FREE'];
  };

  const checkReportAccess = (currentReportCount: number): boolean => {
    const { reportLimit } = getLimits();
    if (currentReportCount >= reportLimit) {
      setCurrentCount(currentReportCount);
      setUpgradeModalType('report');
      setIsUpgradeModalOpen(true);
      return false;
    }
    return true;
  };

  const checkWalletAccess = (currentWalletCount: number): boolean => {
    const { walletLimit } = getLimits();
    if (currentWalletCount >= walletLimit) {
      setCurrentCount(currentWalletCount);
      setUpgradeModalType('wallet');
      setIsUpgradeModalOpen(true);
      return false;
    }
    return true;
  };

  return {
    limits: getLimits(),
    checkReportAccess,
    checkWalletAccess,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    upgradeModalType,
    currentCount,
  };
}; 