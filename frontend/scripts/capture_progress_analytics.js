import puppeteer from 'puppeteer-core';
import path from 'path';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    window.scrollBy(0, 480);
  });
  await new Promise(r => setTimeout(r, 300));

  const outPath = path.resolve('screenshots/progress_career_analytics_desktop.png');
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('Captured progress_career_analytics_desktop.png');
}

capture().catch(console.error);
