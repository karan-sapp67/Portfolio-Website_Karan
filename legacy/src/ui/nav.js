// Glass nav: hides on scroll down, returns on scroll up, highlights the active section.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content } from '../content.js';

const LINKS = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['journey', 'Journey'],
  ['contact', 'Contact'],
];

export function mountNav({ lenis }) {
  const nav = document.getElementById('nav');
  const initials = content.name.split(' ').map((w) => w[0]).join('');
  nav.innerHTML = `
    <a class="nav-logo" href="#top" aria-label="Back to top">${initials}<span class="grad-text">.</span></a>
    <nav aria-label="Primary"><ul class="nav-links">
      ${LINKS.map(([id, label]) => `<li><a href="#${id}" data-id="${id}">${label}</a></li>`).join('')}
    </ul></nav>`;

  const links = [...nav.querySelectorAll('[data-id]')];
  LINKS.forEach(([id]) => {
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && links.forEach((a) => a.classList.toggle('active', a.dataset.id === id)),
    });
  });

  // Smooth anchor scrolling through Lenis (falls back to native anchors without it)
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    e.preventDefault();
    lenis.scrollTo(a.getAttribute('href') === '#top' ? 0 : a.getAttribute('href'), { duration: 1.6 });
  });

  let last = 0;
  const onScroll = (y) => {
    nav.classList.toggle('is-hidden', y > last && y > 120);
    last = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
}
