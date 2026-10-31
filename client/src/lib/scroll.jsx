// Lenis smooth scroll, synced with GSAP ScrollTrigger, exposed through context.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const ScrollCtx = createContext(null);

export function ScrollProvider({ children }) {
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const l = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false });
    l.on('scroll', ScrollTrigger.update);
    const raf = (t) => l.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    // Lenis is an external system created after mount; storing it is the point of this effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(l);
    if (import.meta.env.DEV) window.__lenis = l; // dev-only handle for QA scripts
    return () => { gsap.ticker.remove(raf); l.destroy(); };
  }, []);

  const value = useMemo(() => ({
    lenis,
    /** Jump or glide to a selector / element / pixel offset. */
    scrollTo(target, { immediate = false } = {}) {
      if (lenis) lenis.scrollTo(target, { immediate, force: true, duration: 1.4 });
      else {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        const top = typeof target === 'number' ? target : el?.getBoundingClientRect().top + scrollY;
        window.scrollTo({ top, behavior: immediate || reducedMotion() ? 'auto' : 'smooth' });
      }
    },
  }), [lenis]);

  return <ScrollCtx.Provider value={value}>{children}</ScrollCtx.Provider>;
}

export const useScroll = () => useContext(ScrollCtx);
