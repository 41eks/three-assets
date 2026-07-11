import { createState } from "../core/solid.js";
import "./CoordinateInput.scss";

export function createInput(title: string, initialValue = 0) {
  const valueState = createState(initialValue);
  const visibleState = createState(false);

  const handleInput = (e: Event) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (isNaN(val)) return;
    valueState.set(val);
  };

  const container = (
    <div
      className="coordinate-inputs"
      style={() => ({
        display: visibleState.get() ? "block" : "none",
      })}
    >
      <button className="close-btn" onClick={() => visibleState.set(false)}>
        ×
      </button>

      <h3>{() => title}</h3>

      <div className="input-group">
        <label style={{ width: "52px" }}>Speed:</label>
        <input
          type="range"
          min="-3"
          max="3"
          step="0.01"
          value={() => valueState.get()}
          onInput={handleInput}
        />
        <span>{() => valueState.get().toFixed(2)}</span>
      </div>
    </div>
  ) as HTMLElement;

  return {
    element: container,
    hide: () => visibleState.set(false),
    show: () => visibleState.set(true),
    getValue: () => valueState.get(),
  };
}
