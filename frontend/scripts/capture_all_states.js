import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'c:/Users/rajav/Documents/projects/mentor-os/frontend/screenshots';
fs.mkdirSync(outDir, { recursive: true });

const screens = [
  { name: 'home', path: '/' },
  { name: 'upload', path: '/upload' },
  { name: 'calendar', path: '/calendar' },
  { name: 'progress', path: '/progress' },
  { name: 'mentor', path: '/mentor' },
  { name: 'profile', path: '/profile' },
];

async function captureState(screen, state, viewport) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: viewport.width, height: viewport.height });

  // Enable request interception for state manipulation
  await page.setRequestInterception(true);

  page.on('request', (req) => {
    const url = req.url();

    if (state === 'error') {
      if (url.includes('/api/dashboard') || url.includes('/api/mentor/chat')) {
        req.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database connection refused: mentor service unavailable' }),
        });
        return;
      }
    } else if (state === 'empty') {
      if (url.includes('/api/dashboard')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 'usr_empty', name: '', timezone: 'Local Time' },
            goal: null,
            todayMission: null,
            todayTasks: [],
            criticalDeadlines: [],
            currentDay: 1,
            totalDays: 30,
            streak: { current: 0, best: 0 },
            score: null,
            activeReminders: [],
          }),
        });
        return;
      } else if (url.includes('/api/mentor/chat')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }
    }

    req.continue();
  });

  const targetUrl = `http://localhost:5173${screen.path}`;
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  // Wait for state to settle
  await new Promise((r) => setTimeout(r, 1200));

  const fileName = `${screen.name}_${state}_${viewport.name}.png`;
  const filePath = path.join(outDir, fileName);
  await page.screenshot({ path: filePath });
  await browser.close();
  console.log(`Captured: ${fileName}`);
}

async function run() {
  console.log('Starting full visual audit suite...');
  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  for (const screen of screens) {
    for (const vp of viewports) {
      // 1. Populated normal state
      await captureState(screen, 'normal', vp);

      // 2. Empty state
      await captureState(screen, 'empty', vp);

      // 3. Error state
      await captureState(screen, 'error', vp);
    }
  }

  console.log('\nAll visual audit captures complete!');
}

run().catch(console.error);
