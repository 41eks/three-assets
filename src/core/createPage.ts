import { controls } from './scene.js';
import { setLoadingState } from './ui.js';
import * as THREE from 'three';
import type { Page } from '../types/router.js';
import { currentCamera as camera } from './camera.js';
import { scene } from '../store/webgl.js';

export function createPage(setup: () => Promise<THREE.Object3D> | THREE.Object3D): Page {
    let root: THREE.Object3D | null = null;

    async function enter() {
        camera().position.set(0, 0.5, 3);
        controls.target.set(0, 0, 0);
        const initHash = window.location.hash;

        if (root) {
            scene.add(root);
            return;
        }

        setLoadingState(true);
        try {
            root = await setup();
            if (window.location.hash === initHash) {
                scene.add(root);
            }
        } catch (error) {
            console.error('页面 setup 失败:', error);
        } finally {
            setLoadingState(false);
        }
    }

    function leave() {
        if (root) scene.remove(root);
    }

    // 只返回最基础的生命周期和默认选项
    return {
        enter,
        leave,
        options: { hdr: true }
    };
}