
import * as THREE from 'three';
const groudW = 50;
const groudH = 10;
const w = window.innerWidth;
const h = window.innerHeight;
export const treeGroup = new THREE.Group();
const leftTreeGroup = new THREE.Group();
const singleTreeGroup = new THREE.Group();
const treeTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.2, 5),
    new THREE.MeshStandardMaterial({ color: 0x64a525 })
)
const treeMid = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.3, 5)
    , new THREE.MeshStandardMaterial({ color: 0x64a525 })
)
const treeBottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x7a5753 })

)
const treeShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 5),
    new THREE.MeshBasicMaterial({ color: 0x203d22 })
)
treeTop.position.y = 0.55
treeMid.position.y = 0.4
treeBottom.position.y = 0.2
treeShadow.rotateX(-Math.PI / 2);
singleTreeGroup.add(treeTop, treeMid, treeBottom, treeShadow);
singleTreeGroup.scale.set(0.5, 0.5, 0.5);

const treeNuum = 20;
for (let i = treeNuum; i--;) {
    const tree = singleTreeGroup.clone();
    tree.position.set(-1.2, 0, -groudH / 2 + i * 0.5);
    leftTreeGroup.add(tree);
}

const rightTreeGroup = leftTreeGroup.clone();

// 使用 children.forEach 遍历
rightTreeGroup.children.forEach(tree => {
    // 将原本 -1.2 的位置改为 1.2
    tree.position.x = 1.2;
});

treeGroup.add(leftTreeGroup, rightTreeGroup);

export function setTreePositionZ(z) {
    treeGroup.position.z = z
}