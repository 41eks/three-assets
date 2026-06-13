import { createState, createEffect } from './solid';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

export const scene = new THREE.Scene();

// renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
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
const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000); // 使用正交相机，适合做 2D 立绘
export let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera = defaultCamera;
export const activeCamera = createState('default');

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
createEffect(() => {
    if (activeCamera.get() == "ortho") {
        camera = orthoCamera;
    } else {

        camera = defaultCamera;
    }
    controls.object = camera;

})
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = w / h;
    } else {
        const aspect = w / h;

        camera.left = -aspect;
        camera.right = aspect;
    }

    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
});
export { controls };

const timer = new THREE.Timer();
export type Updatable = (dt: number) => void;
const frontTasks: Updatable[] = [];
export const middleTasks: Updatable[] = [];
const backTasks: Updatable[] = [];
// 全局动画循环
function animate() {
    requestAnimationFrame(animate);
    timer.update();
    const elapsed = timer.getElapsed();
    const dt = timer.getDelta();
    frontTasks.forEach((listener) => listener(dt));
    middleTasks.forEach((listener) => listener(elapsed));
    backTasks.forEach((listener) => listener(dt));
    controls.update();
    renderer.render(scene, camera);
}
animate();

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