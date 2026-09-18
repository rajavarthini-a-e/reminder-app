import puppeteer from 'puppeteer-core';
import path from 'path';

const artifactDir = 'C:\\Users\\rajav\\.gemini\\antigravity\\brain\\cd90e3ef-4314-4fad-8886-b432a8a115f4';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Login session
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const user = {
      id: 'user-default-1',
      name: 'Rajavarthini',
      email: 'alex@mentorai.com',
      onboardingCompleted: true,
      onboardingStep: 3,
      focusPreference: 'career',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('mentor_session_user', JSON.stringify(user));
  });
  await new Promise((r) => setTimeout(r, 400));

  // 1. Home on Laptop
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'desktop_home_work_ahead.png') });
  console.log('Saved: desktop_home_work_ahead.png');

  // 2. Calendar on Laptop
  await page.goto('http://localhost:5173/calendar', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));
  // Next week past 20
  const nextWeekBtn = await page.$('button[title="Next 7 Days"]');
  if (nextWeekBtn) {
    await nextWeekBtn.click();
    await new Promise((r) => setTimeout(r, 800));
  }
  await page.screenshot({ path: path.join(artifactDir, 'desktop_calendar_past_20.png') });
  console.log('Saved: desktop_calendar_past_20.png');

  await browser.close();
}

run().catch(console.error);
