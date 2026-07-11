import { createState, createEffect } from "../core/solid.js";
import "./CoordinateInput.scss";

export function createCoordinateInput(title: string) {
  const coordState = createState({ x: 1, y: 0, z: 1 });
  const visibleState = createState(false);

  const handleInput = (axis: "x" | "y" | "z") => (e: Event) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (isNaN(val)) return;
    coordState.set({ ...coordState.get(), [axis]: val });
  };

  const container = (
    <div
      className="coordinate-inputs"
      style={() => ({
        // 只剩这一项是真正响应式的
        display: visibleState.get() ? "block" : "none",
      })}
    >
      <button className="close-btn" onClick={() => visibleState.set(false)}>
        ×
      </button>

      <h3>{() => title}</h3>

      <div className="input-group">
        <label>X:</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={() => coordState.get().x}
          onInput={handleInput("x")}
        />
        <span>{() => coordState.get().x.toFixed(2)}</span>
      </div>

      <div className="input-group">
        <label>Y:</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={() => coordState.get().y}
          onInput={handleInput("y")}
        />
        <span>{() => coordState.get().y.toFixed(2)}</span>
      </div>

      <div className="input-group">
        <label>Z:</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={() => coordState.get().z}
          onInput={handleInput("z")}
        />
        <span>{() => coordState.get().z.toFixed(2)}</span>
      </div>
    </div>
  ) as HTMLElement;

  return {
    element: container,
    hide: () => visibleState.set(false),
    show: () => visibleState.set(true),
    getXYZ: () => coordState.get(),
  };
}
