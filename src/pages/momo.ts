
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行


import { assetsCache } from '../core/router.ts';

const glbfile = 'momo.glb'
import { createPage } from '../core/createPage.js';

const loadModel = (): Promise<THREE.Group> => {
    const buffer = assetsCache.get(glbfile);
    if (!buffer) throw new Error('未找到模型缓存');
    return new Promise<THREE.Group>((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.parseAsync(
            buffer,

            ""
        ).then((gltf: GLTF) => {
            const root = gltf.scene; // 保存根节点

            root.traverse((obj: THREE.Object3D) => {
                if (obj instanceof THREE.Mesh) {
                    const mat = obj.material;
                    // 确保材质不是数组（GLTF 偶尔会有多重材质数组的情况）
                    if (!Array.isArray(mat)) {
                        // 基类 Material 有 name，但没有 map
                        if (mat.name.includes('001')) {

                           
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

            // 将处理好的 gltf.scene 抛出
            resolve(root);
        },);
    });
};



// export default createPage(loadModel);
const pageBase = createPage(loadModel);
export default {
    ...pageBase,
    assets: [glbfile], // 手动声明 assets

};