// JOURNEY: quest-log timeline. A red line draws itself with scroll; each entry stamps in once.
import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { journey as fallback } from '@shared/seedData.js';
import { useApi } from '../lib/api.js';
import { reducedMotion } from '../lib/scroll.jsx';
import Decor from '../components/Decor.jsx';
import ScreenFrame from '../components/ScreenFrame.jsx';

import { SectionHead } from '../components/ui.jsx';

export default function Journey() {
  const { data } = useApi('/journey', fallback);
  // placeholders (date TBA) only show in dev; a group with no real entries is hidden entirely
  const entries = useMemo(() => data.filter((e) => import.meta.env.DEV || e.date !== 'TBA'), [data]);
  const root = useRef(null);

  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.quest-line-fill', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.quest-log', start: 'top 70%', end: 'bottom 70%', scrub: true },
      });
      gsap.utils.toArray('.quest').forEach((q) => {
        gsap.timeline({ scrollTrigger: { trigger: q, start: 'top 80%', toggleActions: 'play none none none' } })
          .from(q.querySelector('.quest-node'), { scale: 2.4, autoAlpha: 0, rotate: -45, duration: 0.3, ease: 'power3.in' })
          .from(q.querySelector('.quest-card'), { x: 40, autoAlpha: 0, duration: 0.35, ease: 'power3.out' }, 0.1);
      });
    }, root);
    return () => ctx.revert();
  }, [entries]);

  return (
    <section id="journey" className="screen screen--journey" ref={root} aria-labelledby="journey-h">
      <ScreenFrame num="05" name="Journey" desc="The story so far" />
      <Decor items={[{ type: 'code', pos: 'tr', rot: -6 }, { type: 'heart', pos: 'bl', size: 48, rot: 10 }]} />
      <div className="screen-inner">
        <SectionHead title="Journey" id="journey-h" meta="The story so far" />
        <div className="quest-log">
          <span className="quest-line" aria-hidden="true"><span className="quest-line-fill" /></span>
          <ol className="quest-list">
          {entries.map((e, i) => (
            <li key={i} className={`quest ${e.date === 'TBA' ? 'quest--todo' : ''}`}>
              <span className="quest-node" aria-hidden="true" />
              <article className="quest-card">
                <header className="quest-head">
                  <span className="quest-date num">{e.date}</span>
                  <span className="label quest-kind">{e.kind}</span>
                </header>
                <h3 className="quest-title">{e.role}</h3>
                <p className="quest-org">{e.org}</p>
                <ul className="quest-bullets">{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                {e.tags?.length > 0 && (
                  <ul className="chips" aria-label="Tags">{e.tags.map((t) => <li key={t} className="chip"><span>{t}</span></li>)}</ul>
                )}
              </article>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
