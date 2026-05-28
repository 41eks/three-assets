import { createEffect, createState } from './solid.js';
// 创建 loading 元素，模块加载时立即执行
const loading = document.createElement('div');
loading.id = 'loading';


//document.getElementById('loading-text').textContent = `加载中 ${percent}%`;
loading.style.cssText = `
display: none; position: fixed; inset: 0;
background: rgba(0,0,0,0.5); color: white;
justify-content: center; align-items: center;
font-size: 1.5rem; z-index: 20;
`;
const loadingState = createState('none');
const loadingPercentState = createState(0);
createEffect(() => {

  loading.style.display = loadingState.get();
  loading.innerHTML = `<span id="loading-text">加载中 ${loadingPercentState.get()}%</span>`;

});
document.body.appendChild(loading);
export function setLoadingState(state: boolean): void {
  if (state === true) {
    loadingPercentState.set(0); // ← 每次显示时重置进度
    loadingState.set('flex');
  }
  else {
    loadingState.set('none');
  }
}
export function setLoadingPercent(p: number): void {
  loadingPercentState.set(p);
}


const backBtn = document.createElement('a');
backBtn.href = '#/';
backBtn.textContent = '← 首页';
backBtn.style.cssText = `
  position: fixed; top: 20px; left: 20px;
  color: #111; font-size: 0.9rem;
  font-family: sans-serif;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 8px;
  background: white;
  z-index: 100;
  transition: all 0.2s;
  display: none;
`;
backBtn.onmouseenter = () => {
  backBtn.style.background = '#111';
  backBtn.style.color = 'white';
};
backBtn.onmouseleave = () => {
  backBtn.style.background = 'white';
  backBtn.style.color = '#111';
};
document.body.appendChild(backBtn);

// 监听路由变化，home 页隐藏按钮
window.addEventListener('hashchange', updateBackBtn);
updateBackBtn();

function updateBackBtn() {
  const isHome = location.hash === '#/' || location.hash === '';
  backBtn.style.display = isHome ? 'none' : 'block';
}