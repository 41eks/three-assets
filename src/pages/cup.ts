

import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { assetsCache } from '../core/router.ts';
import { createPage } from '../core/createPage.js';
import { addTask } from '../core/scene.js';
import { createInput } from '../component/input.tsx';

const glbfile = 'cup.glb'

const baseUrl = import.meta.env.VITE_BASE_URL;


// 1. 只处理 3D 逻辑
const pageBase = createPage(async () => {
    const buffer = assetsCache.get(glbfile);
    if (!buffer) throw new Error('未找到模型缓存');

    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, '');
    const root = gltf.scene;
    root.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
            const mat = obj.material;
            // 确保材质不是数组（GLTF 偶尔会有多重材质数组的情况）
            if (!Array.isArray(mat)) {
                // 基类 Material 有 name，但没有 map
                if (true) {


                    const standardMat = mat as THREE.MeshStandardMaterial;

                    obj.material = new THREE.MeshPhysicalMaterial({
                        map: standardMat.map, // 现在可以安全访问 map 了
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
        }
    });


    root.scale.set(0.4, 0.4, 0.4);
    return root;
});

const popups = [
    {

        imgSrc: `${baseUrl}refer/01cab261dde6beef5ec58144b02be53019f3d433.jpg@256w_144h_1c.webp`,
        text: 'blender建模杯子教程',
        link: 'https://www.bilibili.com/video/BV1edRMBJEBT/',
        delay: 2000,      // 2秒后显示
        duration: 10000   // 10秒后消失
    }
];
// 2. 导出时手动组装给路由的最终对象
export default {
    ...pageBase,

    assets: [glbfile], // 手动声明 assets
    popups
};
