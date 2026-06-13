// import { addRoute } from './core/router';
import type { Page } from './types/router.ts';
// ✅ 新增模型只改这里

export const routeConfig = [
    // { hash: '#/', label: 'Home', page: () => import('./pages/home.js') },
    { hash: '#/blueberry', label: '蓝莓', page: () => import('./pages/blueberry.ts') },
    { hash: '#/npr', label: 'NPR', page: () => import('./pages/npr.ts') },
    // { hash: '#/tart', label: '蛋挞', page: () => import('./pages/tart.ts') },
    { hash: '#/peach', label: '桃子', page: () => import('./pages/momo.ts') },
    { hash: '#/pudding', label: '布丁', page: () => import('./pages/pudding.ts') },
    { hash: '#/orange', label: '橘子', page: () => import('./pages/orange.ts') },
    { hash: '#/roadscene', label: 'roadscene', page: () => import('./pages/road/index.ts') },
    { hash: '#/tartv2', label: '蛋挞', page: () => import('./pages/tartv2.ts') },
    { hash: '#/sonnet', label: 'sonnet', page: () => import('./pages/sonnet.ts') },
];
import { routeMap } from './core/router.ts';


// routes.js
export async function registerRoutes() {


    for (const { hash, page } of routeConfig) {
        try {
            const { default: p } = await page() as { default: Page };
            routeMap.set(hash, p);
        } catch (err) {
            console.error(`ルート ${hash} の登録失敗:`, err);
        }
    }
}


export const navLinks = routeConfig.map(({ hash }) => ({
    label: hash.replace('#/', '') || 'home',
    hash,
}));