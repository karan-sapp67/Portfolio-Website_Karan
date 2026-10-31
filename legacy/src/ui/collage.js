// Hero collage: photo/art cards that hang off both edges (and slide in on hover) plus
// draggable stickers. Adapted from the "hero playground" prototype. The layout is data,
// so tweak the PHOTOS / STICKERS tables below to move things around.
import { gsap } from 'gsap';
import { content } from '../content.js';

const svg = (s) => 'data:image/svg+xml;utf8,' + encodeURIComponent(s);

// ── Cards ──────────────────────────────────────────────────────
// [media, side, edge (px, negative = hangs off-screen), top (design px of 900), rotate°, layer]
const A = (label, hue) => ({ type: 'art', label, hue, w: 370, h: 260 });
const P = (pos, zoom = 1) => ({ type: 'photo', pos, zoom, w: 270, h: 340 });
const PHOTOS = [
  [A('React', 255), 'left', -140, 65, -8, 8],
  [P('50% 22%', 1.1), 'left', -185, 225, 16, 7],
  [A('Next.js', 190), 'left', -170, 365, -14, 7],
  [A('UI / UX', 330), 'left', -140, 495, 11, 8],
  [P('50% 70%', 1.0), 'left', -95, 610, -20, 9],
  [A('Firebase', 35), 'left', -100, 695, 22, 8],
  [P('50% 18%', 1.25), 'right', -150, 70, 10, 8],
  [A('MERN', 150), 'right', -180, 230, -16, 7],
  [A('Python', 210), 'right', -160, 370, 13, 7],
  [P('60% 35%', 1.35), 'right', -135, 500, -11, 8],
  [A('Tailwind', 175), 'right', -110, 615, 20, 8],
  [A('Figma', 300), 'right', -25, 715, -10, 10],
];

// ── Stickers (design grid 1920×1080) ───────────────────────────
const STICKERS = [
  { src: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect x="30" y="30" width="260" height="260" rx="70" fill="#7c5cff" stroke="#fff" stroke-width="12"/><text x="160" y="212" font-family="Georgia,serif" font-size="170" font-weight="bold" fill="#fff" text-anchor="middle">KS</text></svg>`), side: 'left', x: 75, y: 266, w: 141, r: 18 },
  { src: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><polygon points="160,20 198,118 300,124 220,188 246,290 160,232 74,290 100,188 20,124 122,118" fill="#f5c518" stroke="#fff" stroke-width="12" stroke-linejoin="round"/></svg>`), side: 'left', x: 215, y: 663, w: 65, r: -24 },
  { src: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect x="40" y="60" width="240" height="200" rx="24" fill="#3ee6f2" stroke="#fff" stroke-width="14"/><text x="160" y="185" font-family="monospace" font-size="80" font-weight="bold" fill="#050507" text-anchor="middle">&lt;/&gt;</text></svg>`), side: 'left', x: 300, y: 768, w: 81, r: 13 },
  { src: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><path d="M160 280 C40 200 20 120 70 80 C110 50 150 70 160 105 C170 70 210 50 250 80 C300 120 280 200 160 280Z" fill="#ff5ca8" stroke="#fff" stroke-width="14" stroke-linejoin="round"/></svg>`), side: 'right', x: 100, y: 285, w: 112, r: -16 },
  { src: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><circle cx="160" cy="160" r="140" fill="#4aa3ff" stroke="#fff" stroke-width="14"/><text x="160" y="190" font-family="sans-serif" font-size="84" font-weight="bold" fill="#fff" text-anchor="middle">MERN</text></svg>`), side: 'right', x: 155, y: 528, w: 89, r: 22 },
  { src: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><polygon points="160,24 296,160 160,296 24,160" fill="#a05cff" stroke="#fff" stroke-width="14" stroke-linejoin="round"/></svg>`), side: 'right', x: 280, y: 767, w: 65, r: -9 },
];

const vw = (v) => `calc(${v} / 1920 * 100vw)`;
const vh = (v) => `calc(${v} / 1080 * 100vh)`;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function cardMedia(m) {
  if (m.type === 'photo') {
    const img = document.createElement('img');
    img.className = 'media';
    img.src = content.portrait;
    img.alt = '';
    img.loading = 'lazy';
    img.draggable = false;
    img.style.objectPosition = m.pos;
    img.style.transform = `scale(${m.zoom})`;
    return img;
  }
  const d = document.createElement('div');
  d.className = 'media art';
  d.style.setProperty('--hue', m.hue);
  d.innerHTML = `<span>${m.label}</span>`;
  return d;
}

