// Custom dot + trailing ring cursor. Skipped entirely on touch / coarse pointers.
import { gsap } from 'gsap';

export function initCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.body.classList.add('has-cursor');

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.1 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
  }, { passive: true });

  // Ring grows over anything interactive
  const sel = 'a, button, [data-cursor], .card, .chip, .sticker';
  document.addEventListener('pointerover', (e) => ring.classList.toggle('is-active', !!e.target.closest(sel)));
}
