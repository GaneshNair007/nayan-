import { chromium } from '../pal_reference_capture/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'artifacts/palomino-motion';
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function recordPass(browser, passName, scrollFn, sampleMotion = false) {
  console.log(`\n========================================`);
  console.log(`STARTING RECORDING: ${passName}`);
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
  console.log(`Navigating to https://palominoprod.com/en...`);
  await page.goto('https://palominoprod.com/en', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  // In-browser motion sampling setup
  let samples = [];

  if (sampleMotion) {
    console.log(`Enabling detailed motion telemetry sampler...`);
  }

  const startTime = Date.now();
  await scrollFn(page, async (currentScrollY, totalHeight) => {
    if (sampleMotion) {
      const now = Date.now() - startTime;
      const sample = await page.evaluate(({ timestamp, scrollY, totalHeight }) => {
        const sections = Array.from(document.querySelectorAll('section, header, footer'));
        const images = Array.from(document.querySelectorAll('img, video'));
        
        // Target key elements
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

        // Extract key specific elements
        const heroSection = sections[1];
        const heroImg = heroSection ? heroSection.querySelector('img') : null;
        const heroH1 = heroSection ? heroSection.querySelector('h1') : null;

        const clientSection = sections[3];
        const clientTrack = clientSection ? clientSection.querySelector('div[class*="flex"], div[class*="marquee"]') : null;

        const projectsSection = sections[4];
        const projectItems = projectsSection ? Array.from(projectsSection.querySelectorAll('article, a, div[class*="cursor-pointer"]')).slice(0, 4) : [];

        const keyFiguresSection = sections[5];
        const figures = keyFiguresSection ? Array.from(keyFiguresSection.querySelectorAll('h2, div[class*="font-"]')).slice(0, 6) : [];

        const servicesSection = sections[6];
        const serviceItems = servicesSection ? Array.from(servicesSection.querySelectorAll('article, div[class*="service"], div[class*="min-h-"]')).slice(0, 4) : [];

        const storySection = sections[7];
        const testimonialsSection = sections[8];
        const ctaSection = sections[9] || sections[10];
        const footerSection = document.querySelector('footer');

        return {
          timestamp,
          scrollY,
          scrollProgress: parseFloat((scrollY / Math.max(1, totalHeight - window.innerHeight)).toFixed(4)),
          hero: {
            section: getElementMetrics(heroSection),
            img: getElementMetrics(heroImg),
            h1: getElementMetrics(heroH1)
          },
          clientTrack: getElementMetrics(clientTrack),
          projects: {
            section: getElementMetrics(projectsSection),
            items: projectItems.map(getElementMetrics)
          },
          keyFigures: {
            section: getElementMetrics(keyFiguresSection),
            figures: figures.map(f => ({ text: f.innerText, metrics: getElementMetrics(f) }))
          },
          services: {
            section: getElementMetrics(servicesSection),
            items: serviceItems.map(getElementMetrics)
          },
          story: getElementMetrics(storySection),
          testimonials: getElementMetrics(testimonialsSection),
          cta: getElementMetrics(ctaSection),
          footer: getElementMetrics(footerSection)
        };
      }, { timestamp: now, scrollY: currentScrollY, totalHeight });

      samples.push(sample);
    }
  });

  console.log(`Scroll pass finished. Closing page context to flush video...`);
  const videoObj = page.video();
  await page.close();
  await context.close();

  if (videoObj) {
    const videoPath = await videoObj.path();
    const destPath = path.join(ARTIFACTS_DIR, `${passName}.webm`);
    fs.copyFileSync(videoPath, destPath);
    console.log(`Saved video to: ${destPath}`);
  }

  // Clean up temp dir
  fs.rmSync(tempVideoDir, { recursive: true, force: true });

  return samples;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. PASS A: SLOW SCROLL with 60ms telemetry sampling
  const slowSamples = await recordPass(browser, 'reference-slow', async (page, onStep) => {
    const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(`Total document scroll height: ${totalHeight}px`);
    const stepSize = 40;
    const intervalMs = 60;
    let currentY = 0;

    while (currentY < totalHeight) {
      currentY += stepSize;
      await page.evaluate((y) => window.scrollTo(0, y), currentY);
      await sleep(intervalMs);
      await onStep(currentY, totalHeight);
    }
  }, true);

  // Save sampled telemetry
  const samplesFile = path.join(ARTIFACTS_DIR, 'motion-samples.json');
  fs.writeFileSync(samplesFile, JSON.stringify(slowSamples, null, 2), 'utf-8');
  console.log(`Saved ${slowSamples.length} motion samples to ${samplesFile}`);

  // 2. PASS B: NORMAL TRACKPAD SCROLL
  await recordPass(browser, 'reference-normal', async (page, onStep) => {
    const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const stepSize = 180;
    const intervalMs = 30;
    let currentY = 0;

    while (currentY < totalHeight) {
      currentY += stepSize;
      await page.evaluate((y) => window.scrollTo(0, y), currentY);
      await sleep(intervalMs);
      await onStep(currentY, totalHeight);
    }
  }, false);

  // 3. PASS C: FAST SCROLL with direction changes
  await recordPass(browser, 'reference-fast', async (page, onStep) => {
    const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    // Fast down
    for (let y = 0; y <= totalHeight; y += 450) {
      await page.evaluate((scrollPos) => window.scrollTo(0, scrollPos), y);
      await sleep(25);
      await onStep(y, totalHeight);
    }
    // Reverse up to middle
    for (let y = totalHeight; y >= totalHeight / 2; y -= 400) {
      await page.evaluate((scrollPos) => window.scrollTo(0, scrollPos), y);
      await sleep(25);
      await onStep(y, totalHeight);
    }
    // Forward down to bottom
    for (let y = totalHeight / 2; y <= totalHeight; y += 400) {
      await page.evaluate((scrollPos) => window.scrollTo(0, scrollPos), y);
      await sleep(25);
      await onStep(y, totalHeight);
    }
  }, false);

  await browser.close();
  console.log('\n========================================');
  console.log('ALL REFERENCE MOTION RECORDINGS COMPLETED!');
  console.log('========================================\n');
}

main().catch(err => {
  console.error('Motion recording failed:', err);
  process.exit(1);
});
