import * as THREE from 'three';

// pageGroup 作为本页所有对象的容器，方便一次性 add/remove
const pageGroup = new THREE.Group();
import vertexShader from './vert.glsl'

import fragmentShader from './frag.glsl'
// 调试辅助（开发期保留，生产可删除）
const axesHelper = new THREE.AxesHelper(10);
const gridHelper = new THREE.GridHelper(30, 30);
gridHelper.rotation.x = Math.PI / 2;
pageGroup.add(axesHelper);
pageGroup.add(gridHelper);

const geometry = new THREE.CircleGeometry(5, 128);

const material = new THREE.ShaderMaterial({
    transparent: true,

    uniforms: {
        time: { value: 0 },
        level: { value: 0.5 },
        waveScale: { value: 0.05 },
        waveSpeed: { value: 1.0 },
        waveTense: { value: 8.0 },
    },

    vertexShader,

    fragmentShader
});

const circle = new THREE.Mesh(
    geometry,
    material
);
pageGroup.add(circle)

import { hdrEnabled } from '../../core/scene.js';
import { scene } from '../../store/webgl.ts';

import { middleTasks, addTask, type Updatable } from '../../core/scene.js';
import { activeCamera } from '../../core/camera.ts';
const _task: Updatable = (time) => {
    // 正常更新
    // skeletonMesh.update(delta);
    material.uniforms.time.value = time.elapsed

};
let dispose: (() => void) | undefined;

const baseUrl = import.meta.env.VITE_BASE_URL;
import { createNewsAdPopup } from '../../component/NewsAdPopup.tsx';
// 记录计时器 ID，用于在 leave 时清理
let showPopupTimer: number | null = null;


// ---------------------------------------------------------
// 页面生命周期
// ---------------------------------------------------------
function enter() {
    dispose?.(); // 防御性处理
    activeCamera.set("ortho");
    // 切换到适合查看 Spine 角色的相机（与 sonetto 保持一致）
    // activeCamera.set("default");
    hdrEnabled.set(false);

    scene.add(pageGroup);
    dispose = addTask(_task);

}

function leave() {
    // --- 新增逻辑：清理计时器并立即隐藏 ---
    if (showPopupTimer) {
        clearTimeout(showPopupTimer);
        showPopupTimer = null;
    }


    // 从场景移除本页所有对象
    scene.remove(pageGroup);

    // 恢复全局状态
    activeCamera.set("default");
    hdrEnabled.set(true);
    // middleTasks.pop();
    // dispose();
    dispose?.();
    dispose = undefined;
}

// ---------------------------------------------------------
// 导出：路由器标准接口
// ---------------------------------------------------------
export default {
    enter,
    leave,
    assets: [] // Spine 文件由 assetManager 自行管理，无需路由器预加载
    , options: {
        hdr: false
    }, popups: [{
        imgSrc: `${baseUrl}refer/a563c0a97660262d0f95d3b2448f53d246359050.jpg@256w_144h_1c.avif`,
        text: '一个波浪效果，所以说能用shader解决的不要自己瞎搞',
        link: 'https://www.bilibili.com/video/BV1a66JYUEkC/',
        delay: 2000,      // 2秒后显示
        duration: 10000   // 10秒后消失
    }]
};

