export function createWait(
    assetManager: any,
    parseAssets: () => any,
    postParse: (mesh: any) => void,
    { skel, atlas, png }: { skel: string; atlas: string; png: string }
) {
    let cachedPromise: Promise<void> | null = null;

    return function waitAssetsReady(): Promise<void> {
        if (cachedPromise) return cachedPromise;

        // 先 preload PNG 写入缓存
        const preloadPng = new Promise<void>((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = png;
            link.crossOrigin = 'anonymous';
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Preload failed: ${png}`));
            document.head.appendChild(link);
        });

        cachedPromise = preloadPng
            .then(() => {
                assetManager.loadBinary(skel);
                assetManager.loadTextureAtlas(atlas);

                // 延迟 200ms 再轮询，等 loadTextureAtlas 内部 downloadText 回调触发
                return new Promise<void>((resolve, reject) => {
                    const MAX_WAIT = 10000;
                    const INTERVAL = 100;
                    let elapsed = 0;

                    setTimeout(() => {
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
                    }, 200);
                });
            })
            .then(parseAssets)
            .then(postParse);

        return cachedPromise;
    };
}