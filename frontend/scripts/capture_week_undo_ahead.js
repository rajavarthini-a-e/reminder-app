import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\rajav\\.gemini\\antigravity\\brain\\cd90e3ef-4314-4fad-8886-b432a8a115f4';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915 }); // Mobile viewport for crisp view

  // Login first
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

  // 1. Visit Calendar Screen
  await page.goto('http://localhost:5173/calendar', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));

  // Capture default week view
  await page.screenshot({ path: path.join(artifactDir, 'calendar_initial_week.png') });
  console.log('Saved: calendar_initial_week.png');

  // Click "Next Week" button to navigate past the 20th!
  const nextWeekBtn = await page.$('button[title="Next 7 Days"]');
  if (nextWeekBtn) {
    await nextWeekBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'calendar_navigated_past_20.png') });
    console.log('Saved: calendar_navigated_past_20.png');
  }

  // Click "Month" view toggle button
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.trim() === 'Month') {
      await b.click();
      await new Promise((r) => setTimeout(r, 1000));
      break;
    }
  }
  await page.screenshot({ path: path.join(artifactDir, 'calendar_month_grid_view.png') });
  console.log('Saved: calendar_month_grid_view.png');

  // 2. Visit Home Screen
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));

  // Capture Home with Work Ahead section
  await page.screenshot({ path: path.join(artifactDir, 'home_work_ahead_view.png') });
  console.log('Saved: home_work_ahead_view.png');

  // Test Ticking an upcoming task to work ahead (completing Day 2/3 topics today)
  const checkButtons = await page.$$('button[title*="Mark this upcoming topic complete today"]');
  if (checkButtons.length > 0) {
    console.log(`Found ${checkButtons.length} upcoming topics to work ahead. Clicking first one...`);
    await checkButtons[0].click();
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(artifactDir, 'home_ticked_ahead_of_schedule.png') });
    console.log('Saved: home_ticked_ahead_of_schedule.png');

    // Test UNDO: Find the completed tick and click it to undo
    const undoButton = await page.$('button[title*="Topic completed — Click to undo tick"]');
    if (undoButton) {
      console.log('Found undo button. Clicking to undo tick...');
      await undoButton.click();
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(artifactDir, 'home_tick_undone.png') });
      console.log('Saved: home_tick_undone.png');
    }
  }

  await browser.close();
  console.log('All captures done.');
}

run().catch(console.error);
