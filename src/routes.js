import { addRoute } from './core/router.js';

// ✅ 新增模型只改这里
// export const routeConfig = [
//   { hash: '#/',          page: () => import('./pages/home.js') },
//   { hash: '#/blueberry', page: () => import('./pages/blueberry.js') },
//  // { hash: '#/apple',     page: () => import('./pages/apple.js') },  // 新增
// ];
export const routeConfig = [
    { hash: '#/', label: 'Home', page: () => import('./pages/home.js') },
    { hash: '#/blueberry', label: '蓝莓', page: () => import('./pages/blueberry.js') },
    { hash: '#/glass', label: '玻璃', page: () => import('./pages/glass.js') },
];
export async function registerRoutes() {
    for (const { hash, page } of routeConfig) {
        const mod = await page();
        addRoute(hash, mod);
    }
}

export const navLinks = routeConfig.map(({ hash }) => ({
    label: hash.replace('#/', '') || 'home',
    hash,
}));