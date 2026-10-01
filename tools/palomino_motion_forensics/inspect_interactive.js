import { chromium } from '../pal_reference_capture/node_modules/playwright/index.mjs';

async function inspectInteractiveElements() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('https://palominoprod.com/en', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  // 1. Inspect Nav Links hover
  const navHoverData = await page.evaluate(async () => {
    const navItem = document.querySelector('header a:nth-child(2)'); // WORK link
    if (!navItem) return null;
    
    const initialHtml = navItem.outerHTML;
    const initialRect = navItem.getBoundingClientRect();
    const spansBefore = Array.from(navItem.querySelectorAll('span, div')).map(el => ({
      text: el.innerText,
      transform: window.getComputedStyle(el).transform,
      top: el.offsetTop
    }));

    // Trigger hover
    navItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    navItem.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    
    // Wait 250ms
    await new Promise(r => setTimeout(r, 250));
    const spansAfter = Array.from(navItem.querySelectorAll('span, div')).map(el => ({
      text: el.innerText,
      transform: window.getComputedStyle(el).transform,
      top: el.offsetTop
    }));

    return {
      initialHtml,
      initialRect,
      spansBefore,
      spansAfter
    };
  });

  // 2. Inspect Client marquee
  const clientMarqueeData = await page.evaluate(async () => {
    const clientSec = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('CLIENTS') || s.innerText.includes('THEY TRUST US'));
    if (!clientSec) return null;
    
    const marqueeContainer = clientSec.querySelector('div[class*="overflow-hidden"], div[class*="flex"]');
    const tracks = clientSec.querySelectorAll('div[class*="flex"]');
    
    const t0 = performance.now();
    const pos0 = tracks[0] ? tracks[0].getBoundingClientRect().left : 0;
    await new Promise(r => setTimeout(r, 500));
    const t1 = performance.now();
    const pos1 = tracks[0] ? tracks[0].getBoundingClientRect().left : 0;

    const speedPxPerSec = Math.abs((pos1 - pos0) / ((t1 - t0) / 1000));

    return {
      sectionHtml: clientSec.outerHTML.slice(0, 500),
      trackCount: tracks.length,
      speedPxPerSec
    };
  });

  // 3. Inspect Selected Projects markup & styles
  const projectsData = await page.evaluate(() => {
    const projSec = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('SELECTED PROJECTS'));
    if (!projSec) return null;

    const cards = Array.from(projSec.querySelectorAll('article, div[class*="group"], a')).filter(el => el.querySelector('img, video'));
    return {
      secClasses: projSec.className,
      cardCount: cards.length,
      sampleCard: cards.slice(0, 2).map(c => ({
        tag: c.tagName,
        className: c.className,
        rect: c.getBoundingClientRect(),
        img: c.querySelector('img') ? {
          src: c.querySelector('img').src.slice(0, 100),
          className: c.querySelector('img').className,
          style: c.querySelector('img').getAttribute('style'),
          transform: window.getComputedStyle(c.querySelector('img')).transform
        } : null,
        text: c.innerText.slice(0, 100)
      }))
    };
  });

  // 4. Inspect Services structure
  const servicesData = await page.evaluate(() => {
    const servSec = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('SERVICES'));
    if (!servSec) return null;

    const items = Array.from(servSec.querySelectorAll('div[class*="grid"], div[class*="sticky"], article'));
    return {
      className: servSec.className,
      items: items.slice(0, 6).map(it => ({
        tag: it.tagName,
        className: it.className,
        position: window.getComputedStyle(it).position,
        height: it.getBoundingClientRect().height,
        text: it.innerText.slice(0, 60).replace(/\n/g, ' ')
      }))
    };
  });

  console.log('NAV HOVER:', JSON.stringify(navHoverData, null, 2));
  console.log('CLIENT MARQUEE:', JSON.stringify(clientMarqueeData, null, 2));
  console.log('SELECTED PROJECTS:', JSON.stringify(projectsData, null, 2));
  console.log('SERVICES:', JSON.stringify(servicesData, null, 2));

  await browser.close();
}

inspectInteractiveElements().catch(console.error);
