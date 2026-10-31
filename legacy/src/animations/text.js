// Text splitting helpers (no paid SplitText plugin needed).

/** Wrap each word of `el` in <span class="word">; returns the spans. */
export function splitWords(el) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.innerHTML = text
    .split(/\s+/)
    .map((w) => `<span class="word" aria-hidden="true">${w}</span>`)
    .join(' ');
  return [...el.querySelectorAll('.word')];
}

/** Wrap each word in a clipping mask for slide-up reveals; returns the inner spans. */
export function splitMask(el) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.innerHTML = text
    .split(/\s+/)
    .map((w) => `<span class="mask" aria-hidden="true"><span class="inner">${w}</span></span>`)
    .join(' ');
  return [...el.querySelectorAll('.inner')];
}
