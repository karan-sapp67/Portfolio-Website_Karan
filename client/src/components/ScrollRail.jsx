// Custom scrollbar. Desktop: a fixed rail on the right with a slanted red thumb, section ticks,
// a percentage readout and top/bottom arrows. Mobile: a 4px top progress bar + % in the HUD.
// The native scrollbar is hidden in CSS; real scrolling (wheel, touch, keys) is untouched.
// Position updates happen in a single rAF fed by Lenis/scroll events, writing transforms only.
import { useEffect, useRef, useState } from 'react';
import { useScroll, reducedMotion } from '../lib/scroll.jsx';
import { useWipe } from './Wipe.jsx';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
const pad = (p) => `${String(Math.round(p * 100)).padStart(3, '0')}%`;

export default function ScrollRail({ sections, active, onSelect }) {
  const { lenis, scrollTo } = useScroll();
  const wipe = useWipe();
  const rail = useRef(null);
  const track = useRef(null);
  const thumb = useRef(null);
  const readout = useRef(null);
  const bar = useRef(null);
  const progress = useRef(0);
  const metrics = useRef({ trackH: 0, thumbH: 0 });
  const [ticks, setTicks] = useState([]);

  // ── render loop + metrics ──
  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let idleT;
    const getY = () => (lenis ? lenis.scroll : scrollY);
    const hudPct = () => document.querySelectorAll('[data-scroll-pct]');

    const render = () => {
      raf = 0;
      if (disposed || !thumb.current || !readout.current || !track.current || !bar.current) return;
      const p = clamp01(getY() / maxScroll());
      progress.current = p;
      const { trackH, thumbH } = metrics.current;
      thumb.current.style.transform = `translate3d(0, ${p * (trackH - thumbH)}px, 0)`;
      const txt = pad(p);
      readout.current.textContent = txt;
      track.current.setAttribute('aria-valuenow', Math.round(p * 100));
      track.current.setAttribute('aria-valuetext', `${Math.round(p * 100)} percent`);
      bar.current.style.transform = `scaleX(${p})`;
      hudPct().forEach((el) => { el.textContent = txt; });
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(render); };

    const wake = () => {
      if (disposed || !rail.current) return;
      rail.current.classList.remove('is-idle');
      clearTimeout(idleT);
      idleT = setTimeout(() => rail.current?.classList.add('is-idle'), 2000);
    };
    const onScroll = () => { request(); wake(); };

    const measure = () => {
      if (disposed || !track.current || !thumb.current) return;
      const t = track.current.getBoundingClientRect();
      metrics.current = { trackH: t.height, thumbH: thumb.current.offsetHeight };
      const m = maxScroll();
      setTicks(sections.map((s) => {
        const el = document.getElementById(s.id);
        return { ...s, at: el ? clamp01((el.getBoundingClientRect().top + getY()) / m) : 0 };
      }));
      request();
    };

    if (lenis) lenis.on('scroll', onScroll);
    else addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure);
    addEventListener('load', measure);
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure); // content height changes (images, data)
    ro.observe(document.body);
    measure();
    wake();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(idleT);
      if (lenis) lenis.off('scroll', onScroll);
      else removeEventListener('scroll', onScroll);
      removeEventListener('resize', measure);
      removeEventListener('load', measure);
      ro.disconnect();
    };
  }, [lenis, sections]);

  const jumpTo = (p, eased = true) => scrollTo(clamp01(p) * maxScroll(), { immediate: !eased || reducedMotion() });

  // ── drag the thumb ──
  const onThumbDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    el.classList.add('is-drag');
    const startY = e.clientY;
    const startP = progress.current;
    const { trackH, thumbH } = metrics.current;
    const move = (ev) => jumpTo(startP + (ev.clientY - startY) / Math.max(1, trackH - thumbH), false);
    const up = () => {
      el.classList.remove('is-drag');
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  // ── click the rail to jump ──
  const onTrackDown = (e) => {
    if (!track.current || e.target !== track.current) return;
    const r = track.current.getBoundingClientRect();
    const { trackH, thumbH } = metrics.current;
    jumpTo((e.clientY - r.top - thumbH / 2) / Math.max(1, trackH - thumbH));
  };

  // ── keyboard ──
  const onKey = (e) => {
    const y = progress.current * maxScroll();
    const steps = {
      ArrowDown: y + 80, ArrowUp: y - 80,
      PageDown: y + innerHeight * 0.9, PageUp: y - innerHeight * 0.9, ' ': y + innerHeight * 0.9,
      Home: 0, End: maxScroll(),
    };
    if (!(e.key in steps)) return;
    e.preventDefault();
    scrollTo(Math.max(0, Math.min(maxScroll(), steps[e.key])), { immediate: reducedMotion() });
  };

  return (
    <>
      <div className="rail" ref={rail}>
        <button type="button" className="rail-arrow" aria-label="Scroll to top" onClick={() => wipe(() => scrollTo(0, { immediate: true }))}>
          <svg viewBox="0 0 10 8" aria-hidden="true"><path d="M5 0 L10 8 H0Z" /></svg>
        </button>
        <div className="rail-body">
          <div
            className="rail-track" ref={track} role="scrollbar" tabIndex={0}
            aria-controls="main" aria-orientation="vertical" aria-label="Page scroll position"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}
            onPointerDown={onTrackDown} onKeyDown={onKey}
          >
            <div className="rail-thumb" ref={thumb} onPointerDown={onThumbDown} data-cursor="drag" data-cursor-label="Drag">
              <span className="rail-pct" ref={readout} aria-hidden="true">000%</span>
            </div>
          </div>
          <nav className="rail-ticks" aria-label="Sections">
            {ticks.map((t) => (
              <button key={t.id} type="button" className={`rail-tick ${active === t.id ? 'is-active' : ''}`}
                style={{ top: `${t.at * 100}%` }} aria-current={active === t.id ? 'true' : undefined}
                onClick={() => onSelect(t.id)}>
                <span className="rail-tick-label">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button type="button" className="rail-arrow rail-arrow--down" aria-label="Scroll to bottom" onClick={() => wipe(() => scrollTo(maxScroll(), { immediate: true }))}>
          <svg viewBox="0 0 10 8" aria-hidden="true"><path d="M5 8 L10 0 H0Z" /></svg>
        </button>
      </div>
      <div className="top-progress" ref={bar} aria-hidden="true" />
    </>
  );
}
