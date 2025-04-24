# Test info

- Name: BASIC Plan Subscription >> should allow up to 3 wallet registrations
- Location: /Users/master/Works/Dev/Cobia/frontend/tests/subscription/basic-plan.spec.ts:17:7

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /지갑 추가하기/i }) to be visible

    at /Users/master/Works/Dev/Cobia/frontend/tests/subscription/basic-plan.spec.ts:33:21
```

# Page snapshot

```yaml
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '../setup/subscription';
   2 |
   3 | test.describe('BASIC Plan Subscription', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Mock BASIC plan subscription
   6 |     await page.route('/api/subscriptions/status', async (route) => {
   7 |       await route.fulfill({
   8 |         status: 200,
   9 |         body: JSON.stringify({
  10 |           tier: 'BASIC',
  11 |           status: 'active',
  12 |         }),
  13 |       });
  14 |     });
  15 |   });
  16 |
  17 |   test('should allow up to 3 wallet registrations', async ({ page }) => {
  18 |     await page.goto('/wallet');
  19 |     
  20 |     // Mock wallet count
  21 |     await page.route('/api/wallets/count', async (route) => {
  22 |       await route.fulfill({
  23 |         status: 200,
  24 |         body: JSON.stringify({ count: 3 }),
  25 |       });
  26 |     });
  27 |
  28 |     // Wait for the page to load
  29 |     await page.waitForLoadState('networkidle');
  30 |
  31 |     // Try to add a new wallet
  32 |     const addButton = page.getByRole('button', { name: /지갑 추가하기/i });
> 33 |     await addButton.waitFor({ state: 'visible', timeout: 10000 });
     |                     ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  34 |     await addButton.click();
  35 |
  36 |     // Wait for modal to appear
  37 |     await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  38 |     
  39 |     // Verify upgrade modal is shown
  40 |     const upgradeModal = page.getByRole('dialog');
  41 |     await expect(upgradeModal).toBeVisible();
  42 |     await expect(upgradeModal).toContainText('업그레이드가 필요합니다');
  43 |     await expect(upgradeModal).toContainText('3개의 지갑 모니터링 한도를 초과했습니다');
  44 |   });
  45 |
  46 |   test('should allow up to 5 reports', async ({ page }) => {
  47 |     await page.goto('/report');
  48 |     
  49 |     // Mock report count
  50 |     await page.route('/api/reports/count', async (route) => {
  51 |       await route.fulfill({
  52 |         status: 200,
  53 |         body: JSON.stringify({ count: 5 }),
  54 |       });
  55 |     });
  56 |
  57 |     // Wait for the page to load
  58 |     await page.waitForLoadState('networkidle');
  59 |
  60 |     // Try to generate a report
  61 |     const generateButton = page.getByRole('button', { name: /리포트 생성하기/i });
  62 |     await generateButton.waitFor({ state: 'visible', timeout: 10000 });
  63 |     await generateButton.click();
  64 |
  65 |     // Wait for modal to appear
  66 |     await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  67 |     
  68 |     // Verify upgrade modal is shown
  69 |     const upgradeModal = page.getByRole('dialog');
  70 |     await expect(upgradeModal).toBeVisible();
  71 |     await expect(upgradeModal).toContainText('업그레이드가 필요합니다');
  72 |     await expect(upgradeModal).toContainText('월 5회 리포트 조회 한도를 초과했습니다');
  73 |   });
  74 |
  75 |   test('should show plan upgrade link in navbar', async ({ page }) => {
  76 |     await page.goto('/dashboard');
  77 |     
  78 |     // Wait for the page to load
  79 |     await page.waitForLoadState('networkidle');
  80 |
  81 |     // Verify plan upgrade link is visible
  82 |     const upgradeLink = page.getByRole('link', { name: /플랜보기/i });
  83 |     await expect(upgradeLink).toBeVisible({ timeout: 10000 });
  84 |   });
  85 | }); 
```