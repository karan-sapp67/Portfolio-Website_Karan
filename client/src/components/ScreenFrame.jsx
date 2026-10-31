// Shared menu-screen chrome for every section: slanted section tab (number + name), a slim
// right-edge description strip, a bottom key-hint bar (desktop) and a few red/white shard
// accents that drift with scroll (scroll-driven, not looping). Purely decorative: aria-hidden.
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { reducedMotion } from '../lib/scroll.jsx';

const SHARDS = [
  { cls: 'sf-s1', speed: -60, red: true },
  { cls: 'sf-s2', speed: 40, red: false },
  { cls: 'sf-s3', speed: -30, red: true },
  { cls: 'sf-s4', speed: 70, red: false },
  { cls: 'sf-s5', speed: -50, red: true },
];

export default function ScreenFrame({ num, name, desc, hints = true, theme = 'dark' }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const section = root.current.parentElement;
    const ctx = gsap.context(() => {
      root.current.querySelectorAll('[data-speed]').forEach((el) => {
        gsap.fromTo(el, { y: 0 }, {
          y: +el.dataset.speed, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className={`sf sf--${theme}`} ref={root} aria-hidden="true">
      <p className="sf-tab"><span className="sf-num num">{num}</span><span className="sf-name">{name}</span></p>
      {desc && <p className="sf-strip"><span>{desc}</span></p>}
      {hints && <p className="sf-hints"><kbd>Scroll</kbd> Next screen <kbd>Menu</kbd> Jump anywhere</p>}
      {SHARDS.map((s) => <span key={s.cls} className={`sf-shard ${s.cls} ${s.red ? 'is-red' : ''}`} data-speed={s.speed} />)}
    </div>
  );
}
