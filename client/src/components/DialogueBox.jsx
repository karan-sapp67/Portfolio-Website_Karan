// JRPG dialogue box in the spirit of a Persona conversation: a red name plate with the speaker's
// avatar, short lines that type out one page at a time, *keywords* picked out on red, a bouncing
// "next" marker (click it, click the box or press Enter; clicking mid-line completes the line),
// page pips, and on the last line a short list of choices. Screen readers get all of the text at
// once; reduced motion shows each line instantly.
//   pages:   [{ text: 'Name\'s *Karan*.', big?: true }]   (*word* = highlighted)
//   choices: [{ label, onSelect }]                         (shown after the last line)
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { reducedMotion } from '../lib/scroll.jsx';

// "a *b* c" → [{ t: 'a ' }, { t: 'b', hl: true }, { t: ' c' }]
const parse = (text) => text.split('*').map((t, i) => ({ t, hl: i % 2 === 1 })).filter((s) => s.t);
const plain = (text) => text.replace(/\*/g, '');

function Typed({ segments, n }) {
  let left = n;
  return segments.map((s, i) => {
    if (left <= 0) return null;
    const chunk = s.t.slice(0, left);
    left -= s.t.length;
    return s.hl ? <mark key={i} className="dlg-hl">{chunk}</mark> : <span key={i}>{chunk}</span>;
  });
}

export default function DialogueBox({ name = 'KARAN', pages, speed = 22, avatar = null, choices = [] }) {
  const root = useRef(null);
  const [page, setPage] = useState(0);
  const [shown, setShown] = useState(() => (reducedMotion() ? 999 : 0));
  const [started, setStarted] = useState(() => reducedMotion());

  const segs = useMemo(() => parse(pages[page].text), [pages, page]);
  const length = useMemo(() => plain(pages[page].text).length, [pages, page]);
  const done = shown >= length;
  const last = page === pages.length - 1;

  // start typing the first line once the box is on screen
  useEffect(() => {
    if (started) return undefined;
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(root.current);
    return () => io.disconnect();
  }, [started]);

  // type the current line
  useEffect(() => {
    if (!started || reducedMotion()) return undefined;
    let i = 0;
    const t = setInterval(() => { i += 2; setShown(i); if (i >= length) clearInterval(t); }, speed);
    return () => clearInterval(t);
  }, [started, page, length, speed]);

  const next = useCallback(() => {
    if (!started) return;
    if (!done) { setShown(length); return; } // finish the line
    if (!last) { setPage((p) => p + 1); setShown(reducedMotion() ? 999 : 0); }
  }, [started, done, last, length]);

  const again = () => { setPage(0); setShown(reducedMotion() ? 999 : 0); };

  const all = useMemo(() => pages.map((p) => plain(p.text)).join(' '), [pages]);

  return (
    <div className="dialogue" ref={root}>
      <span className="dialogue-name" aria-hidden="true">
        {avatar}
        <span>{name}</span>
      </span>
      <div className="dialogue-box" onClick={next} data-cursor-label={done && last ? undefined : 'Next'}>
        <p className={`dialogue-text ${pages[page].big ? 'is-big' : ''}`}>
          <span className="sr-only">{all}</span>
          <span aria-hidden="true">
            <Typed segments={segs} n={shown} />
            {!done && <span className="caret" />}
          </span>
        </p>

        {done && last && choices.length > 0 && (
          <ul className="dialogue-choices" aria-label="Choose what to do next">
            {choices.map((c) => (
              <li key={c.label}>
                <button type="button" className="dlg-choice" onClick={(e) => { e.stopPropagation(); c.onSelect(); }} data-cursor-label="Go">
                  <span><i aria-hidden="true" />{c.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button type="button" className="dlg-choice dlg-choice--quiet" onClick={(e) => { e.stopPropagation(); again(); }}>
                <span><i aria-hidden="true" />Talk again</span>
              </button>
            </li>
          </ul>
        )}

        <ol className="dialogue-pips" aria-hidden="true">
          {pages.map((_, i) => <li key={i} className={i === page ? 'is-on' : i < page ? 'is-seen' : ''} />)}
        </ol>
        {done && !last && (
          <button type="button" className="dialogue-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label={`Next line (${page + 1} of ${pages.length})`} />
        )}
      </div>
    </div>
  );
}
