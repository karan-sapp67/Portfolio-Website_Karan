// PROJECTS / "MISSIONS": the star of the site.
// Desktop: full-viewport mission panels in a sticky stack. Each panel enters rotated -2deg at 0.96
// and settles while the one underneath sinks back. On enter, a red slash sweeps the frame, the
// screenshot reveals on a diagonal (scale 1.15 → 1) and a stamp lands. Mockups tilt in 3D toward
// the cursor while their solid shadow shifts the other way.
// Everything is generated from the data: filter chips (ALL / INTERNSHIP / HACKATHON / DESIGN /
// PERSONAL / RESEARCH), the "XX TARGETS" counter, the progress ticks and the Valencia banner. With more than
// 10 projects, the top 9 get panels and the rest open in a lightbox from the ALL MISSIONS list.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects as fallback } from '../data/index.js';
import { useApi } from '../lib/api.js';
import { useScroll, reducedMotion } from '../lib/scroll.jsx';
import { useWipe } from '../components/Wipe.jsx';
import { SectionHead, SlantButton } from '../components/ui.jsx';
import MissionMock from '../components/MissionMock.jsx';
import ScreenFrame from '../components/ScreenFrame.jsx';

const pad = (n) => String(n).padStart(2, '0');
const FILTERS = ['ALL', 'INTERNSHIP', 'HACKATHON', 'DESIGN', 'PERSONAL', 'RESEARCH'];
const DONE = ['Live', 'Shipped'];

function Links({ p }) {
  return (
    <div className="mission-actions">
      {p.live ? (
        <SlantButton href={p.live} data-cursor-label="Open" aria-label={`${p.title}: live site (opens in a new tab)`}>Live</SlantButton>
      ) : (
        <span className="slant-btn is-off" aria-disabled="true"><span>{p.valencia ? 'Live: private' : 'Live: n/a'}</span></span>
      )}
      {p.github ? (
        <SlantButton href={p.github} data-cursor-label="Code" aria-label={`${p.title}: source on GitHub (opens in a new tab)`}>GitHub</SlantButton>
      ) : (
        <span className="slant-btn is-off" aria-disabled="true"><span>{p.valencia ? 'Code: company' : 'Code: soon'}</span></span>
      )}
    </div>
  );
}

function Details({ p, num, total, idPrefix }) {
  return (
    <>
      <p className="mission-kicker reveal">
        <span className="mission-num num" aria-hidden="true">{num}</span>
        <span className="label">Mission {num} / {pad(total)}</span>
      </p>
      {p.valencia && <p className="mission-tag label reveal">Internship · Valencia Nutrition</p>}
      <h3 className="mission-title reveal" id={`${idPrefix}-t`}>{p.title}</h3>
      <p className="mission-sub label reveal">{p.subtitle}</p>
      <p className="mission-desc reveal">{p.description}</p>
      <ul className="chips reveal" aria-label="Tech stack">
        {(Array.isArray(p.tech) ? p.tech : []).slice(0, 6).map((t) => <li key={t} className="chip"><span>{t}</span></li>)}
      </ul>
      <dl className="mission-table reveal">
        <div><dt className="label">Role</dt><dd>{p.role}</dd></div>
        <div><dt className="label">Status</dt><dd>{p.status}</dd></div>
        <div><dt className="label">Year</dt><dd>{p.year}</dd></div>
      </dl>
      {p.valencia && <p className="mission-disclaimer reveal">Built during internship, company owns the product.</p>}
      <div className="reveal"><Links p={p} /></div>
    </>
  );
}

function Mission({ p, i, total }) {
  const num = pad(i + 1);
  const done = DONE.includes(p.status);
  return (
    <article className={`mission ${i % 2 ? 'mission--flip' : ''}`} id={`mission-${i + 1}`}
      data-cursor={p.cursor || 'view'} data-cursor-label="View mission" aria-labelledby={`mission-${i + 1}-t`} style={{ zIndex: (i + 1) * 2 }}>
      <div className="mission-inner">
        <div className="mission-dim" aria-hidden="true" />
        <div className="mission-grid">
          <div className="mission-media">
            <div className="mission-slab" aria-hidden="true" />
            <div className="mission-frame"><MissionMock project={p} index={i} /></div>
            <div className="mission-slash" aria-hidden="true" />
            <p className={`mission-stamp ${done ? 'is-done' : ''}`} aria-hidden="true">{done ? 'Mission complete' : 'Target acquired'}</p>
          </div>
          <div className="mission-info"><Details p={p} num={num} total={total} idPrefix={`mission-${i + 1}`} /></div>
        </div>
      </div>
    </article>
  );
}

