
import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// 引入生成的材质方法
import { createDissolveMaterial } from './dissolveMaterial.js';

// 引入你的图片资源
import targetImg from '../../assets/lemontexure.jpg';
import noiseImg from '../../assets/noise.png'; // ⚠️ 你需要准备一张噪声图

import { createPage } from '../../core/createPage.js';



const pageGroup = new THREE.Group();



// ==========================================
// 核心：加载纹理并创建网格
// ==========================================
const textureLoader = new THREE.TextureLoader();
let dissolveMat;


// ==========================================
const _task = (time) => {

    // 动态更新 Shader 里的时间变量
    if (dissolveMat) {
        dissolveMat.uniforms.uTime.value = time.elapsed;
    }

};
let dispose: (() => void) | undefined;


const loadModel = (): Promise<THREE.Group> => {

    return new Promise<THREE.Group>((resolve, reject) => {

        Promise.all([
            textureLoader.loadAsync(targetImg),
            textureLoader.loadAsync(noiseImg)
        ]).then(([baseTexture, noiseTexture]) => {
            // 噪声图最好设置重复模式，以便贴图坐标偏移时不会采样到边缘
            noiseTexture.wrapS = THREE.RepeatWrapping;
            noiseTexture.wrapT = THREE.RepeatWrapping;

            // 创建材质
            dissolveMat = createDissolveMaterial(baseTexture, noiseTexture);

            // 创建一个平面承载你的 Image (假设图片宽高比是 1:1，你可以根据实际调整比例)
            const geometry = new THREE.PlaneGeometry(2, 2);
            const mesh = new THREE.Mesh(geometry, dissolveMat);
            pageGroup.add(mesh);
            resolve(pageGroup);
        });

    },
    );
};
import { addTask } from '../../core/scene.js';
const pageBase = createPage(loadModel);
export default {
    ...pageBase,
    assets: [], // 手动声明 assets
    enter: () => {
        dispose?.(); // 防御性处理
        pageBase.enter();
        dispose = addTask(_task);
    },
    leave: () => {
        pageBase.leave();
        dispose?.();
        dispose = undefined;
    }
};

