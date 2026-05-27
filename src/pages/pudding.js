
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene, camera, controls, renderer } from '../core/scene.js';

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
    // 1. 记录当前页面的 hash
    const initHash = window.location.hash;

    // --- 【新增】封装好的工具函数 ---

    // 工具 1：校验页面并上屏
    const addModel = () => {
        if (window.location.hash === initHash) {
            scene.add(root);
            showLoading(false);
        } else {
            console.log('页面已切换，模型仅缓存不上屏');
            showLoading(false);
        }
    };
    new GLTFLoader().load(
        'pudding.glb',
        (gltf) => {
            root = gltf.scene; // 保存根节点
            root.traverse((obj) => {
                if (obj.isMesh) {

                    const mat = obj.material;

                    if (mat.name.includes('GLASS')) {
                        obj.material = new THREE.MeshPhysicalMaterial({
                            map: mat.map,       // 继承你的渐变贴图
                            color: mat.color,
                            roughness: 0,
                            transmission: 1,               // 开启透射（玻璃效果）
                            ior: 1.25,
                            thickness: 2.0,                // 【重点】给果冻物理厚度，才能产生折射形变！根据模型大小适当调整这个值 (例如 0.5 - 5)
                            transparent: true,
                        });
                    }
                }
            });
            root.scale.set(0.4, 0.4, 0.4);
            // showLoading(false);
            // ✅ 2. 核心：处理完材质后，直接调用封装的函数
            addModel();
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