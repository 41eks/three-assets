import { createState } from "../core/solid.js";
import "./CoordinateInput.scss";

type ColorState = {
  light: string;
  dark: string;
};

export function createColorInput(title: string, initialValue: ColorState) {
  const colorState = createState(initialValue);
  const visibleState = createState(false);

  const handleInput = (key: keyof ColorState) => (e: Event) => {
    colorState.set({
      ...colorState.get(),
      [key]: (e.target as HTMLInputElement).value,
    });
  };

  const container = (
    <div
      className="coordinate-inputs"
      style={() => ({
        display: visibleState.get() ? "block" : "none",
        top: "220px",
      })}
    >
      <button className="close-btn" onClick={() => visibleState.set(false)}>
        ×
      </button>

      <h3>{() => title}</h3>

      <div className="input-group">
        <label style={{ width: "44px" }}>亮部:</label>
        <input
          type="color"
          value={() => colorState.get().light}
          onInput={handleInput("light")}
        />
        <span>{() => colorState.get().light}</span>
      </div>

      <div className="input-group">
        <label style={{ width: "44px" }}>暗部:</label>
        <input
          type="color"
          value={() => colorState.get().dark}
          onInput={handleInput("dark")}
        />
        <span>{() => colorState.get().dark}</span>
      </div>
    </div>
  ) as HTMLElement;

  return {
    element: container,
    hide: () => visibleState.set(false),
    show: () => visibleState.set(true),
    getColors: () => colorState.get(),
  };
}
