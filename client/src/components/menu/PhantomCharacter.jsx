// THE PHANTOM: an original phantom-thief figure for the main menu. Hooded, long dark coat with red
// lining, a flowing red scarf in three segments, gloved hands, and the face covered by the site's own
// MaskEmblem. Not based on any official character. Built from layered SVG parts and animated with
// GSAP using transforms only, so the art can be swapped later (SVG, Lottie, Rive, sprites) without
// touching menu logic: the only contract is <PhantomCharacter pose ref />, ref.confirm(), ref.cardRect().
//   pose: idle | projects | about | hideout | status | journey | contact
// Idle life: breathing (3s sine, 2px), scarf wave (2s, staggered), coat sway, an eye blink every 4-6s
// and a mouse-follow tilt (max 4deg). Reduced motion: no loops, poses switch instantly.
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import MaskEmblem from '../MaskEmblem.jsx';
import { reducedMotion } from '../../lib/scroll.jsx';

const L_PIVOT = '112 232';
const R_PIVOT = '288 232';
const HEAD_PIVOT = '200 190';

// arm angles are degrees about the shoulder (0 = hanging down); the left arm swings toward the
// body with negative values, the right arm with positive ones
const POSES = {
  idle: { L: 6, R: -6, body: 0, head: 0, dip: 0, chest: 1, prop: null, spark: false, stats: false },
  projects: { L: 8, R: -150, body: 0, head: -3, dip: 0, chest: 1, prop: null, spark: true, stats: false }, // pointing at the viewer
  about: { L: -48, R: -8, body: 2, head: 6, dip: 10, chest: 1, prop: null, spark: false, stats: false }, // hand on chest, small bow
  hideout: { L: -45, R: 45, body: -3, head: -4, dip: 0, chest: 1, prop: 'controller', spark: false, stats: false }, // leaning back
  status: { L: -75, R: 75, body: 0, head: 0, dip: 0, chest: 1.05, prop: null, spark: false, stats: true }, // arms crossed, chest out
  journey: { L: -55, R: 55, body: 0, head: 3, dip: 2, chest: 1, prop: 'scroll', spark: false, stats: false },
  contact: { L: 6, R: -95, body: 2, head: 0, dip: 0, chest: 1, prop: 'card', spark: false, stats: false }, // card held toward the viewer
};
const PROPS = ['controller', 'scroll', 'card'];

