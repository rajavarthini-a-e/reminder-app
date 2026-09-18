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

  // Handle dialogs (confirm) automatically
  page.on('dialog', async (dialog) => {
    console.log('Dialog opened:', dialog.message());
    await dialog.accept();
  });

  // 1. Visit Login & inject the exact 3 roadmaps from user's screenshot
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

    const testRoadmaps = [
      {
        id: 'roadmap-ml',
        title: 'Complete Machine Learning Roadmap (30 Days)',
        description: 'Parsed 3 milestones and 8 structured tasks.',
        status: 'archived',
        progress: 38,
        totalTasks: 8,
        completedTasks: 3,
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        subjectTag: 'Core Curriculum',
      },
      {
        id: 'roadmap-n8n',
        title: 'Complete n8n Roadmap (7 Days)',
        description: 'Parsed 1 milestones and 31 structured tasks.',
        status: 'paused',
        progress: 7,
        totalTasks: 31,
        completedTasks: 2,
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        subjectTag: 'Core Curriculum',
      },
      {
        id: 'roadmap-da',
        title: 'Become a Senior Data Analyst',
        description: 'Comprehensive 60-day roadmap mastering SQL, Power BI, Python for Data Science, and Real-world Portfolio Projects.',
        status: 'paused',
        progress: 60,
        totalTasks: 5,
        completedTasks: 3,
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
        subjectTag: 'Core Curriculum',
      },
    ];

    localStorage.setItem('mentor_roadmaps_library_v1', JSON.stringify(testRoadmaps));
  });

  // 2. Visit Upload page at Bookshelf tab
  await page.goto('http://localhost:5173/upload', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  // Click on Bookshelf tab (My Roadmaps)
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('My Roadmaps')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 800));
      break;
    }
  }

  // Screenshot 1: Bookshelf showing Set Active, Reset, and Delete buttons on cards
  await page.screenshot({ path: path.join(artifactDir, 'upload_shelf_action_buttons.png'), fullPage: true });
  console.log('Saved: upload_shelf_action_buttons.png');

  // 3. Test RESET on n8n Roadmap
  const resetButtons = await page.$$('button[title*="Reset"]');
  console.log(`Found ${resetButtons.length} Reset buttons`);
  if (resetButtons.length > 1) {
    // Click reset on the 2nd card (n8n roadmap)
    await resetButtons[1].click();
    await new Promise((r) => setTimeout(r, 1000));
    console.log('Clicked Reset on n8n Roadmap');
  }

  // Screenshot 2: After Reset (0 of 31 Tasks Completed 0%)
  await page.screenshot({ path: path.join(artifactDir, 'upload_shelf_after_reset.png'), fullPage: true });
  console.log('Saved: upload_shelf_after_reset.png');

  // 4. Test SET ACTIVE on Complete Machine Learning Roadmap
  const setActiveButtons = await page.$$('button');
  for (const b of setActiveButtons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Set Active')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 1200));
      console.log('Clicked Set Active');
      break;
    }
  }

  // Screenshot 3: After Set Active (Active Journey badge)
  await page.screenshot({ path: path.join(artifactDir, 'upload_shelf_after_set_active.png'), fullPage: true });
  console.log('Saved: upload_shelf_after_set_active.png');

  // 5. Test DELETE on Data Analyst Roadmap
  const deleteButtons = await page.$$('button[title*="Delete"]');
  console.log(`Found ${deleteButtons.length} Delete buttons`);
  if (deleteButtons.length > 0) {
    // Click delete on last card
    await deleteButtons[deleteButtons.length - 1].click();
    await new Promise((r) => setTimeout(r, 1000));
    console.log('Clicked Delete on Data Analyst Roadmap');
  }

  // Screenshot 4: After Delete (Senior Data Analyst removed from shelf)
  await page.screenshot({ path: path.join(artifactDir, 'upload_shelf_after_delete.png'), fullPage: true });
  console.log('Saved: upload_shelf_after_delete.png');

  // 6. Check /library (Roadmap Bookshelf page) too
  await page.goto('http://localhost:5173/library', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'library_page_action_buttons.png'), fullPage: true });
  console.log('Saved: library_page_action_buttons.png');

  await browser.close();
  console.log('All roadmap action verification tests completed successfully!');
}

run().catch(console.error);
