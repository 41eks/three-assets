

import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { assetsCache } from '../core/router.ts';
import { createPage } from '../core/createPage.js';
import { addTask } from '../core/scene.js';

const glbfile = '螺旋桨.glb'

const baseUrl = import.meta.env.VITE_BASE_URL;


// 1. 只处理 3D 逻辑
let airscrewRoot: THREE.Object3D | null = null;
let dispose: (() => void) | undefined;

const pageBase = createPage(async () => {
    const buffer = assetsCache.get(glbfile);
    if (!buffer) throw new Error('未找到模型缓存');

    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, '');
    const root = gltf.scene;


    root.scale.set(0.4, 0.4, 0.4);
    airscrewRoot = root;
    return root;
});

const task = (time: { dt: number }) => {
    if (!airscrewRoot) return;
    airscrewRoot.rotation.z += time.dt * 0.35;
};

function enter() {
    pageBase.enter();
    if (!dispose) dispose = addTask(task);
}

function leave() {
    pageBase.leave();
    dispose?.();
    dispose = undefined;
}

const popups = [
    {

        imgSrc: `${baseUrl}refer/ad8bb3101e950eb2d0c42d4acd88b84a07046a78.jpg@760w_428h_1c.avif`,
        text: 'blender如何制作螺旋桨',
        link: 'https://www.bilibili.com/video/BV1BsjE6dEKT/',
        delay: 2000,      // 2秒后显示
        duration: 10000   // 10秒后消失
    }
];
// 2. 导出时手动组装给路由的最终对象
export default {
    ...pageBase,
    enter,
    leave,
    assets: [glbfile], // 手动声明 assets
    popups
};
