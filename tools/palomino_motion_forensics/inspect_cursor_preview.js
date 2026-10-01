import { chromium } from '../pal_reference_capture/node_modules/playwright/index.mjs';

async function inspectCursorInteraction() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://palominoprod.com/en', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll down to Selected Projects section
  await page.evaluate(() => {
    const sec = Array.from(document.querySelectorAll('section')).find(s => s.innerText.includes('SELECTED PROJECTS'));
    if (sec) sec.scrollIntoView();
  });
  await page.waitForTimeout(1000);

  // Check if any element has fixed position or high z-index following cursor
  const initialElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div, img')).filter(el => {
      const s = window.getComputedStyle(el);
      return s.position === 'fixed' && parseInt(s.zIndex || '0', 10) > 40;
    }).map(el => ({
      tagName: el.tagName,
      className: el.className,
      style: el.getAttribute('style')
    }));
  });

  // Move cursor across selected projects
  const card = await page.$('section a[href*="work"], section article');
  if (card) {
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.waitForTimeout(200);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(200);
    }
  }

  const afterMoveElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div, img')).filter(el => {
      const s = window.getComputedStyle(el);
      return s.position === 'fixed' && parseInt(s.zIndex || '0', 10) > 40;
    }).map(el => ({
      tagName: el.tagName,
      className: el.className,
      style: el.getAttribute('style'),
      rect: el.getBoundingClientRect()
    }));
  });

  console.log('INITIAL FIXED HIGH-Z ELEMENTS:', initialElements);
  console.log('AFTER MOUSE MOVE FIXED ELEMENTS:', afterMoveElements);

  await browser.close();
}

inspectCursorInteraction().catch(console.error);
