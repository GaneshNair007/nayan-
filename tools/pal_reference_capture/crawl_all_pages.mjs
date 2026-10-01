import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('..', '..', 'artifacts', 'final-ui-audit');

const PAGES = [
  { tab: 'landing', label: '01_landing', clickSelector: 'nav button:has-text("OVERVIEW")' },
  { tab: 'command-center', label: '02_command', clickSelector: 'nav button:has-text("COMMAND")' },
  { tab: 'camera-intel', label: '03_camera', clickSelector: 'nav button:has-text("CAMERAS")' },
  { tab: 'incident', label: '04_incident', clickSelector: null, appAction: 'incident' },
  { tab: 'corridor', label: '05_corridor', clickSelector: 'nav button:has-text("CORRIDORS")' },
  { tab: 'traffic', label: '06_traffic', clickSelector: 'nav button:has-text("SIGNALS")' },
  { tab: 'digital-twin', label: '07_digital_twin', clickSelector: 'nav button:has-text("TWIN")' },
  { tab: 'audit', label: '08_audit', clickSelector: 'nav button:has-text("AUDIT")' },
  { tab: 'ai', label: '09_ai', clickSelector: 'nav button:has-text("COPILOT")' },
  { tab: 'system', label: '10_system', clickSelector: 'button:has-text("SYSTEM")' }
];

async function runAudit() {
  console.log('--- STARTING PALOMINO × 21ST.DEV FULL-SITE UI CRAWL ---');
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  
  // 1. DESKTOP VIEWPORT CRAWL (1440x900)
  console.log('\n[1/2] EXECUTING DESKTOP AUDIT (1440x900)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();

  const consoleLogs = [];
  desktopPage.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push(`[ERROR] ${msg.text()}`);
    }
  });

  await desktopPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);

  for (const p of PAGES) {
    console.log(` -> Testing Page: ${p.label}`);
    const pageDir = path.join(OUTPUT_DIR, p.label);
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });

    // Navigate to tab
    if (p.clickSelector) {
      const btn = await desktopPage.$(p.clickSelector);
      if (btn) {
        await btn.click();
        await desktopPage.waitForTimeout(800);
      }
    } else if (p.appAction === 'incident') {
      // Navigate to incident via command center or state
      const cmdBtn = await desktopPage.$('button:has-text("COMMAND")');
      if (cmdBtn) {
        await cmdBtn.click();
        await desktopPage.waitForTimeout(600);
        // Click first incident item
        const incItem = await desktopPage.$('h3:has-text("Multi-Vehicle")');
        if (incItem) {
          await incItem.click();
          await desktopPage.waitForTimeout(600);
        }
      }
    }

    // Scroll top to bottom smoothly to trigger 21st scroll animations
    await desktopPage.evaluate(async () => {
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 200));
      window.scrollTo({ top: document.body.scrollHeight * 0.4, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 400));
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 400));
      window.scrollTo(0, 0);
    });
    await desktopPage.waitForTimeout(500);

    // Capture desktop screenshot
    const shotPath = path.join(pageDir, 'desktop.png');
    await desktopPage.screenshot({ path: shotPath, fullPage: false });
    console.log(`    Captured: ${shotPath}`);
  }

  await desktopContext.close();

  // 2. MOBILE VIEWPORT CRAWL (390x844 iPhone 14/15 size)
  console.log('\n[2/2] EXECUTING MOBILE AUDIT (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  for (const p of PAGES) {
    console.log(` -> Testing Mobile Page: ${p.label}`);
    const pageDir = path.join(OUTPUT_DIR, p.label);
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });

    if (p.clickSelector) {
      const btn = await mobilePage.$(p.clickSelector);
      if (btn) {
        await btn.click();
        await mobilePage.waitForTimeout(800);
      }
    }

    const shotPath = path.join(pageDir, 'mobile.png');
    await mobilePage.screenshot({ path: shotPath, fullPage: false });
    console.log(`    Captured: ${shotPath}`);
  }

  // Save console log report
  const logPath = path.join(OUTPUT_DIR, 'console.log');
  fs.writeFileSync(logPath, consoleLogs.length ? consoleLogs.join('\n') : '0 CONSOLE ERRORS');

  await mobileContext.close();
  await browser.close();

  console.log('\n--- FULL-SITE QA COMPLETE. ALL ARTIFACTS WRITTEN. ---');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
