import { createEffect, createState } from "./solid.js";
// 创建 loading 元素，模块加载时立即执行
const loading = document.createElement("div");
loading.id = "loading";

//document.getElementById('loading-text').textContent = `加载中 ${percent}%`;
loading.style.cssText = `
display: none; position: fixed; inset: 0;
background: rgba(0,0,0,0.5); color: white;
justify-content: center; align-items: center;
font-size: 1.5rem; z-index: 20;
`;
const loadingState = createState("none");
const loadingPercentState = createState(0);
createEffect(() => {
  loading.style.display = loadingState.get();
  loading.innerHTML = `<span id="loading-text">加载中 ${loadingPercentState.get()}%</span>`;
});
document.body.appendChild(loading);
export function setLoadingState(state: boolean): void {
  if (state === true) {
    loadingPercentState.set(0); // ← 每次显示时重置进度
    loadingState.set("flex");
  } else {
    loadingState.set("none");
  }
}
export function setLoadingPercent(p: number): void {
  loadingPercentState.set(p);
}

import { backBtn } from "../component/BackBtn.js";

// 4. 将生成的 DOM 节点挂载到 body
document.body.appendChild(backBtn);

// 5. 路由监听与显示逻辑 (与你原本的逻辑基本一致)
function updateBackBtn() {
  const isHome = location.hash === "#/" || location.hash === "";
  backBtn.style.display = isHome ? "none" : "block";
}

window.addEventListener("hashchange", updateBackBtn);
updateBackBtn();
