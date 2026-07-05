
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';



import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { assetsCache } from '../core/router.ts';
import { createPage } from '../core/createPage.js';

const glbfile = 'icecream.glb'

const baseUrl = import.meta.env.VITE_BASE_URL;


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
const  popups= [
{

    imgSrc: `${baseUrl}refer/34045c3de7d6631f0e3f91eb1a17666f3dc8065f.jpg@212w_120h_1c_!web-playlist-list-card-cover.avif`,
    text: 'blender | 冰淇淋建模教程',
    link: 'https://www.bilibili.com/video/BV1s6Tp6fEby/',
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