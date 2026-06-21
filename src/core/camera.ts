
import * as THREE from 'three';
import { createState, createEffect } from './solid';
//import { rendererSize } from './scene'; // 引入屏幕尺寸状态
// ✨ 直接从 store 引入状态
import { rendererSize } from '../store/viewport';
// 💡 对外主要暴露的响应式状态，用于业务层切换相机
export const activeCamera = createState('default');

const defaultCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
defaultCamera.position.set(0, 0.5, 3);
const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// 维护一个内部的当前相机引用
export let currentCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera = defaultCamera;

// 💡 必须暴露一个获取真实相机对象的方法，供 scene 和 composer 底层调用
export const getCamera = () => currentCamera;

const frustumSize = 2;

// 监听状态，切换具体相机
createEffect(() => {
    if (activeCamera.get() === "ortho") {
        currentCamera = orthoCamera;
        console.log(`camera changed -> ortho`);
    } else {
        currentCamera = defaultCamera;
        console.log(`camera changed -> default`);
    }
});

// 监听屏幕尺寸，自适应更新相机矩阵
createEffect(() => {
    const { w, h } = rendererSize.get();
    activeCamera.get(); // 收集依赖：确保切换相机时，当前相机也能重新计算比例
    const aspect = w / h;

    if (currentCamera instanceof THREE.PerspectiveCamera) {
        currentCamera.aspect = aspect;
    } else {
        currentCamera.left = -frustumSize * aspect / 2;
        currentCamera.right = frustumSize * aspect / 2;
        currentCamera.top = frustumSize / 2;
        currentCamera.bottom = -frustumSize / 2;
    }
    currentCamera.updateProjectionMatrix();
});