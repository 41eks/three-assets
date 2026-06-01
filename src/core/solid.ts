type Effect = (() => void) & {
    deps: Set<Effect>[];
};


let activeEffect: Effect | null = null;


// 辅助函数：把 effect 从旧的依赖集里抹除
function cleanup(effect: any) {
    const deps = effect.deps;
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect); // 去对应的 Signal 那里注销自己
        }
        deps.length = 0; // 清空自己的旧账本
    }
}

export function createEffect(fn: () => void) {
    const effect = (() => {
        // ✨ 核心清理动作：执行前，先把自己从所有旧的 Signal 依赖中拔出来
        cleanup(effect);
        const prevEffect = activeEffect;
        activeEffect = effect;
        try {
            fn();
        } finally {
            activeEffect = prevEffect;
        }
    }) as Effect;

    // 初始化一个数组，专门用来存放当前 effect 订阅了哪些 Signal 的 Set 集合
    effect.deps = [] as Set<any>[];

    effect(); // 立即执行一次
}


// 优化 1：直接接收初始值，简化 API
export function createState<T>(initialValue: T) {
    let _state = initialValue;
    const subscribers: Set<Effect> = new Set();

    function setState(newValue: T) {
        if (_state === newValue) return; // 优化：值没变就不触发更新
        _state = newValue;


        const currentSubscribers = new Set(subscribers);
        currentSubscribers.forEach(effectFn => effectFn());
        // activeEffect = prevEffect;
    }

    function getState() {
        if (activeEffect && !subscribers.has(activeEffect)) {
            subscribers.add(activeEffect);
            // 2. ✨ Effect 记录 Signal (新逻辑：把当前的 subscribers 集合存进 effect 的账本)
            activeEffect.deps.push(subscribers);
        }
        return _state;
    }

    return { get: getState, set: setState };
}


