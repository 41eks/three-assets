import { routeConfig, type RouteTab } from '../routes.js';
import { hdrLoaded } from '../core/scene.js';
import { createEffect } from '../core/solid.js';
import { canvasVisible } from '../store/webgl.js';
import { activeHomeTab } from '../store/tab.js';
import './home.scss'
const app = document.getElementById('app');

const tabs: RouteTab[] = ['home', '3d', '2d', 'shader'];

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

    const tabBar = document.createElement('div');
    tabBar.className = 'home-tabs';

    const grid = document.createElement('div');
    grid.className = 'home-grid';
    const links: HTMLAnchorElement[] = [];

    function updateDisabledState() {
        const loaded = hdrLoaded.get();

        links.forEach(a => {
            const needsHdr =
                routeMap.get(a.getAttribute('href') ?? '')?.options?.hdr ?? false;

            a.dataset.disabled =
                !needsHdr || loaded
                    ? ''
                    : 'true';
        });
    }

    function renderGrid() {
        links.length = 0;
        grid.innerHTML = '';
        const activeTab = activeHomeTab.get();

        routeConfig
            .filter(({ hash, label }) => hash !== '#/' && label[activeTab])
            .forEach(({ hash, label }) => {
                const a = document.createElement('a');
                a.href = hash;
                a.textContent = label[activeTab] ?? '';
                a.className = 'home-link';
                links.push(a);
                grid.appendChild(a);
            });

        updateDisabledState();
    }

    function renderTabs() {
        tabBar.innerHTML = '';
        const activeTab = activeHomeTab.get();

        tabs.forEach(tab => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = tab;
            button.className = 'home-tab';
            button.dataset.active = tab === activeTab ? 'true' : '';
            button.addEventListener('click', () => {
                activeHomeTab.set(tab);
                renderTabs();
                renderGrid();
            });
            tabBar.appendChild(button);
        });
    }

    // 根据 hdrLoaded 状态切换按钮可用性
    createEffect(() => {
        updateDisabledState();
    });

    renderTabs();
    renderGrid();

    app.appendChild(title);
    app.appendChild(tabBar);
    app.appendChild(grid);
}

export function leave() {
    canvasVisible.set(true);
    // document.querySelector('canvas')?.style.setProperty('display', 'block');

    app.innerHTML = '';
    app.style.cssText = '';
}
import { routeMap } from '../core/router.js';
