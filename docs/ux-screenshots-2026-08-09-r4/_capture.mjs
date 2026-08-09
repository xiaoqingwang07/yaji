import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require(
  path.join(
    process.env.TEMP || process.env.TMP || ".",
    "yaji-pw",
    "node_modules",
    "playwright",
  ),
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = __dirname;
const BASE = "http://127.0.0.1:8082";

async function shot(page, name) {
  await page.screenshot({ path: path.join(out, name), fullPage: false });
  console.log("saved", name);
}

async function enter(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3500);
  if (await page.getByText("体验示范档案").isVisible().catch(() => false)) {
    await page.getByText("体验示范档案").click();
    await page.getByText("孕期示范").click();
    await page.waitForTimeout(1800);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (
    await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    })
  ).newPage();

  await enter(page);
  await shot(page, "r4-00-login.png").catch(() => {});
  // if already in app, capture login separately
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  if (await page.getByText("体验示范档案").isVisible().catch(() => false)) {
    await shot(page, "r4-00-login.png");
    await page.getByText("体验示范档案").click();
    await page.waitForTimeout(300);
    await shot(page, "r4-00b-demo-entry.png");
    await page.getByText("孕期示范").click();
    await page.waitForTimeout(1800);
  }

  await shot(page, "r4-01-now.png");
  await page.getByText("∨ 展开").first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(300);
  await shot(page, "r4-01b-now-hero-open.png");
  const more = page.getByText(/∨ 另 \d+ 条/).first();
  if (await more.isVisible().catch(() => false)) {
    await more.click({ force: true });
    await page.waitForTimeout(300);
    await shot(page, "r4-01c-now-more-next.png");
  }
  await page.getByText("痕迹与携带").click({ force: true }).catch(() => {});
  await page.waitForTimeout(400);
  await shot(page, "r4-01d-now-traces.png");

  await page.getByText("档案", { exact: true }).last().click({ force: true });
  await page.waitForTimeout(1000);
  await shot(page, "r4-02-archive.png");
  await page.getByText("筛选与小结").click({ force: true }).catch(() => {});
  await page.waitForTimeout(300);
  await shot(page, "r4-02b-archive-filters.png");

  await page.getByText("健康", { exact: true }).last().click({ force: true });
  await page.waitForTimeout(1000);
  await shot(page, "r4-03-health.png");
  await page.getByText("146").first().click({ force: true });
  await page.waitForTimeout(800);
  await shot(page, "r4-03b-health-detail.png");

  await page.getByText("我的", { exact: true }).last().click({ force: true });
  await page.waitForTimeout(800);
  await shot(page, "r4-04-me.png");

  await page.getByText("此刻", { exact: true }).last().click({ force: true });
  await page.waitForTimeout(600);
  await page.getByText("看完医生了").click({ force: true });
  await page.waitForTimeout(900);
  await shot(page, "r4-05b-add-from-now.png");
  const box = await page.getByText("收报告", { exact: true }).boundingBox();
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 + 20);
  await page.waitForTimeout(1800);
  await shot(page, "r4-06-report-upload.png");
  if (await page.getByText("开始识别").isVisible().catch(() => false)) {
    await page.getByText("开始识别").click({ force: true });
  }
  for (let i = 0; i < 40; i++) {
    const t = await page.locator("body").innerText();
    if (t.includes("白话解读") || t.includes("确认归档")) break;
    await page.waitForTimeout(300);
  }
  await shot(page, "r4-07-report-review.png");
  await page.evaluate(() => {
    const els = [...document.querySelectorAll("div")];
    const sc = els.find((e) => e.scrollHeight > e.clientHeight + 80 && e.clientHeight > 200);
    if (sc) sc.scrollTop = 900;
  });
  await page.waitForTimeout(300);
  await shot(page, "r4-07b-report-review-mid.png");
  await page.evaluate(() => {
    const els = [...document.querySelectorAll("div")];
    const sc = els.find((e) => e.scrollHeight > e.clientHeight + 80 && e.clientHeight > 200);
    if (sc) sc.scrollTop = 1800;
  });
  await page.waitForTimeout(300);
  await shot(page, "r4-07c-report-review-lower.png");

  await enter(page);
  await page.getByText("设提醒", { exact: true }).first().click({ force: true });
  await page.waitForTimeout(1000);
  await shot(page, "r4-08b-reminder-from-now.png");

  await browser.close();
  console.log("all done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
