
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';



import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { assetsCache } from '../core/router.ts';
import { createPage } from '../core/createPage.js';

const glbfile = 'gyrs.glb'


// 1. 只处理 3D 逻辑
const pageBase = createPage(async () => {
    const buffer = assetsCache.get(glbfile);
    if (!buffer) throw new Error('未找到模型缓存');

    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, '');
    const root = gltf.scene;


    root.scale.set(0.4, 0.4, 0.4);
    return root;
});

// 2. 导出时手动组装给路由的最终对象
export default {
    ...pageBase,
    assets: [glbfile], // 手动声明 assets

};