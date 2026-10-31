// THE HEIST: the cinematic intro. Scroll is the player's input: one master timeline of 100 units,
// pinned and scrubbed (scroll back up and it reverses cleanly).
//   0-12   Night city: 4 parallax skyline layers, halftone moon, speed lines, SCROLL TO INFILTRATE,
//          whisper "TAKE YOUR TIME."
//   12-35  The climb: layers parallax at 0.2x / 0.5x / 1x / 1.6x with a slight tilt;
//          "TARGET: YOUR ATTENTION" slams in at 25, a MISSION START stamp, then "I AM THOU, THOU ART I."
//   35-55  The card throw: the ring-style CallingCard spins in on a curved path with a ghost trail, then
//          impact (screen shake, red shockwave, one-frame white flash) and a steady 35% ring
//   55-75  The reveal: the card holds (~8%) so TAKE YOUR HEART reads, tears on a diagonal and
//          bursts into shards, revealing the portrait; the name slams in; the tagline rises
//   75-92  Freeze-frame punch: negative flash, then the hero resolves with a giant
//          "SHOW TIME" line beside the portrait, stickers and clip tiles
//   92-100 Release: a red slab wipes across and hands off to Projects
// Mobile / low-power: shorter (~300vh), 3 layers, 8 shards. Reduced motion: static hero, no pin.
import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import StickerArt from '../components/StickerArt.jsx';
import CallingCard, { CardFace } from '../components/CallingCard.jsx';
import Portrait from '../components/Portrait.jsx';
import { fanShards, skylineLayer } from '../lib/heistArt.js';
import { reducedMotion, useScroll } from '../lib/scroll.jsx';

const NAME = ['KARAN', 'SAPALIA'];
const TAGLINE = 'MERN Stack Developer & UI Designer';
const TILT = [-3, 2, -1, 3, -2, 1, -2.5, 2.5, -1.5, 1.5, -3, 2];

const isLite = () =>
  matchMedia('(max-width: 899px)').matches ||
  (navigator.hardwareConcurrency || 8) <= 4 ||
  (navigator.deviceMemory || 8) <= 4;

const LAYERS = [
  { id: 'far', speed: 0.2, cfg: { seed: 3, h: 700, minW: 40, maxW: 110, minH: 280, maxH: 660 } },
  { id: 'mid', speed: 0.5, cfg: { seed: 8, h: 600, minW: 60, maxW: 140, minH: 220, maxH: 540, windows: 0.16 } },
  { id: 'near', speed: 1, cfg: { seed: 13, h: 500, minW: 90, maxW: 210, minH: 150, maxH: 430, windows: 0.12, antennas: 0.25 } },
  { id: 'roof', speed: 1.6, cfg: { seed: 21, h: 260, minW: 180, maxW: 420, minH: 70, maxH: 150, antennas: 0.8 } },
];

