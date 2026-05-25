
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene, camera, controls,renderer } from '../core/scene.js';

import * as THREE from 'three';  // ← 加这行
let loaded = false; // ✅ 缓存标记，同一模型只加载一次
let root = null; // 记住根节点
export function enter() {
    camera.position.set(0, 0.5, 3);
    controls.target.set(0, 0, 0);


    showLoading(true);

    if (root) {
        scene.add(root); // 已加载过，直接加回来
        return;
    }

    new GLTFLoader().load(
        'momo.glb',
        (gltf) => {
            root = gltf.scene; // 保存根节点
            root.traverse((obj) => {
                if (obj.isMesh) {

                    const mat = obj.material;

                    if (mat.name.includes('001')) {
                        obj.material = new THREE.MeshPhysicalMaterial({

                            map: mat.map,

                            transparent: true,

                            transmission: 1,

                            roughness: 0.01,

                            ior: 1.33,

                            thickness: 1,

                            envMapIntensity: 1,

                            depthWrite: false,
                            clearcoat: 1,
                            clearcoatRoughness: 0,
                        });
                    }
                }
            });
            scene.add(root);
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

import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';


export function leave() {
    if (root) scene.remove(root); // 只移出场景，不销毁，下次还能用
    loaded = false;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}