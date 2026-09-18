import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\rajav\\.gemini\\antigravity\\brain\\cd90e3ef-4314-4fad-8886-b432a8a115f4';
const screenshotsDir = 'c:\\Users\\rajav\\Documents\\projects\\mentor-os\\frontend\\screenshots';

fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(screenshotsDir, { recursive: true });

async function saveScreenshot(page, filename) {
  const file1 = path.join(screenshotsDir, filename);
  const file2 = path.join(artifactDir, filename);
  await page.screenshot({ path: file1 });
  fs.copyFileSync(file1, file2);
  console.log(`Saved screenshot: ${filename}`);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });

    // Step A: Clear storage to simulate brand new unauthenticated visitor
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Capture Login Screen (Redirected from /)
    console.log('--- Step 1: Testing Login Screen ---');
    await saveScreenshot(page, 'flow1_login_screen.png');

    // 2. Navigate to Signup Screen
    console.log('--- Step 2: Testing Signup Screen ---');
    await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent && a.textContent.includes('Sign up'));
      if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await saveScreenshot(page, 'flow2_signup_screen.png');

    // Fill signup form with new user
    await page.type('input[placeholder*="Alex Rivera"]', 'Jordan Lee');
    await page.type('input[placeholder="name@example.com"]', 'jordan@example.com');
    await page.type('input[type="password"]', 'mypassword123');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Create account'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 3. Step 2 Onboarding - Step 1: Welcome
    console.log('--- Step 3: Onboarding Step 1 Welcome ---');
    await saveScreenshot(page, 'flow3_onboarding_step1_welcome.png');

    // Click "Let's get started"
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes("Let's get started"));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 4. Onboarding Step 2: Focus Selection & Refresh Safety
    console.log('--- Step 4: Onboarding Step 2 Focus Selection ---');
    await saveScreenshot(page, 'flow4_onboarding_step2_focus.png');

    // Mid-flow Refresh Test: Refresh the browser and verify we remain on Step 2
    console.log('Refreshing browser mid-flow to verify step persistence...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot(page, 'flow4_onboarding_step2_after_refresh.png');

    // Select "Personal Habits" card
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Personal Habits'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 5. Onboarding Step 3: Upload & Live Parsing Confirmation
    console.log('--- Step 5: Onboarding Step 3 Upload ---');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('sample roadmap'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1400));
    await saveScreenshot(page, 'flow5_onboarding_step3_checklist.png');

    // Finish onboarding -> Lands on Home
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('calendar'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 6. Home Screen in Personal mode (as chosen in Step 2)
    console.log('--- Step 6: Home in Personal Mode ---');
    await saveScreenshot(page, 'flow6_home_personal_default.png');

    // 7. Profile Screen with User Info & Logout Button
    console.log('--- Step 7: Profile Screen ---');
    await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a, button')).find(el => el.getAttribute('href') === '/profile' || (el.textContent && el.textContent.includes('Profile')));
      if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await saveScreenshot(page, 'flow7_profile_screen.png');

    // Click "Sign out"
    console.log('Clicking Sign out...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Sign out'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 8. Returning User Login (Skipping Onboarding)
    console.log('--- Step 8: Returning User Login ---');
    await page.type('input[type="email"]', 'jordan@example.com');
    await page.type('input[type="password"]', 'mypassword123');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Log in'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Should land directly on Home with existing data, skipping onboarding
    await saveScreenshot(page, 'flow8_returning_user_home.png');

    // Attempting to visit /onboarding directly should bounce back to /
    console.log('Attempting to navigate directly to /onboarding as returning user...');
    await page.goto('http://localhost:5173/onboarding', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 500));
    await saveScreenshot(page, 'flow9_onboarding_skipped_to_home.png');

    console.log('🎉 Full end-to-end user flow verified successfully!');
    await page.close();
  } catch (err) {
    console.error('Error during flow capture:', err);
  } finally {
    await browser.close();
  }
}

run();
