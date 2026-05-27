import './core/scene.js';
import { startRouter } from './core/router.js';
import { registerRoutes } from './routes.js';
import './core/ui.js';       // ← 加这行
import { addRoute } from './core/router.js';
import * as homePage from './pages/home.js';  // 静态 import，和 main.js 一起打包

// 先注册 home 并启动
addRoute('#/', homePage);
startRouter();  // ← home.enter() 立即执行，无黑屏
await registerRoutes();
startRouter();