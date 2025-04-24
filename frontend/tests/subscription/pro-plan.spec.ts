import { test, expect } from '../setup/subscription';

test.describe('PRO Plan Subscription', () => {
  test.beforeEach(async ({ page }) => {
    // Mock PRO plan subscription
    await page.route('/api/subscriptions/status', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          tier: 'PRO',
          status: 'active',
        }),
      });
    });
  });

  test('should allow unlimited reports', async ({ page }) => {
    await page.goto('/report');
    
    // Mock high report count
    await page.route('/api/reports/count', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ count: 100 }),
      });
    });

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Try to generate a report
    const generateButton = page.getByRole('button', { name: /리포트 생성하기/i });
    await generateButton.waitFor({ state: 'visible', timeout: 10000 });
    await generateButton.click();

    // Verify no upgrade modal is shown
    const upgradeModal = page.getByRole('dialog');
    await expect(upgradeModal).not.toBeVisible({ timeout: 10000 });
  });

  test('should allow unlimited wallet registrations', async ({ page }) => {
    await page.goto('/wallet');
    
    // Mock high wallet count
    await page.route('/api/wallets/count', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ count: 50 }),
      });
    });

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click the add wallet button to open modal
    const addButton = page.getByRole('button', { name: /새로운 지갑을 추가/i });
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();

    // Fill in the wallet form
    await page.fill('input[name="address"]', '0x123456789');
    await page.fill('input[name="alias"]', 'Test Wallet');
    await page.click('button[type="submit"]');

    // Verify no upgrade modal is shown
    const upgradeModal = page.getByRole('dialog');
    await expect(upgradeModal).not.toBeVisible({ timeout: 10000 });
  });

  test('should show subscription management link in navbar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify subscription management link is visible
    const upgradeLink = page.getByRole('link', { name: /플랜보기/i });
    await expect(upgradeLink).toBeVisible({ timeout: 10000 });
  });

  test('should show all core features', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify all core features are visible
    const reportFeature = page.getByText('리포트');
    const walletFeature = page.getByText('지갑');
    const noAds = page.getByText('광고 제거');
    
    await expect(reportFeature).toBeVisible({ timeout: 10000 });
    await expect(walletFeature).toBeVisible({ timeout: 10000 });
    await expect(noAds).toBeVisible({ timeout: 10000 });
  });

  test('should show PRO plan badge', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify PRO plan badge is visible
    const proBadge = page.getByText('PRO');
    await expect(proBadge).toBeVisible({ timeout: 10000 });
  });

  test('should allow AI insights with limit', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Mock AI insights usage
    await page.route('/api/features/usage', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          aiInsights: 10,
        }),
      });
    });

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Try to use AI insights
    const aiInsightsButton = page.getByRole('button', { name: /AI 인사이트 생성하기/i });
    await aiInsightsButton.waitFor({ state: 'visible', timeout: 10000 });
    await aiInsightsButton.click();

    // Verify upgrade modal is shown for PREMIUM
    await expect(page.locator('text=업그레이드가 필요합니다')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=PREMIUM으로 업그레이드하여 무제한 AI 인사이트를 사용하세요')).toBeVisible({ timeout: 10000 });
  });
}); 