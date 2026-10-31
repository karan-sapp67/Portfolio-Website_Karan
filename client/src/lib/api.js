// Fetch helper + hook. In dev Vite proxies /api to the Express server; in production set
// VITE_API_URL to the deployed API origin. Every read has a bundled fallback (shared seed data),
// so the site never renders empty if the API is down.
import { useEffect, useState } from 'react';

const BASE = import.meta.env.VITE_API_URL || '';

export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status, data });
  return data;
}

/** Returns { data, live } — `data` starts as the fallback and is replaced by the API response. */
export function useApi(path, fallback) {
  const [state, setState] = useState({ data: fallback, live: false });
  useEffect(() => {
    let alive = true;
    api(path)
      .then((data) => alive && setState({ data, live: true }))
      .catch((err) => console.info(`[api] ${path} unavailable, using bundled content.`, err.message));
    return () => { alive = false; };
  }, [path]);
  return state;
}
