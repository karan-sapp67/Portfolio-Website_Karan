// Site-wide motion catalogue, started once after the loader:
// - magnetic SlantButtons (pull up to 12px toward the pointer, elastic.out(1, 0.4) on release)
// - scroll-velocity skew on big titles and marquees (--vskew on <html>, ±6deg, eases back to 0)
// - counters count up (About stat tiles), segmented skill bars fill with a 40ms stagger
// - line-mask reveals on [data-mask] headings, letter pop on RansomTitles
// - stickers pop in with a spring stagger
// Everything is skipped under prefers-reduced-motion; elements then simply show their final state.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { reducedMotion } from './scroll.jsx';

gsap.registerPlugin(ScrollTrigger, SplitText);
if (import.meta.env.DEV) window.__gsap = gsap; // dev-only handle for QA scripts (slow-motion frame capture)

const MAG = 12;
const once = (trigger, start = 'top 85%') => ({ trigger, start, toggleActions: 'play none none none' });

// delegated, so buttons that mount later (filter changes, dialogs) are magnetic too
function magnetic() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  let el = null;
  const pos = new WeakMap();
  const apply = (target, p) => { target.style.setProperty('--mx', `${p.x}px`); target.style.setProperty('--my', `${p.y}px`); };
  const tween = (target, x, y, release) => {
    const p = pos.get(target) || { x: 0, y: 0 };
    pos.set(target, p);
    gsap.to(p, { x, y, duration: release ? 0.9 : 0.3, ease: release ? 'elastic.out(1, 0.4)' : 'power3.out', overwrite: true, onUpdate: () => apply(target, p) });
  };
  const over = (e) => {
    const t = e.target.closest?.('.slant-btn:not(.is-off):not(:disabled)');
    if (t === el) return;
    if (el) tween(el, 0, 0, true);
    el = t;
  };
  const move = (e) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    tween(el, gsap.utils.clamp(-1, 1, nx) * MAG, gsap.utils.clamp(-1, 1, ny) * MAG, false);
  };
  document.addEventListener('pointerover', over);
  document.addEventListener('pointermove', move, { passive: true });
  return () => { document.removeEventListener('pointerover', over); document.removeEventListener('pointermove', move); };
}

function velocitySkew() {
  // --vskew is set on the elements that use it, not on <html>: a root custom-property change would
  // restyle the whole tree on every scroll frame
  const SELECTOR = '.sec-head, .marquee, .contact-h, .mission-title';
  let targets = [];
  const collect = () => { targets = gsap.utils.toArray(SELECTOR); };
  collect();
  ScrollTrigger.addEventListener('refresh', collect);
  const p = { skew: 0 };
  const set = () => targets.forEach((el) => el.style.setProperty('--vskew', `${p.skew.toFixed(2)}deg`));
  const st = ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity();
      if (Math.abs(v) > 9000) return; // a jump (menu, rail, wipe), not a scroll
      const target = gsap.utils.clamp(-6, 6, v / -400);
      if (Math.abs(target) > Math.abs(p.skew)) {
        p.skew = target;
        set();
        gsap.to(p, { skew: 0, duration: 0.8, ease: 'power3', overwrite: true, onUpdate: set });
      }
    },
  });
  return () => { st.kill(); ScrollTrigger.removeEventListener('refresh', collect); targets.forEach((el) => el.style.removeProperty('--vskew')); };
}

function counters() {
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const m = el.dataset.count.match(/^(\D*)(\d+)(.*)$/);
    if (!m) return;
    const [, pre, digits, post] = m;
    const n = { v: 0 };
    gsap.to(n, {
      v: Number(digits), duration: 1.2, ease: 'power2.out', scrollTrigger: once(el),
      onUpdate: () => { el.textContent = pre + String(Math.round(n.v)).padStart(digits.length, '0') + post; },
    });
  });
}

function bars() {
  gsap.utils.toArray('.stat-bars, .skill-detail').forEach((group) => {
    gsap.from(group.querySelectorAll('.segments i.is-on'), {
      scaleX: 0, transformOrigin: '0 50%', duration: 0.25, ease: 'power3.out', stagger: 0.04, scrollTrigger: once(group),
    });
  });
}

function headings() {
  gsap.utils.toArray('[data-mask]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true, aria: 'none', // the heading keeps its own text; no aria-label on a span
      onSplit: (self) => {
        // room for the offset shadow and skew overhang, which the mask would otherwise clip
        self.masks.forEach((m) => Object.assign(m.style, { padding: '0 0.3em 10px 0', margin: '0 -0.3em -10px 0' }));
        return gsap.from(self.lines, { yPercent: 110, duration: 0.7, ease: 'power4.out', stagger: 0.1, scrollTrigger: once(el) });
      },
    });
  });
  gsap.utils.toArray('.ransom').forEach((el) => {
    gsap.from(el.querySelectorAll('.ransom-l'), {
      yPercent: 60, autoAlpha: 0, duration: 0.35, ease: 'back.out(2)', stagger: 0.03, scrollTrigger: once(el),
    });
  });
}

function stickers() {
  ScrollTrigger.batch('.decor .sticker', {
    start: 'top 90%', once: false,
    onEnter: (batch) => gsap.fromTo(batch, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)', stagger: 0.12, overwrite: true }),
  });
}

/** Start the catalogue; returns a cleanup function. */
export function startMotion() {
  if (reducedMotion()) return () => {};
  const offMag = magnetic();
  let offSkew = () => {};
  const ctx = gsap.context(() => {
    offSkew = velocitySkew();
    counters();
    bars();
    headings();
    stickers();
  });
  ScrollTrigger.refresh();
  return () => { offMag(); offSkew(); ctx.revert(); };
}
