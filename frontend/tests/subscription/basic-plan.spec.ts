import { test, expect } from '../setup/subscription';

test.describe('BASIC Plan Subscription', () => {
  test.beforeEach(async ({ page }) => {
    // Mock BASIC plan subscription
    await page.route('/api/subscriptions/status', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          tier: 'BASIC',
          status: 'active',
        }),
      });
    });
  });

  test('should allow up to 3 wallet registrations', async ({ page }) => {
    await page.goto('/wallet');
    
    // Mock wallet count
    await page.route('/api/wallets/count', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ count: 3 }),
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

    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Verify upgrade modal is shown
    const upgradeModal = page.getByRole('dialog');
    await expect(upgradeModal).toBeVisible();
    await expect(upgradeModal).toContainText('업그레이드가 필요합니다');
    await expect(upgradeModal).toContainText('3개의 지갑 모니터링 한도를 초과했습니다');
  });

  test('should allow up to 5 reports', async ({ page }) => {
    await page.goto('/report');
    
    // Mock report count
    await page.route('/api/reports/count', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ count: 5 }),
      });
    });

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Try to generate a report
    const generateButton = page.getByRole('button', { name: /리포트 생성하기/i });
    await generateButton.waitFor({ state: 'visible', timeout: 10000 });
    await generateButton.click();

    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Verify upgrade modal is shown
    const upgradeModal = page.getByRole('dialog');
    await expect(upgradeModal).toBeVisible();
    await expect(upgradeModal).toContainText('업그레이드가 필요합니다');
    await expect(upgradeModal).toContainText('월 5회 리포트 조회 한도를 초과했습니다');
  });

  test('should show plan upgrade link in navbar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify plan upgrade link is visible
    const upgradeLink = page.getByRole('link', { name: /플랜보기/i });
    await expect(upgradeLink).toBeVisible({ timeout: 10000 });
  });
}); 