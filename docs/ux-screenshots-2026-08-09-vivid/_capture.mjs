const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  const loadPregnancyDemo = async () => {
    await page.goto('http://127.0.0.1:8082/login', {
      waitUntil: 'networkidle',
      timeout: 90000,
    });
    await page.waitForTimeout(1000);
    await page.getByText('体验示范档案').click();
    await page.waitForTimeout(400);
    await page.getByText('孕期示范').click();
    await page.waitForTimeout(2000);
    // hard refresh then re-enter demo (state is in-memory)
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.goto('http://127.0.0.1:8082/login', {
      waitUntil: 'networkidle',
      timeout: 90000,
    });
    await page.waitForTimeout(800);
    await page.getByText('体验示范档案').click();
    await page.waitForTimeout(400);
    await page.getByText('孕期示范').click();
    await page.waitForTimeout(2000);
    await page.waitForFunction(() => document.body.innerText.includes('大排畸'), null, {
      timeout: 15000,
    });
  };

  await loadPregnancyDemo();
  await page.screenshot({ path: path.join(out, '01-now-why-visible.png'), fullPage: false });

  const expand = page.getByText('展开全文').first();
  if (await expand.isVisible().catch(() => false)) {
    await expand.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(out, '02-now-why-expanded.png'), fullPage: false });

  await page.evaluate(() => {
    const els = [...document.querySelectorAll('div')];
    const sc = els.find((e) => e.scrollHeight > e.clientHeight + 80 && e.clientHeight > 200);
    if (sc) sc.scrollTop = 360;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, '03-now-narrative-rail.png'), fullPage: false });

  await page.getByText('档案', { exact: true }).last().click({ force: true });
  await page.waitForTimeout(1000);
  await page.waitForFunction(() => document.body.innerText.includes('产科超声') || document.body.innerText.includes('产检'), null, {
    timeout: 10000,
  }).catch(() => {});
  await page.screenshot({ path: path.join(out, '04-timeline.png'), fullPage: false });

  await page.getByText('健康', { exact: true }).last().click({ force: true });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(out, '05-health.png'), fullPage: false });

  await page.getByText('我的', { exact: true }).last().click({ force: true });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, '06-me.png'), fullPage: false });

  // open demo mode via 5 taps on hero
  for (let i = 0; i < 6; i++) {
    await page.mouse.click(72, 150);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);
  await page.getByText('待确认超声').click({ force: true });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(out, '08-report-review.png'), fullPage: false });

  await page.goto('http://127.0.0.1:8082/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.getByText('体验示范档案').click();
  await page.getByText('孕期示范').click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(out, '07-tab-selected.png'), fullPage: false });

  // friendly aliases
  const fs = require('fs');
  fs.copyFileSync(path.join(out, '01-now-why-visible.png'), path.join(out, 'now-with-why.png'));
  fs.copyFileSync(path.join(out, '03-now-narrative-rail.png'), path.join(out, 'now-with-why-full.png'));
  fs.copyFileSync(path.join(out, '04-timeline.png'), path.join(out, 'timeline.png'));
  fs.copyFileSync(path.join(out, '05-health.png'), path.join(out, 'health.png'));
  fs.copyFileSync(path.join(out, '06-me.png'), path.join(out, 'me.png'));

  await browser.close();
  console.log('SHOTS_OK');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
