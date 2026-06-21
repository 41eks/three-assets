// import { createState, createEffect } from './solid';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
//
// // import * as THREE from 'three';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
// // import { scene, camera, renderer } from '../scene.js'; // 假设你能拿到 renderer
//
// export const scene = new THREE.Scene();
//
// // renderer
// export const renderer = new THREE.WebGLRenderer({ antialias: true });
// // renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.outputColorSpace = THREE.SRGBColorSpace;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// document.body.appendChild(renderer.domElement);
//
// export const canvasVisible = createState(true);
//
// createEffect(() => {
//     renderer.domElement.style.display = canvasVisible.get() ? 'block' : 'none';
// });
//
//
// //camera
// export const defaultCamera = new THREE.PerspectiveCamera(
//     75, window.innerWidth / window.innerHeight, 0.1, 100
// );
// defaultCamera.position.set(0, 0.5, 3);
// const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); // 使用正交相机，适合做 2D 立绘
// export let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera = defaultCamera;
// export const activeCamera = createState('default');
//
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// createEffect(() => {
//     if (activeCamera.get() == "ortho") {
//         camera = orthoCamera;
//         console.log(`camera changed ->${activeCamera.get()}`)
//     } else {
//
//         camera = defaultCamera;
//     }
//     controls.object = camera;
//
// })
//
//
// export const rendererSize = createState({ w: window.innerWidth, h: window.innerHeight });
// export const fixRenderSize = createState(false);
// const handleResize = () => {
//     if (fixRenderSize.get()) {
//         return; // 被锁定，不作为
//     } else {
//         rendererSize.set({
//             w: window.innerWidth,
//             h: window.innerHeight
//         });
//     }
// };
//
//
// // window.addEventListener('resize', handleResize);
// createEffect(() => {
//     // 绑定事件
//     if (!fixRenderSize.get()) {
//         window.addEventListener('resize', handleResize);
//     }
//     else {
//         window.removeEventListener('resize', handleResize);
//     };
// })
//
// // 建议在外部定义一个缩放系数
// const frustumSize = 2;
//
// createEffect(() => {
//     const { w, h } = rendererSize.get();
//
//     activeCamera.get();
//     const aspect = w / h;
//
//     if (camera instanceof THREE.PerspectiveCamera) {
//         camera.aspect = aspect;
//     } else {
//         // ✨ 更标准的正交相机自适应写法
//         camera.left = -frustumSize * aspect / 2;
//         camera.right = frustumSize * aspect / 2;
//         camera.top = frustumSize / 2;
//         camera.bottom = -frustumSize / 2;
//     }
//
//     camera.updateProjectionMatrix();
//
//     renderer.setSize(w, h);
// })
//
//
// export { controls };
//
//
//
// const PixelShader = {
// uniforms: {
//   // tDiffuse 是 Three.js 后期处理内置的，代表刚刚渲染好的场景画面 (对应你的 color_buffer)
//   'tDiffuse': { value: null },
//   // 屏幕的分辨率
//   'uResolution': { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
//   // 像素块大小系数，值越大马赛克越大 (类似你之前的 0.05 倒数)
//   'uPixelSize': { value: 8.0 } 
// },
// vertexShader: `
//   varying vec2 vUv;
//   void main() {
//     vUv = uv;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//   }
// `,
// fragmentShader: `
//   uniform sampler2D tDiffuse;
//   uniform vec2 uResolution;
//   uniform float uPixelSize;
//   
//   varying vec2 vUv;
//
//   void main() {
//     // 对应你的: vec2 texfac = vec2(texsize) / pixelSize;
//     // 这里我们直接算出当前像素格的宽高比
//     vec2 dxy = uPixelSize / uResolution;
//     
//     // 对应你的: vec2 pix_coords = floor(uvcoordsvar * texfac) / texfac;
//     vec2 coord = dxy * floor(vUv / dxy);
//     
//     // 对应你的: vec4 scene_col = texture(color_buffer, pix_coords);
//     gl_FragColor = texture2D(tDiffuse, coord);
//   }
// `
// };
//
//
// // 1. 创建效果合成器
// export const composer = new EffectComposer(renderer);
//
// // 2. 第一步：先正常渲染场景 (必须要有这一步，否则没有原始画面)
// const renderPass = new RenderPass(scene, camera);
// composer.addPass(renderPass);
//
// // 3. 第二步：添加我们自定义的像素化滤镜
// const pixelPass = new ShaderPass(PixelShader);
// composer.addPass(pixelPass);
//
// const timer = new THREE.Timer();
// export type Updatable = (t: { elapsed: number, dt: number }) => void;
// const frontTasks: Updatable[] = [];
// export const middleTasks: Updatable[] = [];
// const backTasks: Updatable[] = [];
// // 全局动画循环
// function animate(timestamp = 0) {
//     requestAnimationFrame(animate);
//     timer.update(timestamp);
//     const elapsed = timer.getElapsed();
//     const dt = timer.getDelta();
//     frontTasks.forEach((listener) => listener({ elapsed, dt }));
//     middleTasks.forEach((listener) => listener({ elapsed, dt }));
//     backTasks.forEach((listener) => listener({ elapsed, dt }));
//     controls.update();
//     // renderer.render(scene, camera);
//     // composer.render() 内部会自动先渲染场景，然后再跑一遍像素滤镜
//     composer.render();
// }
// animate(0);
//
// let hdrEnvMap: THREE.Texture | null = null;
// // import { composer } from './render/pixel';
// export const hdrLoaded = createState(false);
// export const hdrEnabled = createState(true);
//
// // 新增：导出一个初始化函数，供 main.ts 调用和等待
// export function initScene(): Promise<void> {
//     return new Promise((resolve, reject) => {
//         const pmrem = new THREE.PMREMGenerator(renderer);
//         pmrem.compileEquirectangularShader();
//
//         new HDRLoader().load(
//             'studio.hdr', // 确保路径正确
//             (texture) => {
//                 hdrEnvMap = pmrem.fromEquirectangular(texture).texture;
//                 // 强制重新触发
//                 hdrLoaded.set(true);
//                 texture.dispose();
//                 pmrem.dispose();
//                 resolve(); // 场景及 HDR 加载完成
//             },
//             undefined, // onProgress
//             (error) => {
//                 console.error('HDR 加载失败:', error);
//                 reject(error);
//             }
//         );
//     });
// }
//
//
// createEffect(() => {
//     const enabled = hdrLoaded.get() && hdrEnabled.get() && hdrEnvMap;;
//     if (enabled) {
//         scene.environment = hdrEnvMap;
//         scene.background = hdrEnvMap;
//
//     } else {
//         scene.environment = null;
//         scene.background = null;
//     }
//
// })

