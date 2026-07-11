export { setLoadingPercent, setLoadingState } from "./loading.js";

// import { BackBtn } from "../component/BackBtn.js";
import { createHDRSwitch } from "../component/Switch.js";

const hdrSwitch = createHDRSwitch();
document.body.appendChild(hdrSwitch.element);

const noHDRSwitchRoutes = [
  "#/",
  "#/about",
  "#/login",
  "#/roadscene",
  "#/sonetto",
  "#/mix-and-match-pro",
];

function updateHDRSwitch() {
  const currentRoute = location.hash || "#/";

  const shouldHide = noHDRSwitchRoutes.includes(currentRoute);

  hdrSwitch.element.style.display = shouldHide ? "none" : "block";
}

window.addEventListener("hashchange", updateHDRSwitch);

updateHDRSwitch();
