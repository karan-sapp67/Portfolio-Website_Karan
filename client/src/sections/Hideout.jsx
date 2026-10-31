// HIDEOUT: gaming library. Slanted filter tabs (arrow keys), a SHUFFLE button, a 3-column grid of
// clip cards (muted preview loop on hover if a file exists) and a lightbox with a slanted red frame.
// A clip is a local file (`src`), a YouTube link (`youtube` video id, official embed) or a
// "CLIP COMING SOON" placeholder. The order is shuffled on every visit; SHUFFLE re-deals it.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { clips as fallback } from '@shared/seedData.js';
import { useApi } from '../lib/api.js';
import { reducedMotion, useScroll } from '../lib/scroll.jsx';
import Decor from '../components/Decor.jsx';
import ScreenFrame from '../components/ScreenFrame.jsx';

import { SectionHead, SlantButton } from '../components/ui.jsx';

const TABS = ['ALL', 'FIFA', 'VALORANT', 'OTHER'];
const VISIT_SEED = Date.now() % 100000; // fixed per page load: a new order every visit, stable across renders

function shuffled(list, seed) {
  const a = [...list];
  let s = seed >>> 0;
  const next = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const thumb = (clip) => clip.poster || (clip.youtube ? `https://i.ytimg.com/vi/${clip.youtube}/hqdefault.jpg` : '');

function ClipArt({ game, seed }) {
  // original abstract poster used when no poster image exists
  return (
    <div className={`clip-poster clip-poster--${game.toLowerCase()} clip-poster--v${seed % 3}`} aria-hidden="true">
      <span className="cp-a" /><span className="cp-b" /><span className="cp-c" />
    </div>
  );
}

function ClipCard({ clip, i, onOpen }) {
  const video = useRef(null);
  const preview = (on) => {
    const v = video.current;
    if (!v) return;
    if (on) v.play().catch(() => {});
    else { v.pause(); v.currentTime = 0; }
  };
  return (
    <li className="clip-card" style={{ '--tilt': `${i % 2 ? 1.5 : -1.5}deg` }}>
      <button type="button" className="clip-btn" onClick={() => onOpen(clip)}
        onMouseEnter={() => preview(true)} onMouseLeave={() => preview(false)}
        onFocus={() => preview(true)} onBlur={() => preview(false)}>
        <div className="clip-thumb">
          {thumb(clip) ? <img src={thumb(clip)} alt="" loading="lazy" decoding="async" /> : <ClipArt game={clip.game} seed={i} />}
          {!clip.src && !clip.youtube && <span className="clip-soon label" aria-hidden="true">Clip coming soon</span>}
          {clip.src && <video ref={video} src={clip.src} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />}
          <span className="clip-play-icon" aria-hidden="true" />
          {clip.duration && <span className="clip-dur num" aria-hidden="true">{clip.duration}</span>}
        </div>
        <span className="clip-info">
          <span className="sr-only">Play clip: </span>
          <span className="clip-tag">{clip.game}</span>
          <span className="clip-name">{clip.title}</span>
        </span>
      </button>
    </li>
  );
}

function Lightbox({ clip, onClose }) {
  const box = useRef(null);
  const { lenis } = useScroll();
  useEffect(() => {
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis]);
  useEffect(() => {
    const prev = document.activeElement;
    box.current.querySelector('button')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') { // keep focus inside
        const f = [...box.current.querySelectorAll('button, video, a, iframe')];
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); prev?.focus(); };
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${clip.title} (${clip.game})`} ref={box} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lightbox-frame">
        <button type="button" className="hud-btn lightbox-close" onClick={onClose}><span>Close</span></button>
        <div className="lightbox-media">
          {clip.youtube ? (
            <iframe className="lightbox-embed" title={`${clip.title} (${clip.game})`} width="560" height="315"
              src={`https://www.youtube.com/embed/${encodeURIComponent(clip.youtube)}?autoplay=1&rel=0&modestbranding=1`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          ) : clip.src ? (
            <video src={clip.src} poster={clip.poster || undefined} controls autoPlay playsInline />
          ) : (
            <div className="lightbox-empty">
              <ClipArt game={clip.game} seed={1} />
              <p className="label">Clip coming soon</p>
            </div>
          )}
        </div>
        <p className="lightbox-title"><span className="clip-tag">{clip.game}</span> {clip.title}</p>
      </div>
    </div>
  );
}

export default function Hideout() {
  const { data: clips } = useApi('/clips', fallback);
  const [tab, setTab] = useState('ALL');
  const [open, setOpen] = useState(null);
  const [deal, setDeal] = useState(0); // bumped by SHUFFLE
  const grid = useRef(null);
  const dealt = useRef(0);
  const shown = useMemo(() => {
    const list = tab === 'ALL' ? clips : clips.filter((c) => c.game === tab);
    return shuffled(list, VISIT_SEED + deal * 7919);
  }, [clips, tab, deal]);

  // SHUFFLE: cards flip in with a stagger (skipped on first paint and for reduced motion)
  useLayoutEffect(() => {
    if (deal === dealt.current) return;
    dealt.current = deal;
    if (reducedMotion() || !grid.current) return;
    gsap.fromTo(grid.current.children, { rotateY: 90, autoAlpha: 0, transformPerspective: 800 }, { rotateY: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.6)', stagger: 0.05, clearProps: 'transform,opacity,visibility' });
  }, [deal]);

  // roving focus across the tab bar
  const onTabKey = (e) => {
    const i = TABS.indexOf(tab);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const t = TABS[(next + TABS.length) % TABS.length];
    setTab(t);
    e.currentTarget.querySelector(`[data-tab="${t}"]`)?.focus();
  };

  return (
    <section id="hideout" className="screen screen--hideout" aria-labelledby="hideout-h">
      <ScreenFrame num="03" name="Hideout" desc="Game clips · FIFA · VALORANT" />
      <Decor items={[{ type: 'controller', pos: 'tr', size: 64, rot: -8 }, { type: 'crosshair', pos: 'bl', size: 48 }]} />
      <div className="screen-inner">
        <SectionHead title="Hideout" id="hideout-h" meta="Welcome to the hideout" />
        <div className="hideout-controls">
        <div className="tabbar" role="tablist" aria-label="Filter clips by game" onKeyDown={onTabKey}>
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" data-tab={t} id={`tab-${t}`} aria-selected={tab === t}
              aria-controls="clip-panel" tabIndex={tab === t ? 0 : -1} className="tab" onClick={() => setTab(t)}>
              <span>{t}</span>
            </button>
          ))}
        </div>
        <SlantButton onClick={() => setDeal((d) => d + 1)} data-cursor-label="Shuffle" aria-label="Shuffle the clips">Shuffle</SlantButton>
        </div>
        <div id="clip-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {shown.length ? (
            <ul className="clip-grid" ref={grid}>{shown.map((c, i) => <ClipCard key={`${tab}-${i}`} clip={c} i={i} onOpen={setOpen} />)}</ul>
          ) : (
            <p className="empty-note">No clips here yet.</p>
          )}
        </div>
      </div>
      {open && <Lightbox clip={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
