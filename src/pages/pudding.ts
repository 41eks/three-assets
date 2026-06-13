
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene, camera, controls, renderer } from '../core/scene.js';
import {
    setLoadingState, setLoadingPercent
} from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { createPage } from '../core/createPage.js';

const loadModel = (): Promise<THREE.Group> => {
    return new Promise<THREE.Group>((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            'pudding.glb',
            (gltf) => {
                const root = gltf.scene; // 保存根节点
                root.traverse((obj) => {
                    if (obj instanceof THREE.Mesh) {

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
                })
                    root.scale.set(0.4, 0.4, 0.4);
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
export default createPage(loadModel);