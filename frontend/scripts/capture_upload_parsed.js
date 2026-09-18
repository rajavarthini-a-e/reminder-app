import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const mockExtractedPlan = {
  goal: 'Full-Stack Data Engineering Mastery',
  duration: 60,
  rawSummary: 'A 60-day deep dive covering data warehousing, ETL pipelines, and streaming architectures.',
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
    }
  ]
};

async function captureUploadParsed(viewport, outFileName) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(viewport);

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('/api/upload-plan')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockExtractedPlan })
      });
      return;
    }
    req.continue();
  });

  await page.goto('http://localhost:5173/upload', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  // Click on 'Paste Plan Text' tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tabBtn = buttons.find(b => b.textContent && b.textContent.includes('Paste Plan Text'));
    if (tabBtn) tabBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Type in textarea and click 'Parse & Generate Roadmap'
  await page.type('textarea', 'Day 1 to 60 Full Stack Data Engineering Roadmap with SQL and Spark');
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitBtn = buttons.find(b => b.textContent && b.textContent.includes('Parse & Generate Roadmap'));
    if (submitBtn) submitBtn.click();
  });

  // Wait for parsing and preview to render
  await new Promise(r => setTimeout(r, 1800));

  const outPath = path.resolve('screenshots', outFileName);
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('Captured: ' + outFileName);
}

async function run() {
  await captureUploadParsed({ width: 1280, height: 850 }, 'upload_parsed_desktop.png');
  await captureUploadParsed({ width: 390, height: 844 }, 'upload_parsed_mobile.png');
}

run().catch(console.error);
