// Deterministic generators for the Heist intro: skyline layers and card shards.
// Seeded, so the art is identical on every render and between server/client.

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One skyline layer as SVG primitives in a 1600-wide viewBox.
 * @returns {{ h: number, buildings: object[], windows: object[], antennas: object[] }}
 */
export function skylineLayer({ seed, h, minW, maxW, minH, maxH, windows = 0, antennas = 0 }) {
  const r = rng(seed);
  const buildings = [];
  const wins = [];
  const ants = [];
  let x = -40;
  while (x < 1640) {
    const w = Math.round(minW + r() * (maxW - minW));
    const bh = Math.round(minH + r() * (maxH - minH));
    const b = { x, w, h: bh, y: h - bh };
    buildings.push(b);
    if (windows) {
      // window grid; only some are lit, a few flicker
      for (let wy = b.y + 18; wy < h - 20; wy += 22) {
        for (let wx = b.x + 10; wx < b.x + b.w - 14; wx += 18) {
          const roll = r();
          if (roll < windows) wins.push({ x: wx, y: wy, flick: roll < windows * 0.18, delay: Math.round(r() * 3000) });
        }
      }
    }
    if (antennas && r() < antennas) {
      const ax = b.x + 12 + r() * Math.max(4, b.w - 24);
      ants.push({ x: Math.round(ax), y: b.y, len: Math.round(24 + r() * 70), dish: r() < 0.4 });
    }
    x += w + Math.round(r() * 10);
  }
  return { h, buildings, windows: wins, antennas: ants };
}

/**
 * Radial "fan" shards that tile a rectangle exactly (percent clip-paths), plus a flight vector
 * for each one so they can burst outward from the tear point.
 */
export function fanShards(n, seed = 5) {
  const r = rng(seed);
  const cx = 46 + r() * 8;
  const cy = 44 + r() * 10;
  const corner = [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]];
  const P = (t) => {
    const e = Math.floor(t) % 4;
    const f = t - Math.floor(t);
    if (e === 0) return [f * 100, 0];
    if (e === 1) return [100, f * 100];
    if (e === 2) return [100 - f * 100, 100];
    return [0, 100 - f * 100];
  };
  const ts = Array.from({ length: n }, (_, i) => ((i + 0.15 + r() * 0.7) / n) * 4);
  return ts.map((t0, i) => {
    const t1 = i === n - 1 ? ts[0] + 4 : ts[i + 1];
    const pts = [[cx, cy], P(t0)];
    for (let k = Math.ceil(t0); k < t1; k++) pts.push(corner[k % 4 === 0 ? 0 : k % 4]);
    pts.push(P(t1));
    const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length - cx;
    const my = pts.reduce((s, p) => s + p[1], 0) / pts.length - cy;
    const len = Math.hypot(mx, my) || 1;
    const dist = 55 + r() * 45;
    return {
      clip: `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(',')})`,
      dx: (mx / len) * dist, // in vw
      dy: (my / len) * dist * 0.8, // in vh
      rot: (r() < 0.5 ? -1 : 1) * (40 + r() * 140),
    };
  });
}

/**
 * Wobbly concentric rings for the calling card (printed-bullseye look). Returns SVG polygon
 * point strings from the outermost ring inward, in a viewBox centred on (cx, cy).
 */
export function bullseye({ cx = 350, cy = 250, rings = 7, outer = 400, seed = 4, points = 56 } = {}) {
  // outer < half-diagonal (430) so the card's corners stay black
  const r = rng(seed);
  return Array.from({ length: rings }, (_, k) => {
    const R = outer * (1 - k / rings);
    const pts = Array.from({ length: points }, (_, i) => {
      const a = (i / points) * Math.PI * 2;
      const w = R * (1 + (r() - 0.5) * 0.035); // slight print wobble
      return `${(cx + Math.cos(a) * w).toFixed(1)},${(cy + Math.sin(a) * w).toFixed(1)}`;
    });
    return pts.join(' ');
  });
}
