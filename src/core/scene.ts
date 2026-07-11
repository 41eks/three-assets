
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { createState, createEffect } from './solid';

// ✨ 统统从其他模块导入
import { rendererSize } from '../store/viewport';
import { scene, renderer } from '../store/webgl';
import { getCamera, activeCamera } from './camera';
import { composer } from './composer'; // 因为不再有循环依赖，直接导入即可
import { setLoadingState } from './loading';
// 1. 先初始化核心 WebGL 场景和渲染器
// export const scene = new THREE.Scene();


createEffect(() => {
    const { w, h } = rendererSize.get();
    renderer.setSize(w, h);
});

// // 2. 然后再引入拆分出去的相机和后期处理（解决循环依赖的关键）
// import { activeCamera, getCamera } from './camera';
// import { composer } from './composer';

// 3. 配置控制器
const controls = new OrbitControls(getCamera(), renderer.domElement);
controls.enableDamping = true;

createEffect(() => {
    activeCamera.get(); // 依赖收集
    controls.object = getCamera(); // 相机切换时，将新的相机对象交给控制器
});

export { controls };

const timer = new THREE.Timer();

export type Updatable = (
    t: { elapsed: number; dt: number }
) => void;

const frontTasks = new Set<Updatable>();
export const middleTasks = new Set<Updatable>();
const backTasks = new Set<Updatable>();


export function addTask(fn: Updatable) {
middleTasks.add(fn);

return () => {
    middleTasks.delete(fn);
};
}

function animate(timestamp = 0) {
requestAnimationFrame(animate);

timer.update(timestamp);

const elapsed = timer.getElapsed();
const dt = timer.getDelta();

const time = { elapsed, dt };

frontTasks.forEach(listener => listener(time));
middleTasks.forEach(listener => listener(time));
backTasks.forEach(listener => listener(time));

controls.update();
composer.render();
}

animate(0);

// 5. HDR 环境逻辑 (保持原样)
let hdrEnvMap: THREE.Texture | null = null;
export const hdrLoaded = createState(false);
export const hdrEnabled = createState(true);

export function initScene(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setLoadingState(true);
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();

        new HDRLoader().load(
            'studio.hdr',
            (texture) => {
                hdrEnvMap = pmrem.fromEquirectangular(texture).texture;
                hdrLoaded.set(true);
                texture.dispose();
                pmrem.dispose();
                resolve();
            },
            undefined,
            (error) => {
                console.error('HDR 加载失败:', error);
                reject(error);
            }
        );
    }).then(() => {
        setLoadingState(false);
    });
}

createEffect(() => {
    const enabled = hdrLoaded.get() && hdrEnabled.get() && hdrEnvMap;
    if (enabled) {
        scene.environment = hdrEnvMap;
        scene.background = hdrEnvMap;
    } else {
        scene.environment = null;
        scene.background = null;
    }
});
