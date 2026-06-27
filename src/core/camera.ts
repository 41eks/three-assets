
import * as THREE from 'three';
import { createState, createEffect, createMemo } from './solid'; // ✨ 引入 createMemo
import { rendererSize } from '../store/viewport';

export const activeCamera = createState('default');

const defaultCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

const aspect = window.innerWidth / window.innerHeight;
export const frustumSize = 16;
// (别忘了上一次修复的远端裁切面 100)
const orthoCamera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2, // left  (左边界)
     frustumSize * aspect / 2, // right (右边界)
     frustumSize / 2,          // top   (上边界)
    -frustumSize / 2,          // bottom(下边界)
     0.1,                      // near  (近裁剪面)
     1000                      // far   (远裁剪面)
);
// new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);



export function setCameraPosition(){
defaultCamera.position.set(0, 0.5, 3);
orthoCamera.position.set(0, 0, 20);
}
setCameraPosition();

// ✨ 核心改造：使用 createMemo 创建响应式的派生状态
// 它返回的是一个函数（底层 memoState.get），每次调用拿到的都是最新的正确相机
export const currentCamera = createMemo(() => {
    const type = activeCamera.get();
    console.log(`[Memo] Recalculating camera -> ${type}`);
    return type === "ortho" ? orthoCamera : defaultCamera;
});

// 为了兼容你之前其他模块的写法，把 getCamera 直接指向 currentCamera
export const getCamera = currentCamera;


createEffect(() => {
    const { w, h } = rendererSize.get();
    // ✨ 直接调用 currentCamera() 获取实例，同时自动完成了依赖收集！
    const camera = currentCamera();
    const aspect = w / h;

    if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = aspect;
    } else {
        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
    }
    camera.updateProjectionMatrix();
});

