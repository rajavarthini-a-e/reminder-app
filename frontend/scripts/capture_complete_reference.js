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

  // 1. Onboarding Screen 1: Welcome (390x844)
  {
    console.log('Capturing 1: Onboarding Welcome...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/onboarding', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));
    await saveBoth(page, 'screen1_onboarding_welcome.png');
    await page.close();
  }

  // 2. Onboarding Screen 2: Choose Focus (390x844)
  {
    console.log('Capturing 2: Onboarding Choose Focus...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/onboarding', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 800));
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find((b) => b.textContent && b.textContent.includes("Let's get started"));
      if (startBtn) startBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveBoth(page, 'screen2_onboarding_focus.png');
    await page.close();
  }

  // 3. Home Screen (Career mode, 390x844)
  {
    console.log('Capturing 3: Home Career Phone...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveBoth(page, 'screen4_home_career_phone.png');
    await page.close();
  }

  // 4. Home Screen (Personal mode, 390x844)
  {
    console.log('Capturing 4: Home Personal Phone...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const personalBtn = buttons.find((b) => b.textContent && b.textContent.includes('Personal'));
      if (personalBtn) personalBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveBoth(page, 'screen5_home_personal_phone.png');
    await page.close();
  }

  // 5. Calendar (390x844)
  {
    console.log('Capturing 5: Calendar Phone...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/calendar', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveBoth(page, 'screen6_calendar_phone.png');
    await page.close();
  }

  // 6. Milestone Knowledge Test (390x844)
  {
    console.log('Capturing 6: Milestone Knowledge Test...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const testBtn = buttons.find((b) => b.textContent && b.textContent.includes('Knowledge Test'));
      if (testBtn) testBtn.click();
    });
    await page.waitForSelector('textarea', { timeout: 5000 });
    await page.type('textarea', 'Use a LEFT JOIN on customers and orders where orders.customer_id IS NULL.');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const checkBtn = buttons.find((b) => b.textContent && b.textContent.includes('Check my answer'));
      if (checkBtn) checkBtn.click();
    });
    await new Promise((r) => setTimeout(r, 700));
    await saveBoth(page, 'screen8_milestone_test_phone.png');
    await page.close();
  }

  // 7. Roadmap Library (390x844)
  {
    console.log('Capturing 7: Roadmap Library...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/library', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));
    await saveBoth(page, 'screen10_roadmap_library_phone.png');
    await page.close();
  }

  // 8. Mentor Chat (390x844)
  {
    console.log('Capturing 8: Mentor Chat...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/mentor', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));
    await saveBoth(page, 'screen13_mentor_chat_phone.png');
    await page.close();
  }

  // 9. Profile Screen (390x844)
  {
    console.log('Capturing 9: Profile Screen...');
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/profile', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));
    await saveBoth(page, 'screen15_profile_phone.png');
    await page.close();
  }

  // 10. Whole App Open on Laptop (1280x800)
  {
    console.log('Capturing 10: Whole App Laptop (1280px)...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveBoth(page, 'screen_desktop_1280px.png');
    await page.close();
  }

  await browser.close();
  console.log('All visual reference screenshots captured successfully!');
}

run().catch(console.error);
