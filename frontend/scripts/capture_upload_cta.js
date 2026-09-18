import puppeteer from 'puppeteer-core';
import path from 'path';

const mockExtractedPlan = {
  goal: 'Full-Stack Data Engineering Mastery',
  duration: 60,
  rawSummary: 'A 60-day deep dive covering data warehousing, ETL pipelines, and streaming architectures.',
  milestones: [
    {
      title: 'Phase 1: Dimensional Modeling & SQL Warehousing',
      tasks: [
        { id: 't1', title: 'Star Schema vs Snowflake Data Warehousing Reading', estimatedMinutes: 30 },
        { id: 't2', title: 'dbt Core Models and Jinja Macros Implementation', estimatedMinutes: 45 }
      ]
    },
    {
      title: 'Phase 2: Distributed Data Pipelines with Apache Spark',
      tasks: [
        { id: 't4', title: 'PySpark RDDs vs DataFrames Optimizations', estimatedMinutes: 45 }
      ]
    }
  ]
};

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

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

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tabBtn = buttons.find(b => b.textContent && b.textContent.includes('Paste Plan Text'));
    if (tabBtn) tabBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  await page.type('textarea', 'Day 1 to 60 Full Stack Data Engineering Roadmap with SQL and Spark');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitBtn = buttons.find(b => b.textContent && b.textContent.includes('Parse & Generate Roadmap'));
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll down to show Mascot question and Build button
  await page.evaluate(() => {
    window.scrollBy(0, 320);
  });
  await new Promise(r => setTimeout(r, 300));

  const outPath = path.resolve('screenshots', 'upload_parsed_mobile_cta.png');
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('Captured upload_parsed_mobile_cta.png');
}

capture().catch(console.error);
