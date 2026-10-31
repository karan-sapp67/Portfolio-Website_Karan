// Particle vertex shader. Everything (drift, convergence, swirl, streak size) is computed on
// the GPU from a handful of scroll-driven uniforms, so the JS side stays trivially cheap.
uniform float uTime;
uniform float uConv;     // 0..1 convergence into the name
uniform float uStretch;  // streak amount during the fly-through
uniform float uPx;       // pixel ratio
uniform float uSize;
uniform float uAspect;
uniform float uNameW;

attribute vec3 aTarget;  // sampled point on the name text
attribute vec4 aRand;

varying vec2 vDir;
varying float vStretch;
varying float vAlpha;
varying vec3 vColor;

mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }

void main() {
  vec3 p = position;
  // slow ambient drift
  p.x += sin(uTime * 0.15 + aRand.y * 6.2831) * 0.8 * aRand.x;
  p.y += cos(uTime * 0.12 + aRand.x * 6.2831) * 0.8 * aRand.z;

  // staggered, eased convergence + swirl that unwinds as the particle settles
  float e = clamp((uConv - aRand.z * 0.4) / 0.6, 0.0, 1.0);
  e = e * e * (3.0 - 2.0 * e);
  vec3 q = mix(p, aTarget, e);
  q.xy = rot(sin(e * 3.14159) * (2.0 + aRand.w * 3.0)) * q.xy;
  q.xy += vec2(sin(uTime * 0.8 + aRand.x * 40.0), cos(uTime * 0.9 + aRand.y * 40.0)) * 0.025 * e;

  vec4 mv = modelViewMatrix * vec4(q, 1.0);
  gl_Position = projectionMatrix * mv;

  // streaks radiate away from screen centre
  vec2 ndc = gl_Position.xy / gl_Position.w;
  vDir = normalize(vec2(ndc.x * uAspect, -ndc.y) + 1e-5);
  vStretch = 1.0 + uStretch * (1.0 - e) * (0.4 + aRand.w * 0.6);

  float depth = max(-mv.z, 0.01);
  gl_PointSize = clamp(uSize * uPx * vStretch * (30.0 / depth) * mix(1.0, 2.1, e), 1.0, 160.0);

  vec3 violet = vec3(0.486, 0.361, 1.0);
  vec3 cyan = vec3(0.243, 0.902, 0.949);
  vec3 free = mix(violet, cyan, aRand.y);
  // once settled, colour follows the name's left-to-right gradient (matches the HTML title)
  vec3 named = mix(violet, cyan, clamp(aTarget.x / uNameW + 0.5, 0.0, 1.0)) * 1.15;
  vColor = mix(free, named, e);
  vAlpha = (0.35 + 0.65 * aRand.x) * smoothstep(0.4, 3.0, depth) * mix(0.85, 1.7, e);
}
