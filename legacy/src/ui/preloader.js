// Percentage counter that eases to 90% while assets load, then completes and wipes away.
import { gsap } from 'gsap';

export function runPreloader(loading) {
  const root = document.getElementById('preloader');
  const num = document.getElementById('pre-num');
  const bar = document.getElementById('pre-bar');
  const state = { v: 0 };
  const paint = () => {
    num.textContent = Math.round(state.v);
    bar.style.transform = `scaleX(${state.v / 100})`;
  };

  gsap.to(state, { v: 90, duration: 1.4, ease: 'power2.out', onUpdate: paint });

  return loading.catch(() => {}).then(
    () =>
      new Promise((resolve) => {
        gsap.killTweensOf(state);
        gsap.timeline({ onComplete: resolve })
          .to(state, { v: 100, duration: 0.5, ease: 'power2.inOut', onUpdate: paint })
          .to(root, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power4.inOut', delay: 0.15 })
          .set(root, { display: 'none' });
      }),
  );
}