const PhantomCharacter = forwardRef(function PhantomCharacter({ pose = 'idle', className = '' }, ref) {
  const root = useRef(null);
  const current = useRef(null);
  const statTl = useRef(null);

  const part = (name) => root.current.querySelector(`[data-part="${name}"]`);
  const prop = (name) => root.current.querySelector(`[data-prop="${name}"]`);

  useImperativeHandle(ref, () => ({
    // 150ms confirm gesture: a quick nod, a pop and a one-frame white flash
    confirm() {
      return new Promise((resolve) => {
        const svg = root.current;
        if (!svg || reducedMotion()) { resolve(); return; }
        svg.classList.add('is-flash');
        requestAnimationFrame(() => svg.classList.remove('is-flash'));
        gsap.timeline({ onComplete: resolve })
          .to(svg, { scale: 1.06, duration: 0.075, ease: 'power2.out', transformOrigin: '50% 100%' })
          .to(svg, { scale: 1, duration: 0.075, ease: 'power2.in' }, '>')
          .to(part('head'), { rotation: 9, svgOrigin: HEAD_PIVOT, duration: 0.075, yoyo: true, repeat: 1 }, 0);
      });
    },
    // where the calling card is on screen (the CONTACT transition throws it from here)
    cardRect() {
      return root.current?.querySelector('[data-prop="card"] rect')?.getBoundingClientRect() ?? null;
    },
  }));

  // idle life + mouse-follow tilt
  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.to(part('breath'), { y: 2, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      ['scarf1', 'scarf2', 'scarf3'].forEach((n, i) => {
        gsap.fromTo(part(n), { rotation: -5 }, { rotation: 6, svgOrigin: ['268 214', '332 262', '360 310'][i], duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.18 });
      });
      gsap.fromTo(part('coatL'), { skewX: -2 }, { skewX: 2, svgOrigin: '200 430', duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.fromTo(part('coatR'), { skewX: 2 }, { skewX: -2, svgOrigin: '200 430', duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      // blink: the eye slots flash dark for a moment every 4 to 6 seconds
      const blink = () => {
        gsap.timeline({ delay: 4 + Math.random() * 2, onComplete: blink })
          .set(part('blink'), { autoAlpha: 1 })
          .set(part('blink'), { autoAlpha: 0 }, '+=0.09');
      };
      blink();
    }, root);

    let off = () => {};
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const tilt = gsap.quickTo(part('tilt'), 'rotation', { duration: 0.6, ease: 'power3', svgOrigin: HEAD_PIVOT });
      const move = (e) => tilt(gsap.utils.clamp(-4, 4, (e.clientX / innerWidth - 0.5) * 8));
      addEventListener('pointermove', move, { passive: true });
      off = () => removeEventListener('pointermove', move);
    }
    return () => { off(); ctx.revert(); };
  }, []);

  // pose changes: 250ms tween of part transforms, a pop and a one-frame white flash
  useLayoutEffect(() => {
    const p = POSES[pose] || POSES.idle;
    const instant = reducedMotion() || current.current === null;
    const to = (target, vars) => gsap.to(target, { duration: instant ? 0 : 0.25, ease: 'power3.out', overwrite: 'auto', ...vars });
    to(part('armL'), { rotation: p.L, svgOrigin: L_PIVOT });
    to(part('armR'), { rotation: p.R, svgOrigin: R_PIVOT });
    to(part('card'), { rotation: -p.R, svgOrigin: '288 369' }); // keeps the card upright in the hand
    to(part('pose'), { rotation: p.body, svgOrigin: '200 700' });
    to(part('head'), { rotation: p.head, y: p.dip, svgOrigin: HEAD_PIVOT });
    to(part('torso'), { scale: p.chest, svgOrigin: '200 330' });
    PROPS.forEach((n) => {
      const on = p.prop === n;
      to(prop(n), { autoAlpha: on ? 1 : 0, scale: on ? 1 : 0.6, svgOrigin: n === 'card' ? '288 369' : '200 335' });
    });
    to(part('spark'), { autoAlpha: p.spark ? 1 : 0, scale: p.spark ? 1 : 0.4, svgOrigin: '300 110' });
    // stat bars flicker behind the character on STATUS
    statTl.current?.kill();
    to(part('stats'), { autoAlpha: p.stats ? 1 : 0 });
    if (p.stats && !reducedMotion()) {
      statTl.current = gsap.to(part('stats').children, { scaleX: () => 0.4 + Math.random() * 0.6, transformOrigin: '0% 50%', duration: 0.3, ease: 'steps(3)', stagger: { each: 0.1, repeat: -1, yoyo: true } });
    }
    if (!instant) {
      const svg = root.current;
      svg.classList.add('is-flash');
      requestAnimationFrame(() => svg.classList.remove('is-flash'));
      gsap.fromTo(svg, { scale: 1 }, { scale: 1.04, duration: 0.125, yoyo: true, repeat: 1, ease: 'power2.out', transformOrigin: '50% 100%', overwrite: 'auto' });
    }
    current.current = pose;
    return () => statTl.current?.kill();
  }, [pose]);

  return (
    <svg ref={root} className={`phantom ${className}`} viewBox="-80 0 560 800" aria-hidden="true" focusable="false">
      {/* stat bars behind the figure (STATUS pose) */}
      <g data-part="stats" opacity="0">
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-64} y={250 + i * 56} width={[120, 90, 140, 70, 110][i]} height="20" className={i % 2 ? 'ph-white' : 'ph-red'} />)}
      </g>

      <g data-part="pose">
        <g data-part="breath">
          {/* legs and boots */}
          <polygon points="150,690 196,690 192,780 140,780" className="ph-black" />
          <polygon points="204,690 250,690 260,780 208,780" className="ph-black" />
          <polygon points="130,770 194,770 192,790 126,790" className="ph-white" />
          <polygon points="206,770 266,770 274,790 208,790" className="ph-white" />

          {/* coat tails with red lining */}
          <g data-part="coatL">
            <polygon points="84,424 200,432 196,700 40,730 66,560" className="ph-black" />
            <polygon points="184,432 200,432 196,700 164,694" className="ph-red" />
          </g>
          <g data-part="coatR">
            <polygon points="316,424 200,432 204,700 360,730 334,560" className="ph-black" />
            <polygon points="216,432 200,432 204,700 236,694" className="ph-red" />
          </g>

          {/* torso */}
          <g data-part="torso">
            <polygon points="104,226 296,226 316,430 84,430" className="ph-black" />
            <polygon points="176,230 224,230 214,432 186,432" className="ph-red" />
            <polygon points="88,402 312,402 314,426 86,426" className="ph-ink" />
            <rect x="190" y="404" width="20" height="20" className="ph-white" />
          </g>

          {/* scarf: three chained segments, each waves about its own joint */}
          <g data-part="scarf1">
            <polygon points="256,206 300,214 344,252 332,274 268,242" className="ph-red" />
            <g data-part="scarf2">
              <polygon points="330,262 352,248 384,300 362,322 322,282" className="ph-red" />
              <g data-part="scarf3">
                <polygon points="358,308 382,296 404,352 382,372 350,328" className="ph-red" />
              </g>
            </g>
          </g>

          {/* arms (drawn hanging; the pose rotates them about the shoulders) */}
          <g data-part="armL">
            <polygon points="92,226 132,226 124,350 96,350" className="ph-black" />
            <polygon points="94,340 128,340 126,358 94,358" className="ph-red" />
            <polygon points="92,356 128,356 124,386 96,386" className="ph-white" />
          </g>
          <g data-part="armR">
            <polygon points="308,226 268,226 276,350 304,350" className="ph-black" />
            <polygon points="306,340 272,340 274,358 306,358" className="ph-red" />
            <polygon points="308,356 272,356 276,386 304,386" className="ph-white" />
            {/* calling card held in the right hand (CONTACT) */}
            <g data-prop="card" opacity="0">
              <g data-part="card">
                <rect x="244" y="334" width="104" height="74" className="ph-card" />
                <polygon points="262,372 296,356 330,372 296,390" className="ph-red" />
              </g>
            </g>
          </g>

          {/* props held with both hands */}
          <g data-prop="controller" opacity="0">
            <polygon points="146,318 254,318 270,352 246,368 216,348 184,348 154,368 130,352" className="ph-ctl" />
            <rect x="156" y="328" width="22" height="8" className="ph-red" /><rect x="163" y="321" width="8" height="22" className="ph-red" />
            <rect x="228" y="326" width="10" height="10" className="ph-red" /><rect x="242" y="334" width="10" height="10" className="ph-red" />
          </g>
          <g data-prop="scroll" opacity="0">
            <polygon points="134,318 266,318 266,354 134,354" className="ph-white" />
            <rect x="120" y="310" width="18" height="52" className="ph-red" /><rect x="262" y="310" width="18" height="52" className="ph-red" />
            <rect x="150" y="328" width="70" height="6" className="ph-ink" /><rect x="150" y="340" width="100" height="6" className="ph-ink" />
          </g>

          {/* head: hood, shadowed face, MaskEmblem, blink flash */}
          <g data-part="tilt">
            <g data-part="head">
              <polygon points="128,60 170,14 230,14 272,60 292,140 268,196 132,196 108,140" className="ph-black" />
              <polygon points="150,70 250,70 262,140 246,186 154,186 138,140" className="ph-ink" />
              <polygon points="140,190 260,190 292,238 108,238" className="ph-red" />
              <MaskEmblem x={138} y={96} width={124} height={77} halo />
              <g data-part="blink" opacity="0">
                <polygon points="165,126 191,125 187,137 162,139" className="ph-blink" />
                <polygon points="209,125 235,126 238,139 213,137" className="ph-blink" />
              </g>
            </g>
          </g>

          {/* spark (PROJECTS) */}
          <g data-part="spark" opacity="0">
            <polygon points="300,84 306,104 326,110 306,116 300,136 294,116 274,110 294,104" className="ph-white" />
            <polygon points="352,60 355,70 365,73 355,76 352,86 349,76 339,73 349,70" className="ph-white" />
          </g>
        </g>
      </g>
    </svg>
  );
});

export default PhantomCharacter;
