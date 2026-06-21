import * as THREE from 'three';
// import { scene, camera, controls, renderer } from '../core/scene.js';
import Stat from 'three/examples/jsm/libs/stats.module.js';
// const pageGroup = new THREE.Group();

// ✨ 新增：引入路由中的资源缓存 Map
import { assetsCache } from '../core/router.ts';

// 定义资源路径
const VIDEO_URL = "https://files.rainbowgem.dpdns.org/public/vid/1999/sonnet.webm";

// 2. 动态创建视频元素并创建纹理
const video = document.createElement('video');
// video.src = "https://files.rainbowgem.dpdns.org/public/vid/1999/sonnet.webm";
video.crossOrigin = "anonymous"; // 必须设置，解决跨域问题
video.loop = true;               // 循环播放
video.muted = true;              // 静音（浏览器要求静音才能自动播放或代码控制播放）
video.playsInline = true;        // 重要：保证在移动端也能内联播放，不会自动全屏
video.style.display = "none";    // 隐藏元素
video.preload = "auto";  // ✨ 新增：强制浏览器尽早预加载视频数据

// ✨ 新增：使用状态标记视频是否已经加载到足够播放的帧
let isVideoReady = false;
video.addEventListener('canplay', () => {
    isVideoReady = true;
});

const texture = new THREE.VideoTexture(video);
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RGBAFormat;


// 3. 编写自定义着色器 (Shader)
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv; // 传递 UV 坐标给片元着色器
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // ✨ 删掉了 projectionMatrix 和 modelViewMatrix
    // 直接把平面的 [-1, 1] 顶点坐标作为屏幕坐标！
    //gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D map;
  varying vec2 vUv;

  void main() {
    // vUv.y 在 WebGL 中是从下到上 (0.0 到 1.0)
    // 视频上半部分 (颜色): y 范围是 0.5 到 1.0
    vec2 colorUv = vec2(vUv.x, vUv.y * 0.5 + 0.5);
    // 视频下半部分 (黑白蒙版): y 范围是 0.0 到 0.5
    vec2 alphaUv = vec2(vUv.x, vUv.y * 0.5);

    // 分别采样颜色和蒙版
    vec4 color = texture2D(map, colorUv);
    vec4 mask = texture2D(map, alphaUv);

    // 方式一：平滑透明 (推荐)
    // 直接使用蒙版的红色通道作为透明度，边缘会非常平滑
    // float alpha = mask.r;

    // 方式二：硬边缘透明 (完全模拟你原来的 Canvas 代码 <= 90 的逻辑)
    // 90 / 255.0 ≈ 0.353
    float alpha = step(0.353, mask.r);

    // 输出最终颜色
    gl_FragColor = vec4(color.rgb, alpha);
  }
`;

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




import { activeCamera } from '../core/camera.ts';
import { hdrEnabled } from '../core/scene.js';
import { scene } from '../store/webgl.ts';
// import { middleTasks } from '../core/scene.js';
function enter() {
    activeCamera.set("ortho");
    // 3. 计算立绘网格 (Plane) 应该缩放多大
    // 假设正交相机的高度域是 [-1, 1]（总高度2）
    // 我们想让立绘占满屏幕高度的 80% (0.8)
    const targetHeight = 2 * 0.8;
    const aspect = 940 / 1160;
    const targetWidth = targetHeight * aspect;

    // 直接缩放平面，而不要去缩放 Canvas！
    plane.scale.set(targetWidth / 2, targetHeight / 2, 1);

    // 4. 让 Three.js 接管背景（比如变成半透明黑或者某种颜色）
    scene.background = new THREE.Color(0x00ff00);
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
    // 恢复背景
    scene.background = null;

    scene.remove(plane);
    hdrEnabled.set(true);
    // middleTasks.pop();

    // ✨ 新增：离开页面时暂停视频并重置事件，节约性能
    video.pause();
    document.removeEventListener('click', handlePlay);
}
export default {
    enter, leave,
    // ✨ 新增：声明该页面需要的资源，路由会在触发 enter 前自动下载并缓存它
    assets: [VIDEO_URL]
}




