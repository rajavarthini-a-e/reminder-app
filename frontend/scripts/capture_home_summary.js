import puppeteer from 'puppeteer-core';
import path from 'path';

async function captureSummary() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  // Scroll further down to show Inline verification + This week summary
  await page.evaluate(() => {
    window.scrollBy(0, 950);
  });
  await new Promise(r => setTimeout(r, 400));

  const outPath = path.resolve('screenshots/home_summary_mobile.png');
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('Captured home_summary_mobile.png');
}

captureSummary().catch(console.error);
