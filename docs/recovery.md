# Static deployment and recovery checks

Leave `VITE_API_URL` unset in Vercel until the Express server is deployed. The
entire portfolio uses the resume-based seed content exported by
`client/src/data/index.js`; the server shares the same source. Existing clip
cards still accurately say “Clip coming soon” because no recordings were supplied.
Contact offers copy-email and mailto actions while the form is offline.

To enable the backend later, set `VITE_API_URL` to its origin and rebuild. The
client reads `/api/projects`, `/api/clips`, `/api/journey`, and `/api/skills`.
Every read checks HTTP status, JSON content type, parsing, and response shape,
including nested lists. It aborts after four seconds and warns once per endpoint
on failure. A failed write displays an error instead of a delivered message.

Both Vercel configurations exclude `/api/` from SPA rewrites. The root config
retains the monorepo build/output settings. Share tags use the production URL
and the existing 1200×630 `/og-image.png`.

## Reproduce

```powershell
npm ci
npm run build
npm run lint
npm run test:api
# In a second terminal, from client/:
npx vite preview --host 127.0.0.1 --port 4173 --strictPort
# From the root:
npm run test:recovery
```

For the failure matrix, build a separate production bundle with the API enabled:

```powershell
cd client
$env:VITE_API_URL='http://127.0.0.1:4174'
npx vite build --outDir dist-qa
Remove-Item Env:VITE_API_URL
npx vite preview --host 127.0.0.1 --port 4174 --outDir dist-qa --strictPort
# In another terminal, from the root:
$env:QA_URL='http://127.0.0.1:4174'
$env:QA_LABEL='failure-modes'
$env:QA_MODES='unreachable,html,server,malformed,shape,timeout'
npm run test:recovery
```

The Playwright checks use installed Chrome, real wheel scrolling, 1280×800 and
390×844 viewports, and assertions for every section's visible content, bundled
mission/clip/skill/journey counts, contact behavior, and page/console errors.
Both requested screenshots and full console transcripts are saved under
`artifacts/recovery/<label>/` (ignored by Git).

Deliberately refused connections and HTTP 500 responses cause Chrome's native
“Failed to load resource” diagnostics. Those are retained in the report; the
test separately requires zero application console errors and zero uncaught
JavaScript errors. Static and live checks require a completely error-free console
and zero API requests. No errors are suppressed or hidden.

For the live check, use `QA_URL=https://portfolio-websitekaran.vercel.app`,
`QA_MODES=static`, and `QA_LABEL=live` with the same script.
