// Three.js particle scene for the opening sequence. Scroll progress (0-1) is pushed in via
// setProgress(); the phases below map it onto camera + shader uniforms.
import * as THREE from 'three';
import { gsap } from 'gsap';
import vertexShader from './shaders/particles.vert.glsl?raw';
import fragmentShader from './shaders/particles.frag.glsl?raw';

// Phase boundaries (fraction of the hero scroll). Keep in sync with animations/heroScroll.js.
export const PHASES = { flightStart: 0.2, flightEnd: 0.55, convEnd: 0.8 };

const FOV = 50;
const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Rasterise the name to a canvas and return world-space points sampled from the glyphs. */
function sampleName(lines, worldWidth, fontFamily) {
  const W = 900;
  const lineH = 230;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = lines.length * lineH;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = 200;
  ctx.font = `800 ${size}px ${fontFamily}`;
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  size = Math.min(size, (size * W * 0.94) / widest);
  ctx.font = `800 ${size}px ${fontFamily}`;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, lineH * (i + 0.5)));

  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const pts = [];
  for (let y = 0; y < c.height; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 128) {
        pts.push([((x - W / 2) / W) * worldWidth, (-(y - c.height / 2) / W) * worldWidth]);
      }
    }
  }
  // Fisher-Yates so particle index and position on the glyphs are uncorrelated
  for (let i = pts.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  return pts;
}

export async function createHeroScene(canvas, { name, count, isMobile }) {
  const fontFamily = getComputedStyle(document.body).getPropertyValue('--font-display') || 'Syne, sans-serif';
  const family = fontFamily.split(',')[0].trim();
  try { await document.fonts.load(`800 100px ${family}`); } catch { /* fall back to system font */ }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  const scene = new THREE.Scene();

  // Narrow screens stack the name on two lines so it stays legible
  const stacked = window.innerWidth / window.innerHeight < 0.85;
  const lines = stacked ? name.split(' ') : [name];
  const nameWidth = stacked ? 8 : 15;
  const samples = sampleName(lines, nameWidth, family);

  // ── Geometry: a long tunnel of particles, each with a target on the name ──
  const position = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const rand = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    position[i * 3] = (Math.random() - 0.5) * 80;
    position[i * 3 + 1] = (Math.random() - 0.5) * 50;
    position[i * 3 + 2] = -70 + Math.random() * 95;
    const s = samples[i % samples.length];
    target[i * 3] = s[0] + (Math.random() - 0.5) * 0.06;
    target[i * 3 + 1] = s[1] + (Math.random() - 0.5) * 0.06;
    target[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    for (let k = 0; k < 4; k++) rand[i * 4 + k] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));

  const uniforms = {
    uTime: { value: 0 },
    uConv: { value: 0 },
    uStretch: { value: 0 },
    uBright: { value: 0.4 },
    uPx: { value: 1 },
    uSize: { value: isMobile ? 1.5 : 1.25 },
    uAspect: { value: 1 },
    uNameW: { value: stacked ? 8 : 15 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  // ── Sizing: camera end-distance is chosen so the name fills ~72% of the viewport width ──
  let startZ = 40;
  let endZ = 14;
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    const aspect = w / h;
    const pr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR at 2
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    uniforms.uPx.value = pr;
    uniforms.uAspect.value = aspect;
    endZ = nameWidth / ((aspect > 1.2 ? 0.58 : 0.72) * 2 * Math.tan((FOV / 2) * (Math.PI / 180)) * aspect);
    startZ = endZ + 28;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── State ──
  let progress = 0;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const onMove = (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let inView = true;
  const io = new IntersectionObserver(([en]) => (inView = en.isIntersecting));
  io.observe(canvas);

  function render(time) {
    // pause when the tab is hidden or the hero is scrolled away
    if (!inView || document.hidden) return;
    const p = progress;
    const flight = smooth(PHASES.flightStart, PHASES.flightEnd, p);
    uniforms.uTime.value = time;
    uniforms.uConv.value = smooth(PHASES.flightEnd, PHASES.convEnd, p);
    uniforms.uStretch.value = Math.sin(Math.PI * flight) * 5;
    uniforms.uBright.value = 0.4 + 0.6 * smooth(0.1, 0.4, p);

    camera.position.z = startZ + (endZ - startZ) * flight;
    // gentle roll during the fly-through, then mouse parallax once the name forms
    const settle = uniforms.uConv.value;
    mouse.sx += (mouse.x - mouse.sx) * 0.05;
    mouse.sy += (mouse.y - mouse.sy) * 0.05;
    points.rotation.z = Math.sin(Math.PI * flight) * 0.2;
    points.rotation.y = mouse.sx * 0.18 * (0.3 + settle);
    points.rotation.x = mouse.sy * 0.12 * (0.3 + settle);

    renderer.render(scene, camera);
  }
  const tick = (time) => render(time);
  gsap.ticker.add(tick);

  return {
    setProgress(p) { progress = p; },
    dispose() {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      io.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
