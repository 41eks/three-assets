
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';



import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setLoadingState, setLoadingPercent } from '../core/ui.js';
import * as THREE from 'three';  // ← 加这行

import { assetsCache } from '../core/router.ts';

import { createPage } from '../core/createPage.js';

const glbfile = 'blueberry/蓝莓.optimized.glb'

const loadModel = (): Promise<THREE.Group> => {
    const buffer = assetsCache.get(glbfile);
    if (!buffer) throw new Error('未找到模型缓存');
    return new Promise<THREE.Group>((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        loader.parseAsync(
            buffer,
            ""

        ).then((gltf: GLTF) => {
            const root = gltf.scene; // 保存根节点

            // 将处理好的 gltf.scene 抛出
            resolve(root);
        });
    });
};
import { pixelFilterEnabled } from '../core/composer.ts';
import { createSwitchFactory } from '../component/Switch.tsx';
const createPixelFilterSwitch = createSwitchFactory(pixelFilterEnabled, "Pixel")
const pfSwitch = createPixelFilterSwitch();

document.body.appendChild(pfSwitch.element);
// export default createPage(loadModel);
const pagebase = createPage(loadModel);
export default {
    ...pagebase,
    assets: [glbfile], // 手动声明 assets
    enter: () => {
        pfSwitch.element.style.display = 'block';
        pagebase.enter()
    },
    leave: () => {
        pfSwitch.element.style.display = 'none';
        pagebase.leave();
    }
};