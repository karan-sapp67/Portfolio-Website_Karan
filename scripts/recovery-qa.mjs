// Run against the production preview or live site. API failure cases require a
// build with VITE_API_URL set to the preview origin, so requests really occur.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const modes = (process.env.QA_MODES || 'static').split(',');
const out = `artifacts/recovery/${process.env.QA_LABEL || 'local'}`;
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const mode of modes) for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [], errors = [], warnings = [], logs = [], requests = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      logs.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });
    page.on('request', (req) => { if (new URL(req.url()).pathname.startsWith('/api/')) requests.push(req.url()); });
    if (mode !== 'static') {
      await page.route('**/api/**', async (route) => {
        if (mode === 'unreachable') return route.abort('connectionrefused');
        if (mode === 'timeout') { await new Promise((r) => setTimeout(r, 5000)); return route.abort(); }
        const cases = {
          html: { status: 200, contentType: 'text/html', body: '<!doctype html><html>SPA fallback</html>' },
          server: { status: 500, contentType: 'application/json', body: '{"error":"Unavailable"}' },
          malformed: { status: 200, contentType: 'application/json', body: '{invalid' },
          shape: { status: 200, contentType: 'application/json', body: '{}' },
        };
        assert.ok(cases[mode], `Unknown mode ${mode}`);
        return route.fulfill(cases[mode]);
      });
    }
    try {
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.locator('.loader').waitFor({ state: 'detached' });
      // Allow every response (including the four-second timeout) to settle.
      await page.waitForTimeout(mode === 'timeout' ? 4600 : 800);
      await page.locator('#projects').waitFor({ state: 'attached' });
      assert.equal(await page.locator('.section-offline').count(), 0);
      assert.equal(await page.locator('#projects .mission').count(), 9);
      assert.equal(await page.locator('#hideout .clip-card').count(), 8);
      assert.ok(await page.locator('#journey .quest').count() >= 6);
      assert.ok(await page.locator('#status .skill-opt').count() >= 20);
      assert.equal(await page.locator('#contact a[href^="mailto:"]').count() > 0, true);
      assert.equal(await page.getByRole('button', { name: /Copy email/ }).count(), 1);
      assert.equal(await page.locator('#contact form').count(), mode === 'static' ? 0 : 1);
      if (mode === 'static') assert.equal(requests.length, 0, 'Static deployment must not request an API');
      else {
        for (const path of ['projects', 'clips', 'journey', 'skills']) {
          assert.ok(requests.some((url) => url.endsWith(`/api/${path}`)), `${path} API was exercised`);
          assert.equal(warnings.filter((w) => w.startsWith(`[api] /${path} `)).length, 1, `${path} warns once`);
        }
      }
      // Real wheel input traverses the pinned intro, every mission, and the footer.
      const visited = new Set();
      let firstShot = false, missionShot = false;
      for (let step = 0; step < 140; step++) {
        const visible = await page.evaluate(() => {
          const inView = (el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
          return [...document.querySelectorAll('main section[id]')].filter(inView).map((el) => ({
            id: el.id, text: el.innerText.trim().length,
            content: [...el.querySelectorAll('h2,h3,p,li')].some((child) => inView(child) && getComputedStyle(child).visibility !== 'hidden' && Number(getComputedStyle(child).opacity) > 0 && child.innerText.trim().length > 0),
          }));
        });
        for (const item of visible) if (item.text > 20 && item.content) visited.add(item.id);
        const projectTop = await page.locator('#projects').evaluate((el) => el.getBoundingClientRect().top);
        if (!firstShot && projectTop <= 80) {
          await page.waitForTimeout(900);
          await page.locator('#projects').evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }));
          await page.waitForTimeout(900);
          await page.screenshot({ path: `${out}/${mode}-${viewport.width}-after-intro.png` });
          firstShot = true;
        }
        if (!missionShot && projectTop < -viewport.height * .4) {
          await page.waitForTimeout(1000);
          await page.locator('#projects .mission').first().evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' }));
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `${out}/${mode}-${viewport.width}-missions.png` });
          missionShot = true;
        }
        const bottom = await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 5);
        if (bottom) break;
        await page.mouse.wheel(0, viewport.height * .65);
        await page.waitForTimeout(150);
      }
      for (const id of ['top', 'projects', 'about', 'hideout', 'status', 'journey', 'contact']) assert.ok(visited.has(id), `${id} has visible content`);
      assert.ok(firstShot && missionShot, 'Both requested screenshots saved');
      assert.deepEqual(pageErrors, [], 'No uncaught JavaScript errors');
      // Chrome emits resource diagnostics for deliberate transport failures.
      // Preserve these in full; never suppress application console errors.
      const transportErrors = errors.filter((msg) => /^Failed to load resource:/.test(msg));
      const applicationErrors = errors.filter((msg) => !transportErrors.includes(msg));
      assert.deepEqual(applicationErrors, [], 'No application console errors');
      if (mode === 'static') assert.deepEqual(errors, [], 'Live/static console has zero errors');
      const result = { mode, viewport, passed: true, visited: [...visited], apiRequests: requests.length, pageErrors, consoleErrors: errors, warnings, console: logs };
      results.push(result);
      console.log(JSON.stringify(result));
    } catch (error) {
      await page.screenshot({ path: `${out}/${mode}-${viewport.width}-FAILED.png` });
      results.push({ mode, viewport, passed: false, error: error.message, pageErrors, errors, warnings, logs });
      throw error;
    } finally { await page.close(); }
  }
} finally {
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
