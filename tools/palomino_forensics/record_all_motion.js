import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const REF_DIR = path.join(ROOT, 'artifacts/reference');
const MOTION_DIR = path.join(ROOT, 'artifacts/ui-final-motion');

fs.mkdirSync(REF_DIR, { recursive: true });
fs.mkdirSync(MOTION_DIR, { recursive: true });

async function recordPalominoReference(browser) {
  console.log('\n--- Recording Palomino Reference Motion ---');
  const speeds = [
    { name: 'slow', durationMs: 8000, step: 25 },
    { name: 'normal', durationMs: 5000, step: 60 },
    { name: 'fast', durationMs: 3000, step: 180 }
  ];

  for (const s of speeds) {
    const tempDir = path.join(REF_DIR, `temp_${s.name}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: tempDir, size: { width: 1440, height: 900 } }
    });

    const page = await context.newPage();
    try {
      console.log(`Navigating to Palomino for ${s.name} scroll...`);
      await page.goto('https://palominoprod.com/en', { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(1500);

      // Perform scroll
      const totalScroll = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
      const startTime = Date.now();
      let currentY = 0;

      while (Date.now() - startTime < s.durationMs && currentY < totalScroll) {
        currentY += s.step;
        await page.evaluate((y) => window.scrollTo(0, y), currentY);
        await page.waitForTimeout(30);
      }

      if (s.name === 'fast') {
        while (currentY > 0) {
          currentY -= s.step * 1.5;
          await page.evaluate((y) => window.scrollTo(0, Math.max(0, y)), currentY);
          await page.waitForTimeout(25);
        }
      }

      await page.waitForTimeout(800);
    } catch (e) {
      console.warn(`Palomino recording note (${s.name}):`, e.message);
    }

    await context.close();

    const files = fs.readdirSync(tempDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const dest = path.join(REF_DIR, `palomino-${s.name}.webm`);
      fs.copyFileSync(path.join(tempDir, videoFile), dest);
      console.log(`Saved: ${dest}`);
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function recordNayanPages(browser) {
  console.log('\n--- Recording NAYAN Final Interaction Motion Clips (10-15s each) ---');

  const pages = [
    { id: 'landing', tab: 'OVERVIEW', file: 'landing.webm' },
    { id: 'command-center', tab: 'COMMAND', file: 'command.webm' },
    { id: 'camera-intel', tab: 'CAMERAS', file: 'camera.webm' },
    { id: 'corridor', tab: 'CORRIDORS', file: 'corridor.webm' },
    { id: 'traffic', tab: 'SIGNALS', file: 'traffic.webm' },
    { id: 'digital-twin', tab: 'TWIN', file: 'twin.webm' },
    { id: 'audit', tab: 'AUDIT', file: 'audit.webm' },
    { id: 'ai', tab: 'COPILOT', file: 'ai.webm' },
    { id: 'system', tab: 'SYSTEM', file: 'system.webm' }
  ];

  for (const p of pages) {
    const tempDir = path.join(MOTION_DIR, `temp_${p.id}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: tempDir, size: { width: 1440, height: 900 } }
    });

    const page = await context.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(600);

    // Switch to target view
    if (p.id === 'system') {
      const sysBtn = page.locator('header button:has-text("SYSTEM")').first();
      if (await sysBtn.isVisible()) {
        await sysBtn.click();
        await page.waitForTimeout(500);
        const fullBtn = page.locator('button:has-text("OPEN FULL SYSTEM ARCHITECTURE SPECIFICATIONS")').first();
        if (await fullBtn.isVisible()) await fullBtn.click();
      }
    } else if (p.id !== 'landing') {
      await page.evaluate((tabText) => {
        const btns = Array.from(document.querySelectorAll('header nav button'));
        const target = btns.find(b => b.innerText.includes(tabText));
        if (target) target.click();
      }, p.tab);
    }

    await page.waitForTimeout(800);

    // Scroll through page
    const scrollHeight = await page.evaluate(() => Math.max(300, document.body.scrollHeight - window.innerHeight));
    const steps = 14;
    const stepSize = Math.max(25, Math.floor(scrollHeight / steps));

    for (let i = 1; i <= steps; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), i * stepSize);
      await page.waitForTimeout(250);
    }

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(600);

    await context.close();

    const files = fs.readdirSync(tempDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const dest = path.join(MOTION_DIR, p.file);
      fs.copyFileSync(path.join(tempDir, videoFile), dest);
      console.log(`Saved: artifacts/ui-final-motion/${p.file}`);
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  // Incident Case-Study Page
  {
    const tempDir = path.join(MOTION_DIR, 'temp_incident');
    fs.mkdirSync(tempDir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: tempDir, size: { width: 1440, height: 900 } }
    });

    const page = await context.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header nav button'));
      const target = btns.find(b => b.innerText.includes('CAMERAS'));
      if (target) target.click();
    });
    await page.waitForTimeout(600);

    const caseBtn = page.locator('button:has-text("EXAMINE CASE DETAIL")').first();
    if (await caseBtn.isVisible()) {
      await caseBtn.click();
      await page.waitForTimeout(800);
    }

    for (let i = 1; i <= 10; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y * 140, behavior: 'smooth' }), i);
      await page.waitForTimeout(300);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(600);

    await context.close();

    const files = fs.readdirSync(tempDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const dest = path.join(MOTION_DIR, 'incident.webm');
      fs.copyFileSync(path.join(tempDir, videoFile), dest);
      console.log(`Saved: artifacts/ui-final-motion/incident.webm`);
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  await recordPalominoReference(browser);
  await recordNayanPages(browser);
  await browser.close();
  console.log('\nAll motion recordings completed!');
}

main().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
