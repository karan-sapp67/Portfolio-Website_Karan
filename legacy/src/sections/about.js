// About: statement text whose words light up with scroll, plus a count-up stats row.
import { gsap } from 'gsap';
import { content } from '../content.js';
import { splitWords } from '../animations/text.js';

export function mountAbout({ reduced }) {
  const el = document.getElementById('about');
  el.innerHTML = `
    <div class="wrap">
      <p class="eyebrow"><b>01</b><span id="about-h">About</span></p>
      <div class="about-grid">
        <figure class="portrait">
          <div class="portrait-frame"><img src="${content.portrait}" alt="Portrait of ${content.name}" width="900" height="1600" loading="lazy" /></div>
          <figcaption>Mumbai, India</figcaption>
        </figure>
        <p class="statement" id="statement">${content.bio}</p>
      </div>
      <dl class="stats">
        ${content.stats.map((s) => `<div><dt data-count="${s.value}">${reduced ? s.value : 0}</dt><dd>${s.label}</dd></div>`).join('')}
      </dl>
    </div>`;
  if (reduced) return;

  // portrait drifts slower than the page for a subtle parallax
  gsap.fromTo('.portrait-frame img', { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.portrait', start: 'top bottom', end: 'bottom top', scrub: true } });

  const words = splitWords(el.querySelector('#statement'));
  gsap.fromTo(
    words,
    { opacity: 0.14 },
    {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: '#statement', start: 'top 80%', end: 'bottom 50%', scrub: true },
    },
  );

  el.querySelectorAll('[data-count]').forEach((dt) => {
    const o = { v: 0 };
    gsap.to(o, {
      v: +dt.dataset.count, duration: 1.6, ease: 'power3.out',
      scrollTrigger: { trigger: dt, start: 'top 90%', once: true },
      onUpdate: () => (dt.textContent = Math.round(o.v)),
    });
  });
}
