// CONTACT: full red finale. Massive slanted headline, marquee strips, the form printed on the
// ring-style calling card with
// inline validation (same rules as the API) and a MESSAGE DELIVERED stamp, sticker buttons,
// and the footer (torn edge, signature sticker, back-to-top badge).
import { useState } from 'react';
import { contact } from '../data/index.js';
import { api, apiEnabled } from '../lib/api.js';
import { useScroll } from '../lib/scroll.jsx';
import { useWipe } from '../components/Wipe.jsx';
import StickerArt from '../components/StickerArt.jsx';
import { SlantButton, TornEdge } from '../components/ui.jsx';
import ScreenFrame from '../components/ScreenFrame.jsx';
import CallingCard from '../components/CallingCard.jsx';

// decorative marquee copy (aria-hidden); the ★ between items is an original SVG star
const MARQUEE = ['Take your heart', 'I am thou, thou art I', 'Show time', 'Open for work'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate({ name, email, message }) {
  const e = {};
  if (name.trim().length < 2 || name.trim().length > 80) e.name = 'Name must be 2-80 characters.';
  if (!EMAIL.test(email.trim())) e.email = 'Enter a valid email address.';
  if (message.trim().length < 10 || message.trim().length > 2000) e.message = 'Message must be 10-2000 characters.';
  return e;
}

function Marquee({ reverse }) {
  return (
    <div className={`marquee ${reverse ? 'marquee--rev' : ''}`} aria-hidden="true">
      <div className="marquee-track">
        {Array.from({ length: 4 }, (_, r) => MARQUEE.map((t) => (
          <span key={`${r}-${t}`} className="mq-item">{t}<svg viewBox="0 0 40 40" className="mq-star"><polygon points="20,2 25,15 38,20 25,25 20,38 15,25 2,20 15,15" /></svg></span>
        )))}
      </div>
    </div>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      <p className="field-error" id={`${id}-err`} role={error ? 'alert' : undefined}>{error || ''}</p>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [serverMsg, setServerMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const { scrollTo } = useScroll();
  const wipe = useWipe();

  const set = (k) => (e) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k) => () => { setTouched((t) => ({ ...t, [k]: true })); setErrors(validate(form)); };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errs).length) {
      document.getElementById(`cf-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setState('sending');
    try {
      await api('/contact', { method: 'POST', body: JSON.stringify(form) });
      setState('sent');
      setForm({ name: '', email: '', message: '', website: '' });
      setTouched({});
    } catch (err) {
      if (err.data?.fields) setErrors(err.data.fields);
      setServerMsg(err.data?.fields ? err.data.error : 'Message could not be sent. Please use the email button below.');
      setState('error');
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(contact.email); setCopied(true); } catch { setCopied(false); }
    setTimeout(() => setCopied(false), 2000);
  };

  const describedBy = (k) => (errors[k] && touched[k] ? `cf-${k}-err` : undefined);

  return (
    <>
      <section id="contact" className="contact" aria-labelledby="contact-h" data-cursor-theme="invert">
        <ScreenFrame num="06" name="Contact" desc="Take your heart" hints={false} theme="red" />
        <Marquee />
        <div className="contact-inner">
          <h2 className="contact-h" id="contact-h">
            <span className="contact-h-big" data-mask>Ready for the next mission?</span>
            <span className="contact-h-slab"><span>Let's work together</span></span>
          </h2>

          <div className="contact-grid">
            {apiEnabled ? <CallingCard as="form" className="cc--form" tilt={-1} onSubmit={submit} noValidate aria-describedby="cf-status" aria-labelledby="cf-head">
              <div className="card-form">
              <p className="calling-form-head" id="cf-head">Send a calling card</p>
              <Field id="cf-name" label="Name" error={touched.name && errors.name}>
                <input id="cf-name" name="name" autoComplete="name" value={form.name} onChange={set('name')} onBlur={blur('name')}
                  aria-invalid={!!(touched.name && errors.name)} aria-describedby={describedBy('name')} required />
              </Field>
              <Field id="cf-email" label="Email" error={touched.email && errors.email}>
                <input id="cf-email" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} onBlur={blur('email')}
                  aria-invalid={!!(touched.email && errors.email)} aria-describedby={describedBy('email')} required />
              </Field>
              <Field id="cf-message" label="Message" error={touched.message && errors.message}>
                <textarea id="cf-message" name="message" rows={5} value={form.message} onChange={set('message')} onBlur={blur('message')}
                  aria-invalid={!!(touched.message && errors.message)} aria-describedby={describedBy('message')} required />
              </Field>
              {/* honeypot: hidden from people, bots fill it in */}
              <div className="hp" aria-hidden="true">
                <label htmlFor="cf-website">Website</label>
                <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
              </div>
              <div className="calling-form-foot">
                <button type="submit" className="slant-btn slant-btn--submit" disabled={state === 'sending'}>
                  <span><i className="ptr" aria-hidden="true" />{state === 'sending' ? 'Sending…' : 'Send calling card'}</span>
                </button>
                <p id="cf-status" className={`form-status form-status--${state}`} role="status" aria-live="polite">
                  {state === 'sent' && 'Message delivered. I will get back to you soon.'}
                  {state === 'error' && serverMsg}
                </p>
              </div>
              </div>
              {state === 'sent' && <div className="stamp" aria-hidden="true"><span>Message delivered</span></div>}
            </CallingCard> : (
              <CallingCard className="cc--form" tilt={-1}>
                <div className="card-form">
                  <p className="calling-form-head">Send a calling card</p>
                  <p>The contact form is currently offline. Copy my email address or email me directly.</p>
                  <SlantButton href={`mailto:${contact.email}`}>Write an email</SlantButton>
                </div>
              </CallingCard>
            )}

            <div className="contact-side">
              <p className="contact-lede">Prefer something quicker? Pick a button.</p>
              <ul className="sticker-btns">
                <li>
                  <button type="button" className="sticker-btn" onClick={copy}>
                    <StickerArt type="bubble" className="sticker-btn-icon" />
                    <span className="sticker-btn-label">{copied ? 'Copied!' : 'Copy email'}</span>
                    <span className="sticker-btn-sub">{contact.email}</span>
                  </button>
                </li>
                <li>
                  <a className="sticker-btn" href={contact.github} target="_blank" rel="noopener noreferrer">
                    <StickerArt type="code" className="sticker-btn-icon" />
                    <span className="sticker-btn-label">GitHub</span>
                    <span className="sticker-btn-sub">karan-sapp67</span>
                  </a>
                </li>
                <li>
                  <a className="sticker-btn" href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                    <StickerArt type="star" className="sticker-btn-icon" />
                    <span className="sticker-btn-label">LinkedIn</span>
                    <span className="sticker-btn-sub">Karan Sapalia</span>
                  </a>
                </li>
                <li>
                  {contact.resume ? (
                    <a className="sticker-btn" href={contact.resume} target="_blank" rel="noopener noreferrer">
                      <StickerArt type="heart" className="sticker-btn-icon" />
                      <span className="sticker-btn-label">Résumé</span>
                      <span className="sticker-btn-sub">PDF</span>
                    </a>
                  ) : (
                    <span className="sticker-btn is-off" aria-disabled="true">
                      <StickerArt type="heart" className="sticker-btn-icon" />
                      <span className="sticker-btn-label">Résumé</span>
                      <span className="sticker-btn-sub">Coming soon</span>
                    </span>
                  )}
                </li>
              </ul>
              <span className="sr-only" aria-live="polite">{copied ? 'Email address copied' : ''}</span>
              <SlantButton href={`mailto:${contact.email}`}>Or write an email</SlantButton>
            </div>
          </div>
        </div>
        <Marquee reverse />
      </section>

      <footer className="footer">
        <TornEdge color="var(--red)" />
        <div className="footer-inner">
          <div className="footer-sig" aria-hidden="true"><StickerArt type="mask" /></div>
          <p className="footer-text"><span className="footer-sigline">— K.S.&nbsp;&nbsp; Thou art I.</span> © {new Date().getFullYear()} Karan Sapalia · Built with MongoDB, Express, React and Node</p>
          <button type="button" className="top-badge" onClick={() => wipe(() => scrollTo(0, { immediate: true }))} aria-label="Back to top">
            <svg viewBox="0 0 10 8" aria-hidden="true"><path d="M5 0 L10 8 H0Z" /></svg>
          </button>
        </div>
      </footer>
    </>
  );
}
