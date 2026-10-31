// Express API entry point.
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import publicRoutes from './routes/public.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import { hasDb } from './store.js';

const PORT = process.env.PORT || 5000;
const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());

const app = express();
app.set('trust proxy', 1); // behind Render's proxy, so rate limits see the real client IP
app.use(helmet());
app.use(cors({ origin: origins }));
app.use(compression());
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, db: hasDb() ? 'mongodb' : 'demo (in-memory seed)' }));
app.use('/api', publicRoutes);
app.use('/api', contactRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } catch (err) {
      console.warn('MongoDB connection failed, serving seed data from memory:', err.message);
    }
  } else {
    console.warn('MONGODB_URI not set: running in demo mode with in-memory seed data');
  }
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
}

start();
