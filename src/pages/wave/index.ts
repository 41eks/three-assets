import * as THREE from 'three';

// pageGroup 作为本页所有对象的容器，方便一次性 add/remove
const pageGroup = new THREE.Group();

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

    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix *
                         modelViewMatrix *
                         vec4(position,1.0);
        }
    `,

    fragmentShader: `
        varying vec2 vUv;

        uniform float time;
        uniform float level;
        uniform float waveScale;
        uniform float waveSpeed;
        uniform float waveTense;

        void main() {

            // 圆内的UV
            vec2 uv = vUv;

            // 波浪高度
            float wave =
                sin(
                    (uv.x + time * waveSpeed)
                    * waveTense
                ) * waveScale
                + level;

            // 液体颜色
            vec3 waterColor = vec3(
                0.1,
                0.5,
                1.0
            );

            // 圆背景颜色
            vec3 bgColor = vec3(
                0.95
            );

            vec3 color =
                uv.y < wave
                ? waterColor
                : bgColor;

            gl_FragColor = vec4(color, 1.0);
        }
    `
});

const circle = new THREE.Mesh(
    geometry,
    material
);
pageGroup.add(circle)

import { hdrEnabled } from '../../core/scene.js';
import { scene } from '../../store/webgl.ts';

import { middleTasks, addTask,type Updatable } from '../../core/scene.js';
import { activeCamera } from '../../core/camera.ts';
const _task:Updatable = (time) => {
  // 正常更新
// skeletonMesh.update(delta);
material.uniforms.time.value =time.elapsed

};
let dispose: (() => void) | undefined;
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
    }
};

