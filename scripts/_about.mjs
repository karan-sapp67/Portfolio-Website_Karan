import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [name, vp] of [['desktop', { width: 1280, height: 720 }], ['mobile', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const p = await b.newPage(); await p.setViewport(vp);
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:5174/?qa=about', { waitUntil: 'networkidle0' });
  await sleep(4500);
  const shot = (n) => p.screenshot({ path: `docs/qa/v11-about-${name}-${n}.png` });
  await sleep(1200); await shot('1');
  const click = async () => { await p.evaluate(() => document.querySelector('.dialogue-box').click()); await sleep(250); };
  await click(); await sleep(2200); await shot('2');   // line 2 typed
  await click(); await sleep(300);                      // skip typing on line 3
  await click(); await sleep(300); await click(); await sleep(300); await click(); await sleep(300); // finish 3, go 4, finish 4 ...
  for (let i = 0; i < 6; i++) { await click(); await sleep(200); }
  await sleep(1500); await shot('last');
  const st = await p.evaluate(() => ({ pips: document.querySelectorAll('.dialogue-pips li').length, on: [...document.querySelectorAll('.dialogue-pips li')].findIndex((l) => l.classList.contains('is-on')), choices: [...document.querySelectorAll('.dlg-choice')].map((c) => c.innerText.trim()), hl: document.querySelectorAll('.dlg-hl').length, hscroll: document.documentElement.scrollWidth > innerWidth }));
  console.log(name, JSON.stringify(st), JSON.stringify(errs));
  if (name === 'desktop') { // choice jumps to the missions
    await p.evaluate(() => document.querySelector('.dlg-choice').click()); await sleep(2000);
    console.log('after choice: projects top', await p.evaluate(() => Math.round(document.getElementById('projects').getBoundingClientRect().top)));
  }
  await p.close();
}
await b.close();
