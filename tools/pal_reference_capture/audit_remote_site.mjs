import { chromium } from 'playwright';

async function testRemote() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const failedRequests = [];
  const consoleMessages = [];
  const videoStatuses = [];

  page.on('console', msg => {
    consoleMessages.push(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('requestfailed', req => {
    failedRequests.push(`[FAILED REQUEST] ${req.url()} (${req.failure().errorText})`);
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      failedRequests.push(`[HTTP ${resp.status()}] ${resp.url()}`);
    }
  });

  console.log('Navigating to https://nayan-lovat.vercel.app/ ...');
  await page.goto('https://nayan-lovat.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check videos
  const videos = await page.$$('video');
  console.log(`Found ${videos.length} <video> elements on landing page.`);
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const src = await v.getAttribute('src');
    const currentSrc = await v.evaluate(el => el.currentSrc);
    const readyState = await v.evaluate(el => el.readyState);
    const networkState = await v.evaluate(el => el.networkState);
    const error = await v.evaluate(el => el.error ? el.error.message || el.error.code : null);
    videoStatuses.push({ index: i, src, currentSrc, readyState, networkState, error });
  }

  // Check images
  const images = await page.$$('img');
  console.log(`Found ${images.length} <img> elements on landing page.`);
  const imageStatuses = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = await img.getAttribute('src');
    const naturalWidth = await img.evaluate(el => el.naturalWidth);
    const complete = await img.evaluate(el => el.complete);
    imageStatuses.push({ index: i, src, naturalWidth, complete });
  }

  console.log('\n--- FAILED REQUESTS ---');
  console.log(failedRequests.length ? failedRequests.join('\n') : 'None');

  console.log('\n--- VIDEO STATUSES ---');
  console.log(JSON.stringify(videoStatuses, null, 2));

  console.log('\n--- IMAGE STATUSES ---');
  console.log(JSON.stringify(imageStatuses, null, 2));

  console.log('\n--- CONSOLE MESSAGES ---');
  console.log(consoleMessages.join('\n'));

  await browser.close();
}

testRemote().catch(console.error);