// import { createState, createEffect } from './solid';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
// // ✨ 从 store 和外部模块引入
// import { rendererSize } from '../store/viewport';
// import { getCamera, activeCamera } from './camera';
// import { composer, initComposer } from './composer';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { createState, createEffect } from './solid';

// ✨ 统统从其他模块导入
import { rendererSize } from '../store/viewport';
import { scene, renderer } from '../store/webgl';
import { getCamera, activeCamera } from './camera';
import { composer } from './composer'; // 因为不再有循环依赖，直接导入即可
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

// 4. 动画循环与任务队列
const timer = new THREE.Timer();
export type Updatable = (t: { elapsed: number, dt: number }) => void;
const frontTasks: Updatable[] = [];
export const middleTasks: Updatable[] = [];
const backTasks: Updatable[] = [];

function animate(timestamp = 0) {
    requestAnimationFrame(animate);
    timer.update(timestamp);
    const elapsed = timer.getElapsed();
    const dt = timer.getDelta();

    frontTasks.forEach((listener) => listener({ elapsed, dt }));
    middleTasks.forEach((listener) => listener({ elapsed, dt }));
    backTasks.forEach((listener) => listener({ elapsed, dt }));

    controls.update();

    // ✨ 直接使用 composer 渲染
    composer.render();
}
animate(0);

// 5. HDR 环境逻辑 (保持原样)
let hdrEnvMap: THREE.Texture | null = null;
export const hdrLoaded = createState(false);
export const hdrEnabled = createState(true);

export function initScene(): Promise<void> {
    return new Promise((resolve, reject) => {
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