varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vMappedPos;

uniform float uMappingX;
uniform float uMappingScaleX;

uniform vec3 uObjectSize;
uniform vec3 uObjectCenter;

void main() {
  vPosition = position;
  vNormal   = normalize(normalMatrix * normal);
  vUv       = uv;

  // 归一化到 [-1, 1]，消除物体尺寸差异
  vec3 normalizedPos = (position - uObjectCenter) / max(uObjectSize * 0.5, vec3(0.0001));

  // X 轴映射：uMappingX 从 -1 → 1 控制显示/隐藏扫描线
  vec3 mapped = normalizedPos;
  mapped.x = mapped.x * uMappingScaleX + uMappingX;
  vMappedPos = mapped;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}