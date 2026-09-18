import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const outDir = 'c:/Users/rajav/Documents/projects/mentor-os/frontend/screenshots';
fs.mkdirSync(outDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // 1. Home Career (Desktop 1280px & Mobile 390px)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, 'home_career_desktop.png') });
    console.log('Captured: home_career_desktop.png');

    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, 'home_career_mobile.png') });
    console.log('Captured: home_career_mobile.png');

    await page.close();
  }

  // 2. Home Personal Mode (Desktop 1280px & Mobile 390px)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));

    // Click on Personal toggle button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const personalBtn = buttons.find((b) => b.textContent && b.textContent.includes('Personal'));
      if (personalBtn) personalBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, 'home_personal_desktop.png') });
    console.log('Captured: home_personal_desktop.png');

    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, 'home_personal_mobile.png') });
    console.log('Captured: home_personal_mobile.png');

    await page.close();
  }

  // 3. Milestone Knowledge Test Modal (Desktop 1280px & Mobile 390px)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));

    // Click "Start Check-in" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const checkinBtn = buttons.find((b) => b.textContent && b.textContent.includes('Start Check-in'));
      if (checkinBtn) checkinBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Type answer to trigger conversational feedback: "Use a LEFT JOIN on customers and orders"
    await page.type('textarea', 'Use a LEFT JOIN on customers and orders');
    await new Promise((r) => setTimeout(r, 200));

    // Click Check my answer
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const checkBtn = buttons.find((b) => b.textContent && b.textContent.includes('Check my answer'));
      if (checkBtn) checkBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    await page.screenshot({ path: path.join(outDir, 'milestone_test_modal_desktop.png') });
    console.log('Captured: milestone_test_modal_desktop.png');

    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, 'milestone_test_modal_mobile.png') });
    console.log('Captured: milestone_test_modal_mobile.png');

    await page.close();
  }

  // 4. Auto-Calendar Confirmation Screen (Upload Screen 3)
  {
    const mockPlan = {
      goal: 'Full-Stack Data Engineering Mastery',
      duration: 60,
      rawSummary: 'Curriculum covering dimensional modeling, distributed pipelines, and streaming.',
      milestones: [
        {
          title: 'Phase 1: Dimensional Modeling & SQL Warehousing',
          tasks: [
            { id: 't1', title: 'Star Schema vs Snowflake Data Warehousing Reading', estimatedMinutes: 30 },
            { id: 't2', title: 'dbt Core Models and Jinja Macros Implementation', estimatedMinutes: 45 },
            { id: 't3', title: 'PostgreSQL Indexing Deep-Dive', estimatedMinutes: 30 }
          ]
        },
        {
          title: 'Phase 2: Distributed Data Pipelines with Apache Spark',
          tasks: [
            { id: 't4', title: 'PySpark RDDs vs DataFrames Optimizations', estimatedMinutes: 45 },
            { id: 't5', title: 'Delta Lake ACID Transactions & Time Travel Lab', estimatedMinutes: 60 }
          ]
        },
        {
          title: 'Phase 3: Production Streaming & Orchestration',
          tasks: [
            { id: 't6', title: 'Kafka Topics & Partition Key Design', estimatedMinutes: 45 },
            { id: 't7', title: 'Airflow DAG Dynamic Task Mapping', estimatedMinutes: 60 }
          ]
        }
      ]
    };

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.url().includes('/api/upload-plan')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockPlan })
        });
        return;
      }
      if (req.url().includes('/api/goals/save-plan')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, goalId: 'goal-auto-123' })
        });
        return;
      }
      req.continue();
    });

    await page.goto('http://localhost:5173/upload', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 600));

    // Switch to Paste Plan Text
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tabBtn = buttons.find((b) => b.textContent && b.textContent.includes('Paste Plan Text'));
      if (tabBtn) tabBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    await page.type('textarea', 'Data Engineering Roadmap with SQL and Spark');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const parseBtn = buttons.find((b) => b.textContent && b.textContent.includes('Parse & Generate Roadmap'));
      if (parseBtn) parseBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Click "Build my daily plan"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buildBtn = buttons.find((b) => b.textContent && b.textContent.includes('Build my daily plan'));
      if (buildBtn) buildBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    await page.screenshot({ path: path.join(outDir, 'upload_autocalendar_confirmation.png') });
    console.log('Captured: upload_autocalendar_confirmation.png');

    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: path.join(outDir, 'upload_autocalendar_mobile.png') });
    console.log('Captured: upload_autocalendar_mobile.png');

    await page.close();
  }

  // 5. Calendar auto-populated (Desktop 1280px & Mobile 390px)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/calendar', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, 'calendar_autopopulated_desktop.png') });
    console.log('Captured: calendar_autopopulated_desktop.png');

    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, 'calendar_autopopulated_mobile.png') });
    console.log('Captured: calendar_autopopulated_mobile.png');

    await page.close();
  }

  // 6. Career Growth Progress Screen (Desktop 1280px & Mobile 390px)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/progress', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, 'progress_career_growth_desktop.png') });
    console.log('Captured: progress_career_growth_desktop.png');

    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, 'progress_career_growth_mobile.png') });
    console.log('Captured: progress_career_growth_mobile.png');

    await page.close();
  }

  await browser.close();
  console.log('\nAll new visual feature captures complete!');
}

capture().catch(console.error);
