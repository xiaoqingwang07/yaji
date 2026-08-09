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

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  })).newPage();
  page.setDefaultTimeout(20000);

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.getByText("体验示范档案").click();
  await page.getByText("孕期示范").click();
  await page.waitForTimeout(1800);

  // Archive tab via bottom nav role button
  await page.getByRole("button", { name: /档案/ }).click();
  await page.waitForTimeout(1000);

  // Click the header collect button specifically
  const collect = page.locator("div").filter({ hasText: /^收下报告$/ }).last();
  await collect.click({ force: true });
  await page.waitForTimeout(1000);
  await shot(page, "r4-05-add-menu.png");

  await page.getByText("收报告", { exact: true }).click();
  await page.waitForTimeout(1200);
  await shot(page, "r4-06-report-upload.png");

  // Poll for review
  for (let i = 0; i < 30; i++) {
    if (await page.getByText("确认归档").isVisible().catch(() => false)) break;
    if (await page.getByText("白话解读").isVisible().catch(() => false)) break;
    const any = page.getByText(/进入确认|查看结果|继续|已识别/).first();
    if (await any.isVisible().catch(() => false)) await any.click().catch(() => {});
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(600);
  await shot(page, "r4-07-report-review.png");

  // Scroll inside RN scroll view
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(400);
  await shot(page, "r4-07b-report-review-mid.png");
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(400);
  await shot(page, "r4-07c-report-review-lower.png");

  // From me open pending report as alternate
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  if (await page.getByText("体验示范档案").isVisible().catch(() => false)) {
    await page.getByText("体验示范档案").click();
    await page.getByText("孕期示范").click();
    await page.waitForTimeout(1500);
  }
  await page.getByRole("button", { name: /我的/ }).click();
  await page.waitForTimeout(600);
  // 5 taps on logo area
  const logo = page.getByText("你好，小芽").first();
  for (let i = 0; i < 5; i++) {
    await logo.click({ force: true });
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);
  await shot(page, "r4-04b-me-demo.png");
  if (await page.getByText("待确认超声").isVisible().catch(() => false)) {
    await page.getByText("待确认超声").click();
    await page.waitForTimeout(1200);
    await shot(page, "r4-07d-report-review-demo.png");
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(400);
    await shot(page, "r4-07e-report-suggestions.png");
  }

  // Reminder
  await page.goto(`${BASE}/reminder/new`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await shot(page, "r4-08-reminder.png");

  // From now 设提醒
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  if (await page.getByText("体验示范档案").isVisible().catch(() => false)) {
    await page.getByText("体验示范档案").click();
    await page.getByText("孕期示范").click();
    await page.waitForTimeout(1500);
  }
  const setRem = page.getByText("设提醒", { exact: true }).first();
  if (await setRem.isVisible().catch(() => false)) {
    await setRem.click({ force: true });
    await page.waitForTimeout(1200);
    await shot(page, "r4-08b-reminder-from-now.png");
  }

  // Health detail
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  if (await page.getByText("体验示范档案").isVisible().catch(() => false)) {
    await page.getByText("体验示范档案").click();
    await page.getByText("孕期示范").click();
    await page.waitForTimeout(1500);
  }
  await page.getByRole("button", { name: /健康/ }).click();
  await page.waitForTimeout(800);
  await page.getByText("146").first().click({ force: true });
  await page.waitForTimeout(900);
  await shot(page, "r4-03b-health-detail.png");

  // Now with all expands for density critique
  await page.getByRole("button", { name: /此刻/ }).click();
  await page.waitForTimeout(600);
  const expands = page.getByText(/∨ 展开|∨ 另/);
  const n = await expands.count();
  for (let i = 0; i < n; i++) {
    await expands.nth(i).click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(400);
  await shot(page, "r4-01f-now-all-open.png");

  await browser.close();
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
