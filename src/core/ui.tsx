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

// const backBtn = document.createElement('a');
// backBtn.href = '#/';
// backBtn.textContent = '← 首页';
// backBtn.style.cssText = `
//   position: fixed; top: 20px; left: 20px;
//   color: #111; font-size: 0.9rem;
//   font-family: sans-serif;
//   text-decoration: none;
//   padding: 8px 16px;
//   border: 1px solid rgba(0,0,0,0.2);
//   border-radius: 8px;
//   background: white;
//   z-index: 100;
//   transition: all 0.2s;
//   display: none;
// `;
// backBtn.onmouseenter = () => {
//   backBtn.style.background = '#111';
//   backBtn.style.color = 'white';
// };
// backBtn.onmouseleave = () => {
//   backBtn.style.background = 'white';
//   backBtn.style.color = '#111';
// };
// document.body.appendChild(backBtn);

// // 监听路由变化，home 页隐藏按钮
// window.addEventListener('hashchange', updateBackBtn);
// updateBackBtn();

// function updateBackBtn() {
//   const isHome = location.hash === '#/' || location.hash === '';
//   backBtn.style.display = isHome ? 'none' : 'block';
// }

// 1. 将 CSS 字符串转换为 JSX 风格的样式对象 (小驼峰命名)
const btnStyle = {
  position: "fixed",
  top: "20px",
  left: "20px",
  color: "#111",
  fontSize: "0.9rem",
  fontFamily: "sans-serif",
  textDecoration: "none",
  padding: "8px 16px",
  border: "1px solid rgba(0,0,0,0.2)",
  borderRadius: "8px",
  background: "white",
  zIndex: "100", // 注意，如果用纯数字，有些框架需要写成字符串，我们这里写字符串最稳妥
  transition: "all 0.2s",
  display: "none",
};

// 2. 提取事件处理函数，通过 e.target 获取当前元素并修改样式
const handleMouseEnter = (e: MouseEvent) => {
  const el = e.target as HTMLElement;
  el.style.background = "#111";
  el.style.color = "white";
};

const handleMouseLeave = (e: MouseEvent) => {
  const el = e.target as HTMLElement;
  el.style.background = "white";
  el.style.color = "#111";
};

const backBtn = (
  <a
    href="#/"
    style={btnStyle}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    ← 首页
  </a>
) as HTMLElement; // 断言为 HTMLElement 以便后续操作 style

// 4. 将生成的 DOM 节点挂载到 body
document.body.appendChild(backBtn);

// 5. 路由监听与显示逻辑 (与你原本的逻辑基本一致)
function updateBackBtn() {
  const isHome = location.hash === "#/" || location.hash === "";
  backBtn.style.display = isHome ? "none" : "block";
}

window.addEventListener("hashchange", updateBackBtn);
updateBackBtn();
