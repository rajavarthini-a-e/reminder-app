import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

export async function capture(url, outPath, width = 1280, height = 800) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  // Wait for React to render and API fetch to complete
  await new Promise(r => setTimeout(r, 1500));
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log(`Saved screenshot: ${outPath} (${width}x${height})`);
}

// If run directly
if (process.argv[1]?.endsWith('screenshot_helper.js')) {
  const url = process.argv[2] || 'http://localhost:5173';
  const out = process.argv[3] || 'test_output.png';
  const w = parseInt(process.argv[4] || '1280', 10);
  const h = parseInt(process.argv[5] || '800', 10);
  capture(url, out, w, h).catch(console.error);
}
