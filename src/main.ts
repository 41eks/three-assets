import './core/scene.js';
import { startRouter } from './core/router';
import { registerRoutes } from './routes';
import './core/ui.js';       // ← 加这行
import { addRoute } from './core/router';
import * as homePage from './pages/home';  // 静态 import，和 main.js 一起打包
import { initScene } from './core/scene.js'; // 导入初始化函数
// 先注册 home 并启动
addRoute('#/', homePage);
// 2. 判断当前 hash 是不是 home
const currentHash = location.hash || '#/';

if (currentHash === '#/' || currentHash === '') {
    // 首屏就是 home，立即启动，后台加载其余路由
    startRouter();
    registerRoutes();
} else {
    // 首屏是其他页面，等那个页面的路由注册完再启动
    await registerRoutes();
    startRouter();
}


// registerRoutes();
// startRouter();

console.log('正在加载 3D 场景...');
await initScene();
console.log('3D 场景加载完成！');