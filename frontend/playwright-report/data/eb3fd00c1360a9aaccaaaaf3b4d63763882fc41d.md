# Test info

- Name: PREMIUM Plan Subscription >> should show subscription management link in navbar
- Location: /Users/master/Works/Dev/Cobia/frontend/tests/subscription/premium-plan.spec.ts:65:7

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: getByRole('link', { name: /구독 관리/i })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for getByRole('link', { name: /구독 관리/i })

    at /Users/master/Works/Dev/Cobia/frontend/tests/subscription/premium-plan.spec.ts:73:34
```

# Page snapshot

```yaml
- navigation:
  - link "Cobia":
    - /url: /
  - link "대시보드":
    - /url: /
  - link "지갑":
    - /url: /wallets
  - link "리포트":
    - /url: /reports
  - link "플랜보기":
    - /url: /pricing
  - button "로그아웃"
- heading "환영합니다, 사용자님!" [level=1]
- paragraph: "현재 구독:"
- paragraph: "유효기간: Invalid Date"
- heading "지갑 보기" [level=2]
- paragraph: 암호화폐 지갑을 추적하고 잔액을 실시간으로 모니터링하세요
- button "지갑 관리하기"
- heading "리포트 보기" [level=2]
- paragraph: 분석 리포트와 인사이트에 접근하세요
- button "리포트 보기"
- contentinfo:
  - link "Cobia":
    - /url: /
  - paragraph: Track whale wallets, analyze market trends, and make informed investment decisions with our AI-powered platform.
  - heading "Product" [level=3]
  - list:
    - listitem:
      - link "Features":
        - /url: /features
    - listitem:
      - link "Pricing":
        - /url: /pricing
    - listitem:
      - link "Reports":
        - /url: /reports
  - heading "Company" [level=3]
  - list:
    - listitem:
      - link "About":
        - /url: /about
    - listitem:
      - link "Contact":
        - /url: /contact
    - listitem:
      - link "Blog":
        - /url: /blog
  - text: © 2025 Cobia. All rights reserved.
  - link "Terms":
    - /url: /terms
  - link "Privacy":
    - /url: /privacy
  - link "Cookies":
    - /url: /cookies
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
  57 |     await addButton.waitFor({ state: 'visible', timeout: 10000 });
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
> 73 |     await expect(managementLink).toBeVisible({ timeout: 10000 });
     |                                  ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  74 |   });
  75 | }); 
```