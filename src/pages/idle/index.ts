
import * as THREE from 'three';
import spine from '../../libs/spine-threejs.js';
import { hdrEnabled } from '../../core/scene.js';
import { scene } from '../../store/webgl.ts';
import { addTask } from '../../core/scene.js';
import { activeCamera } from '../../core/camera.ts';
import { createWait } from '../../utils/waitSpineReady.ts';

const baseUrl = import.meta.env.VITE_BASE_URL;



const SPINE_BASE_URL = `${baseUrl}spine-assets/idle/`;
const SKEL_FILE = "04.json";
const ATLAS_FILE = "04.atlas";
const DEFAULT_SKIN = "full-skins/girl";
const DEFAULT_ANIM = "idle";

const link = document.createElement('link');
link.rel = 'preload';
link.as = 'image';
link.href = `${SPINE_BASE_URL}04.png`;
link.crossOrigin = 'anonymous';  // ← 加这行
document.head.appendChild(link);

const pageGroup = new THREE.Group();
const axesHelper = new THREE.AxesHelper(10);
const gridHelper = new THREE.GridHelper(30, 30);
gridHelper.rotation.x = Math.PI / 2;
pageGroup.add(axesHelper);
pageGroup.add(gridHelper);

let skeletonMesh: any = null;

const assetManager = new spine.threejs.AssetManager(SPINE_BASE_URL);

const parseAssets = () => {
    const atlas = assetManager.get(ATLAS_FILE);
    const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
    const binary = new spine.SkeletonJson(atlasLoader);
    binary.scale = 0.01;

    const skeletonData = binary.readSkeletonData(assetManager.get(SKEL_FILE));
    console.log("💀 骨骼数据加载成功！");
    console.log("👗 可用皮肤:", skeletonData.skins.map((s: any) => s.name));
    // 👇 加这行，看看真正加载进来的动画叫什么名字
    console.log("🎬 包含的动画:", skeletonData.animations.map((a: any) => a.name));
    const mesh = new spine.threejs.SkeletonMesh(skeletonData, (params: any) => {
        params.depthTest = true;
        params.depthWrite = true;
    });
    console.log(JSON.stringify(mesh));
    const availableSkins: string[] = skeletonData.skins
        .map((s: any) => s.name)
        .filter((n: string) => n !== "default");

    const targetSkin = availableSkins.includes(DEFAULT_SKIN)
        ? DEFAULT_SKIN
        : availableSkins[0];

    // if (targetSkin) {
    //     mesh.skeleton.setSkinByName(targetSkin);
    //     mesh.skeleton.setSlotsToSetupPose();
    //     console.log(`👕 已穿上皮肤: [${targetSkin}]`);
    // } else {
    //     console.warn("⚠️ 该模型没有除 default 外的皮肤");
    // }

    mesh.state.setAnimation(0, DEFAULT_ANIM, true);

    return mesh
};

let dispose: (() => void) | undefined;

const postParse = (mesh: spine.threejs.SkeletonMesh) => {
    pageGroup.add(mesh as unknown as THREE.Object3D);
    pageGroup.position.y = -6;
    console.log("✅ 骨骼 Mesh 已加入场景");
    skeletonMesh = mesh;
    dispose = addTask(_task);
};

const _task = (time: { dt: number }) => {
    if (!skeletonMesh) return;
    skeletonMesh.update(time.dt);
};

function enter() {
    activeCamera.set("ortho");
    hdrEnabled.set(false);
    // scene.add(pageGroup);
    if (!pageGroup.parent) scene.add(pageGroup);
    if (skeletonMesh) dispose = addTask(_task);  // ← 第二次起在这里注册
}

function leave() {
    // console.log('leave mix-and-match-pro');  // ← 加这行
    scene.remove(pageGroup);
    activeCamera.set("default");
    hdrEnabled.set(true);
    dispose?.();
    dispose = undefined;
}

export default {
    enter,
    leave,
    assets: [createWait(assetManager, parseAssets, postParse, { skel: SKEL_FILE, atlas: ATLAS_FILE, png: `${SPINE_BASE_URL}04.png` })],
    options: { hdr: false }
};