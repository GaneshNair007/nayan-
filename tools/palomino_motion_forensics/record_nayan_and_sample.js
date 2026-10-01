import { chromium } from '../pal_reference_capture/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'artifacts/nayan-motion';
const COMPARISON_DIR = 'artifacts/ui-comparison';
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.mkdirSync(COMPARISON_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function recordPass(browser, passName, scrollFn, sampleMotion = false) {
  console.log(`\n========================================`);
  console.log(`STARTING NAYAN RECORDING: ${passName}`);
  console.log(`========================================`);

  const tempVideoDir = path.join(ARTIFACTS_DIR, `temp_${passName}`);
  fs.mkdirSync(tempVideoDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();
  console.log(`Navigating to http://localhost:5173...`);
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  let samples = [];

  const startTime = Date.now();
  await scrollFn(page, async (currentScrollY, totalHeight) => {
    if (sampleMotion) {
      const now = Date.now() - startTime;
      const sample = await page.evaluate(({ timestamp, scrollY, totalHeight }) => {
        const getElementMetrics = (el) => {
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return {
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            rect: {
              top: Math.round(rect.top),
              bottom: Math.round(rect.bottom),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            style: {
              position: style.position,
              transform: style.transform,
              opacity: parseFloat(style.opacity || '1'),
              clipPath: style.clipPath,
              filter: style.filter,
              borderRadius: style.borderRadius,
              zIndex: style.zIndex,
              objectFit: style.objectFit,
              objectPosition: style.objectPosition,
              visibility: style.visibility
            }
          };
        };

        const hero = document.getElementById('hero');
        const heroImg = hero ? hero.querySelector('video, img') : null;
        const heroH1 = hero ? hero.querySelector('h1') : null;

        const network = document.getElementById('system-network');
        const projects = document.getElementById('selected-projects');
        const figures = document.getElementById('key-figures');
        const services = document.getElementById('services');
        const serviceLayers = services ? Array.from(services.querySelectorAll('.pal-service-layer')) : [];
        const story = document.getElementById('our-story');
        const testimonials = document.getElementById('forensic-evidence');
        const cta = document.getElementById('command-cta');
        const footer = document.getElementById('landing-footer');

        return {
          timestamp,
          scrollY,
          scrollProgress: (scrollY / Math.max(1, totalHeight - window.innerHeight)).toFixed(4),
          elements: {
            hero: getElementMetrics(hero),
            heroMedia: getElementMetrics(heroImg),
            heroH1: getElementMetrics(heroH1),
            network: getElementMetrics(network),
            projects: getElementMetrics(projects),
            figures: getElementMetrics(figures),
            services: getElementMetrics(services),
            serviceLayer1: getElementMetrics(serviceLayers[0]),
            serviceLayer2: getElementMetrics(serviceLayers[1]),
            serviceLayer3: getElementMetrics(serviceLayers[2]),
            serviceLayer4: getElementMetrics(serviceLayers[3]),
            story: getElementMetrics(story),
            testimonials: getElementMetrics(testimonials),
            cta: getElementMetrics(cta),
            footer: getElementMetrics(footer)
          }
        };
      }, { timestamp: now, scrollY: currentScrollY, totalHeight });

      samples.push(sample);
    }
  });

  await page.waitForTimeout(1000);
  await context.close();

  // Find recorded video and move to target
  const files = fs.readdirSync(tempVideoDir);
  const videoFile = files.find(f => f.endsWith('.webm'));
  if (videoFile) {
    const srcPath = path.join(tempVideoDir, videoFile);
    const destPath = path.join(ARTIFACTS_DIR, `nayan-${passName}.webm`);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Saved video to: ${destPath}`);
  }
  fs.rmSync(tempVideoDir, { recursive: true, force: true });

  return samples;
}

async function captureSynchronizedScreenshots(browser) {
  console.log(`\n========================================`);
  console.log(`CAPTURING SYNCHRONIZED SCREENSHOTS (0% to 100%)`);
  console.log(`========================================`);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const maxScroll = totalHeight - 900;

  const points = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

  for (const p of points) {
    const scrollTarget = Math.round(p * maxScroll);
    await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);
    await page.waitForTimeout(400);

    const percent = Math.round(p * 100);
    const filename = `nayan_scroll_${String(percent).padStart(3, '0')}.jpg`;
    const outPath = path.join(COMPARISON_DIR, filename);
    await page.screenshot({ path: outPath, quality: 85, type: 'jpeg' });
    console.log(`Captured ${filename} at scrollY: ${scrollTarget}px (${percent}%)`);
  }

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  try {
    // PASS A: SLOW SCROLL WITH DETAILED TELEMETRY SAMPLING
    const slowSamples = await recordPass(browser, 'slow', async (page, onStep) => {
      const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const step = 40;
      let currentY = 0;

      while (currentY < totalHeight) {
        await page.evaluate((y) => window.scrollTo(0, y), currentY);
        await onStep(currentY, totalHeight);
        await sleep(60); // 60ms interval matching reference
        currentY += step;
      }
      await onStep(totalHeight, totalHeight);
    }, true);

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'motion-samples.json'),
      JSON.stringify({ samples: slowSamples, totalSamples: slowSamples.length }, null, 2)
    );
    console.log(`Saved ${slowSamples.length} telemetry samples to artifacts/nayan-motion/motion-samples.json`);

    // PASS B: NORMAL TRACKPAD-LIKE SCROLL
    await recordPass(browser, 'normal', async (page, onStep) => {
      const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const step = 140;
      let currentY = 0;

      while (currentY < totalHeight) {
        await page.evaluate((y) => window.scrollTo(0, y), currentY);
        await onStep(currentY, totalHeight);
        await sleep(35);
        currentY += step;
      }
    }, false);

    // PASS C: FAST SCROLL WITH DIRECTION CHANGES
    await recordPass(browser, 'fast', async (page, onStep) => {
      const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      let currentY = 0;

      // Down fast
      while (currentY < totalHeight * 0.75) {
        await page.evaluate((y) => window.scrollTo(0, y), currentY);
        await onStep(currentY, totalHeight);
        await sleep(20);
        currentY += 320;
      }

      // Reversal up
      while (currentY > totalHeight * 0.25) {
        await page.evaluate((y) => window.scrollTo(0, y), currentY);
        await onStep(currentY, totalHeight);
        await sleep(20);
        currentY -= 280;
      }

      // Down to bottom
      while (currentY < totalHeight) {
        await page.evaluate((y) => window.scrollTo(0, y), currentY);
        await onStep(currentY, totalHeight);
        await sleep(20);
        currentY += 350;
      }
    }, false);

    // CAPTURE SYNCHRONIZED SCREENSHOTS
    await captureSynchronizedScreenshots(browser);

    console.log(`\nALL NAYAN RECORDINGS AND COMPARISON ASSETS CAPTURED SUCCESSFULLY.`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error("FATAL ERROR IN NAYAN MOTION CAPTURE:", err);
  process.exit(1);
});
