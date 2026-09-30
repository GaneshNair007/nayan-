import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('../../artifacts/pal_reference');
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1600x900', width: 1600, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390x844_mobile', width: 390, height: 844, isMobile: true }
];

async function run() {
  console.log('Launching browser with Edge channel...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  // 1. Capture Multi-Viewport Baseline
  for (const vp of VIEWPORTS) {
    console.log(`Capturing viewport ${vp.name}...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: !!vp.isMobile
    });
    const page = await context.newPage();
    
    try {
      await page.goto('https://palominoprod.com/en', { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) {
      console.log(`Network idle timed out for ${vp.name}, proceeding with load state: ${e.message}`);
      await page.waitForLoadState('domcontentloaded');
    }

    // Give subtle animations a moment to settle
    await page.waitForTimeout(2000);

    const vpFile = path.join(OUT_DIR, `viewport_${vp.name}.png`);
    await page.screenshot({ path: vpFile, fullPage: false });
    console.log(`Saved ${vpFile}`);

    if (vp.name === '1440x900') {
      // 2. Capture Detailed Scroll Sequence (0% to 100% in 5% steps)
      const scrollDir = path.join(OUT_DIR, 'scroll_1440x900');
      fs.mkdirSync(scrollDir, { recursive: true });

      const totalScrollHeight = await page.evaluate(() => {
        return Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) - window.innerHeight;
      });

      console.log(`Total scrollable height at 1440x900: ${totalScrollHeight}px`);

      const steps = 20; // 0% to 100% in 5% increments
      for (let i = 0; i <= steps; i++) {
        const pct = i * 5;
        const scrollY = Math.round((totalScrollHeight * pct) / 100);
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.waitForTimeout(600); // Let scroll settle

        const scrollFile = path.join(scrollDir, `scroll_${String(pct).padStart(3, '0')}pct_${scrollY}px.png`);
        await page.screenshot({ path: scrollFile, fullPage: false });
        console.log(`Captured ${pct}% scroll at ${scrollY}px`);
      }

      // 3. Extract DOM & Computed Style Forensics
      console.log('Extracting DOM & Computed Style Forensics...');
      const metrics = await page.evaluate(() => {
        const getStyle = (el) => {
          if (!el) return null;
          const s = window.getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return {
            tagName: el.tagName,
            className: el.className,
            width: r.width,
            height: r.height,
            top: r.top + window.scrollY,
            left: r.left,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            fontFamily: s.fontFamily,
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing,
            color: s.color,
            backgroundColor: s.backgroundColor,
            padding: s.padding,
            margin: s.margin,
            display: s.display,
            flexDirection: s.flexDirection,
            justifyContent: s.justifyContent,
            alignItems: s.alignItems,
            position: s.position,
            overflow: s.overflow,
            transform: s.transform,
            opacity: s.opacity
          };
        };

        // Scroll back to top for accurate element inspections
        window.scrollTo(0, 0);

        // Sections and key landmarks
        const header = document.querySelector('header') || document.querySelector('nav');
        const navLinks = Array.from(document.querySelectorAll('header a, nav a')).map(a => ({
          text: a.innerText.trim().replace(/\s+/g, ' '),
          html: a.innerHTML,
          style: getStyle(a)
        }));

        const h1 = document.querySelector('h1');
        const heroSection = h1 ? h1.closest('section') || h1.parentElement : null;

        const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
          tag: h.tagName,
          text: h.innerText.trim().replace(/\s+/g, ' '),
          style: getStyle(h)
        }));

        const sections = Array.from(document.querySelectorAll('main > section, body > section, section')).map((sec, idx) => ({
          index: idx,
          id: sec.id,
          className: sec.className,
          style: getStyle(sec),
          innerHeadings: Array.from(sec.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText.trim().replace(/\s+/g, ' ')),
          innerTextSnippet: sec.innerText.slice(0, 200).replace(/\s+/g, ' ')
        }));

        const footer = document.querySelector('footer');

        return {
          windowInnerWidth: window.innerWidth,
          windowInnerHeight: window.innerHeight,
          header: getStyle(header),
          navLinks,
          heroSection: getStyle(heroSection),
          heroH1: getStyle(h1),
          h1Text: h1 ? h1.innerText : '',
          allHeadings,
          sections,
          footer: getStyle(footer),
          footerText: footer ? footer.innerText.slice(0, 400).replace(/\s+/g, ' ') : ''
        };
      });

      fs.writeFileSync(
        path.join(OUT_DIR, 'palomino_computed_metrics.json'),
        JSON.stringify(metrics, null, 2)
      );
      console.log('Saved palomino_computed_metrics.json');
    }

    await context.close();
  }

  await browser.close();
  console.log('Capture complete!');
}

run().catch(err => {
  console.error('Capture script error:', err);
  process.exit(1);
});
