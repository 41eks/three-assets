

import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { createCoordinateInput } from '../../component/CoordinateInput.js';
import { createHDRSwitch } from '../../component/Switch.js';
import { createPage } from '../../core/createPage.js';
// import { scene, camera } from '../core/scene.js';
import vertexShader from './vert.glsl'

import fragmentShader from './frag.glsl'

const glbfile = 'nprv2.glb';
// 1. 创建面板实例
const coordPanel = createCoordinateInput("光照方向");
// const hdrSwitch = createHDRSwitch();
// 2. 挂载到页面
document.body.appendChild(coordPanel.element);
// document.body.appendChild(
//   hdrSwitch.element
// );
// ✅ 卡通材质定义
const celMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uLightDir: { value: new THREE.Vector3(1, 0, 1).normalize() },
    uColorA: { value: new THREE.Color(0x0000ff) },  // 暗部：蓝色
    uColorB: { value: new THREE.Color(0x00ff99) },  // 亮部：青绿色
    uThreshold: { value: 0.5 },
    uSoftness: { value: 0.02 },  // 边缘柔和度，0=硬切
  },
  vertexShader,
  fragmentShader,
});

const emissiveMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,  // 纯黑，不受任何光照影响
});
import { assetsCache } from '../../core/router.ts';
import { createEffect } from '../../core/solid.js';
// 2. 直接监听 getXYZ()，打通双向绑定！
createEffect(() => {
  // 因为 coordPanel.getXYZ() 内部调用了 state.get()
  // 所以这个 Effect 会被自动记录为 coordState 的订阅者
  const { x, y, z } = coordPanel.getXYZ();
  celMaterial.uniforms.uLightDir.value.set(x, y, z).normalize();
});


const loadModel = (): Promise<THREE.Group> => {
  const buffer = assetsCache.get(glbfile);
  if (!buffer) throw new Error('未找到模型缓存');

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.parse(buffer, null, (gltf: GLTF) => {
      const root = gltf.scene; // 保存根节点
      gltf.scene.traverse((child) => {

        if (child instanceof THREE.Mesh) {
          const mat = child.material;
          // 确保材质不是数组（GLTF 偶尔会有多重材质数组的情况）
          if (!Array.isArray(mat)) {
            // 基类 Material 有 name，但没有 map
            if (mat.name.includes('base')) {

              child.material = celMaterial;
            }
            if (mat.name.includes('shell')) {
              console.log(mat.name);
              child.material = emissiveMaterial;
            }
          }
        }
      })
      resolve(root);
    },
      (err) => {
        console.error('模型加载失败', err);
        setLoadingState(false);
        // 抛出错误
        reject(err);
      })
  });
}; const pagebase = createPage(loadModel);
export default {
  ...pagebase, assets: [glbfile],
  enter: () => {
    coordPanel.show();
    pagebase.enter()
  },
  leave: () => {
    coordPanel.hide();
    pagebase.leave();
  }
}