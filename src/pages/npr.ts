

import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { createCoordinateInput } from '../component/CoordinateInput.js';

import { createPage } from '../core/createPage.js';
import { scene } from '../core/scene.js';

// 1. 创建面板实例
const coordPanel = createCoordinateInput("光照方向");

// 2. 挂载到页面
document.body.appendChild(coordPanel.element);

// ✅ 卡通材质定义
const celMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uLightDir: { value: new THREE.Vector3(1, 0, 1).normalize() },
    uColorA: { value: new THREE.Color(0x0000ff) },  // 暗部：蓝色
    uColorB: { value: new THREE.Color(0x00ff99) },  // 亮部：青绿色
    uThreshold: { value: 0.5 },
    uSoftness: { value: 0.02 },  // 边缘柔和度，0=硬切
  },
  vertexShader: `
        varying vec3 vNormal;

        void main() {
            // 将法线转换到世界空间
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform vec3 uLightDir;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uThreshold;
        uniform float uSoftness;

        varying vec3 vNormal;

        void main() {
            // 计算法线和光照方向的点积（就是 Blender 里着色器转RGB做的事）
            float diff = dot(vNormal, uLightDir);

            // smoothstep = Blender 里"大于+阈值"的平滑版本
            float mask = smoothstep(uThreshold - uSoftness, uThreshold + uSoftness, diff);

            // mix = Blender 里的混合节点
            vec3 color = mix(uColorA, uColorB, mask);

            gl_FragColor = vec4(color, 1.0);
        }
    `,
});
import { createEffect } from '../core/solid.js';
// 2. 直接监听 getXYZ()，打通双向绑定！
createEffect(() => {
  // 因为 coordPanel.getXYZ() 内部调用了 state.get()
  // 所以这个 Effect 会被自动记录为 coordState 的订阅者
  const { x, y, z } = coordPanel.getXYZ();
  celMaterial.uniforms.uLightDir.value.set(x, y, z).normalize();
});


const loadModel = (): Promise<THREE.Group> => {


  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load('glass.glb', (gltf: GLTF) => {
      const root = gltf.scene; // 保存根节点
      gltf.scene.traverse((child) => {

        if (child instanceof THREE.Mesh) {
          child.material = celMaterial;
        }
      })
      resolve(root);
    }, (xhr) => {
      // 进度回调（Promise 本身不支持持续的进度抛出，所以这里保留你的外部状态调用）
      if (xhr.total > 0) { // 加上非零判断更安全
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        setLoadingPercent(percent);
      }
    },
      (err) => {
        console.error('模型加载失败', err);
        setLoadingState(false);
        // 抛出错误
        reject(err);
      })
  });
};
const page = createPage(loadModel);
export const enter = () => { coordPanel.show(); page.enter() };
export const leave = () => { coordPanel.hide(); page.leave() };
