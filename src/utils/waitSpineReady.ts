
export function createWait(
    assetManager: any,
    parseAssets: () => any,
    postParse: (mesh: any) => void,
    { skel, atlas }: { skel: string; atlas: string }
) {
    let cachedPromise: Promise<void> | null = null;

    return function waitAssetsReady(): Promise<void> {
        if (cachedPromise) return cachedPromise;

        assetManager.loadBinary(skel);
        assetManager.loadTextureAtlas(atlas);

        cachedPromise = new Promise<void>((resolve, reject) => {
            const MAX_WAIT = 10000;
            const INTERVAL = 100;
            let elapsed = 0;

            const timer = setInterval(() => {
                if (assetManager.isLoadingComplete()) {
                    clearInterval(timer);
                    resolve();
                    return;
                }
                elapsed += INTERVAL;
                if (elapsed >= MAX_WAIT) {
                    clearInterval(timer);
                    reject(new Error('Spine assets 加载超时'));
                }
            }, INTERVAL);
        }).then(parseAssets).then(postParse);

        return cachedPromise;
    };
}