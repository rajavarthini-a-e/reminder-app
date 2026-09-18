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

  // Login session & seed realistic completion data for personal routines
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

    const routinesKey = 'mentor_personal_routines_v1';
    const routines = [
      {
        id: 'routine-water',
        name: 'Drink water',
        icon: '💧',
        repeatDays: ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
        reminderTime: '8:00 AM',
        completions: {
          '2026-09-14': true,
          '2026-09-15': true,
          '2026-09-16': true,
          '2026-09-17': true,
          '2026-09-18': true,
        },
        streak: 5,
        createdAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'routine-hair-oil',
        name: 'Hair oil',
        icon: '🧴',
        repeatDays: ['T', 'F'],
        reminderTime: '9:00 PM',
        completions: {
          '2026-09-15': true,
          '2026-09-18': true,
        },
        streak: 2,
        createdAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'routine-stretch',
        name: 'Morning stretch',
        icon: '🧘',
        repeatDays: ['M', 'W', 'F'],
        reminderTime: '7:30 AM',
        completions: {
          '2026-09-14': true,
          '2026-09-16': true,
        },
        streak: 2,
        createdAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'routine-reading',
        name: 'Bedtime reading',
        icon: '📖',
        repeatDays: ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
        reminderTime: '10:00 PM',
        completions: {
          '2026-09-14': true,
          '2026-09-15': true,
          '2026-09-16': true,
          '2026-09-17': true,
        },
        streak: 4,
        createdAt: '2026-09-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem(routinesKey, JSON.stringify(routines));
  });
  await new Promise((r) => setTimeout(r, 400));

  // 1. Visit Progress Screen - Career Analytics View
  await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'career_analytics_user_friendly.png'), fullPage: true });
  console.log('Saved: career_analytics_user_friendly.png');

  // 2. Switch to Personal Analytics (Routine Consistency tab)
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Routine Consistency')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 1000));
      break;
    }
  }
  await page.screenshot({ path: path.join(artifactDir, 'personal_analytics_routine_water.png'), fullPage: true });
  console.log('Saved: personal_analytics_routine_water.png');

  // 3. Switch to another task in the carousel ("Hair oil")
  const taskPills = await page.$$('button');
  for (const p of taskPills) {
    const text = await page.evaluate((el) => el.textContent, p);
    if (text && text.includes('Hair oil')) {
      await p.click();
      await new Promise((r) => setTimeout(r, 800));
      break;
    }
  }
  await page.screenshot({ path: path.join(artifactDir, 'personal_analytics_second_task.png'), fullPage: true });
  console.log('Saved: personal_analytics_second_task.png');

  // 4. Desktop Viewport (1280px)
  await page.setViewport({ width: 1280, height: 950 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'desktop_personal_analytics.png'), fullPage: true });
  console.log('Saved: desktop_personal_analytics.png');

  // Switch back to Career on desktop
  const desktopButtons = await page.$$('button');
  for (const b of desktopButtons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Career Growth')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 800));
      break;
    }
  }
  await page.screenshot({ path: path.join(artifactDir, 'desktop_career_analytics.png'), fullPage: true });
  console.log('Saved: desktop_career_analytics.png');

  await browser.close();
  console.log('All captures completed.');
}

run().catch(console.error);
