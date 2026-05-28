

import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行


import { createPage } from '../core/createPage.js';

const loadModel = (): Promise<THREE.Group> => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load('glass.glb', (gltf: GLTF) => {
      const root = gltf.scene; // 保存根节点
      gltf.scene.traverse((child) => {

        if (child instanceof THREE.Mesh) {

          child.material = new THREE.MeshPhysicalMaterial({

            color: '#fd6257',

            transmission: 1,

            thickness: 1.5,

            roughness: 0.08,

            ior: 1.45,

            clearcoat: 1,

            envMapIntensity: 2
          })
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
export const enter = page.enter;
export const leave = page.leave;

// export function enter() {
//   camera.position.set(0, 0.5, 3);
//   controls.target.set(0, 0, 0);

//   if (root) {
//     scene.add(root); // 已加载过，直接加回来
//     return;
//   }

//   showLoading(true);

//   new GLTFLoader().load(
//     'glass.glb',
//     (gltf) => {
//       const root = gltf.scene; // 保存根节点
//       gltf.scene.traverse((child) => {

//         if (child.isMesh) {

//           child.material = new THREE.MeshPhysicalMaterial({

//             color: '#fd6257',

//             transmission: 1,

//             thickness: 1.5,

//             roughness: 0.08,

//             ior: 1.45,

//             clearcoat: 1,

//             envMapIntensity: 2
//           })
//         }
//       })

//       scene.add(root)

//       showLoading(false);
//     },
//     (xhr) => {
//       // 加载进度
//       const percent = Math.round((xhr.loaded / xhr.total) * 100);
//       document.getElementById('loading-text').textContent = `加载中 ${percent}%`;
//     },
//     (err) => {
//       console.error('模型加载失败', err);
//       showLoading(false);
//     }
//   );
// }

// export function leave() {
//   if (root) scene.remove(root); // 只移出场景，不销毁，下次还能用
// }

// function showLoading(show) {
//   document.getElementById('loading').style.display = show ? 'flex' : 'none';
// }