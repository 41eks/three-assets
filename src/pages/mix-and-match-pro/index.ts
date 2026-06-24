import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import * as spine from '@esotericsoftware/spine-threejs'; // 引入 Spine 运行时
import spine from '../../libs/spine-threejs.js'
const baseUrl = import.meta.env.VITE_BASE_URL;

// ---------------------------------------------------------
// 模块级常量：只声明，不副作用
// ---------------------------------------------------------
const SPINE_BASE_URL = `${baseUrl}spine-assets/`;
const SKEL_FILE = "mix-and-match-pro.skel";
const ATLAS_FILE = "mix-and-match-pro.atlas";
const DEFAULT_SKIN = "full-skins/girl";
const DEFAULT_ANIM = "walk";

// pageGroup 作为本页所有对象的容器，方便一次性 add/remove
const pageGroup = new THREE.Group();

// 调试辅助（开发期保留，生产可删除）
const axesHelper = new THREE.AxesHelper(10);
const gridHelper = new THREE.GridHelper(30, 30);
gridHelper.rotation.x = Math.PI / 2;
pageGroup.add(axesHelper);
pageGroup.add(gridHelper);

// ---------------------------------------------------------
// Spine 资源管理器（模块级单例，只创建一次）
// ---------------------------------------------------------
const assetManager = new spine.threejs.AssetManager(SPINE_BASE_URL);

// skeletonMesh 延迟到 enter() 首次加载完成后初始化
let skeletonMesh = null;
let assetsQueued = false; // 防止重复排队加载


// const assetManager = new spine.threejs.AssetManager("/spine-assets/");

assetManager.loadBinary("mix-and-match-pro.skel");
assetManager.loadTextureAtlas("mix-and-match-pro.atlas");



// ---------------------------------------------------------
// 内部：初始化骨骼 Mesh（仅在资源就绪后调用一次）
// ---------------------------------------------------------
function initSkeleton() {
    const atlas = assetManager.get(ATLAS_FILE);
    const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
    const binary = new spine.SkeletonBinary(atlasLoader);

    // 1200px 模型缩到约 12 单位高，适配默认相机
    binary.scale = 0.01;

    const skeletonData = binary.readSkeletonData(assetManager.get(SKEL_FILE));

    console.log("💀 骨骼数据加载成功！");
    console.log("👗 可用皮肤:", skeletonData.skins.map(s => s.name));

    skeletonMesh = new spine.threejs.SkeletonMesh(skeletonData, (params) => {
        params.depthTest = true;
        params.depthWrite = true;
    });

    // 换装：优先使用 DEFAULT_SKIN，否则回退到第一个非 default 皮肤
    const availableSkins = skeletonData.skins
        .map(s => s.name)
        .filter(n => n !== "default");

    const targetSkin = availableSkins.includes(DEFAULT_SKIN)
        ? DEFAULT_SKIN
        : availableSkins[0];

    if (targetSkin) {
        skeletonMesh.skeleton.setSkinByName(targetSkin);
        skeletonMesh.skeleton.setSlotsToSetupPose();
        console.log(`👕 已穿上皮肤: [${targetSkin}]`);
    } else {
        console.warn("⚠️ 该模型没有除 default 外的皮肤");
    }

    skeletonMesh.state.setAnimation(0, DEFAULT_ANIM, true);
    pageGroup.add(skeletonMesh);

    console.log("✅ 骨骼 Mesh 已加入场景");
}


import { hdrEnabled } from '../../core/scene.js';
import { scene } from '../../store/webgl.ts';

import { middleTasks } from '../../core/scene.js';
import { activeCamera } from '../../core/camera.ts';
// ---------------------------------------------------------
// 页面生命周期
// ---------------------------------------------------------
function enter() {
    activeCamera.set("ortho");
    // 切换到适合查看 Spine 角色的相机（与 sonetto 保持一致）
    // activeCamera.set("default");
    hdrEnabled.set(false);

    // 排队加载 Spine 资源（只在首次 enter 时执行）
    if (!assetsQueued) {
        assetManager.loadBinary(SKEL_FILE);
        assetManager.loadTextureAtlas(ATLAS_FILE);
        assetsQueued = true;
    }

    scene.add(pageGroup);
    middleTasks.push((time) => {

        // 等待资源加载完成
        if (!assetManager.isLoadingComplete()) {
            return;
        }

        // 首帧：初始化骨骼
        if (!skeletonMesh) {
            initSkeleton();
            return;
        }

        skeletonMesh.update(time.dt);

    })

}

function leave() {

    // 从场景移除本页所有对象
    scene.remove(pageGroup);

    // 恢复全局状态
    activeCamera.set("default");
    hdrEnabled.set(true);
    middleTasks.pop();
}

// ---------------------------------------------------------
// 导出：路由器标准接口
// ---------------------------------------------------------
export default {
    enter,
    leave,
    assets: [] // Spine 文件由 assetManager 自行管理，无需路由器预加载
};

