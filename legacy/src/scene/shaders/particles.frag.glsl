uniform float uBright;

varying vec2 vDir;
varying float vStretch;
varying float vAlpha;
varying vec3 vColor;

void main() {
  // Elliptical sprite: long axis follows the radial direction, so fast particles read as streaks.
  vec2 c = gl_PointCoord - 0.5;
  float a = dot(c, vDir);
  float b = dot(c, vec2(-vDir.y, vDir.x));
  float d = length(vec2(a, b * vStretch));
  float m = smoothstep(0.5, 0.0, d);

  gl_FragColor = vec4(vColor * (1.0 + m), m * vAlpha * uBright);
}
