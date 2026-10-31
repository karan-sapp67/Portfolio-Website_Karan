// Loader: black screen, red slanted bar with percentage, rotating tips. Finishes in under 2s.
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const TIPS = ['Take your time.', 'Show time.', 'Stealing the show...'];

export default function Loader({ ready, onDone }) {
  const root = useRef(null);
  const num = useRef(null);
  const bar = useRef(null);
  const prog = useRef({ v: 0 });
  const [tip, setTip] = useState(0);

  const paint = () => {
    num.current.firstChild.nodeValue = String(Math.round(prog.current.v)).padStart(3, '0');
    bar.current.style.transform = `scaleX(${prog.current.v / 100})`;
  };

  useEffect(() => {
    const t = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 600);
    gsap.to(prog.current, { v: 85, duration: 0.9, ease: 'power2.out', onUpdate: paint });
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // safety net: animation frames pause in background tabs, so never let the loader block the page
    const fallback = setTimeout(onDone, 2000);
    gsap.killTweensOf(prog.current);
    gsap.timeline({ onComplete: onDone })
      .to(prog.current, { v: 100, duration: 0.3, ease: 'power2.inOut', onUpdate: paint })
      .to(root.current, { clipPath: 'polygon(100% 0, 100% 0, 80% 100%, 80% 100%)', duration: 0.5, ease: 'power3.inOut', delay: 0.1 });
    return () => clearTimeout(fallback);
  }, [ready, onDone]);

  return (
    <div className="loader" ref={root} role="status" aria-live="polite" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}>
      <div className="halftone-corner halftone-corner--tl" aria-hidden="true" />
      <span className="sr-only">Loading</span>
      <div className="loader-num" ref={num} aria-hidden="true">000<small>%</small></div>
      <div className="loader-bar" aria-hidden="true"><i ref={bar} /></div>
      <p className="loader-tip"><span className="label">Tip</span>{TIPS[tip]}</p>
    </div>
  );
}
