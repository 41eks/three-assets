import { addRoute } from './core/router';

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
];


// routes.js
export async function registerRoutes() {
    // const mods = await Promise.all(
    //     routeConfig.map(({ page }) => page())
    // );
    // routeConfig.forEach(({ hash }, i) => {
    //     addRoute(hash, mods[i]);
    // });

    for (const { hash, page } of routeConfig) {
        try {
            const mod = await page();
            addRoute(hash, mod);
        } catch (err) {
            console.error(`ルート ${hash} の登録失敗:`, err); // 1つ失敗しても続行
        }
    }
}


export const navLinks = routeConfig.map(({ hash }) => ({
    label: hash.replace('#/', '') || 'home',
    hash,
}));