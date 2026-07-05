
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { scene, camera, controls } from '../core/scene.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';



import * as THREE from 'three';  // ← 加这行


import { createPage } from '../core/createPage.js';



const loadModel = (): Promise<THREE.Group> => {
    return new Promise<THREE.Group>((resolve, reject) => {
        const loader = new GLTFLoader();
        // loader.setMeshoptDecoder(MeshoptDecoder);
        loader.load(
            'tartv2.glb',
            (gltf) => {
                const root = gltf.scene; // 保存根节点
                // scene.add(root);
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



// const page = createPage(loadModel);

export default createPage(loadModel);




