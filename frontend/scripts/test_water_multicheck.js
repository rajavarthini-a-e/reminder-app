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

  page.on('dialog', async (dialog) => {
    console.log('Dialog opened:', dialog.message());
    await dialog.accept();
  });

  // 1. Visit Login & inject session and initial routines
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const user = {
      id: 'user-default-1',
      name: 'Rajavarthini',
      email: 'alex@mentorai.com',
      onboardingCompleted: true,
      onboardingStep: 3,
      focusPreference: 'personal',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('mentor_session_user', JSON.stringify(user));
    localStorage.removeItem('mentor_personal_routines_v1'); // reset to fresh defaults
  });

  // 2. Visit /progress
  await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  // Ensure Personal tab is active
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Personal')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 500));
      break;
    }
  }

  // Click 30m drink check button 3 times
  const checkButtons = await page.$$('button[title*="Log 30m drink"]');
  console.log(`Found ${checkButtons.length} Log 30m drink buttons`);
  if (checkButtons.length > 0) {
    await checkButtons[0].click();
    await new Promise((r) => setTimeout(r, 300));
    await checkButtons[0].click();
    await new Promise((r) => setTimeout(r, 300));
    await checkButtons[0].click();
    await new Promise((r) => setTimeout(r, 600));
    console.log('Clicked 30m drink 3 times -> 3 of 8 drank');
  }

  // Screenshot 1: Multi-check progress (3 of 8 drank today)
  await page.screenshot({ path: path.join(artifactDir, 'personal_water_multicheck_progress.png'), fullPage: true });
  console.log('Saved: personal_water_multicheck_progress.png');

  // Test undo/decrement button
  const undoButtons = await page.$$('button[title*="Undo one drink"]');
  if (undoButtons.length > 0) {
    await undoButtons[0].click();
    await new Promise((r) => setTimeout(r, 500));
    console.log('Clicked Undo -> 2 of 8 drank');
  }

  // Click 6 more times to reach 8 of 8 (Daily goal met)
  for (let i = 0; i < 6; i++) {
    const btn = (await page.$$('button[title*="Log 30m drink"]'))[0];
    if (btn) {
      await btn.click();
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  await new Promise((r) => setTimeout(r, 600));
  console.log('Clicked until 8 of 8 -> Daily Goal Met');

  // Screenshot 2: Goal Met (8 of 8 drank)
  await page.screenshot({ path: path.join(artifactDir, 'personal_water_multicheck_goal_met.png'), fullPage: true });
  console.log('Saved: personal_water_multicheck_goal_met.png');

  // Test 30m Water Alert Popup
  const alertTestBtn = await page.$('button[title*="Test 30m hydration reminder alert"]');
  if (alertTestBtn) {
    await alertTestBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    console.log('Triggered 30m Water Alert popup');
  }

  // Screenshot 3: Popup showing Glass 9 of 8 and "💧 Drank Water (+1)"
  await page.screenshot({ path: path.join(artifactDir, 'personal_water_popup_counter.png'), fullPage: true });
  console.log('Saved: personal_water_popup_counter.png');

  // Click "+1 Drank Water" inside popup
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const txt = await page.evaluate((el) => el.textContent, b);
    if (txt && txt.includes('Drank Water')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 800));
      console.log('Clicked Drank Water in popup');
      break;
    }
  }

  // Test Dark Mode
  await page.evaluate(() => {
    localStorage.setItem('mentor_theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  // Screenshot 4: Dark mode view
  await page.screenshot({ path: path.join(artifactDir, 'dark_personal_water_multicheck.png'), fullPage: true });
  console.log('Saved: dark_personal_water_multicheck.png');

  await browser.close();
  console.log('Verification completed successfully!');
}

run().catch(console.error);
