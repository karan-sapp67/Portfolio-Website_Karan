import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { rmSync } from 'node:fs';

export default defineConfig({
  plugins: [
    react(),
    {
      // the unused 25 MB backup track stays out of deploys even if it sits in public/audio
      name: 'drop-bgm-extended',
      closeBundle() { rmSync(fileURLToPath(new URL('./dist/audio/bgm-extended.mp3', import.meta.url)), { force: true }); },
    },
  ],
  resolve: {
    // shared seed data lives at the repo root so the server and client use the same content
    alias: { '@shared': fileURLToPath(new URL('../shared', import.meta.url)) },
  },
  server: {
    fs: { allow: ['..'] },
    // in dev the API runs on :5000; in production set VITE_API_URL instead
    proxy: { '/api': 'http://localhost:5000' },
  },
});
