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
  await page.setViewport({ width: 1280, height: 950 });

  // Ensure logged-in user and dark theme in localStorage
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
    localStorage.setItem('mentor_theme', 'dark');
  });

  // 1. Visit Home in dark mode
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'dark_home_career.png'), fullPage: true });

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
  await page.screenshot({ path: path.join(artifactDir, 'dark_home_routine.png'), fullPage: true });

  // 2. Visit Progress in dark mode
  await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'dark_progress_career.png'), fullPage: true });

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
  await page.screenshot({ path: path.join(artifactDir, 'dark_progress_personal.png'), fullPage: true });

  // 3. Visit Upload / Roadmaps in dark mode
  await page.goto('http://localhost:5173/upload', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'dark_upload_roadmaps.png'), fullPage: true });

  await browser.close();
  console.log('Dark mode captures completed.');
}

run().catch(console.error);
