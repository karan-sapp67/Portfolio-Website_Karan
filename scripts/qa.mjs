// Dev-only visual QA: drives the locally installed Chrome against the dev server and saves
// screenshots to docs/qa/. Usage: node scripts/qa.mjs name:WxH:qa[:waitMs] ...
// qa = p0.52 (intro progress) | <section id> | menu | f-INTERNSHIP (mission filter)
// QA_REDUCED=1 emulates prefers-reduced-motion. Page errors and console errors are printed.
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.QA_URL || 'http://localhost:5174/';
const shots = process.argv.slice(2).map((s) => {
  const [name, size, qa, wait = '3500'] = s.split(':');
  const [w, h] = size.split('x').map(Number);
  return { name, w, h, qa, wait: +wait };
});

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
  if (process.env.QA_REDUCED) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.on('pageerror', (e) => console.log(`  [${s.name}] page error: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && console.log(`  [${s.name}] console: ${m.text()}`));
  await page.goto(`${BASE}?qa=${encodeURIComponent(s.qa)}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, s.wait));
  await page.screenshot({ path: `docs/qa/${s.name}.png` });
  console.log(`docs/qa/${s.name}.png`);
  await page.close();
}
await browser.close();
