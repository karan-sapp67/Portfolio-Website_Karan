// Scattered stickers that drift and follow the mouse with depth-based parallax.
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import StickerArt from './StickerArt.jsx';
import { reducedMotion } from '../lib/scroll.jsx';

/** items: [{ type, x: '%', y: '%', size: px, rot: deg, depth: 0-1 }] */
export default function StickerLayer({ items, className = '' }) {
  const root = useRef(null);

  useEffect(() => {
    if (reducedMotion() || !matchMedia('(pointer: fine)').matches) return;
    const els = [...root.current.querySelectorAll('.sticker')];
    const movers = els.map((el) => ({
      d: +el.dataset.depth,
      x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' }),
    }));
    const onMove = (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      movers.forEach((m) => { m.x(nx * 60 * m.d); m.y(ny * 40 * m.d); });
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className={`sticker-layer ${className}`} ref={root} aria-hidden="true">
      {items.map((s, i) => (
        <div key={i} className="sticker" data-depth={s.depth ?? 0.5}
          style={{ left: s.x, top: s.y, width: s.size }}>
          <div className="drift" style={{ '--dur': `${5 + (i % 4)}s` }}>
            <div style={{ transform: `rotate(${s.rot || 0}deg)` }}>
              <StickerArt type={s.type} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
