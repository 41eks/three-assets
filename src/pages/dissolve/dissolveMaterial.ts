
// src/dissolveMaterial.js
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uMap;       // 原图 (hero.png)
  uniform sampler2D uNoise;     // 柏林噪声图
  uniform float uTime;          // 运行时间
  uniform vec4 uColor;          // 溶解边缘的颜色 (ColorParameter)
  uniform float uGridSize;      // 像素化程度 (FloatParameter2: 25)
  uniform float uEdgePower;     // 边缘发光强度 (FloatParameter: 15)
  uniform float uOffset;        // 偏移量 (FloatParameter5: 0.005)

  varying vec2 vUv;

  void main() {
    // 1. 采样原图并判断是否是透明区域
    vec4 texColor = texture2D(uMap, vUv);
    // 如果 texColor.a <= 0.0，isTransparency 为 1.0，否则为 0.0
    float isTransparency = step(texColor.a, 0.0);

    // 2. 像素化 UV 坐标
    vec2 pixelUv = ceil(vUv * uGridSize) / uGridSize;

    // 3. 噪声采样 UV 偏移逻辑 (还原自 Godot 着色器)
    vec2 offsetUv = ceil((vUv + uOffset) * uGridSize) / uGridSize;
    vec2 uvDiff = (offsetUv - pixelUv) * 1.5;
    vec2 noiseUv = uvDiff + pixelUv;

    // 4. 获取噪声值
    float noiseVal = texture2D(uNoise, noiseUv).r;

    // 5. 计算随时间变化的阈值 (结合 Y 坐标实现上下蔓延)
    float timeProgress = mix(-1.0, 1.0, abs(sin(uTime * 0.5)));
    float yProgress = pixelUv.y;
    float threshold = clamp(yProgress + timeProgress, 0.0, 1.0);

    // 6. 溶解计算
    float dissolve = noiseVal - threshold;
    float alphaCutoff = ceil(dissolve); // 噪声大于阈值保留(1.0)，否则丢弃(0.0)

    // 7. 边缘发光计算
    // 使用 max 防止负数求幂出现 NaN
    float edge = pow(max(1.0 - dissolve, 0.0), uEdgePower);
    vec4 edgeColor = uColor * edge;

    // 8. 混合颜色
    vec4 finalColor = texColor + edgeColor;
    // 注意：原文神操作是将 alphaCutoff 赋给了 rgb，但这里结合上下文，应是应用到 alpha 并且混合 rgb
    finalColor.a = alphaCutoff;

    // 9. 如果原本就是透明像素，则保持原样；否则应用溶解效果
    gl_FragColor = mix(finalColor, texColor, isTransparency);
  }
`;

export function createDissolveMaterial(baseTexture, noiseTexture) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true, // 允许透明
    uniforms: {
      uMap: { value: baseTexture },
      uNoise: { value: noiseTexture },
      uTime: { value: 0.0 },
      uColor: { value: new THREE.Vector4(0.79, 0.89, 1.0, 1.0) }, // 对应 vec4(0.790780, 0.889110, 0.998456, 1.0)
      uGridSize: { value: 25.0 },
      uEdgePower: { value: 15.0 },
      uOffset: { value: 0.005 }
    }
  });
}