function Skyline({ id, data }) {
  return (
    <svg className={`sky-layer sky-${id}`} viewBox={`0 0 1600 ${data.h}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      {data.buildings.map((b, i) => <rect key={i} className="bld" x={b.x} y={b.y} width={b.w} height={b.h} />)}
      {data.windows.map((w, i) => (
        <rect key={`w${i}`} className={`win ${w.flick ? 'win--flick' : ''}`} x={w.x} y={w.y} width="8" height="10" style={w.flick ? { animationDelay: `${w.delay}ms` } : undefined} />
      ))}
      {data.antennas.map((a, i) => (
        <g key={`a${i}`} className="ant">
          <line x1={a.x} y1={a.y} x2={a.x} y2={a.y - a.len} />
          {a.dish ? <path d={`M${a.x - 9} ${a.y - a.len * 0.6} L${a.x + 9} ${a.y - a.len * 0.6 - 7}`} /> : <line x1={a.x - 7} y1={a.y - a.len * 0.7} x2={a.x + 7} y2={a.y - a.len * 0.7} />}
          <rect className="ant-light" x={a.x - 2} y={a.y - a.len - 4} width="4" height="4" />
        </g>
      ))}
    </svg>
  );
}

function ClipTile({ game, title }) {
  return (
    <div className="h-tile" aria-hidden="true">
      <div className="h-tile-art"><span className="a" /><span className="b" /><span className="play" /></div>
      <p className="h-tile-meta"><span className="h-tile-game">{game}</span><span className="h-tile-title">{title}</span></p>
    </div>
  );
}

export default function Heist({ onSkip }) {
  const root = useRef(null);
  const reduced = reducedMotion();
  const lite = useMemo(() => isLite(), []);
  const { scrollTo } = useScroll();
  const layers = useMemo(() => (lite ? LAYERS.slice(1) : LAYERS).map((l) => ({ ...l, data: skylineLayer(l.cfg) })), [lite]);
  const shards = useMemo(() => fanShards(lite ? 8 : 14, 9), [lite]);

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    let offMove;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: lite ? '+=200%' : '+=400%',
          pin: true, scrub: 0.8, anticipatePin: 1,
        },
      });
      tl.set({}, {}, 100); // 100 units = 100% of the intro

      // ── Beat 1: night city ──
      tl.fromTo(q('.ring-fill'), { strokeDashoffset: 113 }, { strokeDashoffset: 0, duration: 12 }, 0)
        .to(q('.speed'), { xPercent: 40, duration: 35 }, 0)
        .to(q('.moon'), { y: '-6vh', duration: 35 }, 0)
        .to(q('.infiltrate, .whisper'), { autoAlpha: 0, y: -16, duration: 3 }, 11);

      // ── Beat 2: the climb ──
      layers.forEach((l) => tl.to(q(`.sky-${l.id}`), { y: `${l.speed * 28}vh`, duration: 23, ease: 'power1.inOut' }, 12));
      tl.to(q('.skyline'), { rotate: -2.5, duration: 12, ease: 'power1.inOut' }, 12)
        .to(q('.skyline'), { rotate: 0, duration: 11, ease: 'power1.inOut' }, 24)
        .fromTo(q('.slam'), { scale: 2.6, rotate: -14, autoAlpha: 0 }, { scale: 1, rotate: -4, autoAlpha: 1, duration: 3, ease: 'back.out(2)' }, 25)
        .fromTo(q('.slam .slam-l'), { yPercent: -60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2)' }, 25.4)
        .fromTo(q('.stamp-start'), { scale: 2, rotate: -24, autoAlpha: 0 }, { scale: 1, rotate: -12, autoAlpha: 1, duration: 2, ease: 'back.out(2)' }, 28.5)
        .to(q('.slam-wrap'), { x: 6, duration: 0.3, yoyo: true, repeat: 3 }, 30)
        .fromTo(q('.thou-line'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1.5 }, 31)
        .to(q('.slam-wrap'), { autoAlpha: 0, y: '-12vh', duration: 3, ease: 'power2.in' }, 33.5);

      // ── Beat 3: the card throw ──
      const throwPath = (el, at) => {
        tl.fromTo(el, { x: '-70vw' }, { x: 0, duration: 10, ease: 'power2.out' }, at)
          .fromTo(el, { y: '70vh' }, { y: 0, duration: 10, ease: 'power4.out', immediateRender: false }, at)
          .fromTo(el, { rotate: -900, scale: 0.4 }, { rotate: -3, scale: 1, duration: 10, ease: 'power3.out', immediateRender: false }, at);
      };
      tl.set(q('.card-fly'), { autoAlpha: 1 }, 36);
      throwPath(q('.card-assembly'), 36);
      q('.card-ghost').forEach((g, i) => throwPath(g, 36.8 + i * 0.8));
      tl.to(q('.card-ghost'), { autoAlpha: 0, duration: 1 }, 46.5)
        // impact
        .to(q('.cam'), { x: 8, y: -6, duration: 0.25 }, 46)
        .to(q('.cam'), { x: -8, y: 5, duration: 0.25 })
        .to(q('.cam'), { x: 5, y: -3, duration: 0.25 })
        .to(q('.cam'), { x: 0, y: 0, duration: 0.25 })
        .fromTo(q('.shock'), { scale: 0.2, autoAlpha: 1 }, { scale: 3.2, autoAlpha: 0, duration: 5, ease: 'power2.out' }, 46)
        .fromTo(q('.card-ring'), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 3, ease: 'power3.out' }, 46.5)
        .fromTo(q('.flash'), { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.2, yoyo: true, repeat: 1 }, 46)
        // the rings pulse outward once on impact (they also spin slowly via CSS)
        .fromTo(q('.card-whole .cc-rings'), { scale: 1 }, { scale: 1.1, duration: 0.6, yoyo: true, repeat: 1, ease: 'power2.out' }, 46);

      // ── Beat 4: hold so TAKE YOUR HEART reads, then tear + reveal ──
      tl.set(q('.heist-portrait'), { autoAlpha: 1 }, 55)
        .fromTo(q('.tear-line'), { scaleX: 0 }, { scaleX: 1, duration: 2.5, ease: 'power3.in' }, 55)
        .set(q('.card-whole'), { autoAlpha: 0 }, 57.5)
        .set(q('.shard'), { autoAlpha: 1 }, 57.5)
        .set(q('.card-assembly'), { backgroundColor: 'transparent', outlineColor: 'transparent' }, 57.5)
        .to(q('.tear-line'), { autoAlpha: 0, duration: 0.5 }, 57.5)
        .to(q('.card-ring'), { autoAlpha: 0, scale: 1.3, duration: 3 }, 57.5);
      q('.shard').forEach((s, i) => {
        const d = shards[i];
        tl.to(s, { x: `${d.dx}vw`, y: `${d.dy}vh`, rotate: d.rot, autoAlpha: 0, duration: 8, ease: 'power3.out' }, 57.5 + (i % 4) * 0.4);
      });
      tl.fromTo(q('.heist-portrait .portrait'), { scale: 1.12 }, { scale: 1, duration: 9, ease: 'power2.out' }, 57.5)
        .fromTo(q('.hn-l'), { scale: 2.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, stagger: 0.55, ease: 'back.out(2)' }, 63)
        .fromTo(q('.tagline-inner'), { yPercent: 105 }, { yPercent: 0, duration: 3, ease: 'power3.out' }, 71);

      // ── Beat 5: freeze-frame punch ──
      tl.fromTo(q('.negative'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, yoyo: true, repeat: 1 }, 75)
        .to(q('.skyline, .moon, .halftone-panel'), { autoAlpha: 0.32, duration: 4 }, 76)
        .fromTo(q('.heart-line'), { xPercent: 30, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 4, ease: 'power3.out' }, 76.5)
        .fromTo(q('.h-sticker'), { scale: 0, rotate: -40, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 2, stagger: 0.8, ease: 'back.out(3)' }, 78)
        .fromTo(q('.h-tile'), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 3, stagger: 1, ease: 'power3.out' }, 80);

      // ── Beat 6: release ──
      tl.fromTo(q('.release'), { x: 0, xPercent: -130, skewX: -14, autoAlpha: 1 }, { xPercent: 0, autoAlpha: 1, duration: 8, ease: 'power2.inOut' }, 92);

      // gentle mouse parallax: portrait max 8px + 3deg tilt, tiles and stickers a little more
      if (matchMedia('(pointer: fine)').matches && q('.portrait-px')[0]) {
        const px = q('.portrait-px')[0];
        gsap.set(px, { transformPerspective: 900 });
        const pX = gsap.quickTo(px, 'x', { duration: 0.6, ease: 'power3' });
        const pY = gsap.quickTo(px, 'y', { duration: 0.6, ease: 'power3' });
        const rX = gsap.quickTo(px, 'rotationX', { duration: 0.6, ease: 'power3' });
        const rY = gsap.quickTo(px, 'rotationY', { duration: 0.6, ease: 'power3' });
        const others = q('.px').map((el) => ({ d: +el.dataset.depth, x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' }) }));
        const onMove = (e) => {
          const nx = e.clientX / innerWidth - 0.5;
          const ny = e.clientY / innerHeight - 0.5;
          pX(nx * 16); pY(ny * 16); rY(nx * 6); rX(-ny * 6);
          others.forEach((o) => { o.x(nx * 30 * o.d); o.y(ny * 20 * o.d); });
        };
        addEventListener('pointermove', onMove, { passive: true });
        offMove = () => removeEventListener('pointermove', onMove);
      }
    }, root);
    return () => { offMove?.(); ctx.revert(); };
  }, [reduced, lite, layers, shards]);

  return (
    <section ref={root} id="top" className={`heist ${reduced ? 'heist--static' : ''} ${lite ? 'heist--lite' : ''}`} aria-label="Intro">
      <div className="cam">
        <div className="moon" aria-hidden="true" />
        <div className="halftone-panel" aria-hidden="true" />
        <div className="skyline" aria-hidden="true">
          {layers.map((l) => <Skyline key={l.id} id={l.id} data={l.data} />)}
        </div>
        <div className="speedlines-diag" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="speed" style={{ '--i': i }} />)}
        </div>

        <div className="heist-hero">
          <div className="hero-copy">
            <h1 className="hero-name" aria-label={`Karan Sapalia, ${TAGLINE}`}>
              {NAME.map((word, w) => (
                <span key={word} className="hn-word" aria-hidden="true">
                  {[...word].map((ch, i) => {
                    const k = w * 5 + i;
                    return <span key={i} className={`hn-l ${k % 2 ? 'hn-wb' : 'hn-bw'} ${k % 5 === 2 ? 'hn-red' : ''}`} style={{ '--r': `${TILT[k % TILT.length]}deg` }}>{ch}</span>;
                  })}
                </span>
              ))}
            </h1>
            <p className="tagline" aria-hidden="true"><span className="tagline-inner">{TAGLINE}</span></p>
            <div className="h-tiles">
              <div className="px" data-depth="0.6"><ClipTile game="FIFA" title="Last-minute winner" /></div>
              <div className="px" data-depth="0.9"><ClipTile game="VALORANT" title="Ace on Ascent" /></div>
            </div>
            {reduced && <CallingCard className="card-static" />}
          </div>

          <p className="heart-line" aria-hidden="true">Show time</p>
          <div className="portrait-col">
            <div className="portrait-box">
              <div className="heist-portrait"><div className="portrait-px"><Portrait variant="hero" priority /></div></div>
              <div className="card-fly" aria-hidden="true">
                <span className="card-ring" />
                <div className="card-slot">
                  {[0, 1, 2].map((i) => <div key={i} className="card-ghost" style={{ '--o': 0.45 - i * 0.13 }} />)}
                  <div className="card-assembly">
                    {shards.map((s, i) => <div key={i} className="shard" style={{ clipPath: s.clip }}><CardFace /></div>)}
                    {/* one intact face sits on top until the tear, so shard seams never show */}
                    <div className="card-whole"><CardFace /></div>
                    <span className="tear-line" />
                  </div>
                </div>
                <span className="shock" />
              </div>
            </div>
          </div>
        </div>

        <div className="slam-wrap" aria-hidden="true">
          <p className="slam">
            {'TARGET: YOUR ATTENTION'.split(' ').map((w, wi) => (
              <span key={w} className="slam-w">{[...w].map((c, i) => <span key={i} className={`slam-l ${(wi + i) % 2 ? 'hn-wb' : 'hn-bw'}`}>{c}</span>)}</span>
            ))}
          </p>
          <p className="stamp-start">Mission start</p>
          <p className="thou-line">I am thou, thou art I.</p>
        </div>

        <div className="h-stickers" aria-hidden="true">
          {[['star', 'hs-a', 0.9], ['crosshair', 'hs-b', 0.6]].map(([t, c, d]) => (
            <div key={t} className={`sticker h-sticker px ${c}`} data-depth={d}><div className="drift"><StickerArt type={t} /></div></div>
          ))}
        </div>
      </div>

      <div className="infiltrate" aria-hidden="true">
        <svg className="ring" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" className="ring-bg" /><circle cx="20" cy="20" r="18" className="ring-fill" /></svg>
        <span className="infiltrate-tag"><span>Scroll to infiltrate</span></span>
      </div>
      <p className="whisper" aria-hidden="true">Take your time.</p>
      <div className="flash" aria-hidden="true" />
      <div className="negative" aria-hidden="true" />
      <div className="release" aria-hidden="true" />
      {!reduced && (
        <button type="button" className="slant-btn skip-intro" onClick={() => (onSkip ? onSkip() : scrollTo('#projects'))}>
          <span><i className="ptr" aria-hidden="true" />Skip intro</span>
        </button>
      )}
    </section>
  );
}
