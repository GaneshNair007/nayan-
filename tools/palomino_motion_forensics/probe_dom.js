import { chromium } from '../pal_reference_capture/node_modules/playwright/index.mjs';

async function probePalominoDOM() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to https://palominoprod.com/en...');
  await page.goto('https://palominoprod.com/en', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  const analysis = await page.evaluate(() => {
    // 1. Get all main sections
    const sections = Array.from(document.querySelectorAll('section, main > div, header, footer')).map((el, i) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        index: i,
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        height: rect.height,
        top: rect.top + window.scrollY,
        position: style.position,
        hasSticky: style.position === 'sticky',
        childCount: el.children.length,
        textPreview: (el.innerText || '').slice(0, 80).replace(/\n/g, ' ')
      };
    });

    // 2. Identify key interactive elements
    const navLinks = Array.from(document.querySelectorAll('header a, nav a')).map(a => ({
      text: a.innerText.trim(),
      className: a.className,
      html: a.innerHTML.slice(0, 100)
    }));

    // 3. Identify images / media wrappers
    const media = Array.from(document.querySelectorAll('img, video')).map(m => {
      const rect = m.getBoundingClientRect();
      const style = window.getComputedStyle(m);
      const parentStyle = window.getComputedStyle(m.parentElement);
      return {
        tagName: m.tagName,
        src: (m.src || m.currentSrc || '').slice(0, 100),
        width: rect.width,
        height: rect.height,
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
        transform: style.transform,
        parentOverflow: parentStyle.overflow,
        parentTransform: parentStyle.transform
      };
    });

    // 4. Check if Lenis or GSAP is on window
    const hasLenis = Boolean(window.lenis || document.querySelector('.lenis') || document.documentElement.classList.contains('lenis'));
    const hasGSAP = Boolean(window.gsap || window.ScrollTrigger);

    return {
      title: document.title,
      totalHeight: document.documentElement.scrollHeight,
      hasLenis,
      hasGSAP,
      sections,
      navLinks,
      mediaCount: media.length,
      sampleMedia: media.slice(0, 10)
    };
  });

  console.log('DOM Probe Result:', JSON.stringify(analysis, null, 2));
  await browser.close();
}

probePalominoDOM().catch(console.error);
