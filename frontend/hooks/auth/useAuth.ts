export type SubscriptionTier = 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled';

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
} 