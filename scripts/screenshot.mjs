const { chromium } = await import("playwright");

const BASE = "http://localhost:8082";
const OUT = "docs/ux-screenshots-2026-08-09-vivid";
const VP = { width: 390, height: 844 };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: VP });
const page = await ctx.newPage();

// 1. Navigate
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// 2. Login shortcut: "体验示范档案"
const demoLink = page.getByText("体验示范档案");
if (await demoLink.isVisible()) {
  await demoLink.click();
  await page.waitForTimeout(3000);
}

// 3. We should now be at Now/此刻 page or onboarding.
// If onboarding, we need to skip it — look for stage selection
const pregBtn = page.getByText("怀孕中");
if (await pregBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await pregBtn.click();
  await page.waitForTimeout(500);
  // Fill EDD if asked
  const continueBtn = page.getByText("继续").or(page.getByText("下一步"));
  if (await continueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await continueBtn.click();
  }
  await page.waitForTimeout(2000);
}

// 4. Now we should be at the main app. 
// Go to me > load pregnancy demo
const meTab = page.getByText("我的").last();
if (await meTab.isVisible({ timeout: 2000 }).catch(() => false)) {
  await meTab.click();
  await page.waitForTimeout(1500);

  // Tap the hero area 5 times to unlock demo
  const heroEl = page.locator('[style*="heroCard"], [style*="warmCard"]').first();
  for (let i = 0; i < 6; i++) {
    try {
      const clickTarget = page.getByText("你好").first();
      if (await clickTarget.isVisible({ timeout: 500 }).catch(() => false)) {
        await clickTarget.click({ delay: 50 });
      }
    } catch (e) {}
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);

  // Load pregnancy scenario
  const pregScenario = page.getByText("孕期示范");
  if (await pregScenario.isVisible({ timeout: 2000 }).catch(() => false)) {
    await pregScenario.click();
    await page.waitForTimeout(2000);
  }
}

// 5. Screenshot Now page (should be showing after pregnancy scenario load)
await page.screenshot({ path: `${OUT}/now-with-why.png`, fullPage: false });
console.log("✓ now-with-why.png");

// 6. Screenshot Timeline
const archiveTab = page.getByText("档案").last();
if (await archiveTab.isVisible({ timeout: 1000 }).catch(() => false)) {
  await archiveTab.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/timeline.png`, fullPage: false });
  console.log("✓ timeline.png");
}

// 7. Screenshot Health
const healthTab = page.getByText("健康").last();
if (await healthTab.isVisible({ timeout: 1000 }).catch(() => false)) {
  await healthTab.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/health.png`, fullPage: false });
  console.log("✓ health.png");
}

// 8. Screenshot Me
const meTab2 = page.getByText("我的").last();
if (await meTab2.isVisible({ timeout: 1000 }).catch(() => false)) {
  await meTab2.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/me.png`, fullPage: false });
  console.log("✓ me.png");
}

await browser.close();
console.log("Done!");
