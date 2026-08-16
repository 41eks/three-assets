import { createPage } from '../core/createPage.js';

import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';



import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { assetsCache } from '../core/router.ts';
const baseUrl = import.meta.env.VITE_BASE_URL;
const glbfile = `${__ASSET_BASE_URL__}pages/perl.glb`;

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

const  popups= [
{

    imgSrc: `${baseUrl}refer/69a54b82beb67e22acbfbd51933a442f9fa92898.jpg@256w_144h_1c.avif`,
    text: 'blender | 珍珠贝壳建模教程',
    link: 'https://www.bilibili.com/video/BV1W5gP61E3G/',
    delay: 2000,      // 2秒后显示
    duration: 10000   // 10秒后消失
}
];

const pageBase = createPage(loadModel);
export default {
    ...pageBase,
    assets: [glbfile], // 手动声明 assets
    popups


};
