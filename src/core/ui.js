// 创建 loading 元素，模块加载时立即执行
const loading = document.createElement('div');
loading.id = 'loading';
loading.style.cssText = `
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); color: white;
  justify-content: center; align-items: center;
  font-size: 1.5rem; z-index: 20;
`;
loading.innerHTML = `<span id="loading-text">加载中...</span>`;
document.body.appendChild(loading);