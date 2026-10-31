// Scrubbed timeline for the ~500vh opening sequence. One progress value (0-1) drives the
// particle scene and the DOM overlays, so everything stays in lock-step with the scrollbar.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHeroScroll({ scene, collage }) {
  const canvas = document.getElementById('hero-canvas');
  const hint = document.getElementById('hero-hint');
  const name = document.getElementById('hero-name');
  const tag = document.getElementById('hero-tag');
  const proxy = { p: 0 };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#hero-track',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1, // 1s of smoothing gives the weighty, trailing feel
    },
  });

  tl.to(proxy, { p: 1, duration: 1, onUpdate: () => scene.setProgress(proxy.p) }, 0)
    // 0-20% void: hint fades in, then out as the fly-through starts
    .fromTo(hint, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.02)
    .to(hint, { opacity: 0, duration: 0.06 }, 0.17)
    // 80-100% reveal: crisp HTML name resolves, tagline slides up through its mask
    .fromTo(name, { opacity: 0, filter: 'blur(14px)', scale: 1.04 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.1, clearProps: 'filter' }, 0.8)
    .fromTo(tag, { yPercent: 110 }, { yPercent: 0, duration: 0.08, ease: 'power3.out' }, 0.89)
    .to(canvas, { opacity: 0, duration: 0.08 }, 0.82);

  // collage: cards fly in from both edges, stickers pop, then everything is hoverable/draggable
  tl.fromTo(collage.bg, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.84);
  collage.slots.forEach((s, i) => {
    tl.fromTo(s.el, { autoAlpha: 0, x: s.side === 'left' ? -380 : 380 }, { autoAlpha: 1, x: 0, duration: 0.07, ease: 'power3.out' }, 0.84 + i * 0.006);
  });
  collage.stickers.forEach((el, i) => {
    tl.fromTo(el, { autoAlpha: 0, scale: 0.2, rotation: -30 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.05, ease: 'back.out(2)' }, 0.9 + i * 0.008);
  });

  return tl;
}

/** Reduced-motion / no-WebGL: simple fade-in hero (see .hero--static in CSS). */
export function initStaticHero() {
  document.getElementById('top').classList.add('hero--static');
}
