
import * as THREE from 'three';
const groudW = 50;
const groudH = 10;

export const ground = new THREE.Group()


const frontGrass = new THREE.Mesh(
    new THREE.PlaneGeometry(groudW, groudH / 2),
    new THREE.MeshStandardMaterial({ color: 0x61974b })
)
frontGrass.position.set(0, -groudH / 4, -0.001);
const backGrass = new THREE.Mesh(
    new THREE.PlaneGeometry(groudW, groudH / 2),
    new THREE.MeshStandardMaterial({ color: 0xb1d744 })
)
backGrass.position.set(0, groudH / 4, -0.001);
import { roadGroup, setDashLinePositionY } from './road';

ground.add(roadGroup, frontGrass, backGrass);
ground.rotateX(-Math.PI / 2);

import { treeGroup, setTreePositionZ } from './tree';



export const buildingGroup = new THREE.Group();
const buildingNum = 20;
const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x75d1c2 });
for (let i = buildingNum; i--;) {
    const width = Math.random() + 1
    const height = Math.random() + 1
    const deep = Math.random()
    const buildingGeometry = new THREE.BoxGeometry(width, height, deep);
    const mesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
    mesh.position.set(
        -groudW / 2 + i * 2 + (Math.random() - 0.5) * 3,
        height / 2,
        -groudH / 2
    )
    buildingGroup.add(mesh);
};


export const cloudGroup = new THREE.Group();
// const cloudMaterial = new THREE.MeshBasicMaterial(0xffffff);
const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
});
const cloud1 = new THREE.Mesh(new THREE.SphereGeometry(0.6), cloudMaterial)
const cloud2 = new THREE.Mesh(new THREE.SphereGeometry(0.8), cloudMaterial)
const cloud3 = new THREE.Mesh(new THREE.SphereGeometry(1), cloudMaterial)
const cloud4 = new THREE.Mesh(new THREE.SphereGeometry(0.7), cloudMaterial)
const cloud5 = new THREE.Mesh(new THREE.SphereGeometry(0.5), cloudMaterial)
cloud1.position.set(-1.6, -0.05, 0)
cloud2.position.set(-1, -0.1, 0)
cloud4.position.set(1, 0, 0)
cloud5.position.set(1.4, 0, 0);
cloudGroup.add(cloud1, cloud2, cloud3, cloud4, cloud5);
cloudGroup.position.set(0, 3, -groudH / 2 - 2)