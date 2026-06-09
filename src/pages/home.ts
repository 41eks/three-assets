import { routeConfig } from '../routes.js';
import { hdrLoaded, canvasVisible } from '../core/scene.js';
import { createEffect } from '../core/solid.js';

export function enter() {
    canvasVisible.set(false);
    // document.querySelector('canvas')?.style.setProperty('display', 'none');

    const app = document.getElementById('app');
    app.style.cssText = `
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    gap: 40px;
    background: #f5f5f5;
    z-index: 10;
  `;

    const title = document.createElement('h1');
    title.textContent = '目录';
    title.style.cssText = `
    color: #111; font-size: 2.5rem;
    font-family: sans-serif; font-weight: 300;
    letter-spacing: 0.3em; margin: 0;
  `;

    const grid = document.createElement('div');
    grid.style.cssText = `
    display: flex; flex-wrap: wrap;
    gap: 20px; justify-content: center;
  `;
    const links: HTMLAnchorElement[] = [];

    routeConfig
        .filter(({ hash }) => hash !== '#/')
        .forEach(({ hash, label }) => {
            const a = document.createElement('a');
            a.href = hash;
            a.textContent = label;
            a.style.cssText = `
        color: #111; font-size: 1.1rem;
        font-family: sans-serif;
        text-decoration: none;
        padding: 20px 48px;
        border: 1px solid rgba(0,0,0,0.2);
        border-radius: 12px;
        background: white;
        transition: all 0.2s;
        cursor: pointer;
      `;
            a.onmouseenter = () => {
                a.style.background = '#111';
                a.style.color = 'white';
                a.style.transform = 'translateY(-2px)';
            };
            a.onmouseleave = () => {
                a.style.background = 'white';
                a.style.color = '#111';
                a.style.transform = 'translateY(0)';
            };
            links.push(a);
            grid.appendChild(a);
        });
    // 根据 hdrLoaded 状态切换按钮可用性
    createEffect(() => {
        const loaded = hdrLoaded.get();
        links.forEach(a => {
            if (loaded) {
                delete a.dataset.disabled;
                a.style.opacity = '1';
                a.style.pointerEvents = 'auto';
                a.style.cursor = 'pointer';
            } else {
                a.dataset.disabled = 'true';
                a.style.opacity = '0.4';
                a.style.pointerEvents = 'none';
                a.style.cursor = 'not-allowed';
            }
        });
    });

    app.appendChild(title);
    app.appendChild(grid);
}

export function leave() {
    canvasVisible.set(true);
    // document.querySelector('canvas')?.style.setProperty('display', 'block');
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.style.cssText = '';
}