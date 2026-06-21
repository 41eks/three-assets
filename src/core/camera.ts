
import * as THREE from 'three';
import { createState, createEffect, createMemo } from './solid'; // ✨ 引入 createMemo
import { rendererSize } from '../store/viewport';

export const activeCamera = createState('default');

const defaultCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
defaultCamera.position.set(0, 0.5, 3);
// (别忘了上一次修复的远端裁切面 100)
const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
orthoCamera.position.set(0, 0.5, 3);

// ✨ 核心改造：使用 createMemo 创建响应式的派生状态
// 它返回的是一个函数（底层 memoState.get），每次调用拿到的都是最新的正确相机
export const currentCamera = createMemo(() => {
    const type = activeCamera.get();
    console.log(`[Memo] Recalculating camera -> ${type}`);
    return type === "ortho" ? orthoCamera : defaultCamera;
});

// 为了兼容你之前其他模块的写法，把 getCamera 直接指向 currentCamera
export const getCamera = currentCamera;

const frustumSize = 2;

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


// import * as THREE from 'three';
// import { createState, createEffect } from './solid';
// //import { rendererSize } from './scene'; // 引入屏幕尺寸状态
// // ✨ 直接从 store 引入状态
// import { rendererSize } from '../store/viewport';
// // 💡 对外主要暴露的响应式状态，用于业务层切换相机
// export const activeCamera = createState('default');

// const defaultCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
// defaultCamera.position.set(0, 0.5, 3);
// const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// // 维护一个内部的当前相机引用
// export let currentCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera = defaultCamera;

// // 💡 必须暴露一个获取真实相机对象的方法，供 scene 和 composer 底层调用
// export const getCamera = () => currentCamera;

// const frustumSize = 2;

// // 监听状态，切换具体相机
// createEffect(() => {
//     if (activeCamera.get() === "ortho") {
//         currentCamera = orthoCamera;
//         console.log(`camera changed -> ortho`);
//     } else {
//         currentCamera = defaultCamera;
//         console.log(`camera changed -> default`);
//     }
// });

// // 监听屏幕尺寸，自适应更新相机矩阵
// createEffect(() => {
//     const { w, h } = rendererSize.get();
//     activeCamera.get(); // 收集依赖：确保切换相机时，当前相机也能重新计算比例
//     const aspect = w / h;

//     if (currentCamera instanceof THREE.PerspectiveCamera) {
//         currentCamera.aspect = aspect;
//     } else {
//         currentCamera.left = -frustumSize * aspect / 2;
//         currentCamera.right = frustumSize * aspect / 2;
//         currentCamera.top = frustumSize / 2;
//         currentCamera.bottom = -frustumSize / 2;
//     }
//     currentCamera.updateProjectionMatrix();
// });