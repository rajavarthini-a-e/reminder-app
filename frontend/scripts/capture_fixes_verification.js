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
    // 1. Onboarding Step 1: Welcome
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844 });
      await page.goto('http://localhost:5173/onboarding', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot(page, 'fix1_onboarding_welcome.png');

      // Click "Let's get started" -> Step 2
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const startBtn = btns.find(b => b.textContent && b.textContent.includes("Let's get started"));
        if (startBtn) startBtn.click();
      });
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot(page, 'fix1_onboarding_focus_2x2.png');

      // Click Career -> Step 3
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const careerBtn = btns.find(b => b.textContent && b.textContent.includes('Career & Study'));
        if (careerBtn) careerBtn.click();
      });
      await new Promise(r => setTimeout(r, 600));

      // Click "Or load sample roadmap" to show the confirmation checklist
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const sampleBtn = btns.find(b => b.textContent && b.textContent.includes('sample roadmap'));
        if (sampleBtn) sampleBtn.click();
      });
      // Wait for reading simulation (900ms) + buffer
      await new Promise(r => setTimeout(r, 1400));
      await saveScreenshot(page, 'fix1_onboarding_upload_checklist.png');

      await page.close();
    }

    // 2. Career Growth Garden Card (Confirming zero text clipping & dynamic height)
    {
      const page = await browser.newPage();
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('mentor_onboarding_completed', 'true');
      });
      await page.setViewport({ width: 390, height: 844 });
      await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 800));
      await saveScreenshot(page, 'fix2_career_garden_card_mobile.png');

      await page.setViewport({ width: 1280, height: 800 });
      await new Promise(r => setTimeout(r, 500));
      await saveScreenshot(page, 'fix2_career_garden_card_desktop.png');

      await page.close();
    }

    // 3. Personal Routines: Daily, Weekly, Monthly Views & Create Routine Modal
    {
      const page = await browser.newPage();
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('mentor_onboarding_completed', 'true');
      });
      await page.setViewport({ width: 390, height: 844 });
      await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 800));

      // Switch to Personal mode
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const personalBtn = btns.find(b => b.textContent && b.textContent.includes('Personal'));
        if (personalBtn) personalBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));
      await saveScreenshot(page, 'fix3_personal_routines_daily.png');

      // Click "Weekly"
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const weeklyBtn = btns.find(b => b.textContent && b.textContent.trim().toLowerCase() === 'weekly');
        if (weeklyBtn) weeklyBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));
      await saveScreenshot(page, 'fix3_personal_routines_weekly.png');

      // Click "Monthly"
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const monthlyBtn = btns.find(b => b.textContent && b.textContent.trim().toLowerCase() === 'monthly');
        if (monthlyBtn) monthlyBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));
      await saveScreenshot(page, 'fix3_personal_routines_monthly.png');

      // Click "+ Create new routine" button
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.textContent && b.textContent.includes('Create new routine'));
        if (addBtn) addBtn.click();
      });
      await new Promise(r => setTimeout(r, 600));
      await saveScreenshot(page, 'fix3_create_routine_modal_day_chips.png');

      await page.close();
    }

    // 4. Full App Desktop & Mobile Overview
    {
      const page = await browser.newPage();
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('mentor_onboarding_completed', 'true');
      });
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 800));
      await saveScreenshot(page, 'full_app_home_career_desktop.png');

      await page.setViewport({ width: 390, height: 844 });
      await new Promise(r => setTimeout(r, 500));
      await saveScreenshot(page, 'full_app_home_career_mobile.png');

      await page.close();
    }

    console.log('All verification screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

run();
