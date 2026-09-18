import puppeteer from 'puppeteer-core';
import path from 'path';

async function captureCalendarAgenda() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/calendar', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // Click Agenda view
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const agendaBtn = buttons.find(b => b.textContent && b.textContent.includes('Agenda'));
    if (agendaBtn) agendaBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Select day 16 in scrubber
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const day16 = buttons.find(b => b.textContent && b.textContent.trim().startsWith('16'));
    if (day16) day16.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const outPath = path.resolve('screenshots/calendar_agenda_mobile.png');
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('Captured calendar_agenda_mobile.png');
}

captureCalendarAgenda().catch(console.error);
