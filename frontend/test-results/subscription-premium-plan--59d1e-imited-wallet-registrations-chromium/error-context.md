# Test info

- Name: PREMIUM Plan Subscription >> should allow unlimited wallet registrations
- Location: /Users/master/Works/Dev/Cobia/frontend/tests/subscription/premium-plan.spec.ts:41:7

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /지갑 추가하기/i }) to be visible

    at /Users/master/Works/Dev/Cobia/frontend/tests/subscription/premium-plan.spec.ts:57:21
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
   3 | test.describe('PREMIUM Plan Subscription', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Mock PREMIUM plan subscription
   6 |     await page.route('/api/subscriptions/status', async (route) => {
   7 |       await route.fulfill({
   8 |         status: 200,
   9 |         body: JSON.stringify({
  10 |           tier: 'PREMIUM',
  11 |           status: 'active',
  12 |         }),
  13 |       });
  14 |     });
  15 |   });
  16 |
  17 |   test('should allow unlimited reports', async ({ page }) => {
  18 |     await page.goto('/report');
  19 |     
  20 |     // Mock high report count
  21 |     await page.route('/api/reports/count', async (route) => {
  22 |       await route.fulfill({
  23 |         status: 200,
  24 |         body: JSON.stringify({ count: 100 }),
  25 |       });
  26 |     });
  27 |
  28 |     // Wait for the page to load
  29 |     await page.waitForLoadState('networkidle');
  30 |
  31 |     // Try to generate a report
  32 |     const generateButton = page.getByRole('button', { name: /리포트 생성하기/i });
  33 |     await generateButton.waitFor({ state: 'visible', timeout: 10000 });
  34 |     await generateButton.click();
  35 |
  36 |     // Verify no upgrade modal is shown
  37 |     const upgradeModal = page.getByRole('dialog');
  38 |     await expect(upgradeModal).not.toBeVisible({ timeout: 10000 });
  39 |   });
  40 |
  41 |   test('should allow unlimited wallet registrations', async ({ page }) => {
  42 |     await page.goto('/wallet');
  43 |     
  44 |     // Mock high wallet count
  45 |     await page.route('/api/wallets/count', async (route) => {
  46 |       await route.fulfill({
  47 |         status: 200,
  48 |         body: JSON.stringify({ count: 50 }),
  49 |       });
  50 |     });
  51 |
  52 |     // Wait for the page to load
  53 |     await page.waitForLoadState('networkidle');
  54 |
  55 |     // Try to add a new wallet
  56 |     const addButton = page.getByRole('button', { name: /지갑 추가하기/i });
> 57 |     await addButton.waitFor({ state: 'visible', timeout: 10000 });
     |                     ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  58 |     await addButton.click();
  59 |
  60 |     // Verify no upgrade modal is shown
  61 |     const upgradeModal = page.getByRole('dialog');
  62 |     await expect(upgradeModal).not.toBeVisible({ timeout: 10000 });
  63 |   });
  64 |
  65 |   test('should show subscription management link in navbar', async ({ page }) => {
  66 |     await page.goto('/dashboard');
  67 |     
  68 |     // Wait for the page to load
  69 |     await page.waitForLoadState('networkidle');
  70 |
  71 |     // Verify subscription management link is visible
  72 |     const managementLink = page.getByRole('link', { name: /구독 관리/i });
  73 |     await expect(managementLink).toBeVisible({ timeout: 10000 });
  74 |   });
  75 | }); 
```