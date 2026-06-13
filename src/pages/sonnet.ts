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
    fixRenderSize.set(true);
    const aspect = 940 / 1160;
    let height = Math.floor(window.innerHeight * 0.8);
    let width = Math.floor(height * aspect);
    // renderer.setSize(width, height);
    rendererSize.set({ w: width, h: height })
    activeCamera.set("ortho");
    // renderer.setClearColor(0x95e4e8);
    scene.add(plane);
    hdrEnabled.set(false);
    // camera.position.set(0, 0.5, 3);
    // camera.lookAt(new THREE.Vector3(0, 0, 0))
    // controls.target.set(0, 0, 0);
    middleTasks.push((time) => {

        // cloudGroup.position.x = Math.sin(time * 0.3) * 7
    })


}
function leave() {
    fixRenderSize.set(false);
    rendererSize.set({ w: window.innerWidth, h: window.innerHeight })
    activeCamera.set("default");
    // renderer.setClearColor(0x000000);
    scene.remove(plane);
    hdrEnabled.set(true);
    middleTasks.pop();
}
export default {
    enter, leave
}
import * as THREE from 'three';  // ← 加这行


// import { createPage } from '../../core/createPage.js';



