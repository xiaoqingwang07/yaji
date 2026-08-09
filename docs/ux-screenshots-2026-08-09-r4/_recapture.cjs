const fs=require('fs');
const path=require('path');
const { chromium } = require(path.join(process.env.TEMP || process.env.TMP || '.', 'yaji-pw', 'node_modules', 'playwright'));
const out = __dirname;
const BASE = 'http://127.0.0.1:8082';
const T = JSON.parse(fs.readFileSync(path.join(__dirname, '_recapture.mjs_meta.json'), 'utf8'));
async function shot(page, name) {
  const f = path.join(out, name);
  await page.screenshot({ path: f, fullPage: false });
  const size = fs.statSync(f).size;
  console.log('saved', name, size);
  return size;
}
async function enterDemo(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  if (await page.getByText(T.demo).isVisible().catch(() => false)) {
    await page.getByText(T.demo).click();
    await page.waitForTimeout(400);
    await page.getByText(T.preg).click();
    await page.waitForTimeout(2000);
  }
}
async function waitRE(page, re, timeout = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const t = await page.locator('body').innerText().catch(() => '');
    if (re.test(t)) return t;
    await page.waitForTimeout(300);
  }
  return page.locator('body').innerText().catch(() => '');
}
async function pathHealth(page) {
  console.log('PATH A');
  await enterDemo(page);
  await page.getByText(T.health, { exact: true }).last().click({ force: true });
  await page.waitForTimeout(1500);
  const s3 = await shot(page, 'r4-03-health.png');
  const strategies = [
    async () => page.getByText(T.heart).first().click({ force: true }),
    async () => page.getByText('146').first().click({ force: true }),
    async () => {
      const box = await page.getByText('146').first().boundingBox();
      if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    },
    async () => {
      await page.evaluate((heart) => {
        let best = null, bestA = 0;
        const nodes = document.querySelectorAll('div');
        for (const el of nodes) {
          const tx = (el.innerText || '').trim();
          if (!tx.includes('146') || !tx.includes(heart)) continue;
          const r = el.getBoundingClientRect();
          const area = r.width * r.height;
          if (area > bestA && area < 220000 && r.height > 50) { best = el; bestA = area; }
        }
        if (best) best.click();
      }, T.heart);
    },
  ];
  for (const str of strategies) {
    try { await str(); } catch (e) { console.log('str err', e.message); }
    await page.waitForTimeout(1000);
    const t = await page.locator('body').innerText();
    console.log('dhealth snip', t.slice(0, 280).split(String.fromCharCode(10)).join(' | '));
    if (t.includes(T.vs) || t.includes(T.back)) break;
  }
  await waitRE(page, new RegExp(T.vs + '|' + T.back), 8000);
  const s3b = await shot(page, 'r4-03b-health-detail.png');
  console.log('diff', s3 !== s3b, s3, s3b);
}

async function pathReport(page) {
  console.log('PATH B');
  await enterDemo(page);
  await page.getByText(T.now, { exact: true }).last().click({ force: true });
  await page.waitForTimeout(1000);
  const cta = page.getByText(new RegExp(T.adoc)).first();
  if (await cta.isVisible().catch(() => false)) await cta.click({ force: true });
  else await page.getByText(new RegExp(T.take)).first().click({ force: true });
  await page.waitForTimeout(1000);
  await shot(page, 'r4-05b-add-from-now.png');

  const reportTitle = page.getByText(T.get, { exact: true });
  const count = await reportTitle.count();
  console.log('getReport count', count);
  let clicked = false;
  for (let i = 0; i < count; i++) {
    const box = await reportTitle.nth(i).boundingBox();
    if (!box) continue;
    console.log('click box', box);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 + 24);
    clicked = true;
    break;
  }
  if (!clicked) {
    await page.evaluate((getReport) => {
      let best = null, bestA = 0;
      for (const el of document.querySelectorAll('div')) {
        const tx = el.innerText || '';
        if (!tx.includes(getReport)) continue;
        const r = el.getBoundingClientRect();
        const area = r.width * r.height;
        if (area > bestA && r.height > 50 && r.height < 300) { best = el; bestA = area; }
      }
      if (best) best.click();
    }, T.get);
  }
  await page.waitForTimeout(1500);
  let body = await page.locator('body').innerText();
  console.log('after report', body.slice(0, 350).split(String.fromCharCode(10)).join(' | '));
  await shot(page, 'r4-06-report-upload.png');
  if (await page.getByText(T.ocr).isVisible().catch(() => false)) {
    await page.getByText(T.ocr).click({ force: true });
  }
  for (let i = 0; i < 60; i++) {
    body = await page.locator('body').innerText();
    if (body.includes(T.plain) || body.includes(T.conf)) break;
    if (i === 10) await shot(page, 'r4-06-report-upload.png');
    await page.waitForTimeout(400);
  }
  body = await page.locator('body').innerText();
  console.log('review', body.slice(0, 400).split(String.fromCharCode(10)).join(' | '));
  await shot(page, 'r4-07-report-review.png');
  await page.evaluate(() => {
    const els = [...document.querySelectorAll('div')];
    const sc = els.find((e) => e.scrollHeight > e.clientHeight + 80 && e.clientHeight > 200);
    if (sc) sc.scrollTop = 900;
  });
  await page.waitForTimeout(400);
  await shot(page, 'r4-07b-report-review-mid.png');
  await page.evaluate(() => {
    const els = [...document.querySelectorAll('div')];
    const sc = els.find((e) => e.scrollHeight > e.clientHeight + 80 && e.clientHeight > 200);
    if (sc) sc.scrollTop = 1800;
  });
  await page.waitForTimeout(400);
  await shot(page, 'r4-07c-report-review-lower.png');
}

async function pathAddMenu(page) {
  console.log('PATH ADD');
  await enterDemo(page);
  await page.getByText(T.arch, { exact: true }).last().click({ force: true });
  await page.waitForTimeout(1200);
  const pill = page.getByText(T.take, { exact: true });
  const n = await pill.count();
  console.log('takeReport count', n);
  for (let i = 0; i < n; i++) {
    const box = await pill.nth(i).boundingBox();
    if (!box) continue;
    console.log('pill', i, box);
    await pill.nth(i).click({ force: true });
    await page.waitForTimeout(900);
    const t = await page.locator('body').innerText();
    if (t.includes(T.get) || t.includes(T.help) || t.includes(T.adoc)) {
      await shot(page, 'r4-05-add-menu.png');
      return;
    }
  }
  await page.getByText(T.take, { exact: true }).first().click({ force: true });
  await page.waitForTimeout(900);
  await shot(page, 'r4-05-add-menu.png');
}
async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await pathHealth(page);
  await pathReport(page);
  await pathAddMenu(page);
  await browser.close();
  console.log('all done');
}
main().catch((e) => { console.error(e); process.exit(1); });
