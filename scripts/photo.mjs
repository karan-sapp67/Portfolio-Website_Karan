// Portrait pipeline.
//   npm run photo          → responsive variants (480/800/1200, AVIF + WebP + JPG) + manifest
//   npm run photo:cutout   → also tries to make karan-cutout.png with a background-removal package
// Source: client/public/images/karan.png (transparent) or karan.jpg. Your face is never edited:
// only resized, re-encoded and (optionally) cut out.
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const DIR = 'client/public/images';
const WIDTHS = [480, 800, 1200];
const wantCutout = process.argv.includes('--cutout');

const srcName = ['karan.png', 'karan.jpg', 'karan.jpeg', 'karan.webp'].find((f) => existsSync(join(DIR, f)));
if (!srcName) {
  console.error(`No source photo. Put karan.jpg (or a transparent karan.png) in ${DIR}.`);
  process.exit(1);
}
const src = join(DIR, srcName);

if (wantCutout) {
  try {
    const { removeBackground } = await import('@imgly/background-removal-node');
    const blob = await removeBackground(src);
    writeFileSync(join(DIR, 'karan-cutout.png'), Buffer.from(await blob.arrayBuffer()));
    console.log('Cut-out written: karan-cutout.png');
  } catch (err) {
    console.warn('Cut-out skipped:', err.code === 'ERR_MODULE_NOT_FOUND'
      ? 'install it first with `npm i -D @imgly/background-removal-node`'
      : err.message);
  }
}

async function variants(input, base, keepAlpha) {
  const meta = await sharp(input).metadata();
  const out = [];
  for (const w of WIDTHS) {
    const width = Math.min(w, meta.width); // never upscale
    if (out.some((o) => o.w === width)) continue;
    const img = sharp(input).resize({ width });
    const name = `${base}-${w}`;
    await img.clone().avif({ quality: 55 }).toFile(join(DIR, `${name}.avif`));
    await img.clone().webp({ quality: 80 }).toFile(join(DIR, `${name}.webp`));
    if (keepAlpha) await img.clone().png({ compressionLevel: 9 }).toFile(join(DIR, `${name}.png`));
    else await img.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(join(DIR, `${name}.jpg`));
    const h = Math.round((meta.height / meta.width) * width);
    out.push({ w: width, h, name });
  }
  return { width: meta.width, height: meta.height, files: out, fallback: keepAlpha ? 'png' : 'jpg' };
}

const manifest = { generated: new Date().toISOString() };
const cutoutPath = existsSync(join(DIR, 'karan-cutout.png')) ? join(DIR, 'karan-cutout.png') : srcName === 'karan.png' ? src : null;
if (cutoutPath) manifest.cutout = await variants(cutoutPath, 'karan-cutout', true);
manifest.photo = await variants(src, 'karan', srcName.endsWith('.png'));

writeFileSync(join(DIR, 'photo-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Variants written for ${srcName}${manifest.cutout ? ' (+ cut-out)' : ''} → ${DIR}/photo-manifest.json`);
