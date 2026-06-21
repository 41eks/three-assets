import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { scene, camera, renderer } from '../scene.js'; // 假设你能拿到 renderer


const PixelShader = {
uniforms: {
  // tDiffuse 是 Three.js 后期处理内置的，代表刚刚渲染好的场景画面 (对应你的 color_buffer)
  'tDiffuse': { value: null },
  // 屏幕的分辨率
  'uResolution': { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  // 像素块大小系数，值越大马赛克越大 (类似你之前的 0.05 倒数)
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
    // 对应你的: vec2 texfac = vec2(texsize) / pixelSize;
    // 这里我们直接算出当前像素格的宽高比
    vec2 dxy = uPixelSize / uResolution;
    
    // 对应你的: vec2 pix_coords = floor(uvcoordsvar * texfac) / texfac;
    vec2 coord = dxy * floor(vUv / dxy);
    
    // 对应你的: vec4 scene_col = texture(color_buffer, pix_coords);
    gl_FragColor = texture2D(tDiffuse, coord);
  }
`
};


// 1. 创建效果合成器
export const composer = new EffectComposer(renderer);

// 2. 第一步：先正常渲染场景 (必须要有这一步，否则没有原始画面)
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 3. 第二步：添加我们自定义的像素化滤镜
const pixelPass = new ShaderPass(PixelShader);
composer.addPass(pixelPass);