
export type SceneOptions = {
    hdr: boolean
}

// 定义弹窗配置接口
export interface PopupConfig {
    imgSrc: string;
    text: string;
    link: string;
    delay?: number;    // 延迟多少ms弹出
    duration?: number; // 显示持续多久ms
}
export interface Page {
    enter: () => void;
    leave: () => void;
    options?: SceneOptions;
    //uri assets before enter;
    assets?: string[]
    popups?: PopupConfig[]; // 新增：弹窗列表
}