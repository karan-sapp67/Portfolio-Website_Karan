import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projects, clips, journey, skills } from '../shared/seedData.js';

const source = (await readFile(new URL('../client/src/lib/api.js', import.meta.url), 'utf8'))
  .replace("import { useEffect, useState } from 'react';", '');
const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
const warnings = [];
console.warn = (...args) => warnings.push(args);
let id = 0;
async function load(env = {}) {
  const code = source.replace('import.meta.env', JSON.stringify(env));
  return import(`data:text/javascript,${encodeURIComponent(code)}#${id++}`);
}
try {
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('Must not fetch'); };
  for (const env of [{}, { VITE_API_URL: '' }, { VITE_API_URL: '  ' }]) {
    assert.equal(await (await load(env)).fetchJson('/projects', projects), projects);
  }
  assert.equal(calls, 0);
  const api = await load({ VITE_API_URL: 'https://api.example.test/' });
  for (const [path, fallback] of Object.entries({ projects, clips, journey, skills: { stats: skills.filter((s) => s.kind === 'stat'), items: skills.filter((s) => s.kind === 'skill') } })) {
    globalThis.fetch = async (url) => {
      assert.equal(url, `https://api.example.test/api/${path}`);
      return new Response(JSON.stringify(fallback), { headers: { 'content-type': 'application/json; charset=utf-8' } });
    };
    assert.deepEqual(await api.fetchJson(`/${path}`, fallback), fallback, `Valid ${path} accepted`);
  }
  const failures = [
    () => Promise.reject(new TypeError('Failed to fetch')),
    () => new Response('<html/>', { headers: { 'content-type': 'text/html' } }),
    () => new Response('{}', { status: 500, headers: { 'content-type': 'application/json' } }),
    () => new Response('{bad', { headers: { 'content-type': 'application/json' } }),
    () => new Response('{}', { headers: { 'content-type': 'application/json' } }),
    () => new Response('[null]', { headers: { 'content-type': 'application/json' } }),
  ];
  for (const failure of failures) {
    globalThis.fetch = failure;
    assert.equal(await api.fetchJson('/projects', projects), projects);
  }
  assert.equal(warnings.length, 1, 'Warn once per path across repeated failures');
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason)));
  const start = Date.now();
  assert.equal(await api.fetchJson('/timeout', projects), projects);
  assert.ok(Date.now() - start >= 3900 && Date.now() - start < 5000, 'Timeout is four seconds');
  console.log('PASS: no-API mode, four valid content endpoints, six failure cases, warn-once and four-second timeout');
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
}
