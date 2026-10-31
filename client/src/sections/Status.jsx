// STATUS (skills): a character status screen. Left: grouped skill list (listbox, arrow keys,
// red slanted highlight). Right: detail panel with a segmented bar, description and related
// missions. Overall stats sit above as segmented bars.
import { useMemo, useRef, useState } from 'react';
import { skills as seedSkills, projects as seedProjects } from '@shared/seedData.js';
import { useApi } from '../lib/api.js';
import { useScroll } from '../lib/scroll.jsx';
import Decor from '../components/Decor.jsx';
import ScreenFrame from '../components/ScreenFrame.jsx';

import { SectionHead } from '../components/ui.jsx';

const GROUPS = ['Languages & Databases', 'Frameworks', 'Tools & Platforms', 'Core Competencies'];
const rank = (level) => Math.max(1, Math.min(5, Math.ceil(level / 20))); // 0-100 → RANK 1-5
const fallback = {
  stats: seedSkills.filter((s) => s.kind === 'stat'),
  items: seedSkills.filter((s) => s.kind === 'skill'),
};

function Segments({ level, label }) {
  const filled = Math.round(level / 10);
  return (
    <span className="segments" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={level} aria-label={label}>
      {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < filled ? 'is-on' : ''} />)}
    </span>
  );
}

export default function Status() {
  const { data } = useApi('/skills', fallback);
  const { data: projects } = useApi('/projects', seedProjects);
  const { scrollTo } = useScroll();
  const list = useRef(null);

  // flat order follows the groups, so arrow keys move top-to-bottom through the list
  const items = useMemo(
    () => GROUPS.flatMap((g) => data.items.filter((s) => s.category === g)).concat(data.items.filter((s) => !GROUPS.includes(s.category))),
    [data.items],
  );
  const [sel, setSel] = useState(0);
  const skill = items[sel] || items[0];

  const onKey = (e) => {
    const next = { ArrowDown: sel + 1, ArrowUp: sel - 1, Home: 0, End: items.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setSel(Math.max(0, Math.min(items.length - 1, next)));
  };

  const missionIndex = (title) => projects.findIndex((p) => p.title === title);

  return (
    <section id="status" className="screen screen--status" aria-labelledby="status-h">
      <ScreenFrame num="04" name="Status" desc="Rank up · skills and tools" />
      <Decor items={[{ type: 'star', pos: 'tr', rot: 10 }, { type: 'mask', pos: 'bl', size: 64, rot: -6 }]} />
      <div className="screen-inner">
        <SectionHead title="Status" id="status-h" meta="Skills" />

        <dl className="stat-bars">
          {data.stats.map((s) => (
            <div key={s.name} className="stat-bar">
              <dt className="label">{s.name}</dt>
              <dd><Segments level={s.level} label={`${s.name}: ${s.level} out of 100`} /><span className="label stat-rank">Rank {rank(s.level)}</span></dd>
            </div>
          ))}
        </dl>

        <div className="status-panels">
          <div className="skill-list" role="listbox" tabIndex={0} ref={list} aria-label="Skills"
            aria-activedescendant={skill ? `skill-${sel}` : undefined} onKeyDown={onKey}>
            {GROUPS.map((g) => {
              const groupItems = items.map((s, i) => [s, i]).filter(([s]) => s.category === g);
              if (!groupItems.length) return null;
              return (
                <div key={g} role="group" aria-labelledby={`grp-${g}`} className="skill-group">
                  <p className="label skill-group-title" id={`grp-${g}`}>{g}</p>
                  {groupItems.map(([s, i]) => (
                    <div key={s.name} id={`skill-${i}`} role="option" aria-selected={i === sel}
                      className={`skill-opt ${i === sel ? 'is-sel' : ''}`}
                      onMouseEnter={() => setSel(i)} onClick={() => { setSel(i); list.current.focus(); }}>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {skill && (
            <article className="skill-detail" aria-live="polite" data-cursor-theme="invert">
              <p className="label skill-cat">{skill.category}</p>
              <h3 className="skill-name">{skill.name}</h3>
              <div className="skill-level">
                <Segments level={skill.level} label={`${skill.name} level: ${skill.level} out of 100`} />
                <span className="num skill-rank">Rank {rank(skill.level)}</span>
              </div>
              <p className="skill-desc">{skill.detail}</p>
              {skill.related?.length > 0 && (
                <div className="skill-related">
                  <p className="label">Used in</p>
                  <ul className="chips">
                    {skill.related.map((t) => {
                      const i = missionIndex(t);
                      return (
                        <li key={t}>
                          {i >= 0 ? (
                            <button type="button" className="chip chip--btn" onClick={() => scrollTo(`#mission-${i + 1}`)}><span>{t}</span></button>
                          ) : (
                            <span className="chip"><span>{t}</span></span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
