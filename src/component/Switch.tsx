import { hdrEnabled } from "../core/scene.js";
import { createState } from "../core/solid.js";

// import { createState } from "../core/solid.js";

let switchCount = 0;

export function createSwitchFactory(
  hdrEnabled: {
    get: () => boolean;
    set: (value: boolean) => void;
  },
  title: string,
) {
   const index = switchCount++;
  return () => {
    const visibleState = createState(false);

    const container = (
      <div
        style={() => ({
          position: "fixed",
          // bottom: "20px",
           bottom: `${20 + index * 60}px`,
          left: "20px",
          zIndex: "1000",
          display: visibleState.get() ? "block" : "none",
        })}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <span>{title}</span>

          <div
            onClick={() => hdrEnabled.set(!hdrEnabled.get())}
            style={() => ({
              width: "50px",
              height: "28px",
              borderRadius: "999px",
              background: hdrEnabled.get() ? "#4CAF50" : "#ccc",
              position: "relative",
              cursor: "pointer",
              transition: "all .2s",
            })}
          >
            <div
              style={() => ({
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: "2px",
                left: hdrEnabled.get() ? "24px" : "2px",
                transition: "all .2s",
                boxShadow: "0 1px 4px rgba(0,0,0,.3)",
              })}
            />
          </div>
        </div>
      </div>
    ) as HTMLElement;

    return {
      element: container,
      show: () => visibleState.set(true),
      hide: () => visibleState.set(false),
    };
  };
}

export const createHDRSwitch = createSwitchFactory(hdrEnabled, "HDR");
