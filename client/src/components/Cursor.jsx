// Custom cursor (fine pointer + hover devices only). A 4-point star core that tracks the pointer
// 1:1 and a slanted ring that trails it. States come from the element under the pointer via
// event delegation:
//   data-cursor="view|hand|text|drag"  data-cursor-label="…"  data-cursor-theme="invert"
// Links/buttons get a crosshair + optional label, disabled elements a dimmed star with an X.
// Over inputs and iframes the native cursor takes over. Never carries meaning on its own.
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { reducedMotion } from '../lib/scroll.jsx';

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], [role="option"], [role="scrollbar"], summary, label';
const NATIVE = 'input, textarea, select, [contenteditable="true"], iframe';
const TEXT = 'p, li, dd, blockquote';
const POOL = 12;

export default function Cursor() {
  const root = useRef(null);
  const core = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduce = reducedMotion();
    const el = root.current;
    const parts = [...el.querySelectorAll('.cur-p')];
    let next = 0;
    const pos = { x: -100, y: -100 };
    let dirty = false;

    const ringX = gsap.quickTo(ring.current, 'x', { duration: reduce ? 0 : 0.18, ease: 'power3' });
    const ringY = gsap.quickTo(ring.current, 'y', { duration: reduce ? 0 : 0.18, ease: 'power3' });

    // single ticker update: no layout reads, transforms only
    const tick = () => {
      if (!dirty) return;
      dirty = false;
      gsap.set(core.current, { x: pos.x, y: pos.y });
      ringX(pos.x);
      ringY(pos.y);
    };
    gsap.ticker.add(tick);

    const move = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      dirty = true;
      el.classList.remove('is-out');
    };

    let lastState = '';
    const over = (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest(NATIVE)) { el.classList.add('is-native'); return; }
      el.classList.remove('is-native');
      // precedence: disabled → interactive element → tagged region → text → default
      const inter = t.closest(INTERACTIVE);
      const tagged = t.closest('[data-cursor]');
      let state = 'default';
      let src = null;
      if (t.closest('[aria-disabled="true"], :disabled')) state = 'disabled';
      // a tag nested inside an interactive element (e.g. the drag thumb inside the scrollbar) wins
      else if (tagged && (!inter || inter.contains(tagged))) { state = tagged.dataset.cursor; src = tagged; }
      else if (inter) { state = inter.dataset.cursor || 'link'; src = inter; }
      else if (t.closest(TEXT)) state = 'text';
      const lbl = src?.dataset.cursorLabel || { view: 'View mission', drag: 'Drag' }[state] || '';
      const theme = t.closest('[data-cursor-theme="invert"]') ? 'invert' : 'normal';
      const key = `${state}|${lbl}|${theme}`;
      if (key === lastState) return;
      lastState = key;
      el.dataset.state = state;
      el.dataset.theme = theme;
      label.current.textContent = lbl;
    };

    const burst = () => {
      if (reduce) return;
      for (let i = 0; i < 6; i++) {
        const p = parts[next];
        next = (next + 1) % POOL;
        const a = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
        gsap.fromTo(p, { x: pos.x, y: pos.y, rotate: (a * 180) / Math.PI, opacity: 1, scaleX: 1 },
          { x: pos.x + Math.cos(a) * 30, y: pos.y + Math.sin(a) * 30, opacity: 0, scaleX: 0.3, duration: 0.3, ease: 'power2.out', overwrite: true });
      }
    };
    const down = () => { el.classList.add('is-pressed'); burst(); };
    const up = () => el.classList.remove('is-pressed');
    const leave = (e) => { if (!e.relatedTarget) el.classList.add('is-out'); };
    const blur = () => el.classList.add('is-out');

    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    addEventListener('pointerdown', down);
    addEventListener('pointerup', up);
    document.addEventListener('pointerout', leave);
    addEventListener('blur', blur);
    // hide the system cursor only now that ours exists, so there is never a moment with none
    document.documentElement.classList.add('cursor-on');

    return () => {
      gsap.ticker.remove(tick);
      removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      removeEventListener('pointerdown', down);
      removeEventListener('pointerup', up);
      document.removeEventListener('pointerout', leave);
      removeEventListener('blur', blur);
      document.documentElement.classList.remove('cursor-on');
    };
  }, []);

  return (
    <div className="cursor is-out" ref={root} data-state="default" data-theme="normal" aria-hidden="true">
      <div className="cur-ring" ref={ring}><span className="cur-ring-shape" /><span className="cur-label" ref={label} /></div>
      <div className="cur-core" ref={core}>
        <svg viewBox="0 0 40 40" className="cur-svg">
          <g className="cs cs-star"><polygon points="20,2 25,15 38,20 25,25 20,38 15,25 2,20 15,15" /></g>
          <g className="cs cs-cross"><circle cx="20" cy="20" r="10" /><path d="M20 2 V12 M20 28 V38 M2 20 H12 M28 20 H38" /></g>
          <g className="cs cs-hand"><path d="M12 36 L9 22 L9 14 L13 14 L14 21 L14 6 L18 6 L19 19 L20 4 L24 4 L24 19 L26 7 L30 7 L29 21 L32 15 L35 17 L30 30 L26 36 Z" /></g>
          <g className="cs cs-grab"><path d="M10 34 L8 20 L12 14 L28 14 L33 20 L31 30 L26 34 Z M12 14 V20 M17 14 V20 M22 14 V20 M27 14 V20" /></g>
          <g className="cs cs-bar"><polygon points="22,4 26,4 18,36 14,36" /></g>
          <g className="cs cs-x"><path d="M28 28 L36 36 M36 28 L28 36" /></g>
        </svg>
      </div>
      {Array.from({ length: POOL }, (_, i) => <span key={i} className="cur-p" />)}
    </div>
  );
}
