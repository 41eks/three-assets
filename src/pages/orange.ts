import { createPage } from '../core/createPage.js';

import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';



import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { assetsCache } from '../core/router.ts';

const glbfile = 'orange.glb'

const loadModel = (): Promise<THREE.Group> => {
    const buffer = assetsCache.get(glbfile);
    if (!buffer) throw new Error('未找到模型缓存');

    return new Promise<THREE.Group>((resolve, reject) => {
        const loader = new GLTFLoader();
        // loader.setMeshoptDecoder(MeshoptDecoder);
        const gltf = loader.parseAsync(buffer
            ,
            ""
        ).then(gltf => {
            const root = gltf.scene; // 保存根节点

            // 将处理好的 gltf.scene 抛出
            resolve(root);

        });


    },
    );
};


const pageBase = createPage(loadModel);
export default {
    ...pageBase,
    assets: [glbfile], // 手动声明 assets

};