import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Output directory directly in c:\nayan\artifacts\ui-final
const BASE_OUT_DIR = path.resolve('artifacts/ui-final');
fs.mkdirSync(BASE_OUT_DIR, { recursive: true });

const PAGES = [
  { id: 'landing', tabSelector: 'OVERVIEW', folder: 'landing', title: '01. Landing / Overview' },
  { id: 'command-center', tabSelector: 'COMMAND', folder: 'command', title: '02. Command Center' },
  { id: 'camera-intel', tabSelector: 'CAMERAS', folder: 'camera', title: '03. Camera Intelligence' },
  { id: 'corridor', tabSelector: 'CORRIDORS', folder: 'corridor', title: '06. Emergency Corridor' },
  { id: 'traffic', tabSelector: 'SIGNALS', folder: 'traffic', title: '05. Traffic & Signals' },
  { id: 'digital-twin', tabSelector: 'TWIN', folder: 'twin', title: '07. Digital Twin' },
  { id: 'audit', tabSelector: 'AUDIT', folder: 'audit', title: '08. Audit Trail' },
  { id: 'ai', tabSelector: 'COPILOT', folder: 'ai', title: '09. AI Operator Copilot' }
];

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080, isMobile: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false },
  { name: '390x844_mobile', width: 390, height: 844, isMobile: true }
];

async function run() {
  console.log('====================================================');
  console.log('NAYAN × PALOMINO — FULL PRODUCT SUITE CAPTURE & QA');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const consoleErrors = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.isMobile
    });

    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.warn(`[Browser Console Error] ${msg.text()}`);
        consoleErrors.push({ viewport: vp.name, text: msg.text() });
      }
    });

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1000);

    for (const p of PAGES) {
      console.log(`Capturing: ${p.title}...`);
      const targetDir = path.join(BASE_OUT_DIR, p.folder);
      fs.mkdirSync(targetDir, { recursive: true });

      // Click nav tab to trigger AnimatePresence page transition
      if (p.id !== 'landing') {
        const navBtn = page.locator(`header nav button:has-text("${p.tabSelector}")`).first();
        if (await navBtn.isVisible()) {
          await navBtn.click();
          await page.waitForTimeout(600);
        } else {
          await page.evaluate((tabId) => {
            const btns = Array.from(document.querySelectorAll('header nav button'));
            const target = btns.find(b => b.innerText.includes(tabId));
            if (target) target.click();
          }, p.tabSelector);
          await page.waitForTimeout(600);
        }
      } else {
        const brandBtn = page.locator('header button:has-text("NAYAN")').first();
        if (await brandBtn.isVisible()) {
          await brandBtn.click();
          await page.waitForTimeout(600);
        }
      }

      const shotPath = path.join(targetDir, `${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(` -> Saved ${shotPath}`);

      // Capture Incident Detail (Page 04) when on camera view
      if (p.id === 'camera-intel') {
        const incDir = path.join(BASE_OUT_DIR, 'incident');
        fs.mkdirSync(incDir, { recursive: true });

        const caseBtn = page.locator('button:has-text("EXAMINE CASE DETAIL")').first();
        if (await caseBtn.isVisible()) {
          await caseBtn.click();
          await page.waitForTimeout(700);
          const incShot = path.join(incDir, `${vp.name}.png`);
          await page.screenshot({ path: incShot, fullPage: false });
          console.log(` -> Saved Incident View: ${incShot}`);
        }
      }
    }

    // Capture System Page (Page 10) & System Drawer
    console.log('Testing System Drawer & Full Page...');
    const sysBtn = page.locator('header button:has-text("SYSTEM")').first();
    if (await sysBtn.isVisible()) {
      await sysBtn.click();
      await page.waitForTimeout(500);
      const sysDir = path.join(BASE_OUT_DIR, 'system');
      fs.mkdirSync(sysDir, { recursive: true });
      const drawerShot = path.join(sysDir, `drawer_${vp.name}.png`);
      await page.screenshot({ path: drawerShot, fullPage: false });
      console.log(` -> Saved System Drawer: ${drawerShot}`);

      // Click "OPEN FULL SYSTEM ARCHITECTURE SPECIFICATIONS" inside drawer
      const fullPageBtn = page.locator('button:has-text("OPEN FULL SYSTEM ARCHITECTURE SPECIFICATIONS")').first();
      if (await fullPageBtn.isVisible()) {
        await fullPageBtn.click();
        await page.waitForTimeout(600);
        const fullSysShot = path.join(sysDir, `${vp.name}.png`);
        await page.screenshot({ path: fullSysShot, fullPage: false });
        console.log(` -> Saved Full System Page: ${fullSysShot}`);
      } else {
        await page.keyboard.press('Escape');
      }
    }

    // Capture Scenarios Drawer
    console.log('Testing Scenarios Drawer...');
    const scenBtn = page.locator('header button:has-text("SCENARIOS +")').first();
    if (await scenBtn.isVisible()) {
      await scenBtn.click();
      await page.waitForTimeout(500);
      const scenDir = path.join(BASE_OUT_DIR, 'scenarios');
      fs.mkdirSync(scenDir, { recursive: true });
      const scenShot = path.join(scenDir, `drawer_${vp.name}.png`);
      await page.screenshot({ path: scenShot, fullPage: false });
      console.log(` -> Saved Scenario Drawer: ${scenShot}`);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    await context.close();
  }

  await browser.close();

  console.log('\n====================================================');
  console.log(`QA Capture completed! Total browser errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors caught:', consoleErrors);
  } else {
    console.log('PASS: Zero uncaught browser errors detected across all viewports!');
  }
  console.log('====================================================\n');
}

run().catch(err => {
  console.error('Capture script error:', err);
  process.exit(1);
});
