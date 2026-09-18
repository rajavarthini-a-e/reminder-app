import puppeteer from 'puppeteer-core';
import path from 'path';

const artifactDir = 'C:\\Users\\rajav\\.gemini\\antigravity\\brain\\cd90e3ef-4314-4fad-8886-b432a8a115f4';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  // 1. Visit Login & set user + clear old cache
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
    localStorage.setItem('mentor_sound_muted', 'false'); // Sound ON
    localStorage.removeItem('mentor_personal_routines_v1'); // Reset so default routines re-initialize with new intervals
  });

  // 2. Visit Progress screen in Personal Mode
  await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  // Ensure Personal tab is selected
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Personal')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 800));
      break;
    }
  }

  // Screenshot 1: Routine list showing "Every 30 mins" on Drink Water and "Once a day" on Hair oil & Stretch
  await page.screenshot({ path: path.join(artifactDir, 'personal_routines_frequency_badges.png'), fullPage: true });
  console.log('Saved: personal_routines_frequency_badges.png');

  // 3. Click "Test 30m Water Alert" with Sound ON
  const testButtons = await page.$$('button');
  for (const b of testButtons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Test 30m Water Alert')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 1000));
      break;
    }
  }

  // Screenshot 2: In-app popup with sound alert active
  await page.screenshot({ path: path.join(artifactDir, 'personal_routine_popup_sound_on.png'), fullPage: true });
  console.log('Saved: personal_routine_popup_sound_on.png');

  // Dismiss popup by clicking Snooze 5m or X
  const dismissBtn = await page.$('button[aria-label="Dismiss notification"]');
  if (dismissBtn) {
    await dismissBtn.click();
    await new Promise((r) => setTimeout(r, 500));
  }

  // 4. Mute sound and test "Test 30m Water Alert" with Sound MUTED
  await page.evaluate(() => {
    localStorage.setItem('mentor_sound_muted', 'true');
    window.location.reload();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Trigger test reminder again (now sound is muted)
  const testButtons2 = await page.$$('button');
  for (const b of testButtons2) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Test 30m Water Alert')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 1000));
      break;
    }
  }

  // Screenshot 3: In-app popup with sound MUTED (pop-up alone)
  await page.screenshot({ path: path.join(artifactDir, 'personal_routine_popup_sound_muted.png'), fullPage: true });
  console.log('Saved: personal_routine_popup_sound_muted.png');

  // 5. Open Edit Routine modal for Drink water
  const editButtons = await page.$$('button[aria-label*="Edit"]');
  if (editButtons.length > 0) {
    await editButtons[0].click();
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, 'personal_edit_routine_modal.png'), fullPage: true });
    console.log('Saved: personal_edit_routine_modal.png');
  }

  // Close modal
  const closeBtn = await page.$('button[aria-label="Close modal"]');
  if (closeBtn) {
    await closeBtn.click();
    await new Promise((r) => setTimeout(r, 500));
  }

  // 6. Dark mode capture of the routine view with popup
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'dark_personal_routines_reminders.png'), fullPage: true });
  console.log('Saved: dark_personal_routines_reminders.png');

  await browser.close();
  console.log('All routine reminder captures completed successfully!');
}

run().catch(console.error);
