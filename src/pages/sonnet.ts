import * as THREE from 'three';
import { scene, camera, controls, renderer } from '../core/scene.js';
import Stat from 'three/examples/jsm/libs/stats.module.js';
// const pageGroup = new THREE.Group();




// 2. 动态创建视频元素并创建纹理
const video = document.createElement('video');
video.src = "https://files.rainbowgem.dpdns.org/public/vid/1999/sonnet.webm";
video.crossOrigin = "anonymous"; // 必须设置，解决跨域问题
video.loop = true;               // 循环播放
video.muted = true;              // 静音（浏览器要求静音才能自动播放或代码控制播放）
video.playsInline = true;        // 重要：保证在移动端也能内联播放，不会自动全屏
video.style.display = "none";    // 隐藏元素

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





// 5. 点击播放视频（因为浏览器限制自动播放）
document.addEventListener('click', () => {
    video.play();
}, { once: true }); // 只监听一次


import { activeCamera } from '../core/scene.js';
import { hdrEnabled } from '../core/scene.js';
import { middleTasks, rendererSize, fixRenderSize } from '../core/scene.js';
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



}
function leave() {
    fixRenderSize.set(false);
    rendererSize.set({ w: window.innerWidth, h: window.innerHeight })
    activeCamera.set("default");
    // 恢复背景
    scene.background = null;

    scene.remove(plane);
    hdrEnabled.set(true);
    // middleTasks.pop();
}
export default {
    enter, leave
}




