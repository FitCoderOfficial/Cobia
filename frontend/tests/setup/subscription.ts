import { test as base } from '@playwright/test';
import { useAuth } from '@/hooks/auth/useAuth';

// Extend the base test with subscription-related fixtures
export const test = base.extend({
  // Mock subscription state
  subscription: async ({ page }, use) => {
    await page.route('/api/subscriptions/status', async (route) => {
      const subscription = await useAuth().subscription;
      await route.fulfill({
        status: 200,
        body: JSON.stringify(subscription),
      });
    });
    await use(null);
  },

  // Mock feature usage
  featureUsage: async ({ page }, use) => {
    await page.route('/api/features/usage', async (route) => {
      const usage = {
        reports: 0,
        wallets: 0,
        alerts: 0,
        aiInsights: 0,
      };
      await route.fulfill({
        status: 200,
        body: JSON.stringify(usage),
      });
    });
    await use(null);
  },
});

export { expect } from '@playwright/test'; 