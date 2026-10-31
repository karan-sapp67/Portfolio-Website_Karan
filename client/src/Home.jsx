// Home: loader → title intro → screens, plus the persistent HUD, menu overlay and scroll rail.
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Loader from './components/Loader.jsx';
import Hud from './components/Hud.jsx';
import ScrollRail from './components/ScrollRail.jsx';
import SoundButton from './components/SoundButton.jsx';
import { MENU, MenuOverlay } from './components/MainMenu.jsx';
import { useWipe } from './components/Wipe.jsx';
import { TRANSITION_FOR, useTransitions } from './components/menu/TransitionLayer.jsx';
import { useScroll, reducedMotion } from './lib/scroll.jsx';
import { startMotion } from './lib/motion.js';
import Heist from './sections/Heist.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Projects from './sections/Projects.jsx';
import About from './sections/About.jsx';
import Hideout from './sections/Hideout.jsx';
import Status from './sections/Status.jsx';
import Journey from './sections/Journey.jsx';
import Contact from './sections/Contact.jsx';

export default function Home() {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('top');
  const menuBtn = useRef(null);
  const wipe = useWipe();
  const { play } = useTransitions();
  const { lenis, scrollTo } = useScroll();

  // loader finishes once fonts are in (min 600ms so it reads, well under 2s)
  useEffect(() => {
    const min = new Promise((r) => setTimeout(r, 600));
    const cap = new Promise((r) => setTimeout(r, 1500));
    Promise.race([Promise.all([document.fonts?.ready, min]), cap]).then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (loaded && !menuOpen) lenis.start();
    else lenis.stop();
  }, [lenis, loaded, menuOpen]);

  // dev-only QA hook: ?qa=p0.52 (intro progress), ?qa=about (section), ?qa=menu (open menu),
  // ?qa=f-INTERNSHIP (apply a mission filter)
  useEffect(() => {
    if (!import.meta.env.DEV || !loaded) return;
    const qa = new URLSearchParams(location.search).get('qa');
    if (!qa) return;
    const t = setTimeout(() => {
      if (qa === 'menu') { setMenuOpen(true); return; }
      if (qa.startsWith('f-')) { setTimeout(() => document.querySelector(`[data-filter="${qa.slice(2)}"]`)?.click(), 500); return; }
      if (/^p[\d.]+$/.test(qa)) {
        const st = ScrollTrigger.getAll().find((x) => x.pin);
        if (st) scrollTo(st.start + (st.end - st.start) * parseFloat(qa.slice(1)), { immediate: true });
        return;
      }
      setTimeout(() => scrollTo(`#${qa}`, { immediate: true }), 500);
    }, 400);
    return () => clearTimeout(t);
  }, [loaded, scrollTo]);

  // page-load orchestration: HUD drops in, then the scroll rail slides in
  useEffect(() => {
    if (!loaded || reducedMotion()) return;
    const tl = gsap.timeline()
      .from('.hud', { yPercent: -140, duration: 0.4, ease: 'power3.out' })
      .from('.rail', { x: 80, autoAlpha: 0, duration: 0.35, ease: 'power3.out' }, 0.15);
    return () => tl.revert();
  }, [loaded]);

  // motion catalogue: magnetic buttons, velocity skew, counters, bars, heading reveals, stickers
  // All section shells mount immediately; start decorative motion after the loader.
  useEffect(() => (loaded ? startMotion() : undefined), [loaded]);

  // active section → HUD tag + rail tick
  useEffect(() => {
    if (!loaded) return;
    const triggers = [
      // the intro is pinned, so it stays "active" until Projects reaches mid-screen
      ...(document.getElementById('top') && document.getElementById('projects') ? [
        ScrollTrigger.create({ trigger: document.getElementById('top'), start: 'top top', endTrigger: document.getElementById('projects'), end: 'top 50%', onToggle: (s) => s.isActive && setActive('top') }),
      ] : []),
      // Create triggers only for existing section targets.
      ...MENU.filter((m) => document.getElementById(m.id)).map((m) => ScrollTrigger.create({
        trigger: `#${m.id}`, start: 'top 50%', end: 'bottom 50%',
        onToggle: (s) => s.isActive && setActive(m.id),
      })),
    ];
    ScrollTrigger.sort(); // keep refresh order = page order even if the pin was (re)created later
    ScrollTrigger.refresh();
    return () => triggers.forEach((t) => t.kill());
  }, [loaded]);

  const go = useCallback((id) => {
    setMenuOpen(false);
    wipe(() => {
      scrollTo(`#${id}`, { immediate: true });
      const h = document.querySelector(`#${id} h2`);
      h?.setAttribute('tabindex', '-1');
      h?.focus({ preventScroll: true });
    });
  }, [wipe, scrollTo]);

  // a menu choice plays that item's own transition; the page jumps when the screen is covered
  const goMenu = useCallback((id, opts) => {
    return play(TRANSITION_FOR[id], {
      ...opts,
      onCovered: () => {
        setMenuOpen(false);
        scrollTo(`#${id}`, { immediate: true });
        const h = document.querySelector(`#${id} h2`);
        h?.setAttribute('tabindex', '-1');
        h?.focus({ preventScroll: true });
      },
    });
  }, [play, scrollTo]);

  // All targets already exist when the intro hands off.
  const skipIntro = useCallback(() => {
    setTimeout(() => scrollTo('#projects'), 50);
  }, [scrollTo]);

  const finishLoading = useCallback(() => setLoaded(true), []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuBtn.current?.focus();
  }, []);

  const label = active === 'top' ? 'TITLE' : MENU.find((m) => m.id === active)?.label.toUpperCase();

  return (
    <>
      <a className="skip" href="#projects">Skip to projects</a>
      {!loaded && <Loader ready={ready} onDone={finishLoading} />}
      <Hud section={label} menuOpen={menuOpen} menuBtnRef={menuBtn}
        onMenu={() => setMenuOpen(true)} onTop={() => wipe(() => scrollTo(0, { immediate: true }))} />
      <MenuOverlay open={menuOpen} onClose={closeMenu} onSelect={goMenu} />
      <ScrollRail sections={MENU} active={active} onSelect={go} />
      {loaded && <SoundButton />}
      <main id="main">
        <ErrorBoundary id="top" name="Heist"><Heist onSkip={skipIntro} /></ErrorBoundary>
        <ErrorBoundary id="projects" name="Projects"><Projects /></ErrorBoundary>
        <ErrorBoundary id="about" name="About"><About /></ErrorBoundary>
        <ErrorBoundary id="hideout" name="Hideout"><Hideout /></ErrorBoundary>
        <ErrorBoundary id="status" name="Status"><Status /></ErrorBoundary>
        <ErrorBoundary id="journey" name="Journey"><Journey /></ErrorBoundary>
        <ErrorBoundary id="contact" name="Contact"><Contact /></ErrorBoundary>
      </main>
    </>
  );
}
