const { chromium } = require('../../lbbs_Dash_v2/lbbs-v2/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['/servicios', '/servicios/la-bajadita-san-juan', '/servicios/la-bajadita-ricardo-palma']) {
      for (const width of [1920, 1366, 768, 390, 360]) {
        await page.setViewportSize({ width, height: 900 });
        const response = await page.goto('http://localhost:3002' + route);
        assert.equal(response.status(), 200);
        await page.locator('#service-branch').waitFor();
        assert.equal(await page.locator('h1').count(), 1);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert.equal(overflow, false, route + ' overflow at ' + width);
        if (route !== '/servicios') {
          assert.ok(await page.locator('main li').count() > 0, 'Missing services');
          assert.equal(await page.locator('#service-branch').inputValue(), route.split('/').pop());
          const outside = await page.locator('main li').evaluateAll(rows => rows.some(row => {
            const bounds = row.lastElementChild.getBoundingClientRect();
            return bounds.right > innerWidth || bounds.left < 0;
          }));
          assert.equal(outside, false, 'Price outside viewport');
        }
        console.log('PASS', route, width);
      }
    }
    const lastCategory = page.locator('[role="tablist"] [role="tab"]').last();
    await lastCategory.click();
    assert.equal(await lastCategory.getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('[role="tabpanel"] li').count(), 1);
    assert.equal(await page.locator('[role="tabpanel"] li').first().textContent(), 'Personalizado');
    assert.equal(await page.locator('[role="tabpanel"] li span').count(), 2);
    await page.locator('#service-branch').selectOption('la-bajadita-san-juan');
    await page.waitForURL('**/servicios/la-bajadita-san-juan');
    await page.screenshot({ path: 'service-menu-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.screenshot({ path: 'service-menu-desktop.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS category navigation, branch change, no browser errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
