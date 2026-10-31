import './styles/main.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content } from './content.js';
import { initSmoothScroll } from './animations/smooth.js';
import { initHeroScroll, initStaticHero } from './animations/heroScroll.js';
import { runPreloader } from './ui/preloader.js';
import { initCursor } from './ui/cursor.js';
import { mountNav } from './ui/nav.js';
import { mountCollage } from './ui/collage.js';
import { mountAbout } from './sections/about.js';
import { mountProjects } from './sections/projects.js';
import { mountSkills } from './sections/skills.js';
import { mountJourney } from './sections/journey.js';
import { mountContact } from './sections/contact.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 768px)').matches || matchMedia('(pointer: coarse)').matches;
const PARTICLES = isMobile ? 3500 : 8000; // tweak particle count here

document.getElementById('hero-name').textContent = content.name;
document.getElementById('hero-tag').innerHTML = content.tagline.replace(
  content.highlight,
  `<strong class="grad-text">${content.highlight}</strong>`,
);

async function boot() {
  const lenis = reduced ? null : initSmoothScroll();
  lenis?.stop();
  initCursor();

  // Heavy bits (three.js + shaders) are loaded lazily so the preloader paints first
  let scene = null;
  const loading = reduced
    ? Promise.resolve()
    : import('./scene/heroScene.js')
        .then(({ createHeroScene }) =>
          createHeroScene(document.getElementById('hero-canvas'), { name: content.name, count: PARTICLES, isMobile }),
        )
        .then((s) => { scene = s; })
        .catch((err) => console.warn('WebGL intro unavailable, using static hero.', err));

  await runPreloader(loading);

  const collage = mountCollage();
  if (scene) initHeroScroll({ scene, collage });
  else {
    initStaticHero();
    collage.showAll();
  }

  // sections are mounted in DOM order so pinned triggers calculate spacing correctly
  mountAbout({ reduced });
  mountProjects({ reduced });
  mountSkills({ reduced });
  mountJourney({ reduced });
  mountContact({ reduced });
  mountNav({ lenis });
  lenis?.start();
  ScrollTrigger.refresh();
}

boot();
