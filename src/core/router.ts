// import { routeOptionMap } from "../main";
import type { Page } from "../types/router";
export const routeMap = new Map<string, Page>();
import { createNewsAdPopup } from "../component/NewsAdPopup";
import { loadAssets, assetsCache } from "./assets";
import { setLoadingState } from "./loading";
export { assetsCache };
export function startRouter() {
  window.addEventListener('hashchange', () => navigate(location.hash));
  navigate(location.hash || '#/');
}
let currentRoute = null;

import { controls } from "./scene";
import { setCameraPosition } from "./camera";
// 用于存储当前显示的弹窗实例
let currentPopup: { element: HTMLElement, hide: () => void } | null = null;
let popupTimer: number | null = null;

// (前面的接口和 Map 定义保持不变)

function navigate(hash: string) {
  const next: Page | undefined = routeMap.get(hash) ?? routeMap.get('#/');

  if (!next) return;

  // 离开当前页
  if (currentRoute?.leave) {
    currentRoute.leave();
    controls.enabled = true
    setCameraPosition();

  }
  currentRoute = next;
  // 清理旧弹窗逻辑
  if (popupTimer) clearTimeout(popupTimer);
  if (currentPopup) {
    currentPopup.hide();
    if (currentPopup.element.parentElement) {
      currentPopup.element.remove();
    }
    currentPopup = null;
  }
  // 定义进入新页面的逻辑
  const enterNextPage = () => {
    next.enter();
    
    // --- 3. 新增：处理新页面的第一个弹窗 ---
    if (next.popups && next.popups.length > 0) {
      const config = next.popups[0];
      const delay = config.delay ?? 2000;

      popupTimer = window.setTimeout(() => {
        const pop = createNewsAdPopup(
          config.imgSrc,
          config.text,
          config.link,
          config.duration ?? 10000
        );
        document.body.appendChild(pop.element);
        pop.show();
        currentPopup = pop;
      }, delay);
    }
  };

  // 判断并加载 assets
  if (next.assets && next.assets.length > 0) {
    setLoadingState(true);
    loadAssets(next.assets)
      .then(() => {
        setLoadingState(false);
        enterNextPage();
      })
      .catch(error => {
        setLoadingState(false);
        console.error("加载 assets 失败:", error);
      });
  } else {
    // 没有 assets 需要下载，直接同步进入新页
    enterNextPage();
  }
  if (next.controls === false) {
    controls.enabled = false;
  }
}
