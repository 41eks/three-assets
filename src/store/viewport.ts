// 注意这里的 solid 引入路径，根据你的实际目录结构调整
import { createState, createEffect } from '../core/solid';

export const rendererSize = createState({ w: window.innerWidth, h: window.innerHeight });
export const fixRenderSize = createState(false);

const handleResize = () => {
    if (!fixRenderSize.get()) {
        rendererSize.set({
            w: window.innerWidth,
            h: window.innerHeight
        });
    }
};

// 监听锁定状态，自动绑定/解绑事件
createEffect(() => {
    if (!fixRenderSize.get()) {
        window.addEventListener('resize', handleResize);
    } else {
        window.removeEventListener('resize', handleResize);
    }
});