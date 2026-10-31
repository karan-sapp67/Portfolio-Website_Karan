// JWT-protected admin API: login, messages, and CRUD for projects, clips and journey.
import { Router } from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { MODELS } from '../models/index.js';
import { create, listMessages, remove, update } from '../store.js';

const router = Router();
const EDITABLE = ['projects', 'clips', 'journey'];

const configured = () => Boolean(process.env.ADMIN_PASSWORD && process.env.JWT_SECRET);
const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();

router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }), (req, res) => {
  if (!configured()) return res.status(503).json({ error: 'Admin is not configured (set ADMIN_PASSWORD and JWT_SECRET).' });
  const ok = crypto.timingSafeEqual(digest(req.body?.password ?? ''), digest(process.env.ADMIN_PASSWORD));
  if (!ok) return res.status(401).json({ error: 'Wrong password.' });
  res.json({ token: jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' }) });
});

// everything below requires a valid token
router.use((req, res, next) => {
  if (!configured()) return res.status(503).json({ error: 'Admin is not configured.' });
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Not authorised.' });
  }
});

router.get('/messages', async (_req, res) => res.json(await listMessages()));

// only accept fields that exist on the model
function pick(kind, body) {
  const allowed = Object.keys(MODELS[kind].schema.paths).filter((p) => !p.startsWith('_') && !['createdAt', 'updatedAt'].includes(p));
  return Object.fromEntries(Object.entries(body || {}).filter(([k]) => allowed.includes(k.split('.')[0])));
}

router.param('kind', (req, res, next, kind) => (EDITABLE.includes(kind) ? next() : res.status(404).json({ error: 'Unknown collection.' })));

router.post('/:kind', async (req, res) => res.status(201).json(await create(req.params.kind, pick(req.params.kind, req.body))));
router.put('/:kind/:id', async (req, res) => {
  const row = await update(req.params.kind, req.params.id, pick(req.params.kind, req.body));
  return row ? res.json(row) : res.status(404).json({ error: 'Not found.' });
});
router.delete('/:kind/:id', async (req, res) => {
  const row = await remove(req.params.kind, req.params.id);
  return row ? res.status(204).end() : res.status(404).json({ error: 'Not found.' });
});

export default router;
