import { createState } from "../core/solid.js";

export function createCoordinateInput(title: string) {
  // 1. 在组件内部闭包中维护状态，外部不需要关心
  const coordState = createState({ x: 1, y: 0, z: 1 });
  const visibleState = createState(false);

  // 处理输入事件
  const handleInput = (axis: "x" | "y" | "z") => (e: Event) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (isNaN(val)) return;
    coordState.set({ ...coordState.get(), [axis]: val });
  };
  // 2. 使用你的 h.ts 引擎生成 DOM
  const container = (
    <div
      className="coordinate-inputs"
      style={() => ({
        // 动态样式
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "1000",
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: visibleState.get() ? "block" : "none", // 响应式显示隐藏
      })}
    >
      <button
        className="close-btn"
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          cursor: "pointer",
        }}
        onClick={() => visibleState.set(false)}
      >
        ×
      </button>

   <h3 style={{ marginTop: "0", marginBottom: "15px" }}>{() => title}</h3>

   {/* X 轴滑动输入 */}
   <div className="input-group" style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
     <label style={{ width: "20px", fontWeight: "bold" }}>X:</label>
     <input
       type="range"
       min="-1"
       max="1"
       step="0.01"
       value={() => coordState.get().x}
       onInput={handleInput("x")}
       style={{ flex: "1", margin: "0 10px" }}
     />
     <span style={{ width: "40px", textAlign: "right", fontSize: "14px" }}>
       {() => coordState.get().x.toFixed(2)}
     </span>
   </div>

   {/* Y 轴滑动输入 */}
   <div className="input-group" style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
     <label style={{ width: "20px", fontWeight: "bold" }}>Y:</label>
     <input
       type="range"
       min="-1"
       max="1"
       step="0.01"
       value={() => coordState.get().y}
       onInput={handleInput("y")}
       style={{ flex: "1", margin: "0 10px" }}
     />
     <span style={{ width: "40px", textAlign: "right", fontSize: "14px" }}>
       {() => coordState.get().y.toFixed(2)}
     </span>
   </div>

   {/* Z 轴滑动输入 */}
   <div className="input-group" style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
     <label style={{ width: "20px", fontWeight: "bold" }}>Z:</label>
     <input
       type="range"
       min="-1"
       max="1"
       step="0.01"
       value={() => coordState.get().z}
       onInput={handleInput("z")}
       style={{ flex: "1", margin: "0 10px" }}
     />
     <span style={{ width: "40px", textAlign: "right", fontSize: "14px" }}>
       {() => coordState.get().z.toFixed(2)}
     </span>
   </div>
 </div>
  ) as HTMLElement;

  // 3. 对外暴露接口
  return {
    element: container,
    hide: () => visibleState.set(false),
    show: () => visibleState.set(true),
    // 关键点：这里暴露出内部 state 的 getter。
    // 因为它是响应式的，外部放在 createEffect 里调用，就能自动收集依赖。
    getXYZ: () => coordState.get(),
  };
}
