// Per-button menu transitions. One fixed, pointer-events:none layer holds pre-built SVG scenes; a
// play() call sizes the shapes to the viewport, runs one scene's GSAP timeline and resolves when
// it is over. Each scene covers the screen by ~45% of its length and calls onCovered() right then
// (that is where the menu closes and the page jumps to the section), then reveals the section.
//   projects SHATTER · about CURTAIN + INK · hideout SLASH · status BARS · journey PAPER RIP ·
//   contact SHOCKWAVE CARD (the calling card flies from the character's hand)
// Only transform, opacity and clip-path animate; shapes are pooled and re-pointed per play; no
// filters. Input is locked while playing; Esc (or reduced motion) finishes instantly (a 150ms fade).
// Mobile / low power: 8 shards and 5 bars.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import CallingCard from '../CallingCard.jsx';
import { reducedMotion } from '../../lib/scroll.jsx';

export const TRANSITION_FOR = { projects: 'shatter', about: 'curtain', hideout: 'slash', status: 'bars', journey: 'rip', contact: 'card' };

const SHARDS = 14;
const BARS = 8;
const BANDS = 6;
const COLORS = ['tl-red', 'tl-white', 'tl-black'];

const Ctx = createContext({ play: () => Promise.resolve(), finish: () => {}, playing: () => false });
export const useTransitions = () => useContext(Ctx);

// deterministic jagged tear down the middle (x offsets alternate)
const zig = (w, h, steps = 12) => Array.from({ length: steps + 1 }, (_, i) => [w / 2 + (i % 2 ? 1 : -1) * w * (0.012 + ((i * 37) % 5) * 0.004), (h * i) / steps]);
// deterministic ink blot around (0,0), radius about 100
const blot = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2;
  const r = 78 + ((i * 53) % 9) * 5 + (i % 2 ? 12 : -6);
  return [Math.cos(a) * r, Math.sin(a) * r];
});
const pts = (a) => a.map((p) => p.join(',')).join(' ');

function shardBoundary(w, h, lite) {
  const t = lite ? [0.5] : [0.25, 0.5, 0.75];
  const s = lite ? [0.5] : [0.33, 0.66];
  return [[0, 0], ...t.map((k) => [w * k, 0]), [w, 0], ...s.map((k) => [w, h * k]), [w, h], ...[...t].reverse().map((k) => [w * k, h]), [0, h], ...[...s].reverse().map((k) => [0, h * k])];
}

