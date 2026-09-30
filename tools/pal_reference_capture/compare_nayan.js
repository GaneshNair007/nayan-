import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const COMP_DIR = path.resolve('../../artifacts/ui-comparison');
const PAL_DIR = path.resolve('../../artifacts/pal_reference');
fs.mkdirSync(COMP_DIR, { recursive: true });

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1600x900', width: 1600, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390x844_mobile', width: 390, height: 844, isMobile: true }
];

async function run() {
  console.log('Launching browser for NAYAN QA capture...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  // 1. Capture Multi-Viewport Baseline
  for (const vp of VIEWPORTS) {
    console.log(`Capturing NAYAN viewport ${vp.name}...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: !!vp.isMobile
    });
    const page = await context.newPage();

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    const vpFile = path.join(COMP_DIR, `nayan_viewport_${vp.name}.png`);
    await page.screenshot({ path: vpFile, fullPage: false });
    console.log(`Saved ${vpFile}`);

    // If 1440x900, run scroll checkpoint comparison loop
    if (vp.name === '1440x900') {
      console.log('Running scroll checkpoint comparison loop (0% - 100%)...');

      const totalScrollHeight = await page.evaluate(() => {
        return Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) - window.innerHeight;
      });

      console.log(`NAYAN total scrollable height: ${totalScrollHeight}px`);

      const checkpoints = [
        { pct: 0, palFile: 'scroll_000pct_0px.png', label: '00' },
        { pct: 10, palFile: 'scroll_010pct_748px.png', label: '10' },
        { pct: 20, palFile: 'scroll_020pct_1495px.png', label: '20' },
        { pct: 30, palFile: 'scroll_030pct_2243px.png', label: '30' },
        { pct: 40, palFile: 'scroll_040pct_2990px.png', label: '40' },
        { pct: 50, palFile: 'scroll_050pct_3738px.png', label: '50' },
        { pct: 60, palFile: 'scroll_060pct_4485px.png', label: '60' },
        { pct: 70, palFile: 'scroll_070pct_5233px.png', label: '70' },
        { pct: 80, palFile: 'scroll_080pct_5980px.png', label: '80' },
        { pct: 90, palFile: 'scroll_090pct_6728px.png', label: '90' },
        { pct: 100, palFile: 'scroll_100pct_7475px.png', label: '100' }
      ];

      for (const cp of checkpoints) {
        const targetScrollY = Math.round(totalScrollHeight * (cp.pct / 100));
        await page.evaluate((y) => window.scrollTo(0, y), targetScrollY);
        await page.waitForTimeout(600); // Allow smooth transitions to settle

        const nayanShot = path.join(COMP_DIR, `nayan-${cp.label}.png`);
        await page.screenshot({ path: nayanShot, fullPage: false });

        // Copy matching reference screenshot for direct side-by-side comparison
        const refSrc = path.join(PAL_DIR, 'scroll_1440x900', cp.palFile);
        const refDest = path.join(COMP_DIR, `reference-${cp.label}.png`);
        if (fs.existsSync(refSrc)) {
          fs.copyFileSync(refSrc, refDest);
        }

        console.log(`Captured checkpoint ${cp.label}% (scroll ${targetScrollY}px) -> nayan-${cp.label}.png & reference-${cp.label}.png`);
      }

      // Extract DOM metrics for analytical discrepancy calculation
      const metrics = await page.evaluate(() => {
        const getEl = (sel) => document.querySelector(sel);
        const getMetrics = (el) => {
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return {
            tagName: el.tagName,
            width: rect.width,
            height: rect.height,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
            fontWeight: style.fontWeight,
            fontFamily: style.fontFamily,
            color: style.color,
            backgroundColor: style.backgroundColor
          };
        };

        return {
          header: getMetrics(getEl('header')),
          heroH1: getMetrics(getEl('.pal-h1')),
          networkStrip: getMetrics(getEl('#system-network')),
          selectedIntelligence: getMetrics(getEl('#selected-projects')),
          keyFigures: getMetrics(getEl('#key-figures')),
          services: getMetrics(getEl('#services')),
          story: getMetrics(getEl('#our-story')),
          evidence: getMetrics(getEl('#forensic-evidence')),
          cta: getMetrics(getEl('#command-cta')),
          footer: getMetrics(getEl('#landing-footer')),
          wordmark: getMetrics(getEl('.pal-giant-wordmark'))
        };
      });

      fs.writeFileSync(
        path.join(COMP_DIR, 'nayan_computed_metrics.json'),
        JSON.stringify(metrics, null, 2),
        'utf-8'
      );
      console.log('Saved nayan_computed_metrics.json');
    }

    await context.close();
  }

  await browser.close();
  console.log('QA Comparison Capture completed successfully!');
}

run().catch((err) => {
  console.error('QA Capture failed:', err);
  process.exit(1);
});
