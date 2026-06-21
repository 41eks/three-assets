

import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { createCoordinateInput } from '../../component/CoordinateInput.js';
import { createHDRSwitch } from '../../component/HDRSwitch.js';
import { createPage } from '../../core/createPage.js';
// import { scene } from '../../core/scene.js';

// 1. 创建面板实例
const coordPanel = createCoordinateInput("光照方向");
// const hdrSwitch = createHDRSwitch();
// 2. 挂载到页面
document.body.appendChild(coordPanel.element);

import { mixmaterial, updateObjectSize } from './material';

const emissiveMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,  // 纯黑，不受任何光照影响
});
import { assetsCache } from '../../core/router.ts';
import { createEffect } from '../../core/solid.js';


const loadModel = (): Promise<THREE.Group> => {
    const buffer = assetsCache.get('mh.glb');
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
                        child.material = mixmaterial;
                        updateObjectSize(child.geometry, root.scale);


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
    ...pagebase, assets: ['mh.glb']
}