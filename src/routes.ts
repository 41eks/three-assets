// import { addRoute } from './core/router';
import type { Page } from './types/router.ts';
// ✅ 新增模型只改这里

export type RouteTab = 'home' | '3d' | '2d' | 'shader';
export type RouteLabel = Partial<Record<RouteTab, string>>;

export const routeConfig = [
    { hash: '#/blueberry', label: { home: '蓝莓', '3d': '蓝莓' }, page: () => import('./pages/blueberry.ts') },
    { hash: '#/peach', label: { home: '桃子', '3d': '桃子' }, page: () => import('./pages/momo.ts') },
    { hash: '#/pudding', label: { home: '布丁', '3d': '布丁' }, page: () => import('./pages/pudding.ts') },
    { hash: '#/orange', label: { home: '橘子', '3d': '橘子' }, page: () => import('./pages/orange.ts') },
    { hash: '#/roadscene', label: { home: 'roadscene', '3d': 'roadscene' }, page: () => import('./pages/road/index.ts') },
    { hash: '#/appear', label: { home: 'appear', shader: 'appear' }, page: () => import('./pages/appeareffect/index.ts') },
    { hash: '#/tartv2', label: { home: '蛋挞', '3d': '蛋挞' }, page: () => import('./pages/tart.ts') },
    { hash: '#/sonetto', label: { home: 'sonetto', '2d': 'sonetto' }, page: () => import('./pages/sonetto/index.ts') },
    { hash: '#/penguin', label: { home: 'penguin', '3d': 'penguin' }, page: () => import('./pages/penguin.ts') },
    { hash: '#/puff', label: { home: '河豚', '3d': '河豚' }, page: () => import('./pages/puff.ts') },
    { hash: '#/npr', label: { home: 'NPR', shader: 'NPR' }, page: () => import('./pages/npr/index.ts') },
    { hash: '#/mix-and-match-pro', label: { home: 'mix-and-match', '2d': 'mix-and-match' }, page: () => import('./pages/mix-and-match-pro/index.ts') },
    { hash: '#/dissolve', label: { home: 'dissolve', shader: 'dissolve' }, page: () => import('./pages/dissolve/index.ts') },
    { hash: '#/wave', label: { home: 'wave', shader: 'wave' }, page: () => import('./pages/wave/index.ts') },
    { hash: '#/ikeye', label: { home: 'ikeye', '2d': 'ikeye' }, page: () => import('./pages/ikeye/index.ts') },
    { hash: '#/icecream', label: { home: '冰淇淋', '3d': '冰淇淋' }, page: () => import('./pages/icecream.ts') },
    { hash: '#/airscrew', label: {  '3d': '螺旋桨' }, page: () => import('./pages/airscrew.ts') },
    { hash: '#/cup', label: { '3d': '杯子' }, page: () => import('./pages/cup.ts') },
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
