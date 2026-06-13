import { createState, createEffect } from './solid';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

export const scene = new THREE.Scene();

// renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

export const canvasVisible = createState(true);

createEffect(() => {
    renderer.domElement.style.display = canvasVisible.get() ? 'block' : 'none';
});


//camera
export const defaultCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 100
);
defaultCamera.position.set(0, 0.5, 3);
const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); // 使用正交相机，适合做 2D 立绘
export let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera = defaultCamera;
export const activeCamera = createState('default');

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
createEffect(() => {
    if (activeCamera.get() == "ortho") {
        camera = orthoCamera;
        console.log(`camera changed ->${activeCamera.get()}`)
    } else {

        camera = defaultCamera;
    }
    controls.object = camera;

})


export const rendererSize = createState({ w: window.innerWidth, h: window.innerHeight });
export const fixRenderSize = createState(false);
const handleResize = () => {
    if (fixRenderSize.get()) {
        return; // 被锁定，不作为
    } else {
        rendererSize.set({
            w: window.innerWidth,
            h: window.innerHeight
        });
    }
};


// window.addEventListener('resize', handleResize);
createEffect(() => {
    // 绑定事件
    if (!fixRenderSize.get()) {
        window.addEventListener('resize', handleResize);
    }
    else {
        window.removeEventListener('resize', handleResize);
    };
})

// 建议在外部定义一个缩放系数
const frustumSize = 2;

createEffect(() => {
    const { w, h } = rendererSize.get();

    activeCamera.get();
    const aspect = w / h;

    if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = aspect;
    } else {
        // ✨ 更标准的正交相机自适应写法
        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
    }

    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
})


export { controls };

const timer = new THREE.Timer();
export type Updatable = (t: { elapsed: number, dt: number }) => void;
const frontTasks: Updatable[] = [];
export const middleTasks: Updatable[] = [];
const backTasks: Updatable[] = [];
// 全局动画循环
function animate(timestamp = 0) {
    requestAnimationFrame(animate);
    timer.update(timestamp);
    const elapsed = timer.getElapsed();
    const dt = timer.getDelta();
    frontTasks.forEach((listener) => listener({ elapsed, dt }));
    middleTasks.forEach((listener) => listener({ elapsed, dt }));
    backTasks.forEach((listener) => listener({ elapsed, dt }));
    controls.update();
    renderer.render(scene, camera);
}
animate(0);

let hdrEnvMap: THREE.Texture | null = null;

export const hdrLoaded = createState(false);
export const hdrEnabled = createState(true);

// 新增：导出一个初始化函数，供 main.ts 调用和等待
export function initScene(): Promise<void> {
    return new Promise((resolve, reject) => {
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();

        new HDRLoader().load(
            'studio.hdr', // 确保路径正确
            (texture) => {
                hdrEnvMap = pmrem.fromEquirectangular(texture).texture;
                // 强制重新触发
                hdrLoaded.set(true);
                texture.dispose();
                pmrem.dispose();
                resolve(); // 场景及 HDR 加载完成
            },
            undefined, // onProgress
            (error) => {
                console.error('HDR 加载失败:', error);
                reject(error);
            }
        );
    });
}


createEffect(() => {
    const enabled = hdrLoaded.get() && hdrEnabled.get() && hdrEnvMap;;
    if (enabled) {
        scene.environment = hdrEnvMap;
        scene.background = hdrEnvMap;

    } else {
        scene.environment = null;
        scene.background = null;
    }

})