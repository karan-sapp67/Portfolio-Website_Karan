// Ring-style calling card (SVG + CSS, not a raster): a landscape 7:5 postcard with a full-bleed
// bullseye of wobbly red/black rings, black corners, the original MaskEmblem (white outer stroke)
// with original white swooshes, and "TAKE YOUR HEART" in cut-out lettering under it.
// Reference (layout/composition only): client/src/assets/reference/calling-card-reference.png
// Reused by the intro (rings spin + pulse there), the contact form (children render on the card),
// the 404 page and the share image.
import MaskEmblem from './MaskEmblem.jsx';
import { bullseye } from '../lib/heistArt.js';

const RINGS = bullseye();
const TILT = [-4, 3, -2, 5, -3, 2, -5, 3, -1, 4, -3, 2, -4, 1, 3];
const LIFT = [2, -3, 1, -1, 3, -2, 0, 2, -3, 1, -1, 2, -2, 3, -1];

/** Just the printed face (the intro shards clip copies of it). */
export function CardFace({ title = 'Take your heart', signature = 'K.S.', label, children }) {
  let n = 0;
  return (
    <div className="cc-face">
      <svg className="cc-rings" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <rect width="700" height="500" fill="#0A0A0A" />
        <g className="cc-spin">
          {RINGS.map((pts, i) => <polygon key={i} points={pts} fill={i % 2 ? '#0A0A0A' : '#E60012'} />)}
        </g>
      </svg>
      <span className="cc-grain" aria-hidden="true" />
      {label && <p className="cc-label">{label}</p>}
      {children ?? (
        <>
          <div className="cc-emblem-wrap" aria-hidden="true">
            <svg className="cc-swoosh" viewBox="0 0 120 120">
              <path d="M110 70 C80 66 52 50 30 20 C50 40 74 52 112 56Z" />
              <path d="M108 86 C74 86 40 74 10 50 C40 64 72 74 110 76Z" />
              <path d="M104 100 C80 104 54 98 28 86 C54 92 80 94 106 92Z" />
            </svg>
            <MaskEmblem className="cc-emblem" halo />
          </div>
          <p className="cc-title" aria-label={title}>
            {title.split(' ').map((word, w) => (
              <span key={w} className="cc-word" aria-hidden="true">
                {[...word].map((ch) => {
                  const i = n++;
                  return <span key={i} className="cc-l" style={{ '--r': `${TILT[i % TILT.length]}deg`, '--y': `${LIFT[i % LIFT.length]}px` }}>{ch}</span>;
                })}
              </span>
            ))}
          </p>
        </>
      )}
      <p className="cc-sig">— {signature}</p>
    </div>
  );
}

/** Extra props (onSubmit, noValidate, aria-*) go to the outer element, e.g. as="form". */
export default function CallingCard({ className = '', tilt = -2, as: Tag = 'div', spin = false, title, signature, label, children, ...rest }) {
  return (
    <Tag {...rest} className={`cc ${spin ? 'cc--spin' : ''} ${className}`} style={{ '--cc-tilt': `${tilt}deg` }}>
      <div className="cc-sheet"><CardFace title={title} signature={signature} label={label}>{children}</CardFace></div>
    </Tag>
  );
}
