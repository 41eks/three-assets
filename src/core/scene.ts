import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

export const scene = new THREE.Scene();

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

export const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 100
);
camera.position.set(0, 0.5, 3);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const pmrem = new THREE.PMREMGenerator(renderer);
// 加载一次 HDR
new HDRLoader().load('studio.hdr', (hdr) => {
    const envMap = pmrem.fromEquirectangular(hdr).texture;

    scene.environment = envMap;

    scene.background = envMap;

    hdr.dispose();

    pmrem.dispose();
});

// 全局动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 响应窗口缩放
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
