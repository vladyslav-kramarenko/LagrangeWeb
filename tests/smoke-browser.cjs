const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const base = process.env.SITE || 'https://lagrangeweb.kramarenko-vladyslav-92.workers.dev';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    acceptDownloads: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
  });
  const errors = [];
  page.on('pageerror', e => errors.push(page.url() + ': ' + (e.stack || String(e))));

  try {
    const home = await page.goto(base + '/', {waitUntil:'networkidle', timeout: 60000});
    assert.equal(home.status(), 200);
    assert.match(await page.locator('h1').first().innerText(), /Lagrange/i);
    assert.equal(await page.locator('input[name="x[]"]').count(), 2);
    assert.equal(await page.locator('input[name="y[]"]').count(), 2);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');

    await page.locator('#theme-select').selectOption('light');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
    await page.locator('#theme-select').selectOption('dark');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');

    await page.locator('#language-select').selectOption('uk');
    assert.match(await page.locator('h1').first().innerText(), /Калькулятор/);
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('#language-select').inputValue(), 'uk');
    await page.locator('#language-select').selectOption('en');

    await page.locator('input[name="x[]"]').nth(0).fill('2');
    await page.locator('.sign-toggle').first().click();
    assert.equal(await page.locator('input[name="x[]"]').nth(0).inputValue(), '-2');
    await page.locator('.sign-toggle').first().click();
    assert.equal(await page.locator('input[name="x[]"]').nth(0).inputValue(), '2');
    await page.locator('input[name="x[]"]').nth(0).fill('1');
    await page.locator('input[name="y[]"]').nth(0).fill('2');
    await page.locator('input[name="x[]"]').nth(1).fill('2');
    await page.locator('input[name="y[]"]').nth(1).fill('5');
    await page.locator('#add-row-btn').click();
    await page.locator('input[name="x[]"]').nth(2).fill('3');
    await page.locator('input[name="y[]"]').nth(2).fill('10');
    await page.locator('.calculate-btn').first().click();
    assert.match(await page.locator('#output').innerHTML(), /1\.000x<sup>2<\/sup>/);
    assert.equal(await page.locator('#print-report-btn').isVisible(), true);
    assert.equal(await page.locator('#open-result-btn').isVisible(), true);
    assert.equal(await page.locator('#chart-placeholder').isVisible(), false);

    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('#print-points tr').count(), 3);
    assert.match(await page.locator('#print-formula').innerHTML(), /x<sup>2<\/sup>/);
    assert.match(await page.locator('#print-chart').getAttribute('src'), /^data:image\/png/);

    const shareHref = await page.locator('#open-result-btn').getAttribute('href');
    assert.match(shareHref, /^\/result\/\?p=/);
    const resultResponse = await page.goto(new URL(shareHref, base).href, {waitUntil:'networkidle'});
    assert.equal(resultResponse.status(), 200);
    assert.match(await page.locator('#result-formula').innerHTML(), /x<sup>2<\/sup>/);
    assert.equal(await page.locator('#result-content').isVisible(), true);
    await page.locator('#language-select').selectOption('de');
    const translationDiagnostics = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      select: document.getElementById('language-select').value,
      current: document.getElementById('language-current')?.textContent,
      helper: typeof window.lagrangeI18n,
      translation: window.lagrangeI18n?.t('resultHeading'),
      heading: document.querySelector('h1')?.textContent,
      scripts: [...document.scripts].map(script => script.src).filter(src => /i18n/.test(src))
    }));
    console.log('Result locale diagnostics:', JSON.stringify(translationDiagnostics));
    console.log('Browser errors:', JSON.stringify(errors));
    assert.match(await page.locator('h1').first().innerText(), /Diagramm/);
    await page.locator('#language-select').selectOption('en');
    const [download] = await Promise.all([
      page.waitForEvent('download', {timeout:30000}),
      page.locator('#download-png').click()
    ]);
    assert.match(download.suggestedFilename(), /\.png$/);

    const guideResponse = await page.goto(base + '/guide/', {waitUntil:'networkidle'});
    assert.equal(guideResponse.status(), 200);
    assert.match(await page.locator('h1').first().innerText(), /Lagrange/i);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 2, 'Guide overflows viewport by ' + overflow + 'px');

    await page.goto(base + '/result/', {waitUntil:'networkidle'});
    assert.equal(await page.locator('#result-error').isVisible(), true);
    assert.deepEqual(errors, []);
    console.log('PASS: browser math, input, chart, PDF layout, PNG download, guide, locale, theme, and invalid share URL');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
