// Persona-style pause menu (full screen). Original art only.
// Zig-zag list of rotated cut-out items; the selected one pops (scale 1.15, red slab, jagged
// white outline, spinning star pointer, letter pop, tiny jitter). A dark-red description panel
// types out the highlighted item. Input: ↑/↓ or W/S, 1-6 jump, Enter/click confirms, Esc closes.
// The animated PhantomCharacter stands on the right and changes pose with the selection; confirming
// plays its gesture, then that item's own transition (see menu/TransitionLayer.jsx).
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StickerArt from './StickerArt.jsx';
import PhantomCharacter from './menu/PhantomCharacter.jsx';
import { useTransitions } from './menu/TransitionLayer.jsx';
import { reducedMotion } from '../lib/scroll.jsx';

export const MENU = [
  { id: 'projects', label: 'Projects', sub: 'Missions', icon: 'code', desc: 'Every target I have taken on: internship apps, hackathon builds and design work.' },
  { id: 'about', label: 'About', sub: 'About me', icon: 'bubble', desc: 'Who is behind the mask. A short dialogue and the numbers so far.' },
  { id: 'hideout', label: 'Hideout', sub: 'Game clips', icon: 'controller', desc: 'Welcome to the hideout. FIFA and VALORANT highlights, shuffled.' },
  { id: 'status', label: 'Status', sub: 'Skills', icon: 'star', desc: 'Skill ranks from Python to Firebase, and where each one was used.' },
  { id: 'journey', label: 'Journey', sub: 'The story so far', icon: 'mask', desc: 'Internship, hackathon and degree, logged in order.' },
  { id: 'contact', label: 'Contact', sub: 'Calling card', icon: 'heart', desc: 'Ready for the next mission? Leave a calling card.' },
];

const ROT = [-6, -3.5, -8, -4, -7, -3]; // deterministic zig-zag angles
const OFF = [0, 6, 2, 8, 3, 9]; // x offsets in 8px units
const ease = [0.2, 0.9, 0.1, 1];
const SHARDS = Array.from({ length: 12 }, (_, i) => ({
  top: `${(i * 37) % 92}%`, left: `${48 + ((i * 53) % 50)}%`, w: 18 + ((i * 29) % 46), h: 6 + ((i * 17) % 14),
  rot: -30 + ((i * 41) % 60), red: i % 3 !== 0, dur: 6 + (i % 5),
}));

function Typer({ text }) {
  const [n, setN] = useState(() => (reducedMotion() ? text.length : 0));
  useEffect(() => {
    if (reducedMotion()) return;
    let i = 0;
    const t = setInterval(() => { i += 3; setN(i); if (i >= text.length) clearInterval(t); }, 12);
    return () => clearInterval(t);
  }, [text]);
  return <>{text.slice(0, n)}</>;
}

