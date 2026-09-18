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

  // 1. Visit Login & Clear all old roadmaps from localStorage
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
    // Clear all roadmaps from localStorage to start fresh
    localStorage.setItem('mentor_roadmaps_library_v1', '[]');
  });

  // 2. Visit Home (/) in dark mode (Expect clean fresh empty state for Career Analytics)
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'dark_home_fresh_career.png'), fullPage: true });
  console.log('Saved: dark_home_fresh_career.png');

  // Switch to Routine Consistency on Home in dark mode
  const buttonsHome = await page.$$('button');
  for (const b of buttonsHome) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Routine Consistency')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 1000));
      break;
    }
  }
  await page.screenshot({ path: path.join(artifactDir, 'dark_home_routine_refined.png'), fullPage: true });
  console.log('Saved: dark_home_routine_refined.png');

  // 3. Visit Progress (/progress) in dark mode (Expect clean fresh empty state for Career Plan)
  await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'dark_progress_fresh_career.png'), fullPage: true });
  console.log('Saved: dark_progress_fresh_career.png');

  // Switch to Personal on Progress in dark mode (Refined cohesive dark mode)
  const buttonsProg = await page.$$('button');
  for (const b of buttonsProg) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Personal')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 1000));
      break;
    }
  }
  await page.screenshot({ path: path.join(artifactDir, 'dark_progress_personal_refined.png'), fullPage: true });
  console.log('Saved: dark_progress_personal_refined.png');

  // 4. Visit My Roadmaps (/library) in dark mode (Confirm 0 roadmaps on shelf)
  await page.goto('http://localhost:5173/library', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'dark_library_fresh_empty.png'), fullPage: true });
  console.log('Saved: dark_library_fresh_empty.png');

  // 5. Mobile viewports (412px) for Home and Progress
  await page.setViewport({ width: 412, height: 950 });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'dark_mobile_home_fresh.png'), fullPage: true });
  console.log('Saved: dark_mobile_home_fresh.png');

  await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'dark_mobile_progress_fresh.png'), fullPage: true });
  console.log('Saved: dark_mobile_progress_fresh.png');

  await browser.close();
  console.log('All fresh dark captures complete!');
}

run().catch(console.error);
