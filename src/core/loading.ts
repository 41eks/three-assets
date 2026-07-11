import { createEffect, createState } from "./solid.js";

const loading = document.createElement("div");
loading.id = "loading";

loading.style.cssText = `
display: none; position: fixed; inset: 0;
background: rgba(0,0,0,0.5); color: white;
justify-content: center; align-items: center;
font-size: 1.5rem; z-index: 20;
`;

const loadingState = createState("none");

createEffect(() => {
  loading.style.display = loadingState.get();
  loading.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:20px;">
  <div class="loader"></div>
  <span id="loading-text">加载中</span>
</div>
  `;
});

document.body.appendChild(loading);

export function setLoadingState(state: boolean): void {
  if (state === true) {
    loadingState.set("flex");
  } else {
    loadingState.set("none");
  }
}

export function setLoadingPercent(_p: number): void {
}
