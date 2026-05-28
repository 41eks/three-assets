
import { GLTFLoader,type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行


import { createPage } from '../core/createPage.js';

const loadModel = (): Promise<THREE.Group> => {
    return new Promise<THREE.Group>((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            'momo.glb',
            (gltf: GLTF) => {
                const root = gltf.scene; // 保存根节点

                root.traverse((obj: THREE.Object3D) => {
                    if (obj instanceof THREE.Mesh) {
                        const mat = obj.material;
                        // 确保材质不是数组（GLTF 偶尔会有多重材质数组的情况）
                        if (!Array.isArray(mat)) {
                            // 基类 Material 有 name，但没有 map
                            if (mat.name.includes('001')) {

                                // 🔥 避坑点 2：类型断言 (Type Assertion)
                                // GLTF 模型默认解出来的是 MeshStandardMaterial，它带有多套贴图
                                // 我们需要告诉 TS：“放心，我知道它有 map 属性”
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
            },
            (xhr) => {
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
            }
        );
    });
};



// const page = createPage(loadMomoModel);
const page = createPage(loadModel);

export const enter = page.enter;
export const leave = page.leave;
// export { enter, leave };