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
  await page.setViewport({ width: 412, height: 1100 });

  // Ensure logged-in user
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

  // 1. Visit Home (/) -> Expect Analytics Dashboard
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'home_now_analytics_mobile.png'), fullPage: true });
  console.log('Saved: home_now_analytics_mobile.png');

  // Switch to Routine Consistency on Home
  const buttonsHome = await page.$$('button');
  for (const b of buttonsHome) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Routine Consistency')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 1000));
      break;
    }
  }
  await page.screenshot({ path: path.join(artifactDir, 'home_routine_analytics_mobile.png'), fullPage: true });
  console.log('Saved: home_routine_analytics_mobile.png');

  // 2. Visit Progress (/progress) -> Expect Daily Tasks & Execution
  await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'progress_now_tasks_mobile.png'), fullPage: true });
  console.log('Saved: progress_now_tasks_mobile.png');

  // Switch to Personal on Progress
  const buttonsProg = await page.$$('button');
  for (const b of buttonsProg) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Personal')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 1000));
      break;
    }
  }
  await page.screenshot({ path: path.join(artifactDir, 'progress_personal_tasks_mobile.png'), fullPage: true });
  console.log('Saved: progress_personal_tasks_mobile.png');

  // 3. Desktop Viewports (1280px)
  await page.setViewport({ width: 1280, height: 950 });

  // Desktop Home (/)
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'home_now_analytics_desktop.png'), fullPage: true });
  console.log('Saved: home_now_analytics_desktop.png');

  // Desktop Progress (/progress)
  await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'progress_now_tasks_desktop.png'), fullPage: true });
  console.log('Saved: progress_now_tasks_desktop.png');

  await browser.close();
  console.log('All verification captures completed successfully!');
}

run().catch(console.error);
