import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene, camera, controls, renderer } from './scene.js';
import { setLoadingState, setLoadingPercent } from './ui.js';
import * as THREE from 'three';  // ← 加这行

// 定义一个页面生命周期接口
interface Page {
  enter: () => void;
  leave: () => void;
}
export function createPage(glbLoadFn: () => Promise<THREE.Group<THREE.Object3DEventMap>>): Page {


    let root: THREE.Object3D | null = null; // 记住根节点
    function enter() {
        camera.position.set(0, 0.5, 3);
        controls.target.set(0, 0, 0);
        // 1. 记录当前页面的 hash
        const initHash = window.location.hash;

        // --- 【新增】封装好的工具函数 ---

        // 工具 1：校验页面并上屏
        const addModel = (root: THREE.Object3D) => {
            if (window.location.hash === initHash) {
                scene.add(root);
                setLoadingState(false);
            } else {
                console.log('页面已切换，模型仅缓存不上屏');
                setLoadingState(false);
            }
        };

        // showLoading(true);

        if (root) {
            scene.add(root); // 已加载过，直接加回来
            return;
        } else {
            setLoadingState(true);
        }


        glbLoadFn().then((model) => {
            root = model;
            console.log('模型加载完成');
            console.log(root
            );
            addModel(root); // 如果 addModel 需要接收参数的话
            setLoadingState(false);
        });
    }
    function leave() {
        if (root) scene.remove(root); // 只移出场景，不销毁，下次还能用
    }
    return { enter, leave }
}