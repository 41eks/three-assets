import { scene, camera, controls, renderer } from '../../core/scene.js';
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



import { hdrEnabled } from '../../core/scene.js';
import { setDashLinePositionY } from './road.js';
import { setTreePositionZ } from './tree.js';
import { middleTasks } from '../../core/scene.js';
export function enter() {
    renderer.setClearColor(0x95e4e8);
    scene.add(pageGroup);
    hdrEnabled.set(false);
    camera.position.set(0, 0.5, 3);
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    controls.target.set(0, 0, 0);
    middleTasks.push((time) => {
        // dashLineGroup.position.y = -time * 0.2 % 3;
        setDashLinePositionY(-time * 0.6 % 3);
        // treeGroup.position.z = time * 0.2 % 3;
        setTreePositionZ(time * 0.6 % 3);
        cloudGroup.position.x = Math.sin(time * 0.3) * 7
    })


}
export function leave() {
    renderer.setClearColor(0x000000);
    scene.remove(pageGroup);
    hdrEnabled.set(true);
    middleTasks.pop();
}

import * as THREE from 'three';  // ← 加这行


// import { createPage } from '../../core/createPage.js';



