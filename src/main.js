import './core/scene.js';
import { startRouter } from './core/router.js';
import { registerRoutes } from './routes.js';
import './core/ui.js';       // ← 加这行
await registerRoutes();
startRouter();