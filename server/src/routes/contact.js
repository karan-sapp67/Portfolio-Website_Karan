// POST /api/contact: validated, sanitised, rate-limited, stored, optionally emailed.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { saveMessage } from '../store.js';

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many messages. Try again in a few minutes.' },
});

// strip tags and control characters (keeping newlines in the message)
const clean = (v, keepNewlines = false) =>
  String(v ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(keepNewlines ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, ' ')
    .trim();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(body) {
  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const message = clean(body.message, true);
  const fields = {};
  if (name.length < 2 || name.length > 80) fields.name = 'Name must be 2-80 characters.';
  if (!EMAIL.test(email) || email.length > 120) fields.email = 'Enter a valid email address.';
  if (message.length < 10 || message.length > 2000) fields.message = 'Message must be 10-2000 characters.';
  return { data: { name, email, message }, fields };
}

async function notify({ name, email, message }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !CONTACT_TO) return;
  const { default: nodemailer } = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host: SMTP_HOST, port: Number(SMTP_PORT) || 587, secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  await transport.sendMail({
    from: SMTP_USER || CONTACT_TO, to: CONTACT_TO, replyTo: email,
    subject: `Portfolio message from ${name}`, text: `${name} <${email}>\n\n${message}`,
  });
}

router.post('/contact', limiter, async (req, res) => {
  if (req.body?.website) return res.status(201).json({ ok: true }); // honeypot: silently drop bots
  const { data, fields } = validate(req.body || {});
  if (Object.keys(fields).length) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields });
  await saveMessage({ ...data, ip: req.ip });
  notify(data).catch((err) => console.warn('Contact email failed:', err.message));
  res.status(201).json({ ok: true });
});

export default router;
