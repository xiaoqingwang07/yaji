import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = __dirname;
const BASE = "http://127.0.0.1:8082";

async function shot(page, name) {
  const file = path.join(out, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", name);
}

async function clickText(page, text, opts = {}) {
  const loc = page.getByText(text, { exact: opts.exact ?? false }).first();
  await loc.waitFor({ state: "visible", timeout: opts.timeout ?? 15000 });
  await loc.click({ timeout: 8000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await shot(page, "r4-00-login.png");

  // Expand demo + pregnancy
  try {
    await clickText(page, "体验示范档案");
    await page.waitForTimeout(400);
    await shot(page, "r4-00b-demo-entry.png");
    await clickText(page, "孕期示范");
  } catch (e) {
    console.log("demo entry fail", e.message);
    // maybe already in app
  }

  await page.waitForTimeout(2000);
  await shot(page, "r4-01-now.png");

  // Expand hero + more next + traces
  try {
    await clickText(page, "∨ 展开");
    await page.waitForTimeout(300);
    await shot(page, "r4-01b-now-hero-open.png");
  } catch {}

  try {
    const more = page.getByText(/∨ 另 \d+ 条/).first();
    if (await more.isVisible().catch(() => false)) {
      await more.click();
      await page.waitForTimeout(300);
      await shot(page, "r4-01c-now-more-next.png");
    }
  } catch {}

  try {
    await clickText(page, "痕迹与携带");
    await page.waitForTimeout(400);
    await shot(page, "r4-01d-now-traces.png");
  } catch {}

  // Timeline
  await clickText(page, "档案", { exact: true });
  await page.waitForTimeout(1200);
  await shot(page, "r4-02-archive.png");

  try {
    await clickText(page, "筛选与小结");
    await page.waitForTimeout(400);
    await shot(page, "r4-02b-archive-filters.png");
  } catch {}

  // Health
  await clickText(page, "健康", { exact: true });
  await page.waitForTimeout(1200);
  await shot(page, "r4-03-health.png");

  try {
    await clickText(page, "胎心");
    await page.waitForTimeout(800);
    await shot(page, "r4-03b-health-detail.png");
    const back = page.getByText("返回").first();
    if (await back.isVisible().catch(() => false)) await back.click();
  } catch {}

  // Me
  await clickText(page, "我的", { exact: true });
  await page.waitForTimeout(1000);
  await shot(page, "r4-04-me.png");

  // Back to archive → add menu
  await clickText(page, "档案", { exact: true });
  await page.waitForTimeout(800);
  await clickText(page, "收下报告");
  await page.waitForTimeout(1000);
  await shot(page, "r4-05-add-menu.png");

  // Report flow
  await clickText(page, "收报告");
  await page.waitForTimeout(1500);
  await shot(page, "r4-06-report-upload.png");

  // Wait for review if auto-advance, or click through
  for (let i = 0; i < 20; i++) {
    const review = page.getByText("白话解读");
    const confirm = page.getByText("确认归档");
    if (
      (await review.isVisible().catch(() => false)) ||
      (await confirm.isVisible().catch(() => false))
    ) {
      break;
    }
    const cont = page.getByText(/继续|查看|进入确认|帮读/).first();
    if (await cont.isVisible().catch(() => false)) {
      await cont.click().catch(() => {});
    }
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(800);
  await shot(page, "r4-07-report-review.png");

  // Scroll review for suggestions
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(400);
  await shot(page, "r4-07b-report-review-lower.png");

  // Expand fields
  try {
    await clickText(page, "∨ 展开");
    await page.waitForTimeout(400);
    await shot(page, "r4-07c-report-fields.png");
  } catch {}

  // Reminder via me demo or navigate
  // Go back to now via tabs if possible; else URL
  try {
    await page.goto(`${BASE}/reminder/new`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await shot(page, "r4-08-reminder.png");
  } catch (e) {
    console.log("reminder nav", e.message);
  }

  // Also try deep link now after reload demo via login again if needed
  try {
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    if (await page.getByText("体验示范档案").isVisible().catch(() => false)) {
      await clickText(page, "体验示范档案");
      await clickText(page, "孕期示范");
      await page.waitForTimeout(1500);
    }
    await clickText(page, "此刻", { exact: true });
    await page.waitForTimeout(800);
    // situational CTA close-up
    await shot(page, "r4-01e-now-cta.png");
    const remind = page.getByText("设提醒").first();
    if (await remind.isVisible().catch(() => false)) {
      await remind.click();
      await page.waitForTimeout(1000);
      await shot(page, "r4-08b-reminder-from-now.png");
    }
  } catch (e) {
    console.log("cta path", e.message);
  }

  await browser.close();
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
