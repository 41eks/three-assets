import { routeConfig } from '../routes.js';
import { hdrLoaded } from '../core/scene.js';
import { createEffect } from '../core/solid.js';
import { canvasVisible } from '../store/webgl.js';
import './home.scss'
const app = document.getElementById('app');
export function enter() {
    canvasVisible.set(false);
    // document.querySelector('canvas')?.style.setProperty('display', 'none');
    app.style.cssText = `
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    gap: 40px;
    background: #f5f5f5;
    z-index: 10;
  `;

    const title = document.createElement('h1');
    title.className = 'home-title';

    const grid = document.createElement('div');
    grid.className = 'home-grid';
    const links: HTMLAnchorElement[] = [];

    routeConfig
        .filter(({ hash }) => hash !== '#/')
        .forEach(({ hash, label }) => {
            const a = document.createElement('a');
            a.href = hash;
            a.textContent = label;
            a.className = 'home-link';
            links.push(a);
            grid.appendChild(a);
        });
    // 根据 hdrLoaded 状态切换按钮可用性
    createEffect(() => {
        const loaded = hdrLoaded.get();

        links.forEach(a => {
            const needsHdr =
                routeMap.get(a.getAttribute('href') ?? '')?.options?.hdr ?? false;

            a.dataset.disabled =
                !needsHdr || loaded
                    ? ''
                    : 'true';
        });
    });

    app.appendChild(title);
    app.appendChild(grid);
}

export function leave() {
    canvasVisible.set(true);
    // document.querySelector('canvas')?.style.setProperty('display', 'block');

    app.innerHTML = '';
    app.style.cssText = '';
}
import { routeMap } from '../core/router.js';