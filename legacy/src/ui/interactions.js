// Reusable hover effects: cursor-following spotlight, 3D tilt, magnetic pull.
import { gsap } from 'gsap';

/** Sets --mx/--my on each element so CSS can draw a spotlight under the cursor. */
export function initSpotlight(els) {
  els.forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

export function initTilt(els, max = 7) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  els.forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
      rx(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

export function initMagnetic(el, strength = 0.35) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    x((e.clientX - (r.left + r.width / 2)) * strength);
    y((e.clientY - (r.top + r.height / 2)) * strength);
  });
  el.addEventListener('pointerleave', () => { x(0); y(0); });
}
