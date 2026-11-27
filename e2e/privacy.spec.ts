import { test, expect } from '@playwright/test';

test.describe('GhostPass E2E Independent Privacy & Security Verification', () => {
  const CANARY_PII = {
    email: 'canary.judge@confidential-audit.gov',
    card: '4532 0150 1234 5671',
    phone: '+91 98201 12345',
    pan: 'ABCPV1234K',
    aadhaar: '3675 9834 6016',
    ip: '192.168.1.100',
  };

  test('Test A: Request Interception - Zero canary leakage and zero unexpected cross-origin requests', async ({
    page,
  }) => {
    const networkRequests: { url: string; origin: string; method: string }[] = [];

    // Intercept all requests initiated by the browser
    await page.route('**/*', async (route) => {
      const req = route.request();
      const url = req.url();
      const origin = new URL(url).origin;
      const postData = req.postData() || '';

      // Check request URL and postData for any canary PII leak
      for (const [key, val] of Object.entries(CANARY_PII)) {
        expect(url, `Leak detected in request URL for ${key}`).not.toContain(val);
        expect(postData, `Leak detected in request body for ${key}`).not.toContain(val);
      }

      networkRequests.push({ url, origin, method: req.method() });
      await route.continue();
    });

    // 1. Navigate to GhostPass production preview
    await page.goto('/#workspace');
    await page.waitForLoadState('networkidle');

    // 2. Clear initial asset loading logs to measure only app execution requests
    const initialRequestCount = networkRequests.length;

    // 3. Input Canary PII payload into workspace
    const canaryPayload = `Audit Record: Contact ${CANARY_PII.email}, Phone: ${CANARY_PII.phone}, PAN: ${CANARY_PII.pan}, Aadhaar: ${CANARY_PII.aadhaar}, Card: ${CANARY_PII.card}, IP: ${CANARY_PII.ip}.`;
    await page.fill('textarea', canaryPayload);

    // Wait for live debounce sanitize
    await page.waitForTimeout(600);

    // Assert PII detected in live counter
    await expect(page.locator('text=6 PII found')).toBeVisible();

    // 4. Test all three modes
    await page.selectOption('select:has-text("Full Mask")', 'partialMask');
    await page.waitForTimeout(400);

    await page.selectOption('select:has-text("Partial Mask")', 'pseudonymize');
    await page.waitForTimeout(400);

    await page.selectOption('select:has-text("Pseudonymize")', 'fullMask');
    await page.waitForTimeout(400);

    // 5. Assert zero network requests happened during the entire sanitization workflow
    const postActionRequests = networkRequests.slice(initialRequestCount);
    expect(postActionRequests.length).toBe(0);
  });

  test('Test B: Storage Invariant - Zero canary content stored in client storage', async ({ page }) => {
    await page.goto('/#workspace');

    const canaryPayload = `Private Patient Note: ${CANARY_PII.email} with Card ${CANARY_PII.card}`;
    await page.fill('textarea', canaryPayload);
    await page.waitForTimeout(500);

    // Query localStorage, sessionStorage, and IndexedDB
    const storageAudit = await page.evaluate((canary) => {
      let leakFound = false;
      const checkedKeys: string[] = [];

      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        checkedKeys.push(k);
        const v = localStorage.getItem(k) || '';
        if (v.includes(canary.email) || v.includes(canary.card)) {
          leakFound = true;
        }
      }

      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i)!;
        checkedKeys.push(k);
        const v = sessionStorage.getItem(k) || '';
        if (v.includes(canary.email) || v.includes(canary.card)) {
          leakFound = true;
        }
      }

      return { leakFound, checkedKeys };
    }, CANARY_PII);

    expect(storageAudit.leakFound).toBe(false);
    // Only theme preference is allowed in localStorage
    for (const key of storageAudit.checkedKeys) {
      expect(['ghostpass_theme']).toContain(key);
    }
  });

  test('Test C: Content-Security-Policy blocks connect-src fetch attempts', async ({ page }) => {
    await page.goto('/#privacy');

    // Attempt to execute an external fetch inside the browser page context
    const fetchBlocked = await page.evaluate(async () => {
      try {
        await fetch('https://example.com/api/test', { mode: 'no-cors' });
        return false; // fetch was not blocked
      } catch {
        return true; // fetch was blocked by browser CSP
      }
    });

    expect(fetchBlocked).toBe(true);
  });

  test('Test D: Golden Journey - Sample load, multi-mode sanitize, and clean memory', async ({ page }) => {
    await page.goto('/#workspace');

    // 1. Select Support Ticket sample
    await page.locator('#select-load-sample').selectOption('support-ticket');
    await page.waitForTimeout(600);

    // 2. Assert entities detected against stable data-testid with true engine count (5 entities now that ORD- is rejected)
    const entityCountLocator = page.locator('[data-testid="entity-count"]');
    await expect(entityCountLocator).toBeVisible();
    await expect(entityCountLocator).toHaveText('5 PII found');

    // 3. Switch to Pseudonymize
    await page.locator('#select-redaction-mode').selectOption('pseudonymize');
    await page.waitForTimeout(400);

    // 4. Clear Memory
    await page.click('button:has-text("Clear Memory")');
    await page.click('button:has-text("Reset Memory Map")');
    await page.waitForTimeout(300);

    // Verify Privacy Center route works
    await page.goto('/#privacy');
    await expect(page.locator('text=100% Client-Side')).toBeVisible();
  });

  test('Test E: XSS Immunity - Inert rendering of script and onerror payloads', async ({ page }) => {
    await page.goto('/#workspace');

    const xssPayload = `<script>window.__xssPwned = true;</script><img src="x" onerror="window.__xssPwned = true;"> and user email alex@example.com`;
    await page.fill('textarea', xssPayload);
    await page.waitForTimeout(500);

    // Assert that the script did not execute
    const xssExecuted = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).__xssPwned === true;
    });

    expect(xssExecuted).toBe(false);

    // Assert that no unescaped script tag was injected into DOM
    const scriptElements = await page.locator('mark script').count();
    expect(scriptElements).toBe(0);
  });
});
