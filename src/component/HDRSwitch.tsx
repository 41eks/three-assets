import { hdrEnabled } from "../core/scene.js";
import { createState } from "../core/solid.js";

export function createHDRSwitch() {
  const visibleState = createState(true);

  const container = (
    <div
      style={() => ({
        position: "fixed",
        bottom: "20px",
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
        <span>HDR</span>

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
}
// export function createHDRSwitch() {
//   const visibleState = createState(true);

//   const container = (
//     <div
//       style={() => ({
//         position: "fixed",
//         top: "20px",
//         left: "20px",
//         zIndex: "1000",
//         background: "white",
//         padding: "12px",
//         borderRadius: "8px",
//         boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//         display: visibleState.get() ? "block" : "none",
//       })}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "10px",
//         }}
//       >
//         <label style={{ fontWeight: "bold" }}>
//           HDR
//         </label>

//         <input
//           type="checkbox"
//           checked={() => hdrEnabled.get()}
//           onInput={(e: Event) => {
//             hdrEnabled.set(
//               (e.target as HTMLInputElement).checked
//             );
//           }}
//         />
//       </div>
//     </div>
//   ) as HTMLElement;

//   return {
//     element: container,
//     show: () => visibleState.set(true),
//     hide: () => visibleState.set(false),
//   };
// }
