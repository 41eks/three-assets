import * as THREE from 'three';
// import { scene, camera, controls, renderer } from '../core/scene.js';
import Stat from 'three/examples/jsm/libs/stats.module.js';

import { assetsCache } from '../../core/router.ts';
import bgimg from '../../assets/9_暴雨前夕_compress.jpg';


// ✨ 新增：加载背景图片纹理
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load(bgimg);
// 确保色彩空间正确（现代 Three.js 强烈建议设置，否则图片可能显得灰暗或偏色）
bgTexture.colorSpace = THREE.SRGBColorSpace;



// 定义资源路径
const VIDEO_URL =`${__ASSET_BASE_URL__}pages/vid/sonnet.webm`;

// 2. 动态创建视频元素并创建纹理
const video = document.createElement('video');
video.crossOrigin = "anonymous"; // 必须设置，解决跨域问题
video.loop = true;               // 循环播放
video.muted = true;              // 静音（浏览器要求静音才能自动播放或代码控制播放）
video.playsInline = true;        // 重要：保证在移动端也能内联播放，不会自动全屏
video.style.display = "none";    // 隐藏元素
video.preload = "auto";

// ✨ 新增：使用状态标记视频是否已经加载到足够播放的帧
let isVideoReady = false;
video.addEventListener('canplay', () => {
    isVideoReady = true;
});

const texture = new THREE.VideoTexture(video);
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RGBAFormat;


import vertexShader from './vert.glsl'

import fragmentShader from './frag.glsl'

// 4. 创建材质并应用
const material = new THREE.ShaderMaterial({
    uniforms: {
        map: { value: texture }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true // 开启透明渲染
});

// 创建一个占满相机的平面
const geometry = new THREE.PlaneGeometry(2, 2);
const plane = new THREE.Mesh(geometry, material);

// 点击播放后备方案 (提升作用域以便重复使用)
const handlePlay = () => {
    if (isVideoReady || video.readyState >= 3) {
        video.play().catch(e => console.warn("自动播放失败被浏览器拦截:", e));
    }
};

import { renderer } from '../../store/webgl.ts';
import { frustumSize } from '../../core/camera.ts';

import { activeCamera } from '../../core/camera.ts';
import { hdrEnabled } from '../../core/scene.js';
import { scene } from '../../store/webgl.ts';
// import { middleTasks } from '../core/scene.js';
function enter() {
    activeCamera.set("ortho");
    // 3. 计算立绘网格 (Plane) 应该缩放多大
    // 假设正交相机的高度域是 [-1, 1]（总高度2）
    // 我们想让立绘占满屏幕高度的 80% (0.8)
    const targetHeight = frustumSize * 0.8;
    const aspect = 940 / 1160;
    const targetWidth = targetHeight * aspect;

    // 直接缩放平面，而不要去缩放 Canvas！
    plane.scale.set(targetWidth / 2, targetHeight / 2, 1);

    // 4. 让 Three.js 接管背景（比如变成半透明黑或者某种颜色）
    // scene.background =bgTexture;

    // 1. 设置 CSS 背景（不受 3D 场景光照影响，保持原比例）
    if (renderer && renderer.domElement) {
        const canvas = renderer.domElement;
        canvas.style.backgroundImage = `url(${bgimg})`;
        canvas.style.backgroundSize = 'cover'; // 或者 'contain' 保持原比例不拉伸
        canvas.style.backgroundPosition = 'center center';
        canvas.style.backgroundRepeat = 'no-repeat';

        // ✨ 新增核心：强制让 Three.js 背景清理为“完全透明”
        // 这样底层的 CSS 背景图片才能透过 Canvas 显现出来
        renderer.setClearColor(0x000000, 0);
    }
    scene.add(plane);
    hdrEnabled.set(false);

    // ✨ 核心适配逻辑：从缓存中读取 ArrayBuffer 并转换为视频源
    if (!video.src) {
        const buffer = assetsCache.get(VIDEO_URL);
        if (buffer) {
            // 将 ArrayBuffer 包装成 Blob，生成本地可访问的 URL
            const blob = new Blob([buffer], { type: 'video/webm' });
            video.src = URL.createObjectURL(blob);
        } else {
            console.error("未找到视频缓存！");
        }
    }

    // 尝试播放（因为静音 muted=true，大部分现代浏览器允许直接 play）
    video.play().catch(e => {
        console.warn("直接播放失败，等待用户点击交互:", e);
        // 如果拦截了，降级到需要点击
        document.addEventListener('click', handlePlay, { once: true });
    });


}
// import { fixRenderSize, rendererSize } from '../store/viewport.ts';
function leave() {
    // fixRenderSize.set(false);
    // rendererSize.set({ w: window.innerWidth, h: window.innerHeight })
    activeCamera.set("default");

    // 2. 清理工作
    if (renderer && renderer.domElement) {
        renderer.domElement.style.backgroundImage = 'none';

        // ✨ 新增核心：离开时，恢复 Three.js 默认的背景清理颜色（通常是不透明黑 1.0）
        renderer.setClearColor(0x000000, 1);
    }

    scene.remove(plane);
    hdrEnabled.set(true);
    // middleTasks.pop();

    video.pause();
    document.removeEventListener('click', handlePlay);
}
export default {
    enter, leave,
    assets: [VIDEO_URL],
    options: { hdr: false }
}




