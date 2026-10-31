// Contact: giant headline, magnetic CTA, copy-to-clipboard email, socials and footer.
import { gsap } from 'gsap';
import { content } from '../content.js';
import { splitMask } from '../animations/text.js';
import { initMagnetic } from '../ui/interactions.js';

export function mountContact({ reduced }) {
  const c = content.contact;
  const el = document.getElementById('contact');
  el.innerHTML = `
    <div class="wrap">
      <p class="eyebrow"><b>05</b>Contact</p>
      <h2 class="contact-h" id="contact-h">Let's work <span class="grad-text">together</span></h2>
      <div class="contact-row">
        <a class="magnetic" href="mailto:${c.email}" data-cursor>Say hello ↗</a>
        <button class="copy-email" type="button" id="copy-email" data-cursor aria-label="Copy email address">
          <span>${c.email}</span><small id="copy-state" aria-live="polite">Copy</small>
        </button>
      </div>
      <nav class="socials" aria-label="Social links">
        <a href="${c.github}" target="_blank" rel="noopener">GitHub</a>
        <a href="${c.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
        ${c.resume ? `<a href="${c.resume}" target="_blank" rel="noopener">Résumé</a>` : ''}
      </nav>
    </div>`;

  document.getElementById('footer').innerHTML = `<span>© ${new Date().getFullYear()} ${content.name}</span><span>Designed &amp; built with care.</span>`;

  const state = document.getElementById('copy-state');
  document.getElementById('copy-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(c.email);
      state.textContent = 'Copied ✓';
    } catch {
      state.textContent = 'Press Ctrl+C';
    }
    setTimeout(() => (state.textContent = 'Copy'), 1800);
  });

  initMagnetic(el.querySelector('.magnetic'));
  if (reduced) return;

  // headline is split by word; the gradient span is kept whole via its own wrapper
  const h = el.querySelector('#contact-h');
  const words = splitMask(h);
  words.forEach((w, i) => i === words.length - 1 && w.classList.add('grad-text'));
  gsap.from(words, { yPercent: 110, stagger: 0.1, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
  gsap.from('.contact-row > *, .socials', { opacity: 0, y: 30, stagger: 0.12, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.contact-row', start: 'top 90%', once: true } });
}
