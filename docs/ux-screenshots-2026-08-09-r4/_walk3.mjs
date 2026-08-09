import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = __dirname;
const BASE = "http://127.0.0.1:8082";

async function shot(page, name) {
  await page.screenshot({ path: path.join(out, name), fullPage: false });
  console.log("saved", name);
}

async function enterDemo(page) {
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  const demo = page.getByText("体验示范档案");
  if (await demo.isVisible().catch(() => false)) {
    await demo.click();
    await page.waitForTimeout(300);
    await page.getByText("孕期示范").click();
    await page.waitForTimeout(1800);
  }
}

async function tab(page, name) {
  // Expo tabs often render as text; prefer last matching bottom label
  await page.getByText(name, { exact: true }).last().click({ force: true });
  await page.waitForTimeout(900);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (
    await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    })
  ).newPage();
  page.setDefaultTimeout(25000);

  await enterDemo(page);

  // Archive → exact 收下报告 button in header
  await tab(page, "档案");
  await page.locator("text=收下报告").first().click({ force: true });
  await page.waitForTimeout(1000);
  await shot(page, "r4-05-add-menu.png");

  await page.getByText("收报告", { exact: true }).click({ force: true });
  await page.waitForTimeout(1500);
  await shot(page, "r4-06-report-upload.png");

  for (let i = 0; i < 40; i++) {
    if (await page.getByText("确认归档").isVisible().catch(() => false)) break;
    const t = page.getByText(/进入确认|查看帮读|继续|完成识别|看看帮读/).first();
    if (await t.isVisible().catch(() => false)) await t.click({ force: true }).catch(() => {});
    await page.waitForTimeout(350);
  }
  await shot(page, "r4-07-report-review.png");
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(400);
  await shot(page, "r4-07b-report-review-mid.png");
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(400);
  await shot(page, "r4-07c-report-review-lower.png");

  // Me demo → pending ultrasound
  await enterDemo(page);
  await tab(page, "我的");
  const greet = page.getByText("你好，小芽").first();
  for (let i = 0; i < 6; i++) {
    await greet.click({ force: true });
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(500);
  await shot(page, "r4-04b-me-demo.png");
  const pending = page.getByText(/待确认超声/);
  if (await pending.isVisible().catch(() => false)) {
    await pending.click({ force: true });
    await page.waitForTimeout(1200);
    await shot(page, "r4-07d-report-review-demo.png");
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(400);
    await shot(page, "r4-07e-report-suggestions.png");
  } else {
    console.log("no pending demo row");
  }

  // Reminder from now
  await enterDemo(page);
  const setRem = page.getByText("设提醒", { exact: true }).first();
  await setRem.click({ force: true });
  await page.waitForTimeout(1200);
  await shot(page, "r4-08b-reminder-from-now.png");

  // Direct reminder route
  await page.goto(`${BASE}/reminder/new`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await shot(page, "r4-08-reminder.png");

  // Health detail
  await enterDemo(page);
  await tab(page, "健康");
  await page.getByText("146").first().click({ force: true });
  await page.waitForTimeout(900);
  await shot(page, "r4-03b-health-detail.png");

  await browser.close();
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
