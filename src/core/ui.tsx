export { setLoadingPercent, setLoadingState } from "./loading.js";

// import { BackBtn } from "../component/BackBtn.js";
import { createHDRSwitch } from "../component/Switch.js";
import { routeMap } from "./router.js";

const hdrSwitch = createHDRSwitch();
document.body.appendChild(hdrSwitch.element);

function updateHDRSwitch() {
  const currentRoute = location.hash || "#/";
  const shouldShow = routeMap.get(currentRoute)?.options?.hdr === true;

  hdrSwitch.element.style.display = shouldShow ? "block" : "none";
}

window.addEventListener("hashchange", updateHDRSwitch);
window.addEventListener("routechange", updateHDRSwitch);

updateHDRSwitch();
