// Skills: two counter-scrolling marquees (CSS) plus a grid of glowing chips.
import { gsap } from 'gsap';
import { content } from '../content.js';
import { splitMask } from '../animations/text.js';
import { initSpotlight } from '../ui/interactions.js';

export function mountSkills({ reduced }) {
  const el = document.getElementById('skills');
  const half = Math.ceil(content.skills.length / 2);
  // each row is duplicated so translateX(-50%) loops seamlessly
  const row = (list, cls) => {
    const spans = list.map((s) => `<span>${s}</span>`).join('');
    return `<div class="marquee ${cls}" aria-hidden="true">${spans}${spans}</div>`;
  };
  el.innerHTML = `
    <div class="wrap">
      <p class="eyebrow"><b>03</b>Toolbox</p>
      <h2 class="h2" id="skills-h">Skills &amp; tools</h2>
    </div>
    <div class="marquees">${row(content.skills.slice(0, half), '')}${row(content.skills.slice(half), 'marquee--rev')}</div>
    <div class="wrap">
      <ul class="chip-grid" aria-label="Skills">
        ${content.skills.map((s) => `<li class="chip">${s}</li>`).join('')}
      </ul>
    </div>`;

  const chips = [...el.querySelectorAll('.chip')];
  initSpotlight(chips);

  if (reduced) return;
  const inner = splitMask(el.querySelector('#skills-h'));
  gsap.from(inner, { yPercent: 110, stagger: 0.06, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: '#skills-h', start: 'top 85%', once: true } });
  gsap.from(chips, { opacity: 0, y: 24, stagger: 0.03, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.chip-grid', start: 'top 85%', once: true } });
}
