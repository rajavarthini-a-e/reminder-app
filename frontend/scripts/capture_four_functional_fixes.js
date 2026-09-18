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
    // 1. Bug 1: Onboarding Step 3 with Paste Plan Text Toggle
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844 });
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('mentor_session_user', JSON.stringify({
          id: 'user-new-1',
          name: 'Taylor',
          email: 'taylor@mentorai.com',
          onboardingCompleted: false,
          onboardingStep: 3,
          focusPreference: 'career',
          createdAt: new Date().toISOString()
        }));
        localStorage.setItem('mentor_onboarding_completed', 'false');
      });

      await page.goto('http://localhost:5173/onboarding', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 800));

      // Switch toggle to "Paste Plan Text"
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(btn => btn.textContent && btn.textContent.includes('Paste Plan Text'));
        if (b) b.click();
      });
      await new Promise(r => setTimeout(r, 500));

      // Type sample plan
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.type('# Full-Stack React & Node Roadmap\n## Phase 1: Core Fundamentals\n- Day 1: React Component Lifecycle\n- Day 2: Node.js Express REST APIs');
      }
      await new Promise(r => setTimeout(r, 500));
      await saveScreenshot(page, 'bug1_paste_plan_text_onboarding.png');

      await page.close();
    }

    // 2. Bug 2: Clean Home screen with no leaked sample data
    {
      const page = await browser.newPage();
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('mentor_session_user', JSON.stringify({
          id: 'user-default-1',
          name: 'Rajavarthini',
          email: 'alex@mentorai.com',
          onboardingCompleted: true,
          onboardingStep: 3,
          focusPreference: 'career',
          createdAt: new Date().toISOString()
        }));
        localStorage.setItem('mentor_onboarding_completed', 'true');
        localStorage.setItem('mentor_focus_preference', 'career');
        localStorage.setItem('mentor_domain_mode', 'career');
      });

      await page.setViewport({ width: 390, height: 844 });
      await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1200));

      // Ensure Career mode is selected
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const careerBtn = btns.find(btn => btn.textContent && btn.textContent.includes('Career'));
        if (careerBtn) careerBtn.click();
      });
      await new Promise(r => setTimeout(r, 600));

      await saveScreenshot(page, 'bug2_clean_home_no_sample_leakage.png');

      // 3. Bug 3: Verification evaluator - reject gibberish
      const verifyInput = await page.$('input[placeholder*="Type your answer"]');
      if (verifyInput) {
        await verifyInput.type('asdfghjkl zxcvbnm qwertyuiop');
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const b = btns.find(btn => btn.textContent && btn.textContent.includes('Submit verification'));
          if (b) b.click();
        });
        await new Promise(r => setTimeout(r, 1200));
        await saveScreenshot(page, 'bug3_verification_rejection_feedback.png');

        // Clear and type substantive correct answer
        await page.evaluate(() => {
          const inp = document.querySelector('input[placeholder*="Type your answer"]');
          if (inp) inp.value = '';
        });
        await verifyInput.type('A LEFT JOIN preserves and retains all rows from the left table with NULL in right columns where no match exists.');
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const b = btns.find(btn => btn.textContent && btn.textContent.includes('Submit verification'));
          if (b) b.click();
        });
        await new Promise(r => setTimeout(r, 1200));
        await saveScreenshot(page, 'bug3_verification_approved.png');
      }

      await page.close();
    }

    // 4. Bug 4: Mentor Chat answering technical question
    {
      const page = await browser.newPage();
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('mentor_session_user', JSON.stringify({
          id: 'user-default-1',
          name: 'Rajavarthini',
          email: 'alex@mentorai.com',
          onboardingCompleted: true,
          onboardingStep: 3,
          focusPreference: 'career',
          createdAt: new Date().toISOString()
        }));
        localStorage.setItem('mentor_onboarding_completed', 'true');
        localStorage.setItem('mentor_focus_preference', 'career');
      });

      await page.setViewport({ width: 390, height: 844 });
      await page.goto('http://localhost:5173/mentor', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1000));

      const chatInput = await page.$('input[placeholder*="Type a message to Momo"]');
      if (chatInput) {
        await chatInput.type('what is DAX?');
        await page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) form.requestSubmit();
        });
        await new Promise(r => setTimeout(r, 2200));
      }
      await saveScreenshot(page, 'bug4_mentor_chat_technical_answer.png');

      await page.close();
    }

    console.log('All bug verification screenshots saved!');
  } catch (err) {
    console.error('Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
}

run();
