// Full-screen diagonal red/black wipe (~500ms) with a one-frame white flash. wipe(cb) covers the
// screen, runs cb while hidden (e.g. jump to a section), then reveals.
import { createContext, useCallback, useContext, useRef } from 'react';
import { gsap } from 'gsap';
import { reducedMotion } from '../lib/scroll.jsx';

const WipeCtx = createContext(() => {});
const inOut = 'power3.inOut'; // closest GSAP match for --ease-in-out

export function WipeProvider({ children }) {
  const black = useRef(null);
  const red = useRef(null);
  const flash = useRef(null);
  const busy = useRef(false);

  const wipe = useCallback((cb) => {
    if (reducedMotion()) { cb?.(); return; }
    if (busy.current) return;
    busy.current = true;
    const panels = [black.current, red.current];
    gsap.timeline({ onComplete: () => { busy.current = false; } })
      .set(panels, { x: 0, xPercent: -130, skewX: -18, visibility: 'visible' })
      .to(black.current, { xPercent: 0, duration: 0.22, ease: inOut })
      .to(red.current, { xPercent: 0, duration: 0.2, ease: inOut }, 0.03)
      .set(flash.current, { opacity: 0.9 })
      .add(() => cb?.())
      .set(flash.current, { opacity: 0 }, '+=0.016')
      .to(red.current, { xPercent: 130, duration: 0.24, ease: inOut })
      .to(black.current, { xPercent: 130, duration: 0.24, ease: inOut }, '<0.03')
      .set(panels, { visibility: 'hidden' });
  }, []);

  return (
    <WipeCtx.Provider value={wipe}>
      {children}
      <div className="wipe" aria-hidden="true">
        <div className="wipe-panel wipe-panel--black" ref={black} />
        <div className="wipe-panel wipe-panel--red" ref={red} />
        <div className="wipe-flash" ref={flash} />
      </div>
    </WipeCtx.Provider>
  );
}

export const useWipe = () => useContext(WipeCtx);
