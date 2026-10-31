// Character-style portrait, natural colour by default.
// Reads /images/photo-manifest.json (written by `npm run photo`) to serve AVIF/WebP/JPG at
// 480/800/1200. Prefers a transparent cut-out; otherwise a clean slanted rectangular crop on the
// red slab. If no photo exists, an original silhouette placeholder appears (never a broken image).
// --photo-mode: natural | duotone (tokens.css) switches the colour treatment.
import { useEffect, useState } from 'react';
import { PHOTO } from '../config/photo.js';

const DIR = '/images';
let found;

async function resolvePortrait() {
  try {
    const res = await fetch(`${DIR}/photo-manifest.json`, { cache: 'no-cache' });
    if (res.ok && /json/.test(res.headers.get('content-type') || '')) {
      const m = await res.json();
      const set = m.cutout || m.photo;
      if (set?.files?.length) return { kind: m.cutout ? 'cutout' : 'photo', ...set };
    }
  } catch { /* fall through to a direct probe */ }
  // no manifest: try the raw files directly
  for (const [file, kind] of [['karan.png', 'cutout'], ['karan.jpg', 'photo']]) {
    const ok = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = `${DIR}/${file}`; });
    if (ok) return { kind, width: ok.naturalWidth, height: ok.naturalHeight, single: `${DIR}/${file}` };
  }
  console.info('[portrait] No photo found. Add client/public/images/karan.jpg (or a transparent karan.png), then run `npm run photo`.');
  return null;
}

// one lookup for the whole page, started at load so the hero has it before the reveal
const findPortrait = () => (found ||= resolvePortrait());
findPortrait();

function Picture({ p, priority, sizes }) {
  if (p.single) {
    return <img className="portrait-img" src={p.single} alt={PHOTO.alt} width={p.width} height={p.height} decoding="async"
      fetchPriority={priority ? 'high' : 'auto'} style={{ objectPosition: PHOTO.objectPosition }} />;
  }
  const srcset = (ext) => p.files.map((f) => `${DIR}/${f.name}.${ext} ${f.w}w`).join(', ');
  const largest = p.files[p.files.length - 1];
  return (
    <picture>
      <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
      <img className="portrait-img" src={`${DIR}/${largest.name}.${p.fallback}`} srcSet={srcset(p.fallback)} sizes={sizes}
        alt={PHOTO.alt} width={p.width} height={p.height} decoding="async"
        fetchPriority={priority ? 'high' : 'auto'} loading={priority ? 'eager' : 'lazy'}
        style={{ objectPosition: PHOTO.objectPosition }} />
    </picture>
  );
}

function Silhouette() {
  return (
    <svg className="portrait-placeholder" viewBox="0 0 200 250" role="img" aria-label={`${PHOTO.alt} placeholder`}>
      <rect width="200" height="250" fill="#141414" />
      <path fill="#E60012" d="M100 40 C128 40 144 62 142 92 C140 120 124 140 100 140 C76 140 60 120 58 92 C56 62 72 40 100 40Z" />
      <path fill="#E60012" d="M28 250 C30 196 58 166 100 166 C142 166 170 196 172 250Z" />
      <path fill="#0A0A0A" d="M66 88 L92 92 L88 102 L66 100Z M134 88 L108 92 L112 102 L134 100Z" />
    </svg>
  );
}

/** variant: 'hero' (large, on a red slab) | 'avatar' (small slanted frame) */
export default function Portrait({ variant = 'hero', priority = false }) {
  const [p, setP] = useState(undefined); // undefined = loading, null = missing
  // --photo-mode token (tokens.css): natural | duotone
  const [mode] = useState(() => (getComputedStyle(document.documentElement).getPropertyValue('--photo-mode').trim() === 'duotone' ? 'duotone' : 'natural'));

  useEffect(() => {
    let live = true;
    findPortrait().then((r) => live && setP(r));
    return () => { live = false; };
  }, []);

  const kind = p?.kind ?? 'placeholder';
  const sizes = variant === 'hero' ? '(max-width: 899px) 60vw, 34vw' : '48px';
  return (
    <figure className={`portrait portrait--${variant} portrait--${kind}`} data-mode={mode} data-loading={p === undefined || undefined}>
      {variant === 'hero' && <div className="portrait-slab" aria-hidden="true" />}
      {p === null && <div className="portrait-frame"><Silhouette /></div>}
      {p && kind === 'photo' && <div className="portrait-frame"><Picture p={p} priority={priority} sizes={sizes} /></div>}
      {p && kind === 'cutout' && <Picture p={p} priority={priority} sizes={sizes} />}
    </figure>
  );
}

/** Hidden SVG filter used only when --photo-mode is duotone. */
export function DuotoneDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="p5-duotone" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.04 0.04 0.90 0.96 0.96" />
          <feFuncG type="table" tableValues="0.04 0.04 0.00 0.96 0.96" />
          <feFuncB type="table" tableValues="0.04 0.04 0.07 0.94 0.94" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}
