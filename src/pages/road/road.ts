
import * as THREE from 'three';
const groudW = 50;
const groudH = 10;
const w = window.innerWidth;
const h = window.innerHeight;
export const roadGroup = new THREE.Group();
const roadPlaneG = new THREE.PlaneGeometry(2, groudH);
const roadPlaneM = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
});
const roadPlane = new THREE.Mesh(roadPlaneG, roadPlaneM);

const leftLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, groudH),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
)

leftLine.position.set(-0.8, 0, 0.0001);

const rightLine = leftLine.clone();
rightLine.position.set(0.8, 0, 0.0001);

const dashLineGroup = new THREE.Group();
const dashNum = 24;
for (let i = dashNum; i--;) {
    const m = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const g = new THREE.PlaneGeometry(0.1, 0.3);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(0, -groudH / 2 + i * 0.5, 0.001);
    dashLineGroup.add(mesh);
}
roadGroup.add(roadPlane, leftLine, rightLine, dashLineGroup);

export function setDashLinePositionY(y) {
    dashLineGroup.position.y = y;
}