// import { scene, camera, controls, renderer } from '../../core/scene.js';
import Stat from 'three/examples/jsm/libs/stats.module.js';
import { ground, buildingGroup, cloudGroup } from './bg.js';
import { treeGroup } from './tree.js';
const pageGroup = new THREE.Group();
pageGroup.add(ground);
pageGroup.add(treeGroup);
pageGroup.add(buildingGroup);
pageGroup.add(cloudGroup)

const ambientLight =
    new THREE.AmbientLight(0xffffff, 0.2);

const directionalLight =
    new THREE.DirectionalLight(0xffffff);

pageGroup.add(ambientLight);
pageGroup.add(directionalLight);

import { currentCamera as camera } from '../../core/camera.js';
import { scene } from '../../store/webgl.js';
import { renderer } from '../../store/webgl.js';

import { hdrEnabled } from '../../core/scene.js';
import { setDashLinePositionY } from './road.js';
import { setTreePositionZ } from './tree.js';
import { middleTasks, addTask } from '../../core/scene.js';
const _task = (time) => {
    // dashLineGroup.position.y = -time * 0.2 % 3;
    setDashLinePositionY(-time.elapsed * 0.6 % 3);
    // treeGroup.position.z = time * 0.2 % 3;
    setTreePositionZ(time.elapsed * 0.6 % 3);
    cloudGroup.position.x = Math.sin(time.elapsed * 0.3) * 7
}

let dispose: (() => void) | undefined;
function enter() {
    dispose?.(); // 防御性处理
    renderer.setClearColor(0x95e4e8);
    scene.add(pageGroup);
    hdrEnabled.set(false);
    camera().position.set(0, 0.5, 3);
    camera().lookAt(new THREE.Vector3(0, 0, 0))
    // controls.target.set(0, 0, 0);
    // middleTasks.push()
    dispose = addTask(_task);


}
function leave() {
    renderer.setClearColor(0x000000);
    scene.remove(pageGroup);
    hdrEnabled.set(true);
    // middleTasks.pop();
    dispose?.();
    dispose = undefined;
}
export default {
    enter, leave
}
import * as THREE from 'three';