function MissionDialog({ p, num, total, onClose }) {
  const box = useRef(null);
  const { lenis } = useScroll();
  useEffect(() => {
    lenis?.stop();
    const prev = document.activeElement;
    box.current?.querySelector('button')?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => { lenis?.start(); removeEventListener('keydown', onKey); prev?.focus(); };
  }, [lenis, onClose]);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="md-t" ref={box} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lightbox-frame mission-dialog">
        <button type="button" className="hud-btn lightbox-close" onClick={onClose}><span>Close</span></button>
        <div className="mission-dialog-body"><Details p={p} num={num} total={total} idPrefix="md" /></div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { data } = useApi('/projects', fallback);
  const projects = Array.isArray(data) ? data : fallback;
  const root = useRef(null);
  const progress = useRef(null);
  const [filter, setFilter] = useState('ALL');
  const [current, setCurrent] = useState(0);
  const [dialog, setDialog] = useState(null);
  const { scrollTo } = useScroll();
  const wipe = useWipe();

  const shown = useMemo(() => (filter === 'ALL' ? projects : projects.filter((p) => p.categories?.includes(filter))), [projects, filter]);
  const featured = useMemo(() => (shown.length > 10 ? shown.slice(0, 9) : shown), [shown]);
  const closeDialog = useCallback(() => setDialog(null), []);
  const total = shown.length;
  const valenciaCount = projects.filter((p) => p.valencia).length;
  const firstValencia = featured.findIndex((p) => p.valencia);

  const applyFilter = (f) => {
    if (f === filter) return;
    wipe(() => {
      setFilter(f);
      scrollTo('#projects', { immediate: true });
    });
  };

  // roving focus across the filter tabs
  const onTabKey = (e) => {
    const i = FILTERS.indexOf(filter);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: FILTERS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const f = FILTERS[(next + FILTERS.length) % FILTERS.length];
    applyFilter(f);
    e.currentTarget.querySelector(`[data-filter="${f}"]`)?.focus();
  };

  useLayoutEffect(() => {
    if (!root.current) return;
    const reduced = reducedMotion();
    let offTilt = () => {};
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('.mission');

      // progress ticks: which mission is on screen, and whether the stack is in view
      panels.forEach((p, i) => ScrollTrigger.create({
        trigger: p, start: 'top 55%', end: 'bottom 55%',
        onToggle: (st) => st.isActive && setCurrent(i),
      }));
      const stack = root.current.querySelector('.missions-stack');
      if (stack) ScrollTrigger.create({
        trigger: stack, start: 'top 50%', end: 'bottom 50%',
        onToggle: (st) => progress.current?.classList.toggle('is-on', st.isActive),
      });
      if (reduced) return;

      // reveal: red slash sweeps the frame, diagonal image reveal (scale 1.15 → 1), details stagger,
      // then the stamp lands with a small shake
      panels.forEach((p) => {
        const q = gsap.utils.selector(p);
        gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 60%', toggleActions: 'play none none none' } })
          .fromTo(q('.mission-slash'), { xPercent: -140, autoAlpha: 1 }, { xPercent: 140, duration: 0.5, ease: 'power3.inOut', immediateRender: false })
          .set(q('.mission-slash'), { autoAlpha: 0 })
          .fromTo(q('.mission-frame'), { clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)' }, { clipPath: 'polygon(0 0, 130% 0, 100% 100%, -30% 100%)', duration: 0.5, ease: 'power3.inOut' }, 0.08)
          .fromTo(q('.device-parallax > *'), { scale: 1.15 }, { scale: 1, duration: 0.9, ease: 'power3.out' }, 0.08)
          .from(q('.reveal'), { y: 24, autoAlpha: 0, duration: 0.35, stagger: 0.06, ease: 'power3.out' }, 0.15)
          .fromTo(q('.mission-stamp'), { scale: 2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2)' }, 0.55)
          .to(q('.mission-stamp'), { x: 3, duration: 0.05, yoyo: true, repeat: 3 }, 0.85);
      });

      // sticky stack choreography (desktop only)
      gsap.matchMedia().add('(min-width: 900px) and (min-height: 600px)', () => {
        panels.forEach((p, i) => {
          if (i > 0) {
            gsap.fromTo(p, { rotate: -2, scale: 0.96 }, { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'top top', scrub: true } });
          }
          const next = panels[i + 1];
          if (next) {
            const st = { trigger: next, start: 'top bottom', end: 'top top', scrub: true };
            gsap.fromTo(p.querySelector('.mission-inner'), { scale: 1, rotate: 0 }, { scale: 0.92, rotate: -1.5, ease: 'none', immediateRender: false, scrollTrigger: st });
            gsap.fromTo(p.querySelector('.mission-dim'), { autoAlpha: 0 }, { autoAlpha: 0.7, ease: 'none', immediateRender: false, scrollTrigger: st });
          }
          // subtle screenshot parallax inside the frame
          gsap.fromTo(p.querySelector('.device-parallax'), { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      });

      // 3D tilt toward the cursor (max 6deg); the solid shadow shifts the opposite way
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const offs = q2(panels).map(({ media, wrap, shadow }) => {
          gsap.set(wrap, { transformPerspective: 900 });
          const rx = gsap.quickTo(wrap, 'rotationX', { duration: 0.4, ease: 'power3' });
          const ry = gsap.quickTo(wrap, 'rotationY', { duration: 0.4, ease: 'power3' });
          const sx = gsap.quickTo(shadow, 'x', { duration: 0.4, ease: 'power3' });
          const sy = gsap.quickTo(shadow, 'y', { duration: 0.4, ease: 'power3' });
          const move = (e) => {
            if (!media?.isConnected) return;
            const r = media.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            ry(nx * 12); rx(-ny * 12); sx(-nx * 20); sy(-ny * 20);
          };
          const leave = () => { rx(0); ry(0); sx(0); sy(0); };
          media.addEventListener('pointermove', move);
          media.addEventListener('pointerleave', leave);
          return () => { media.removeEventListener('pointermove', move); media.removeEventListener('pointerleave', leave); };
        });
        offTilt = () => offs.forEach((f) => f());
      }
    }, root);
    return () => { offTilt(); ctx.revert(); };
  }, [featured]);

  return (
    <section id="projects" className="projects" ref={root} aria-labelledby="projects-h">
      <ScreenFrame num="01" name="Missions" desc="Target acquired · every mission so far" />
      <div className="projects-head">
        <SectionHead title="Missions" id="projects-h" num={pad(total)} meta="Targets" />
        <div className="tabbar mission-filters" role="tablist" aria-label="Filter missions" onKeyDown={onTabKey}>
          {FILTERS.map((f) => (
            <button key={f} type="button" role="tab" data-filter={f} aria-selected={filter === f} tabIndex={filter === f ? 0 : -1}
              aria-controls="missions-stack" className="tab" data-cursor-label="Filter" onClick={() => applyFilter(f)}>
              <span>{f}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="missions-stack" id="missions-stack" role="tabpanel" aria-label={`${total} missions`}>
        {featured.map((p, i) => (
          <MissionAndBanner key={`${filter}-${i}`} p={p} i={i} total={total}
            banner={i === firstValencia ? { count: valenciaCount, showButton: filter !== 'INTERNSHIP', onAll: () => applyFilter('INTERNSHIP') } : null} />
        ))}
        {!featured.length && <p className="empty-note missions-empty">No missions in this category yet.</p>}
      </div>

      <nav className="mission-progress" ref={progress} aria-label="Mission progress">
        <p className="mission-progress-count num" aria-hidden="true">{pad(Math.min(current + 1, featured.length))}<small>/{pad(featured.length)}</small></p>
        <ol>
          {featured.map((p, i) => (
            <li key={`${filter}-${i}`}>
              <button type="button" className={`mp-tick ${i <= current ? 'is-filled' : ''}`} aria-label={`Mission ${i + 1}: ${p.title}`}
                aria-current={i === current ? 'step' : undefined} onClick={() => scrollTo(`#mission-${i + 1}`)} />
            </li>
          ))}
        </ol>
      </nav>

      <div className="all-missions">
        <h3 className="all-missions-title label">All missions</h3>
        <ol className="am-list">
          {shown.map((p, i) => {
            const isPanel = i < featured.length;
            return (
              <li key={`${filter}-${i}`}>
                <button type="button" className="am-row" data-cursor-label={isPanel ? 'Go' : 'Open'}
                  onClick={() => (isPanel ? scrollTo(`#mission-${i + 1}`) : setDialog(i))}>
                  <span className="am-num num">{pad(i + 1)}</span>
                  <span className="am-title">{p.title}</span>
                  <span className="am-meta">{p.valencia ? 'Valencia · ' : ''}{p.role}</span>
                  <span className="am-meta">{p.status}</span>
                  <span className="am-meta">{p.year}</span>
                  <span className="am-arrow" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      {dialog !== null && shown[dialog] && (
        <MissionDialog p={shown[dialog]} num={pad(dialog + 1)} total={total} onClose={closeDialog} />
      )}
    </section>
  );
}

function MissionAndBanner({ p, i, total, banner }) {
  return (
    <>
      <Mission p={p} i={i} total={total} />
      {banner && (
        <aside className="valencia-banner" id="valencia" style={{ zIndex: (i + 1) * 2 + 1 }} aria-label="Valencia Nutrition internship apps">
          <p className="vb-text">
            <span className="vb-name">Valencia Nutrition Ltd.</span>
            <span className="vb-count num">{pad(banner.count)}</span>
            <span className="label">Internship apps</span>
          </p>
          {banner.showButton && <SlantButton onClick={banner.onAll} data-cursor-label="Filter">View all Valencia apps</SlantButton>}
        </aside>
      )}
    </>
  );
}

// media + tilt target (the frame) + its solid red slab, which acts as the shadow
function q2(panels) {
  return panels.map((p) => ({
    media: p.querySelector('.mission-media'),
    wrap: p.querySelector('.mission-frame'),
    shadow: p.querySelector('.mission-slab'),
  })).filter((x) => x.media && x.wrap && x.shadow);
}
