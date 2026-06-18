import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createPage } from '../core/createPage.js';
import { assetsCache } from '../core/router.ts';

// 1. 只处理 3D 逻辑
const pageBase = createPage(async () => {
    const buffer = assetsCache.get('pudding.glb');
    if (!buffer) throw new Error('未找到模型缓存');

    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, '');
    const root = gltf.scene;

    root.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
            const mat = obj.material;
            if (mat.name.includes('GLASS')) {
                obj.material = new THREE.MeshPhysicalMaterial({
                    map: mat.map,
                    color: mat.color,
                    roughness: 0,
                    transmission: 1,
                    ior: 1.25,
                    thickness: 2.0,
                    transparent: true,
                });
            }
        }
    });

    root.scale.set(0.4, 0.4, 0.4);
    return root;
});

// 2. 导出时手动组装给路由的最终对象
export default {
    ...pageBase,
    assets: ['pudding.glb'], // 手动声明 assets

};