// Journey: a vertical line that draws itself as you scroll, with entries fading in.
import { gsap } from 'gsap';
import { content } from '../content.js';
import { splitMask } from '../animations/text.js';

export function mountJourney({ reduced }) {
  const el = document.getElementById('journey');
  el.innerHTML = `
    <div class="wrap">
      <p class="eyebrow"><b>04</b>Journey</p>
      <h2 class="h2" id="journey-h">Education &amp; milestones</h2>
      <div class="timeline">
        <div class="tl-line-bg" aria-hidden="true"></div><div class="tl-line" aria-hidden="true"></div>
        <ol>
        ${content.timeline.map((t) => `
          <li class="tl-item">
            <p class="tl-when">${t.when} <span class="tl-kind">· ${t.kind}</span></p>
            <h3>${t.title}</h3>${t.text ? `<p>${t.text}</p>` : ''}
          </li>`).join('')}
        </ol>
      </div>
    </div>`;
  if (reduced) { el.querySelector('.tl-line').style.transform = 'none'; return; }

  gsap.from(splitMask(el.querySelector('#journey-h')), { yPercent: 110, stagger: 0.06, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: '#journey-h', start: 'top 85%', once: true } });
  gsap.to('.tl-line', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 70%', scrub: true } });
  gsap.utils.toArray('.tl-item').forEach((item) => {
    gsap.from(item, { opacity: 0, x: 30, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 85%', once: true } });
  });
}
