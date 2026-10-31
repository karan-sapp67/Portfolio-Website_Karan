import { useEffect, useState } from 'react';

const BASE = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
export const apiEnabled = Boolean(BASE);
const warned = new Set();

// The bundled content describes the response contract, including nested lists.
function validShape(value, example) {
  if (Array.isArray(example)) {
    return Array.isArray(value) && value.every((item) => !example.length || validShape(item, example[0]));
  }
  if (example && typeof example === 'object') {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      && Object.entries(example).every(([key, sample]) => validShape(value[key], sample));
  }
  return typeof value === typeof example;
}

async function request(path, opts = {}) {
  if (!apiEnabled) throw new Error('API is not configured');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${BASE}/api${path}`, {
      ...opts,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...opts.headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      throw new Error('Expected application/json');
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/** Reads never throw; a static deployment makes no API requests. */
export async function fetchJson(path, fallback) {
  if (!apiEnabled) return fallback;
  try {
    const data = await request(path);
    if (!validShape(data, fallback)) throw new Error('Unexpected response shape');
    return data;
  } catch (err) {
    if (!warned.has(path)) {
      warned.add(path);
      console.warn(`[api] ${path} unavailable; using bundled content.`, err.message);
    }
    return fallback;
  }
}

// Writes report failure so the contact form never pretends to send a message.
export const api = request;

export function useApi(path, fallback) {
  const [data, setData] = useState(fallback);
  useEffect(() => {
    let alive = true;
    fetchJson(path, fallback).then((next) => { if (alive) setData(next); });
    return () => { alive = false; };
  }, [path, fallback]);
  return { data, live: apiEnabled && data !== fallback };
}
