const { chromium } = require("C:\\Users\\asus\\AppData\\Roaming\\npm\\node_modules\\playwright");

const BASE = "http://localhost:8082";
const OUT = "docs/ux-screenshots-2026-08-09-vivid";
const VP = { width: 390, height: 844 };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VP });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(3000);

  // The login page shows demo options directly: "孕期示范" link
  const pregDemo = page.getByText("孕期示范").first();
  if (await pregDemo.isVisible({ timeout: 3000 }).catch(() => false)) {
    await pregDemo.click();
    await page.waitForTimeout(3000);
  } else {
    // Try "体验示范档案" first
    const demoLink = page.getByText("体验示范档案");
    if (await demoLink.isVisible().catch(() => false)) {
      await demoLink.click();
      await page.waitForTimeout(1500);
      const pregDemo2 = page.getByText("孕期示范").first();
      if (await pregDemo2.isVisible({ timeout: 2000 }).catch(() => false)) {
        await pregDemo2.click();
        await page.waitForTimeout(3000);
      }
    }
  }

  // Screenshot Now page (should be showing pregnancy demo now)
  await page.screenshot({ path: `${OUT}/now-with-why.png`, fullPage: false });
  console.log("now-with-why.png done");

  // Take a full-page screenshot too
  await page.screenshot({ path: `${OUT}/now-with-why-full.png`, fullPage: true });
  console.log("now-with-why-full.png done");

  // Click tab bar items (the floating tab bar has text labels)
  // Timeline tab
  try {
    // Use locator that finds tab bar labels
    const tabs = await page.locator('text=档案').all();
    if (tabs.length > 0) {
      await tabs[tabs.length - 1].click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT}/timeline.png`, fullPage: false });
      console.log("timeline.png done");
    }
  } catch (e) { console.log("timeline skip:", e.message); }

  // Health tab
  try {
    const tabs = await page.locator('text=健康').all();
    if (tabs.length > 0) {
      await tabs[tabs.length - 1].click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT}/health.png`, fullPage: false });
      console.log("health.png done");
    }
  } catch (e) { console.log("health skip:", e.message); }

  // Me tab
  try {
    const tabs = await page.locator('text=我的').all();
    if (tabs.length > 0) {
      await tabs[tabs.length - 1].click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT}/me.png`, fullPage: false });
      console.log("me.png done");
    }
  } catch (e) { console.log("me skip:", e.message); }

  await browser.close();
  console.log("All done!");
})().catch(e => { console.error(e); process.exit(1); });
