// Original sticker set (8), drawn as SVG: thick white outline, flat fills.
const O = { stroke: '#F5F5F0', strokeWidth: 7, strokeLinejoin: 'round', strokeLinecap: 'round', paintOrder: 'stroke' };
const RED = '#E60012';
const BLACK = '#0A0A0A';
const WHITE = '#F5F5F0';
const YELLOW = '#FFD400';

const ART = {
  star: <polygon {...O} fill={YELLOW} points="50,6 61,36 94,37 68,57 77,90 50,71 23,90 32,57 6,37 39,36" />,
  heart: <path {...O} fill={RED} d="M50 88 C14 64 6 40 20 26 C32 14 46 20 50 32 C54 20 68 14 80 26 C94 40 86 64 50 88Z" />,
  bubble: (
    <g>
      <path {...O} fill={WHITE} stroke={BLACK} strokeWidth="5" d="M10 14 H90 V64 H48 L28 86 L32 64 H10Z" />
      <path fill={RED} d="M38 26 h8 l-3 24 h-4z M54 26 h8 l-3 24 h-4z M39 54 h6 v6 h-6z M55 54 h6 v6 h-6z" />
    </g>
  ),
  mask: (
    <path {...O} fill={BLACK} fillRule="evenodd"
      d="M4 38 L26 28 L44 36 L50 30 L56 36 L74 28 L96 38 L86 62 L62 64 L50 52 L38 64 L14 62Z M22 42 L38 44 L34 54 L20 52Z M78 42 L62 44 L66 54 L80 52Z" />
  ),
  controller: (
    <g>
      <path {...O} fill={RED} d="M22 30 H78 C90 30 96 44 96 58 C96 72 88 80 80 78 L66 66 H34 L20 78 C12 80 4 72 4 58 C4 44 10 30 22 30Z" />
      <path fill={WHITE} d="M24 46 h6 v-6 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6z" />
      <circle cx="70" cy="46" r="4" fill={WHITE} />
      <circle cx="78" cy="54" r="4" fill={WHITE} />
    </g>
  ),
  crosshair: (
    <g>
      <circle {...O} cx="50" cy="50" r="36" fill={RED} />
      <circle cx="50" cy="50" r="18" fill="none" stroke={WHITE} strokeWidth="5" />
      <path stroke={WHITE} strokeWidth="5" d="M50 8 V30 M50 70 V92 M8 50 H30 M70 50 H92" />
    </g>
  ),
  ball: (
    <g>
      <circle cx="50" cy="50" r="40" fill={WHITE} stroke={BLACK} strokeWidth="5" />
      <polygon fill={BLACK} points="50,34 64,44 59,60 41,60 36,44" />
      <path stroke={BLACK} strokeWidth="4" fill="none" d="M50 34 V12 M64 44 L84 36 M59 60 L72 78 M41 60 L28 78 M36 44 L16 36" />
    </g>
  ),
  code: (
    <g>
      <polygon {...O} fill={RED} points="18,18 96,18 82,82 4,82" />
      <path fill="none" stroke={WHITE} strokeWidth="7" strokeLinejoin="miter" d="M36 36 L22 50 L36 64 M64 36 L78 50 L64 64 M56 30 L44 70" />
    </g>
  ),
};

export const STICKER_TYPES = Object.keys(ART);

export default function StickerArt({ type, className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      {ART[type]}
    </svg>
  );
}

/** Original angular mask emblem for the calling card (not any official logo). */
export function MaskEmblem({ className }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true" focusable="false">
      <path fill={RED} stroke={BLACK} strokeWidth="4" strokeLinejoin="round" fillRule="evenodd"
        d="M2 30 L30 14 L52 24 L60 16 L68 24 L90 14 L118 30 L104 60 L74 62 L60 48 L46 62 L16 60Z M24 34 L46 36 L41 49 L22 47Z M96 34 L74 36 L79 49 L98 47Z" />
      <path fill={BLACK} d="M56 64 L60 78 L64 64Z" />
    </svg>
  );
}
