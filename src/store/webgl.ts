
import * as THREE from 'three';
import { createState, createEffect } from '../core/solid';

// 1. 导出全局唯一的 Scene
export const scene = new THREE.Scene();
// 2. 获取 HTML 中的 canvas 元素
const canvasElement = document.getElementById('webgl-canvas') as HTMLCanvasElement;
// 2. 导出全局唯一的 Renderer
export const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement, // 核心修改：指定渲染目标为现有的 canvas
    antialias: true
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// document.body.appendChild(renderer.domElement);

// 3. 画布的显示/隐藏状态
export const canvasVisible = createState(true);
createEffect(() => {
    renderer.domElement.style.display = canvasVisible.get() ? 'block' : 'none';
});