/** Builds the collage inside #collage and returns handles for the scroll timeline. */
export function mountCollage() {
  const root = document.getElementById('collage');
  const hero = root.closest('.hero-sticky');
  const slots = [];
  const stickers = [];

  PHOTOS.forEach(([m, side, edge, top, rot, z]) => {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.style[side] = `${edge}px`;
    slot.style.top = `calc(${top} / 900 * 100svh)`;
    slot.style.width = `${m.w + 20}px`;
    slot.style.height = `${m.h + 30}px`;
    slot.style.zIndex = z;

    const slide = document.createElement('div');
    slide.className = 'slide';
    const card = document.createElement('div');
    card.className = 'card';
    card.style.width = `${m.w}px`;
    card.style.height = `${m.h}px`;
    card.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(.78)`;
    card.appendChild(cardMedia(m));
    slide.appendChild(card);
    slot.appendChild(slide);
    root.appendChild(slot);

    // hover: slide out toward the centre now, slide back 200ms after leaving
    const dx = Math.max(Math.abs(edge) + 80, 160) * (side === 'right' ? -1 : 1);
    const dy = top < 450 ? 40 : -40;
    let t;
    card.addEventListener('mouseenter', () => {
      clearTimeout(t);
      slot.style.zIndex = 100;
      if (!reduce) slide.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    card.addEventListener('mouseleave', () => {
      t = setTimeout(() => { slide.style.transform = 'none'; slot.style.zIndex = z; }, 200);
    });
    slots.push({ el: slot, side });
  });

  STICKERS.forEach((s) => {
    const wrap = document.createElement('div'); // animated by the scroll timeline
    wrap.className = 'sticker-wrap';
    wrap.style[s.side] = vw(s.x);
    wrap.style.top = vh(s.y);
    wrap.style.width = vw(s.w);
    const el = document.createElement('div'); // owns hover + drag transforms
    el.className = 'sticker';
    const img = document.createElement('img');
    img.className = 'media';
    img.src = s.src;
    img.alt = '';
    img.draggable = false;
    img.style.transform = `rotate(${s.r}deg)`;
    el.appendChild(img);
    wrap.appendChild(el);
    root.appendChild(wrap);
    makeDraggable(el, img, s.r);
    stickers.push(wrap);
  });

  return {
    slots,
    stickers,
    bg: hero.querySelector('#bgArt'),
    /** Reduced-motion / static hero: just show everything. */
    showAll() { gsap.set([...slots.map((s) => s.el), ...stickers, hero.querySelector('#bgArt')], { autoAlpha: 1 }); },
  };
}

function makeDraggable(el, img, rot) {
  let lifted = false;
  let hoverT;
  const set = (tx, ty, dragging) => {
    const lift = dragging ? 14 : lifted ? 6 : 0;
    el.style.transform = `translate(${tx}px, ${ty - lift}px) scale(${dragging ? 1.1 : lifted ? 1.05 : 1})`;
    el.style.filter = lift ? `drop-shadow(0 ${lift}px ${lift + 6}px rgba(0,0,0,.45))` : '';
    img.style.transform = `rotate(${rot + (dragging ? 4 : 0)}deg)`;
  };
  el.addEventListener('mouseenter', () => { hoverT = setTimeout(() => { lifted = true; set(0, 0, false); }, 150); });
  el.addEventListener('mouseleave', () => { clearTimeout(hoverT); lifted = false; if (!el.classList.contains('dragging')) set(0, 0, false); });
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const base = new DOMMatrix(getComputedStyle(el).transform);
    const ox = base.m41, oy = base.m42 + (lifted ? 6 : 0);
    el.classList.add('dragging');
    el.setPointerCapture(e.pointerId);
    set(ox, oy, true);
    const move = (ev) => set(ox + ev.clientX - sx, oy + ev.clientY - sy, true);
    const up = (ev) => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.classList.remove('dragging');
      // stays where it was dropped (keep the offset)
      set(ox + ev.clientX - sx, oy + ev.clientY - sy, false);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  });
}
