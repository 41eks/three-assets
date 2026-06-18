// import * as THREE from 'three';
import * as THREE from 'three';
// 正常 import 即可
import vertGLSL from './vert.glsl';
import fragGLSL from './frag.glsl';




const uniforms = {
  uMappingX: { value: 0.3 },
  uMappingScaleX: { value: 1.0 },
  uTime: { value: 0.0 }, // ← 新增：传入时间变量
  // === 物体尺寸（调用 updateObjectSize() 后自动填充）===
  uObjectSize: { value: new THREE.Vector3(1, 1, 1) },
  uObjectCenter: { value: new THREE.Vector3(0, 0, 0) },

  // === 噪波：只影响边缘毛边 ===
  uNoiseScale: { value: 3.0 },  // 噪波频率，越大毛边越碎
  uNoiseDetail: { value: 2.0 },
  uNoiseRoughness: { value: 0.5 },
  uNoiseEdge: { value: 0.08 },  // 毛边幅度，越大边缘越不规则

  // === 颜色渐变 ===
  uColor1: { value: new THREE.Color(0xecef0f) },
  uGradPos1: { value: 0.0 },   // 过渡起点（隐藏侧）
  uGradPos2: { value: 0.05 },   // 过渡终点，差值越小边缘越锐利

  // === 原理化 BSDF ===
  uRoughness: { value: 0.5 },
  uIOR: { value: 1.5 },
  uAlpha: { value: 1.0 },

  // === 自发光（边缘发光效果）===
  uEmitStrength: { value: 20.0 },
  uEmitColor: { value: new THREE.Color(0x0000ff) }, // 边缘发光色

  // === 透明混合 ===
  uTransparencyMix: { value: 0.0 },
};

export const mixmaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: vertGLSL,
  fragmentShader: fragGLSL,
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
});

/**
 * 根据 geometry 包围盒设置 uObjectSize / uObjectCenter。
 * 赋完材质后调用一次即可。
 */

export function updateObjectSize(geometry, meshScale = new THREE.Vector3(1, 1, 1)) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  // size 和 center 都不乘 scale
  // position 是局部坐标，归一化除法必须在同一空间
  // size.multiply(meshScale);    // ← 删掉
  // center.multiply(meshScale);  // ← 之前已删

  mixmaterial.uniforms.uObjectSize.value.copy(size);
  mixmaterial.uniforms.uObjectCenter.value.copy(center);
}



// 在 index.ts 中设置
let currentMappingX = -0.7;
let currentTime = 0; // ← 新增：时间累加器
const speed = 0.02; // 每次增加的步长

// 创建一个每 16 毫秒（约 60FPS）执行一次的定时器
const mappingTimer = setInterval(() => {
  currentMappingX += speed;
  currentTime += 0.016; // ← 模拟 60FPS 递增时间
  // 如果超过 1.0 就重置回 0（循环扫描）
  if (currentMappingX > 0.7) {
    currentMappingX = -0.7;
  }

  mixmaterial.uniforms.uMappingX.value = currentMappingX;
  mixmaterial.uniforms.uMappingX.value = currentMappingX;
  mixmaterial.uniforms.uTime.value = currentTime; // ← 把时间传给着色器
}, 16);