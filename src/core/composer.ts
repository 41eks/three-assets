import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { createState, createEffect } from './solid';

// ✨ 直接从 store 引入底层实例
import { scene, renderer } from '../store/webgl';
import { rendererSize } from '../store/viewport';
import { getCamera, activeCamera } from './camera';


const PixelShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'uResolution': { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    'uPixelSize': { value: 8.0 } 
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uPixelSize;
    varying vec2 vUv;
    void main() {
      vec2 dxy = uPixelSize / uResolution;
      vec2 coord = dxy * floor(vUv / dxy);
      gl_FragColor = texture2D(tDiffuse, coord);
    }
  `
};

export const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, getCamera());
composer.addPass(renderPass);

export const pixelPass = new ShaderPass(PixelShader);
composer.addPass(pixelPass);

// 💡 导出一个状态，供业务层(UI)随时开启/关闭像素滤镜
export const pixelFilterEnabled = createState(false);

createEffect(() => {
    pixelPass.enabled = pixelFilterEnabled.get();
});

// 监听分辨率变化，同步给 Composer 和滤镜 Shader
createEffect(() => {
    const { w, h } = rendererSize.get();
    composer.setSize(w, h);
    pixelPass.uniforms['uResolution'].value.set(w, h);
});

// 监听相机切换，同步更新 RenderPass 的相机
createEffect(() => {
    activeCamera.get(); // 收集依赖：activeCamera 改变时触发
    renderPass.camera = getCamera();
});