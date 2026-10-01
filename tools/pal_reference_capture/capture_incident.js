import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('artifacts/ui-final/incident');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: '1920x1080', width: 1920, height: 1080, isMobile: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false },
  { name: '390x844_mobile', width: 390, height: 844, isMobile: true }
];

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.isMobile
    });
    const page = await ctx.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Switch to CAMERAS
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header nav button'));
      const target = btns.find(b => b.innerText.includes('CAMERAS'));
      if (target) target.click();
    });
    await page.waitForTimeout(700);

    // Click EXAMINE CASE DETAIL
    const caseBtn = page.locator('button:has-text("EXAMINE CASE DETAIL")').first();
    if (await caseBtn.isVisible()) {
      await caseBtn.click();
      await page.waitForTimeout(900);
    }

    const shot = path.join(outDir, `${vp.name}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    console.log(`Saved Incident View (${vp.name}): ${shot}`);
    await ctx.close();
  }

  await browser.close();
}

run().catch(console.error);
