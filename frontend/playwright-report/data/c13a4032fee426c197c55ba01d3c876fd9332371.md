# Test info

- Name: PRO Plan Subscription >> should allow AI insights with limit
- Location: /Users/master/Works/Dev/Cobia/frontend/tests/subscription/pro-plan.spec.ts:103:7

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /AI 인사이트 생성하기/i }) to be visible

    at /Users/master/Works/Dev/Cobia/frontend/tests/subscription/pro-plan.spec.ts:121:28
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
   73 |     await expect(managementLink).toBeVisible({ timeout: 10000 });
   74 |   });
   75 |
   76 |   test('should show all core features', async ({ page }) => {
   77 |     await page.goto('/dashboard');
   78 |     
   79 |     // Wait for the page to load
   80 |     await page.waitForLoadState('networkidle');
   81 |
   82 |     // Verify all core features are visible
   83 |     const aiInsights = page.getByText('AI 인사이트');
   84 |     const realtimeTracking = page.getByText('실시간 트래킹');
   85 |     const noAds = page.getByText('광고 제거');
   86 |     
   87 |     await expect(aiInsights).toBeVisible({ timeout: 10000 });
   88 |     await expect(realtimeTracking).toBeVisible({ timeout: 10000 });
   89 |     await expect(noAds).toBeVisible({ timeout: 10000 });
   90 |   });
   91 |
   92 |   test('should show PRO plan badge', async ({ page }) => {
   93 |     await page.goto('/dashboard');
   94 |     
   95 |     // Wait for the page to load
   96 |     await page.waitForLoadState('networkidle');
   97 |
   98 |     // Verify PRO plan badge is visible
   99 |     const proBadge = page.getByText('PRO');
  100 |     await expect(proBadge).toBeVisible({ timeout: 10000 });
  101 |   });
  102 |
  103 |   test('should allow AI insights with limit', async ({ page }) => {
  104 |     await page.goto('/dashboard');
  105 |     
  106 |     // Mock AI insights usage
  107 |     await page.route('/api/features/usage', async (route) => {
  108 |       await route.fulfill({
  109 |         status: 200,
  110 |         body: JSON.stringify({
  111 |           aiInsights: 10,
  112 |         }),
  113 |       });
  114 |     });
  115 |
  116 |     // Wait for the page to load
  117 |     await page.waitForLoadState('networkidle');
  118 |
  119 |     // Try to use AI insights
  120 |     const aiInsightsButton = page.getByRole('button', { name: /AI 인사이트 생성하기/i });
> 121 |     await aiInsightsButton.waitFor({ state: 'visible', timeout: 10000 });
      |                            ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  122 |     await aiInsightsButton.click();
  123 |
  124 |     // Verify upgrade modal is shown for PREMIUM
  125 |     await expect(page.locator('text=업그레이드가 필요합니다')).toBeVisible({ timeout: 10000 });
  126 |     await expect(page.locator('text=PREMIUM으로 업그레이드하여 무제한 AI 인사이트를 사용하세요')).toBeVisible({ timeout: 10000 });
  127 |   });
  128 | }); 
```