function Menu({ onClose, onSelect }) {
  const [sel, setSel] = useState(0);
  const list = useRef(null);
  const phantom = useRef(null);
  const { playing, finish } = useTransitions();
  const confirming = useRef(false);
  const skip = useRef(false); // Esc during the confirm gesture skips the transition
  const panel = useRef(null);
  const instant = reducedMotion();
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

  // click / Enter: the character's confirm gesture (150ms), then the item's transition
  const confirm = async (i, e) => {
    if (confirming.current || playing()) return;
    confirming.current = true;
    skip.current = false;
    const r = e?.currentTarget?.getBoundingClientRect?.();
    const origin = e && e.clientX ? { x: e.clientX, y: e.clientY } : r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined;
    await phantom.current?.confirm();
    const run = onSelect(MENU[i].id, { origin, cardRect: phantom.current?.cardRect() });
    if (skip.current) finish();
    await run;
    confirming.current = false;
  };

  const focusItem = (i) => {
    setSel(i);
    list.current?.querySelectorAll('.pm-item button')[i]?.focus();
  };

  useEffect(() => {
    list.current?.querySelector('.pm-item button')?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (confirming.current && k === 'escape') { skip.current = true; return; }
      if (confirming.current || playing()) return;
      if (k === 'escape') { onClose(); return; }
      if (k === 'arrowdown' || k === 's') { e.preventDefault(); focusItem((sel + 1) % MENU.length); }
      else if (k === 'arrowup' || k === 'w') { e.preventDefault(); focusItem((sel + MENU.length - 1) % MENU.length); }
      else if (/^[1-6]$/.test(k)) { e.preventDefault(); focusItem(+k - 1); }
      else if (k === 'tab') { // keep focus inside
        const all = [...panel.current.querySelectorAll('button')];
        if (e.shiftKey && document.activeElement === all[0]) { e.preventDefault(); all[all.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === all[all.length - 1]) { e.preventDefault(); all[0].focus(); }
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const v = {
    shard: { hidden: { x: '60vw', opacity: 0 }, show: { x: 0, opacity: 1 } },
    item: { hidden: { x: 120, opacity: 0 }, show: { x: 0, opacity: 1 } },
  };

  return (
    <motion.div
      ref={panel} className="pm" role="dialog" aria-modal="true" aria-label="Main menu"
      initial={instant ? false : 'hidden'} animate="show" exit={instant ? undefined : 'hidden'}
      variants={{ hidden: { opacity: 0, transition: { duration: 0.3, ease } }, show: { opacity: 1, transition: { duration: 0.15 } } }}
    >
      <div className="pm-strip" aria-hidden="true" />
      <div className="pm-slash" aria-hidden="true" />
      <div className="halftone-corner halftone-corner--br" aria-hidden="true" />
      <motion.div className="pm-shards" aria-hidden="true" variants={{ show: { transition: { staggerChildren: 0.04 } }, hidden: { transition: { staggerChildren: 0.02, staggerDirection: -1 } } }}>
        {SHARDS.map((s, i) => (
          <motion.span key={i} className={`pm-shard ${s.red ? 'is-red' : ''}`} variants={v.shard} transition={{ duration: 0.3, ease }}
            style={{ top: s.top, left: s.left, width: s.w, height: s.h, rotate: `${s.rot}deg`, '--dur': `${s.dur}s` }} />
        ))}
      </motion.div>
      <div className="pm-phantom" aria-hidden="true"><PhantomCharacter ref={phantom} pose={MENU[sel].id} /></div>

      <button type="button" className="hud-btn pm-close" onClick={onClose} data-cursor-label="Back">
        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5" aria-hidden="true"><path d="M4 4 L20 20 M20 4 L4 20" /></svg>
        <span>Close</span>
      </button>

      <nav className="pm-nav" aria-label="Sections">
        <motion.ol ref={list} className="pm-list" variants={{ show: { transition: { delayChildren: 0.18, staggerChildren: 0.06 } }, hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } } }}>
          {MENU.map((m, i) => (
            <motion.li key={m.id} className={`pm-item ${sel === i ? 'is-sel' : ''}`} variants={v.item} transition={{ duration: 0.3, ease }}
              style={{ '--rot': `${ROT[i]}deg`, '--off': `${OFF[i] * 8}px` }}>
              <button type="button" onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onClick={(e) => confirm(i, e)}
                aria-describedby="pm-desc" data-cursor-label="Go">
                <span className="pm-pointer" aria-hidden="true">
                  <svg viewBox="0 0 40 40"><polygon points="20,2 25,15 38,20 25,25 20,38 15,25 2,20 15,15" /></svg>
                </span>
                <span className="pm-num num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <StickerArt type={m.icon} className="pm-icon" />
                <span className="pm-text">
                  <span className="pm-label" key={sel === i ? 'on' : 'off'} aria-label={m.label}>
                    {[...m.label].map((ch, j) => <span key={j} className="pm-l" style={{ '--i': j }} aria-hidden="true">{ch}</span>)}
                  </span>
                  <span className="pm-sub label">{m.sub}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </motion.ol>
      </nav>

      <div className="pm-desc" id="pm-desc" aria-live="polite">
        <p key={sel}><Typer text={MENU[sel].desc} /></p>
      </div>
      <p className="pm-keys" aria-hidden="true">
        {touch ? <kbd>Tap to select</kbd> : (<><kbd>↑/↓</kbd> Select <kbd>Enter</kbd> Confirm <kbd>Esc</kbd> Back</>)}
      </p>
    </motion.div>
  );
}

export function MenuOverlay({ open, onClose, onSelect }) {
  return <AnimatePresence>{open && <Menu onClose={onClose} onSelect={onSelect} />}</AnimatePresence>;
}
