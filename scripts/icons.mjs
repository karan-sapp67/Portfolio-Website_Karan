// Icon set + share image.  npm run icons
// Writes to client/public/:
//   favicon.svg (full detail) · favicon-away.svg (hidden-tab swap) · favicon.ico (16/32/48, from a
//   simplified small version) · favicon-32.png · apple-touch-icon.png (180) · icon-192.png ·
//   icon-512.png · icon-maskable-512.png · og-image.png (1200x630) · site.webmanifest
// Art: the site's original angular mask (red, black outline) on a black angular tile with a white
// outline. The og image is rendered with your installed Chrome (puppeteer-core) so it can use the
// site fonts; if Chrome is missing it is skipped with a note.
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { bullseye } from '../client/src/lib/heistArt.js';

const OUT = 'client/public';
const RED = '#E60012';
const BLACK = '#0A0A0A';
const WHITE = '#F5F5F0';

// same geometry as client/src/components/MaskEmblem.jsx (viewBox -12 -12 264 164)
const MASK = '6,62 34,26 96,24 120,38 144,24 206,26 234,62 214,98 160,106 132,94 120,72 108,94 80,106 26,98';
const EYES = ['46,52 100,49 93,76 39,79', '140,49 194,52 201,79 147,76'];
const EYES_BIG = ['40,48 104,45 96,82 32,85', '136,45 200,48 208,85 144,82'];

function mask({ simple, fill = RED, eye = WHITE, halo = true, x, y, w }) {
  const h = (w * 184) / 284;
  const eyes = (simple ? EYES_BIG : EYES).map((p) => `<polygon points="${p}" fill="${eye}" stroke="${BLACK}" stroke-width="${simple ? 8 : 6}" stroke-linejoin="miter"/>`).join('');
  const shine = simple ? '' : `<clipPath id="mc"><polygon points="${MASK}"/></clipPath><g clip-path="url(#mc)" stroke="${WHITE}" stroke-width="2.5" opacity="0.55"><line x1="40" y1="110" x2="110" y2="10"/><line x1="58" y1="110" x2="128" y2="10"/><line x1="150" y1="110" x2="220" y2="10"/></g>`;
  const shard = simple ? '' : `<polygon points="110,112 130,112 120,134" fill="${BLACK}"/>`;
  // white halo keeps the black outline readable on the black tile
  const ring = halo ? `<polygon points="${MASK}" fill="none" stroke="${WHITE}" stroke-width="${simple ? 34 : 26}" stroke-linejoin="miter" stroke-miterlimit="8"/>` : '';
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="-22 -22 284 184">` + ring
    + `<polygon points="${MASK}" fill="${fill}" stroke="${BLACK}" stroke-width="${simple ? 14 : 10}" stroke-linejoin="miter" stroke-miterlimit="8"/>`
    + shine + eyes + shard + '</svg>';
}

// angular tile on a 512 canvas: cut corners, slightly off-square, white outline
const TILE = '40,28 452,12 500,60 484,472 440,500 28,484 12,440 20,72';

function icon({ simple = false, away = false, bleed = false } = {}) {
  const tileFill = away ? RED : BLACK;
  const m = away ? { fill: BLACK, eye: WHITE, halo: false } : {};
  if (bleed) {
    // maskable: full-bleed black, mask inside the 80% safe zone
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${BLACK}"/>${mask({ simple, x: 86, y: 165, w: 340 })}</svg>`;
  }
  const stroke = simple ? 36 : 22;
  const w = simple ? 500 : 430;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">`
    + `<polygon points="${TILE}" fill="${tileFill}" stroke="${WHITE}" stroke-width="${stroke}" stroke-linejoin="miter"/>`
    + mask({ simple, ...m, x: (512 - w) / 2, y: 256 - (w * 184) / 284 / 2 + 6, w })
    + '</svg>';
}

const png = (svg, size, bg) => {
  let img = sharp(Buffer.from(svg), { density: 300 }).resize(size, size);
  if (bg) img = img.flatten({ background: bg });
  return img.png().toBuffer();
};

const full = icon();
const small = icon({ simple: true });
writeFileSync(join(OUT, 'favicon.svg'), full);
writeFileSync(join(OUT, 'favicon-away.svg'), icon({ away: true }));

