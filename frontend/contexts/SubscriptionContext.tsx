import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

interface SubscriptionContextType {
  isFeatureAvailable: (feature: string) => boolean;
  getFeatureLimit: (feature: string) => number;
  getCurrentUsage: (feature: string) => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FEATURE_LIMITS: Record<string, Record<string, number>> = {
  FREE: {
    reports: 1,
    wallets: 1,
    alerts: 0,
    aiInsights: 0,
  },
  BASIC: {
    reports: 5,
    wallets: 3,
    alerts: 5,
    aiInsights: 0,
  },
  PRO: {
    reports: Infinity,
    wallets: Infinity,
    alerts: Infinity,
    aiInsights: 10,
  },
  PREMIUM: {
    reports: Infinity,
    wallets: Infinity,
    alerts: Infinity,
    aiInsights: Infinity,
  },
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { subscription } = useAuth();

  const isFeatureAvailable = (feature: string): boolean => {
    const tier = subscription?.tier || 'FREE';
    const limit = FEATURE_LIMITS[tier][feature];
    return limit > 0;
  };

  const getFeatureLimit = (feature: string): number => {
    const tier = subscription?.tier || 'FREE';
    return FEATURE_LIMITS[tier][feature];
  };

  const getCurrentUsage = (feature: string): number => {
    // This would typically come from your backend
    // For now, we'll return a mock value
    return 0;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isFeatureAvailable,
        getFeatureLimit,
        getCurrentUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 