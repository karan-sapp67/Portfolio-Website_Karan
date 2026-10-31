// Public read-only content routes.
import { Router } from 'express';
import { list } from '../store.js';

const router = Router();

router.get('/projects', async (_req, res) => res.json(await list('projects')));
router.get('/clips', async (_req, res) => res.json(await list('clips')));
router.get('/journey', async (_req, res) => res.json(await list('journey')));
router.get('/skills', async (_req, res) => {
  const rows = await list('skills');
  res.json({ stats: rows.filter((r) => r.kind === 'stat'), items: rows.filter((r) => r.kind === 'skill') });
});

export default router;