const [p16, p32, p48] = await Promise.all([16, 32, 48].map((s) => png(small, s)));
writeFileSync(join(OUT, 'favicon.ico'), await pngToIco([p16, p32, p48]));
writeFileSync(join(OUT, 'favicon-32.png'), p32);
writeFileSync(join(OUT, 'apple-touch-icon.png'), await png(full, 180, BLACK)); // iOS ignores transparency
writeFileSync(join(OUT, 'icon-192.png'), await png(full, 192));
writeFileSync(join(OUT, 'icon-512.png'), await png(full, 512));
writeFileSync(join(OUT, 'icon-maskable-512.png'), await png(icon({ bleed: true }), 512));

writeFileSync(join(OUT, 'site.webmanifest'), JSON.stringify({
  name: 'Karan Sapalia — Portfolio',
  short_name: 'K.S.',
  description: 'MERN stack developer and UI designer.',
  start_url: '/',
  display: 'standalone',
  background_color: BLACK,
  theme_color: BLACK,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2) + '\n');
console.log('icons: favicon.svg, favicon-away.svg, favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192/512, maskable, site.webmanifest');

// ── og-image (1200x630): rings card on the right, name + role in the site fonts on the left ──
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!existsSync(CHROME)) {
  console.log(`og-image skipped: Chrome not found at ${CHROME} (set CHROME_PATH).`);
} else {
  const rings = bullseye().map((pts, i) => `<polygon points="${pts}" fill="${i % 2 ? BLACK : RED}"/>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Dela+Gothic+One&family=Inter:wght@600;700&display=block" rel="stylesheet">
<style>
  *{margin:0;box-sizing:border-box} body{width:1200px;height:630px;overflow:hidden;background:${BLACK};color:${WHITE};font-family:Inter,sans-serif;position:relative}
  .slab{position:absolute;left:-60px;top:0;bottom:0;width:150px;background:${RED};transform:skewX(-10deg)}
  .copy{position:absolute;left:120px;top:110px;width:640px}
  .kicker{display:inline-block;padding:6px 14px;background:${WHITE};color:${BLACK};font-weight:700;letter-spacing:.18em;font-size:20px;transform:skewX(-10deg)}
  h1{margin-top:28px;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:118px;line-height:.92;text-transform:uppercase;transform:skewX(-10deg);text-shadow:8px 8px 0 ${RED}}
  .role{margin-top:30px;white-space:nowrap;font-weight:700;font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:${WHITE}}
  .role b{color:${RED}}
  .card{position:absolute;right:70px;top:115px;width:448px;height:320px;rotate:4deg;outline:4px solid ${WHITE};outline-offset:-4px;filter:drop-shadow(14px 14px 0 ${RED});overflow:hidden;background:${BLACK}}
  .card>svg{position:absolute;inset:0;width:100%;height:100%} .em{position:absolute;left:109px;top:56px;width:230px}
  .title{position:absolute;left:0;right:0;bottom:30px;text-align:center;font-family:Anton,Impact,sans-serif;font-size:50px;text-transform:uppercase;color:${WHITE};-webkit-text-stroke:5px ${BLACK};paint-order:stroke fill;transform:skewX(-10deg)}
  .num{position:absolute;right:70px;bottom:40px;font-family:'Dela Gothic One',sans-serif;font-size:22px;color:#9A9A9A}
</style></head><body>
<div class="slab"></div>
<div class="copy"><span class="kicker">PORTFOLIO</span><h1>Karan<br>Sapalia</h1><p class="role">MERN stack developer <b>/</b> UI designer</p></div>
<div class="card"><svg viewBox="0 0 700 500" preserveAspectRatio="xMidYMid slice"><rect width="700" height="500" fill="${BLACK}"/>${rings}</svg>
<div class="em">${mask({ x: 0, y: 0, w: 230 })}</div>
<p class="title">Take your heart</p></div>
<p class="num">— K.S.</p>
</body></html>`;
  const { default: puppeteer } = await import('puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const shot = await page.screenshot({ type: 'png' });
    writeFileSync(join(OUT, 'og-image.png'), await sharp(shot).png({ compressionLevel: 9 }).toBuffer());
    console.log('og-image.png written');
  } finally {
    await browser.close();
  }
}
