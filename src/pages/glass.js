
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene, camera, controls } from '../core/scene.js';
import * as THREE from 'three';  // ← 加这行
let loaded = false; // ✅ 缓存标记，同一模型只加载一次
let root = null; // 记住根节点
export function enter() {
  camera.position.set(0, 0.5, 3);
  controls.target.set(0, 0, 0);

  if (root) {
    scene.add(root); // 已加载过，直接加回来
    return;
  }

  showLoading(true);

  new GLTFLoader().load(
    'glass.glb',
    (gltf) => {
      root = gltf.scene; // 保存根节点
      gltf.scene.traverse((child) => {

        if (child.isMesh) {

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

      scene.add(root)

      showLoading(false);
    },
    (xhr) => {
      // 加载进度
      const percent = Math.round((xhr.loaded / xhr.total) * 100);
      document.getElementById('loading-text').textContent = `加载中 ${percent}%`;
    },
    (err) => {
      console.error('模型加载失败', err);
      showLoading(false);
    }
  );
}

export function leave() {
  if (root) scene.remove(root); // 只移出场景，不销毁，下次还能用
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
}