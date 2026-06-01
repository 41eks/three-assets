


declare namespace JSX {
    type Element = HTMLElement | DocumentFragment;
    interface IntrinsicElements {
        [elemName: string]: any; // 简单粗暴允许所有 HTML 标签和属性
    }
}



// global.d.ts
import { h as _h, Fragment as _Fragment } from './h';

declare global {
    const h: typeof _h;
    const Fragment: typeof _Fragment;
}