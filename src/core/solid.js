let activeEffect = null;

export function createEffect(effectFn) {
    activeEffect = effectFn;
    effectFn();
    activeEffect = null;
}

// 优化 1：直接接收初始值，简化 API
export function createState(initialValue) {
    let _state = initialValue;
    const subscribers = new Set();

    function setState(newValue) {
        if (_state === newValue) return; // 优化：值没变就不触发更新
        _state = newValue;
        
        const prevEffect = activeEffect;
        activeEffect = null;            
        // 复制一份 subscribers，防止在遍历过程中添加新订阅导致死循环
        const currentSubscribers = new Set(subscribers);
        currentSubscribers.forEach(effectFn => effectFn());
        activeEffect = prevEffect;      
    }

    function getState() {
        if (activeEffect) {
            subscribers.add(activeEffect);
        }
        return _state;
    }
    
    return { get: getState, set: setState };
}