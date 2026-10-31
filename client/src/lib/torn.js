// Generates a jagged "torn paper" clip-path polygon. Deterministic per seed so the edge
// doesn't change between renders.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @param teeth points per long edge, @param amp max tear depth in % */
export function tornClip({ seed = 7, teeth = 22, amp = 3, sides = 3, sideAmp } = {}) {
  const sa = sideAmp ?? amp * 0.6; // side jitter (near-straight sides when small)
  const r = rng(seed);
  const pts = [];
  const side = Math.max(4, Math.round(teeth / sides));
  for (let i = 0; i <= teeth; i++) pts.push([(i / teeth) * 100, r() * amp]); // top
  for (let i = 1; i < side; i++) pts.push([100 - r() * sa, (i / side) * 100]); // right
  for (let i = teeth; i >= 0; i--) pts.push([(i / teeth) * 100, 100 - r() * amp]); // bottom
  for (let i = side - 1; i > 0; i--) pts.push([r() * sa, (i / side) * 100]); // left
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',')})`;
}
