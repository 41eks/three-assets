

// global.d.ts
import { h as _h, Fragment as _Fragment } from './h';

declare global {
    const h: typeof _h;
    const Fragment: typeof _Fragment;
    const __ASSET_BASE_URL__: string;
    // 声明全局 JSX 命名空间
    namespace JSX {
        type Element = HTMLElement | DocumentFragment;
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
    module '*.glsl' {
        const value: string;
        export default value;
    }
    module '*.vert' {
        const value: string;
        export default value;
    }
    module '*.frag' {
        const value: string;
        export default value;
    }
}
