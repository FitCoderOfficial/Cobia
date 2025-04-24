import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';

export const useFeatureAccess = (feature: string) => {
  const { isFeatureAvailable, getFeatureLimit, getCurrentUsage } = useSubscription();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const checkAccess = (): boolean => {
    if (!isFeatureAvailable(feature)) {
      setIsUpgradeModalOpen(true);
      return false;
    }

    const limit = getFeatureLimit(feature);
    const usage = getCurrentUsage(feature);

    if (usage >= limit) {
      setIsUpgradeModalOpen(true);
      return false;
    }

    return true;
  };

  return {
    checkAccess,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    limit: getFeatureLimit(feature),
    currentUsage: getCurrentUsage(feature),
  };
}; 