export function TransitionProvider({ children }) {
  const root = useRef(null);
  const svg = useRef(null);
  const cardL = useRef(null);
  const cardR = useRef(null);
  const tlRef = useRef(null);
  const busy = useRef(null);
  const finish = useCallback(() => { tlRef.current?.progress(1, false); }, []);

  // Esc finishes a running transition instantly (and is not seen by the menu)
  useEffect(() => {
    const onKey = (e) => {
      if (!busy.current) return;
      e.stopImmediatePropagation();
      if (e.key === 'Escape') finish();
    };
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  }, [finish]);

  const play = useCallback((name, { origin, onCovered, cardRect } = {}) => {
    if (busy.current) return busy.current;
    const el = root.current;
    const all = (s) => gsap.utils.toArray(s, el);
    const w = innerWidth;
    const h = innerHeight;
    const lite = w < 900 || (navigator.hardwareConcurrency || 8) <= 4;
    const ox = gsap.utils.clamp(0, w, origin?.x ?? w / 2);
    const oy = gsap.utils.clamp(0, h, origin?.y ?? h / 2);
    const diag = Math.hypot(w, h);
    svg.current.setAttribute('viewBox', `0 0 ${w} ${h}`);
    gsap.set(el, { visibility: 'visible' });
    document.documentElement.classList.add('is-transitioning');

    let covered = false;
    const cover = () => { if (!covered) { covered = true; onCovered?.(); } };
    const tl = gsap.timeline({ paused: true });
    // white flash on a single frame
    const flash = (at) => tl.set('.tl-flash', { autoAlpha: 0.9 }, at).set('.tl-flash', { autoAlpha: 0 }, at + 0.034);

    if (reducedMotion()) {
      tl.fromTo('.tl-fade', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.075 }, 0).add(cover, 0.075).to('.tl-fade', { autoAlpha: 0, duration: 0.075 }, 0.08);
    } else if (name === 'shatter') {
      const n = lite ? 8 : SHARDS;
      const b = shardBoundary(w, h, lite);
      const polys = all('.tl-shard');
      const cracks = all('.tl-crack');
      polys.forEach((p, i) => {
        if (i >= n) { gsap.set(p, { autoAlpha: 0 }); return; }
        const a = b[i]; const c = b[(i + 1) % n];
        p.setAttribute('points', `${ox},${oy} ${a[0]},${a[1]} ${c[0]},${c[1]}`);
        const cx = (ox + a[0] + c[0]) / 3; const cy = (oy + a[1] + c[1]) / 3;
        p.dataset.cx = cx; p.dataset.cy = cy;
        gsap.set(p, { autoAlpha: 0, x: 0, y: 0, rotation: 0, svgOrigin: `${cx} ${cy}` });
      });
      cracks.forEach((c, i) => {
        const a = b[(i * 2) % n];
        c.setAttribute('x1', ox); c.setAttribute('y1', oy); c.setAttribute('x2', a[0]); c.setAttribute('y2', a[1]);
      });
      tl.set(cracks, { autoAlpha: 1 }, 0).to(cracks, { autoAlpha: 0, duration: 0.1, stagger: 0.01 }, 0.02);
      polys.slice(0, n).forEach((p) => {
        const dx = (+p.dataset.cx - ox); const dy = (+p.dataset.cy - oy);
        const d = Math.hypot(dx, dy) || 1;
        tl.set(p, { autoAlpha: 1 }, 0.05)
          .to(p, { x: (dx / d) * 36, y: (dy / d) * 36, duration: 0.12, ease: 'power3.out' }, 0.05) // blown outward from the click
          .to(p, { x: (dx / d) * 36 + 5, y: (dy / d) * 36 - 4, duration: 0.05, yoyo: true, repeat: 3, ease: 'none' }, 0.17); // rattle
      });
      flash(0.17);
      tl.add(cover, 0.38);
      polys.slice(0, n).forEach((p, i) => {
        const d = Math.hypot(+p.dataset.cx - ox, +p.dataset.cy - oy);
        tl.to(p, { y: h * 1.25, x: `+=${(i % 2 ? 1 : -1) * 60}`, rotation: (i % 2 ? 1 : -1) * (24 + (i % 4) * 14), duration: 0.42, ease: 'power2.in' }, 0.4 + (d / diag) * 0.14);
      });
      tl.set(polys, { autoAlpha: 0 }, 0.95);
    } else if (name === 'curtain') {
      const cl = el.querySelector('.tl-cl'); const cr = el.querySelector('.tl-cr'); const ink = el.querySelector('.tl-ink');
      gsap.set(cl, { attr: { x: 0, y: 0, width: w / 2 + 24, height: h } });
      gsap.set(cr, { attr: { x: w / 2 - 24, y: 0, width: w / 2 + 24, height: h } });
      gsap.set(cl, { x: -(w / 2 + 40), autoAlpha: 1 });
      gsap.set(cr, { x: w / 2 + 40, autoAlpha: 1 });
      ink.setAttribute('points', pts(blot.map(([x, y]) => [x + w / 2, y + h / 2])));
      gsap.set(ink, { scale: 0, rotation: 0, autoAlpha: 1, svgOrigin: `${w / 2} ${h / 2}` });
      const full = diag / 130;
      tl.to(cl, { x: 0, duration: 0.26, ease: 'power3.out' }, 0).to(cr, { x: 0, duration: 0.26, ease: 'power3.out' }, 0)
        .to(ink, { scale: full, rotation: 40, duration: 0.2, ease: 'power3.in' }, 0.2)
        .add(cover, 0.4)
        .to(ink, { scale: 0, duration: 0.22, ease: 'power3.out' }, 0.42)
        .to(cl, { x: -(w / 2 + 40), duration: 0.34, ease: 'power3.in' }, 0.5).to(cr, { x: w / 2 + 40, duration: 0.34, ease: 'power3.in' }, 0.5)
        .set([cl, cr, ink], { autoAlpha: 0 }, 0.9);
    } else if (name === 'slash') {
      const g = el.querySelector('.tl-slash-g');
      g.setAttribute('transform', `rotate(-28 ${w / 2} ${h / 2})`);
      const bh = diag / BANDS;
      const bands = all('.tl-band'); const cuts = all('.tl-cut');
      bands.forEach((r, i) => gsap.set(r, { attr: { x: w / 2 - diag, y: h / 2 - diag / 2 + i * bh, width: diag * 2, height: bh + 1 }, x: 0, autoAlpha: 0 }));
      cuts.forEach((r, i) => gsap.set(r, { attr: { x: w / 2 - diag, y: h / 2 - diag / 2 + (i + 1) * bh - 5, width: diag * 2, height: 10 }, scaleX: 0, autoAlpha: 1, transformOrigin: i % 2 ? '100% 50%' : '0% 50%' }));
      tl.to(cuts, { scaleX: 1, duration: 0.09, stagger: 0.05, ease: 'power3.out' }, 0)
        .set(bands, { autoAlpha: 1 }, 0.3)
        .add(cover, 0.38);
      flash(0.3);
      bands.forEach((r, i) => tl.to(r, { x: (i % 2 ? 1 : -1) * diag * 1.15, duration: 0.4, ease: 'power3.in' }, 0.4 + i * 0.03));
      tl.to(cuts, { autoAlpha: 0, duration: 0.1 }, 0.4).set([...bands, ...cuts], { autoAlpha: 0 }, 0.95);
    } else if (name === 'bars') {
      const n = lite ? 5 : BARS;
      const bars = all('.tl-bar');
      const bh = h / n;
      bars.forEach((r, i) => {
        if (i >= n) { gsap.set(r, { autoAlpha: 0 }); return; }
        gsap.set(r, { attr: { x: 0, y: i * bh - 1, width: w, height: bh + 2 }, x: (i % 2 ? 1 : -1) * w, autoAlpha: 1 });
      });
      const act = bars.slice(0, n);
      tl.to(act, { x: 0, duration: 0.18, stagger: 0.025, ease: 'power3.out' }, 0)
        .add(cover, 0.36)
        .to(act, { x: (i) => (i % 2 ? -1 : 1) * w, duration: 0.18, stagger: 0.025, ease: 'power3.in' }, 0.42)
        .set(bars, { autoAlpha: 0 }, 0.9);
    } else if (name === 'rip') {
      const z = zig(w, h);
      const left = [[0, 0], ...z, [0, h]]; const right = [[w, 0], ...z, [w, h]];
      const pl = el.querySelector('.tl-ripl'); const pr = el.querySelector('.tl-ripr'); const edge = el.querySelector('.tl-edge');
      pl.setAttribute('points', pts(left)); pr.setAttribute('points', pts(right)); edge.setAttribute('points', pts(z));
      const len = edge.getTotalLength?.() || h * 1.4;
      gsap.set([pl, pr], { x: 0, rotation: 0, autoAlpha: 0 });
      gsap.set(pl, { svgOrigin: `0 ${h}` }); gsap.set(pr, { svgOrigin: `${w} ${h}` });
      gsap.set(edge, { autoAlpha: 1, attr: { 'stroke-dasharray': len, 'stroke-dashoffset': len } });
      tl.set([pl, pr], { autoAlpha: 1 }, 0.04)
        .to(edge, { attr: { 'stroke-dashoffset': 0 }, duration: 0.26, ease: 'power1.in' }, 0.1)
        .add(cover, 0.4)
        .to(pl, { x: -w * 0.7, rotation: -9, duration: 0.42, ease: 'power3.in' }, 0.44)
        .to(pr, { x: w * 0.7, rotation: 9, duration: 0.42, ease: 'power3.in' }, 0.44)
        .to(edge, { autoAlpha: 0, duration: 0.1 }, 0.44)
        .set([pl, pr, edge], { autoAlpha: 0 }, 0.95);
    } else if (name === 'card') {
      const cards = [cardL.current, cardR.current];
      const ring = el.querySelector('.tl-ring');
      const cw = Math.max(w * 1.6, h * 1.9);
      const hand = cardRect ? { x: cardRect.left + cardRect.width / 2, y: cardRect.top + cardRect.height / 2 } : { x: ox, y: oy };
      cards.forEach((c) => {
        c.style.width = `${cw}px`;
        gsap.set(c, { autoAlpha: 1, xPercent: -50, yPercent: -50, x: hand.x - w / 2, y: hand.y - h / 2, scale: 0.07, rotation: -24 });
      });
      gsap.set(ring, { attr: { cx: w / 2, cy: h / 2, r: Math.min(w, h) * 0.12 }, autoAlpha: 0, scale: 0.2, svgOrigin: `${w / 2} ${h / 2}` });
      tl.to(cards, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.36, ease: 'power3.in' }, 0)
        .add(cover, 0.38);
      flash(0.38);
      tl.set(ring, { autoAlpha: 1 }, 0.38).to(ring, { scale: 4.2, autoAlpha: 0, duration: 0.4, ease: 'power2.out' }, 0.38)
        .to(cards[0], { x: -w * 0.95, rotation: -7, duration: 0.4, ease: 'power3.in' }, 0.46)
        .to(cards[1], { x: w * 0.95, rotation: 7, duration: 0.4, ease: 'power3.in' }, 0.46)
        .set(cards, { autoAlpha: 0 }, 0.95);
    }

    busy.current = new Promise((resolve) => {
      tl.eventCallback('onComplete', () => {
        cover(); // Esc / a stalled frame must still land the page where the visitor asked
        tl.kill();
        tlRef.current = null;
        busy.current = null;
        gsap.set(el, { visibility: 'hidden' });
        document.documentElement.classList.remove('is-transitioning');
        resolve();
      });
      tlRef.current = tl;
      if (import.meta.env.DEV && window.__trSlow) tl.timeScale(window.__trSlow); // dev-only: slow-motion frame capture
      tl.play();
    });
    return busy.current;
  }, []);

  const value = useMemo(() => ({ play, finish, playing: () => !!busy.current }), [play, finish]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="tl" ref={root} aria-hidden="true">
        <svg className="tl-svg" ref={svg} preserveAspectRatio="none">
          <g className="tl-scene">
            {Array.from({ length: SHARDS }, (_, i) => <polygon key={i} className={`tl-shard ${COLORS[i % 3]}`} points="0,0 0,0 0,0" opacity="0" />)}
            {Array.from({ length: 7 }, (_, i) => <line key={i} className="tl-crack" opacity="0" />)}
          </g>
          <g className="tl-scene">
            <rect className="tl-cl tl-red" opacity="0" /><rect className="tl-cr tl-red" opacity="0" />
            <polygon className="tl-ink tl-black" points={pts(blot)} opacity="0" />
          </g>
          <g className="tl-scene tl-slash-g">
            {Array.from({ length: BANDS }, (_, i) => <rect key={i} className="tl-band tl-black" opacity="0" />)}
            {Array.from({ length: BANDS - 1 }, (_, i) => <rect key={i} className="tl-cut tl-white" opacity="0" />)}
          </g>
          <g className="tl-scene">
            {Array.from({ length: BARS }, (_, i) => <rect key={i} className={`tl-bar ${i % 2 ? 'tl-red' : 'tl-black'}`} opacity="0" />)}
          </g>
          <g className="tl-scene">
            <polygon className="tl-ripl tl-paper" points="0,0 0,0 0,0" opacity="0" /><polygon className="tl-ripr tl-paper" points="0,0 0,0 0,0" opacity="0" />
            <polyline className="tl-edge" points="0,0 0,0" fill="none" opacity="0" />
          </g>
          <g className="tl-scene"><circle className="tl-ring" r="10" fill="none" opacity="0" /></g>
          <rect className="tl-fade" width="100%" height="100%" opacity="0" />
        </svg>
        <div className="tl-card tl-card--l" ref={cardL}><CallingCard tilt={0} /></div>
        <div className="tl-card tl-card--r" ref={cardR}><CallingCard tilt={0} /></div>
        <div className="tl-flash" />
      </div>
    </Ctx.Provider>
  );
}
