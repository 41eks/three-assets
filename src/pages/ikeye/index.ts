import * as THREE from 'three';
import spine from '../../libs/spine-threejs.js';
import { hdrEnabled } from '../../core/scene.js';
import { scene } from '../../store/webgl.ts';
import { addTask } from '../../core/scene.js';
import { activeCamera } from '../../core/camera.ts';

const baseUrl = import.meta.env.VITE_BASE_URL;

// ---------------------------------------------------------
// 模块级常量
// ---------------------------------------------------------
const SPINE_BASE_URL = `${baseUrl}spine-assets/eye/`;
const SKEL_FILE = "skeleton.skel";
const ATLAS_FILE = "skeleton.atlas";
const DEFAULT_ANIM = "target"; // 改成你 eye 模型实际有的动画名

// ---------------------------------------------------------
// 场景容器
// ---------------------------------------------------------
const pageGroup = new THREE.Group();

// 调试辅助（生产可删）
const axesHelper = new THREE.AxesHelper(10);
const gridHelper = new THREE.GridHelper(30, 30);
gridHelper.rotation.x = Math.PI / 2;
pageGroup.add(axesHelper);
pageGroup.add(gridHelper);


let skeletonMesh: any = null;
let targetBone: any = null;   // 需要控制的骨骼
// let assetsQueued = false;  // 防止重复排队

// 鼠标/目标位置（Spine 局部坐标）
const pointerTarget = new THREE.Vector2(0, 0);

// ---------------------------------------------------------
// 鼠标监听：将屏幕坐标转换为 Spine 局部坐标
// ---------------------------------------------------------
function onPointerMove(e: PointerEvent) {
    // 归一化到 [-1, 1]
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;

    // Spine 模型缩放 0.01，原始约 1200px 宽 → 约 12 单位
    // 根据你的模型实际尺寸微调系数
    pointerTarget.set(nx * 6, -ny * 6);
}


const assetManager = new spine.threejs.AssetManager(SPINE_BASE_URL);

const parseAssets = () => {
    const atlas = assetManager.get(ATLAS_FILE);
    console.log("📦 Atlas pages:", atlas.pages.map((p: any) => p.name));
    console.log("📦 Atlas regions:", atlas.regions.map((r: any) => r.name));

    const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
    const binary = new spine.SkeletonBinary(atlasLoader);
    binary.scale = 0.01;

    const skeletonData = binary.readSkeletonData(assetManager.get(SKEL_FILE));
    console.log("💀 骨骼数据加载成功！");
    console.log("🦴 可用骨骼:", skeletonData.bones.map((b: any) => b.name));
    console.log("🎬 可用动画:", skeletonData.animations.map((a: any) => a.name));

    const mesh = new spine.threejs.SkeletonMesh(skeletonData, (params: any) => {
        params.depthTest = false;
        params.alphaTest = 0.001;
    });

    const availableAnims: string[] = skeletonData.animations.map((a: any) => a.name);
    const animToPlay = availableAnims.includes(DEFAULT_ANIM)
        ? DEFAULT_ANIM
        : availableAnims[0];

    if (animToPlay) {
        mesh.state.setAnimation(0, animToPlay, true);
        console.log(`🎬 播放动画: [${animToPlay}]`);
    } else {
        console.warn("⚠️ 没有可用动画");
    }

    targetBone = mesh.skeleton.findBone('target');
    if (targetBone) {
        console.log("🎯 找到 target 骨骼:", targetBone.data.name);
    } else {
        console.warn(
            "⚠️ 未找到名为 'target' 的骨骼，可用骨骼：",
            mesh.skeleton.bones.map((b: any) => b.data.name)
        );
    }
    return mesh as unknown as THREE.Object3D;
};

// ---------------------------------------------------------
// 每帧任务
// ---------------------------------------------------------
const _task = (_time: { dt: number }) => {
    if (!skeletonMesh) return;
    // ✅ 先更新动画
    skeletonMesh.update(_time.dt);

    // ✅ 动画 apply 之后再修改骨骼，避免被动画覆盖
    if (targetBone) {
        // 平滑插值，让眼睛跟随鼠标，lerp 系数越小越滞后
        targetBone.x += (pointerTarget.x - targetBone.x) * 0.1;
        targetBone.y += (pointerTarget.y - targetBone.y) * 0.1;
    }
};

// ---------------------------------------------------------
// dispose 句柄
// ---------------------------------------------------------
let dispose: (() => void) | undefined;
const postParse = (mesh: THREE.Object3D) => {
    pageGroup.add(mesh);
    pageGroup.position.y = 0;
    console.log("✅ 骨骼 Mesh 已加入场景");
    skeletonMesh = mesh;
}
import { createWait } from '../../utils/waitSpineReady.ts';



// ---------------------------------------------------------
// 页面生命周期
// ---------------------------------------------------------
function enter() {

    activeCamera.set("ortho");
    hdrEnabled.set(false);

    window.addEventListener('pointermove', onPointerMove);

    if (!pageGroup.parent) scene.add(pageGroup);
    if (skeletonMesh && !dispose) dispose = addTask(_task);
    console.log(scene)

}

function leave() {
    window.removeEventListener('pointermove', onPointerMove);

    scene.remove(pageGroup);

    activeCamera.set("default");
    hdrEnabled.set(true);

    dispose?.();
    dispose = undefined;
}

// ---------------------------------------------------------
// 导出：路由器标准接口
// ---------------------------------------------------------
export default {
    enter,
    leave,
    assets: [createWait(assetManager, parseAssets, postParse, { skel: SKEL_FILE, atlas: ATLAS_FILE, png: `${SPINE_BASE_URL}skeleton.png` })],
    options: {
        hdr: false
    }, popups: [
        {

            imgSrc: `https://zh.esotericsoftware.com/img/blog/eye-limit/eye-blog.gif`,
            text: 'Distance-limit-setup-for-eyes',
            link: 'https://zh.esotericsoftware.com/blog/Distance-limit-setup-for-eyes',
            delay: 2000,      // 2秒后显示
            duration: 10000   // 10秒后消失
        }
    ], controls: false
};
