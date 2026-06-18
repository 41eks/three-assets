
export type SceneOptions = {
    hdr: boolean
}

export interface Page {
    enter: () => void;
    leave: () => void;
    options?: SceneOptions;
    //uri assets before enter;
    assets?: string[]
}