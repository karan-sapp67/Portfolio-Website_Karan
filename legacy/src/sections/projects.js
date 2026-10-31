// Projects: pinned horizontal-scroll gallery on desktop, stacked cards on mobile.
// Cards get tilt, a cursor spotlight and a zooming generated preview.
import { gsap } from 'gsap';
import { content } from '../content.js';
import { splitMask } from '../animations/text.js';
import { initSpotlight, initTilt } from '../ui/interactions.js';

export function mountProjects({ reduced }) {
  const el = document.getElementById('projects');
  el.innerHTML = `
    <div class="proj-pin">
      <div class="proj-head">
        <p class="eyebrow"><b>02</b>Selected work</p>
        <h2 class="h2" id="projects-h">Things I've built</h2>
      </div>
      <div class="proj-track">
        ${content.projects.map((p, i) => `
          <article class="card" style="--hue:${p.hue}">
            <div class="card-visual" role="img" aria-label="Abstract preview artwork for ${p.title}">
              <div class="art"></div><span class="card-num">0${i + 1}</span>
            </div>
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <ul class="chips">${p.tech.map((t) => `<li class="tag">${t}</li>`).join('')}</ul>
            <div class="card-links">
              ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener" aria-label="${p.title} live demo">Live ↗</a>` : ''}
              ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener" aria-label="${p.title} source on GitHub">GitHub ↗</a>` : ''}
            </div>
          </article>`).join('')}
      </div>
    </div>`;

  const cards = [...el.querySelectorAll('.card')];
  initSpotlight(cards);
  initTilt(cards);

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const track = el.querySelector('.proj-track');
    const dist = () => track.scrollWidth - window.innerWidth + 2 * parseFloat(getComputedStyle(track).paddingLeft);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.proj-pin', pin: true, scrub: 1, start: 'top top',
        end: () => `+=${dist()}`, invalidateOnRefresh: true,
      },
    });
  });

  if (!reduced) {
    const inner = splitMask(el.querySelector('#projects-h'));
    gsap.from(inner, {
      yPercent: 110, stagger: 0.06, duration: 1, ease: 'power4.out',
      scrollTrigger: { trigger: '#projects-h', start: 'top 85%', once: true },
    });
  }
}
