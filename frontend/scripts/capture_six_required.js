import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const brainDir = 'C:/Users/rajav/.gemini/antigravity/brain/cd90e3ef-4314-4fad-8886-b432a8a115f4';
const brainScreenshotsDir = path.join(brainDir, 'screenshots');
const localScreenshotsDir = 'c:/Users/rajav/Documents/projects/mentor-os/frontend/screenshots';

fs.mkdirSync(brainScreenshotsDir, { recursive: true });
fs.mkdirSync(localScreenshotsDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function saveBoth(page, filename) {
  const p1 = path.join(localScreenshotsDir, filename);
  const p2 = path.join(brainScreenshotsDir, filename);
  const p3 = path.join(brainDir, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  fs.copyFileSync(p1, p3);
  console.log(`Saved: ${filename}`);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  // 1. Home on phone (Career mode, 390x844)
  {
    console.log('Capturing 1: Home on phone...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    await saveBoth(page, '1_home_phone.png');
    await page.close();
  }

  // 2. Home on laptop (Career mode, 1280x800)
  {
    console.log('Capturing 2: Home on laptop...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    await saveBoth(page, '2_home_laptop.png');
    await page.close();
  }

  // 3. Home in Personal mode (390x844 & 1280x800)
  {
    console.log('Capturing 3: Home in Personal mode...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Click "🌿 Personal" toggle button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const personalBtn = buttons.find(b => b.textContent && b.textContent.includes('Personal'));
      if (personalBtn) personalBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await saveBoth(page, '3_home_personal_mode.png');
    await page.close();
  }

  // 4. Calendar after uploading a plan (1280x800)
  {
    console.log('Capturing 4: Calendar after uploading a plan...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/calendar', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    await saveBoth(page, '4_calendar_plan.png');
    await page.close();
  }

  // 5. Knowledge test screen (Screen 8 milestone knowledge test modal)
  {
    console.log('Capturing 5: Knowledge test screen...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    // Click "Take Phase 1 Knowledge Test" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const testBtn = buttons.find(b => b.textContent && (b.textContent.includes('Knowledge Test') || b.textContent.includes('Check-in')));
      if (testBtn) testBtn.click();
    });
    await page.waitForSelector('textarea', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 400));

    // Type sample answer into the modal textarea
    await page.type('textarea', 'Use a LEFT JOIN on customers and orders where orders.customer_id IS NULL.');
    await new Promise(r => setTimeout(r, 200));

    // Click "Check my answer"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const checkBtn = buttons.find(b => b.textContent && b.textContent.includes('Check my answer'));
      if (checkBtn) checkBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await saveBoth(page, '5_knowledge_test_screen.png');
    await page.close();
  }

  // 6. Whole app open on a laptop (Full 1440x900 desktop screen showing sidebar, header, companion content)
  {
    console.log('Capturing 6: Whole app open on a laptop...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    await saveBoth(page, '6_whole_app_laptop.png');
    await page.close();
  }

  await browser.close();
  console.log('All 6 required screenshots captured and synced successfully!');
}

run().catch(console.error);
