// Original angular domino mask (the site's emblem; not any official logo). Red fill, thick black
// mitered outline, pointed notch at the nose bridge, off-white parallelogram eye holes, a small
// black shard under the center and faint white diagonal shine lines.
// `simple` = small-size variant for favicons / badges: no shard, no shine, bigger eye holes.
import { useId } from 'react';

const MASK = '6,62 34,26 96,24 120,38 144,24 206,26 234,62 214,98 160,106 132,94 120,72 108,94 80,106 26,98';
const EYE_L = '46,52 100,49 93,76 39,79';
const EYE_R = '140,49 194,52 201,79 147,76';
const EYE_L_BIG = '40,48 104,45 96,82 32,85';
const EYE_R_BIG = '136,45 200,48 208,85 144,82';

/** x / y / width / height position it inside another <svg> (the menu character wears it). */
export default function MaskEmblem({ className = '', simple = false, halo = false, title, x, y, width, height }) {
  const id = `mask${useId().replace(/:/g, '')}`; // unique per instance (the intro renders many copies)
  return (
    <svg viewBox="-12 -12 264 164" x={x} y={y} width={width} height={height} className={`mask-emblem ${className}`} role={title ? 'img' : undefined}
      aria-label={title} aria-hidden={title ? undefined : 'true'} focusable="false">
      <defs>
        <clipPath id={`${id}-clip`}><polygon points={MASK} /></clipPath>
      </defs>
      {halo && <polygon points={MASK} fill="none" stroke="#F5F5F0" strokeWidth="26" strokeLinejoin="miter" strokeMiterlimit="8" />}
      <polygon points={MASK} fill="#E60012" stroke="#0A0A0A" strokeWidth={simple ? 14 : 10} strokeLinejoin="miter" strokeMiterlimit="8" />
      {!simple && (
        <g clipPath={`url(#${id}-clip)`} stroke="#F5F5F0" strokeWidth="2.5" opacity="0.55">
          <line x1="40" y1="110" x2="110" y2="10" />
          <line x1="58" y1="110" x2="128" y2="10" />
          <line x1="150" y1="110" x2="220" y2="10" />
        </g>
      )}
      <polygon points={simple ? EYE_L_BIG : EYE_L} fill="#F5F5F0" stroke="#0A0A0A" strokeWidth={simple ? 8 : 6} strokeLinejoin="miter" />
      <polygon points={simple ? EYE_R_BIG : EYE_R} fill="#F5F5F0" stroke="#0A0A0A" strokeWidth={simple ? 8 : 6} strokeLinejoin="miter" />
      {!simple && <polygon points="110,112 130,112 120,134" fill="#0A0A0A" />}
    </svg>
  );
}
