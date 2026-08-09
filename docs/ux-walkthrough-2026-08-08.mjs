/**
 * 芽纪移动端原型走查脚本（390 视口）— 加固版
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "ux-screenshots-2026-08-08");
const BASE = process.env.YAJI_URL || "http://localhost:8082";
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const note = (msg) => {
  console.log(msg);
  log.push(msg);
};

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  note(`SHOT ${name}`);
}

async function waitMs(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function visibleText(page, text, exact = false) {
  const loc = page.getByText(text, { exact }).locator("visible=true").first();
  return (await loc.count()) > 0 ? loc : null;
}

async function clickVisible(page, text, exact = false) {
  const loc = await visibleText(page, text, exact);
  if (!loc) {
    note(`MISS visible text="${text}"`);
    return false;
  }
  await loc.click({ timeout: 8000 });
  note(`CLICK "${text}"`);
  return true;
}

async function goTab(page, name) {
  // Prefer bottom tab: last matching visible label
  const tabs = page.getByText(name, { exact: true });
  const n = await tabs.count();
  for (let i = n - 1; i >= 0; i--) {
    const t = tabs.nth(i);
    if (await t.isVisible()) {
      const box = await t.boundingBox();
      if (box && box.y > 700) {
        await t.click();
        note(`TAB ${name}`);
        await waitMs(900);
        return true;
      }
    }
  }
  // fallback any visible
  for (let i = n - 1; i >= 0; i--) {
    const t = tabs.nth(i);
    if (await t.isVisible()) {
      await t.click();
      note(`TAB_FALLBACK ${name}`);
      await waitMs(900);
      return true;
    }
  }
  note(`TAB_MISS ${name}`);
  return false;
}

async function openCollect(page) {
  await goTab(page, "档案");
  await waitMs(400);
  const btn = page.getByText("收进来", { exact: true }).locator("visible=true").first();
  if ((await btn.count()) === 0) {
    note("MISS 收进来");
    return false;
  }
  await btn.click();
  await waitMs(900);
  note("OPEN collect menu");
  return true;
}

async function tabBarLabels(page) {
  const labels = await page.evaluate(() => {
    const hits = [];
    for (const el of document.querySelectorAll("body *")) {
      const t = (el.textContent || "").trim();
      if (!["此刻", "档案", "健康", "我的", "添加", "提醒"].includes(t)) continue;
      if (el.children.length) continue;
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.75 && r.width > 0 && r.height > 0) {
        hits.push({ text: t, y: Math.round(r.top), x: Math.round(r.left) });
      }
    }
    const map = new Map();
    for (const h of hits) map.set(h.text, h);
    return Array.from(map.values()).sort((a, b) => a.x - b.x);
  });
  note(`TABBAR ${JSON.stringify(labels)}`);
  return labels;
}

async function sample(page) {
  return (await page.evaluate(() => document.body?.innerText || ""))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 900);
}

async function backOrClose(page) {
  if (await clickVisible(page, "返回")) return;
  if (await clickVisible(page, "关闭")) return;
  await page.goBack().catch(() => {});
  await waitMs(600);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  try {
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitMs(2000);
    await shot(page, "01-login");

    await clickVisible(page, "体验示范档案");
    await waitMs(300);
    await shot(page, "02-login-demo-expanded");
    await clickVisible(page, "孕期示范");
    await waitMs(1800);
    await shot(page, "03-now-top");
    note(`NOW ${await sample(page)}`);
    const tabs = await tabBarLabels(page);
    note(`FINDING add_tab=${tabs.some((t) => t.text === "添加")}`);

    await page.mouse.wheel(0, 700);
    await waitMs(400);
    await shot(page, "04-now-scrolled");

    await goTab(page, "档案");
    await shot(page, "05-archive-list");
    note(`ARCHIVE ${await sample(page)}`);
    note(`FINDING collect=${(await page.getByText("收进来").locator("visible=true").count()) > 0}`);

    if (await clickVisible(page, "阶段小结")) {
      await waitMs(800);
      await shot(page, "06-stage-summary-entry");
      if (await clickVisible(page, "生成小结")) {
        await waitMs(700);
        await shot(page, "07-stage-summary-generated");
        if (await clickVisible(page, "查看完整分区")) {
          await waitMs(500);
          await shot(page, "07b-stage-summary-full");
        }
      }
      await backOrClose(page);
      await waitMs(700);
    }

    // Add menu
    if (await openCollect(page)) {
      await shot(page, "08-add-menu");
      note(`ADD_MENU ${await sample(page)}`);
    }

    // Report flow — wait through auto processing
    if (await clickVisible(page, "收报告")) {
      await waitMs(800);
      await shot(page, "09-report-upload");
      // may auto jump
      const start = await visibleText(page, "开始识别");
      if (start) {
        await start.click();
        note("CLICK 开始识别");
      }
      await waitMs(1200);
      await shot(page, "10-report-processing-or-review");
      // wait for review cues
      for (let i = 0; i < 20; i++) {
        const body = await sample(page);
        if (body.includes("核对字段") || body.includes("白话解读") || body.includes("确认归档")) break;
        await waitMs(500);
      }
      await shot(page, "11-report-review-top");
      note(`REVIEW ${await sample(page)}`);
      await page.mouse.wheel(0, 900);
      await waitMs(300);
      await shot(page, "12-report-review-mid");
      await page.mouse.wheel(0, 900);
      await waitMs(300);
      await shot(page, "13-report-review-bottom");
      if (await clickVisible(page, "确认归档")) {
        await waitMs(900);
        await shot(page, "14-report-confirmed");
        await clickVisible(page, "好的");
        await waitMs(900);
      } else {
        // stuck? hard navigate home via tab if possible
        note("WARN 未点到确认归档");
        await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
        await waitMs(1000);
      }
    }

    // Voice
    if (await openCollect(page)) {
      if (await clickVisible(page, "录医嘱")) {
        await waitMs(1000);
        await shot(page, "15-voice-recording");
        note(`VOICE ${await sample(page)}`);
        // stop and review if possible
        if (await clickVisible(page, "结束")) {
          await waitMs(2000);
          await shot(page, "15b-voice-review");
          note(`VOICE_REVIEW ${await sample(page)}`);
        }
        await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" }).catch(() => {});
        await waitMs(1000);
        // re-enter demo if bounced to login
        if (await visibleText(page, "体验示范档案")) {
          await clickVisible(page, "体验示范档案");
          await clickVisible(page, "孕期示范");
          await waitMs(1200);
        }
      }
    }

    // Quick note
    if (await openCollect(page)) {
      if (await clickVisible(page, "记一条")) {
        await waitMs(800);
        await shot(page, "16-quick-note");
        note(`NOTE ${await sample(page)}`);
        await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" }).catch(() => {});
        await waitMs(800);
        if (await visibleText(page, "体验示范档案")) {
          await clickVisible(page, "体验示范档案");
          await clickVisible(page, "孕期示范");
          await waitMs(1000);
        }
      }
    }

    // Health
    await goTab(page, "健康");
    await shot(page, "17-health");
    note(`HEALTH ${await sample(page)}`);
    await clickVisible(page, "胎儿", true);
    await waitMs(500);
    await shot(page, "18-health-fetus");
    // try open detail
    const metric = page.getByText("胎心", { exact: true }).locator("visible=true").first();
    if ((await metric.count()) > 0) {
      await metric.click().catch(() => {});
      await waitMs(500);
      await shot(page, "19-health-detail");
    }

    // Me + trust
    await goTab(page, "我的");
    await shot(page, "20-me");
    note(`ME ${await sample(page)}`);
    if (await clickVisible(page, "隐私与信任")) {
      await waitMs(800);
      await shot(page, "21-trust");
      note(`TRUST ${await sample(page)}`);
      await backOrClose(page);
    }

    // Unlock demo empty
    await goTab(page, "我的");
    for (let i = 0; i < 6; i++) {
      const hero = page.getByText(/你好/).locator("visible=true").first();
      if ((await hero.count()) > 0) await hero.click({ force: true }).catch(() => {});
      await waitMs(120);
    }
    await waitMs(300);
    await shot(page, "22-me-demo-unlocked");
    if (await clickVisible(page, "档案空状态")) {
      await waitMs(900);
      await shot(page, "23-archive-empty");
      note(`EMPTY ${await sample(page)}`);
      const hasCollect = (await page.getByText("收进来").locator("visible=true").count()) > 0;
      note(`FINDING empty_collect=${hasCollect}`);
    }

    // Restore pregnancy demo
    await goTab(page, "我的");
    for (let i = 0; i < 6; i++) {
      const hero = page.getByText(/你好/).locator("visible=true").first();
      if ((await hero.count()) > 0) await hero.click({ force: true }).catch(() => {});
      await waitMs(100);
    }
    if (await clickVisible(page, "孕期示范")) await waitMs(1000);

    await goTab(page, "此刻");
    await shot(page, "24-now-final");
    await tabBarLabels(page);

    await goTab(page, "档案");
    const event = page.getByText("产科超声").locator("visible=true").first();
    if ((await event.count()) > 0) {
      await event.click();
      await waitMs(900);
      await shot(page, "25-event-detail");
      note(`EVENT ${await sample(page)}`);
    }

    // Privacy page if linked from trust already covered; check me soft copy & family
    await goTab(page, "我的");
    if (await clickVisible(page, "家庭成员")) {
      await waitMs(700);
      await shot(page, "26-family");
      note(`FAMILY ${await sample(page)}`);
    }
  } catch (err) {
    note(`FATAL ${err.message}`);
    await shot(page, "99-fatal").catch(() => {});
  } finally {
    fs.writeFileSync(path.join(OUT, "walkthrough-log.txt"), log.join("\n"), "utf8");
    await browser.close();
  }
}

main();
