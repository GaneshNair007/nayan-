import { chromium } from '../pal_reference_capture/node_modules/playwright/index.mjs';

async function inspectHover() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://palominoprod.com/en', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const a = await page.$('header a[href*="work"]');
  console.log('--- BEFORE HOVER ---');
  console.log(await page.evaluate(el => el.innerHTML, a));

  await a.hover();
  await page.waitForTimeout(120);
  console.log('--- 120ms AFTER HOVER ---');
  console.log(await page.evaluate(el => el.innerHTML, a));

  await page.waitForTimeout(400);
  console.log('--- 520ms AFTER HOVER ---');
  console.log(await page.evaluate(el => el.innerHTML, a));

  await browser.close();
}

inspectHover().catch(console.error);
