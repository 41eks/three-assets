// import { routeOptionMap } from "../main";
import type { Page } from "../types/router";
export const routeMap = new Map<string, Page>();
import { createNewsAdPopup } from "../component/NewsAdPopup";
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
// 建议使用 Map 来存储键值对：URI -> ArrayBuffer
export const assetsCache = new Map<string, ArrayBuffer>();

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
    currentRoute = next;
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
    // 调用我们封装好的函数
    loadAssets(next.assets, enterNextPage);
  } else {
    // 没有 assets 需要下载，直接同步进入新页
    enterNextPage();
  }
  if (next.controls === false) {
    controls.enabled = false;
  }
}
import type { AssetEntry } from "../types/router";

function loadAssets(assets: AssetEntry[], onComplete: () => void) {
  const missingUris = assets
    .filter((a): a is string => typeof a === 'string' && !assetsCache.has(a));

  const fnPromises = assets
    .filter((a): a is () => Promise<any> => typeof a === 'function')
    .map(fn => fn());

  const uriPromises = missingUris.map(uri =>
    fetch(uri)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${uri}: ${res.statusText}`);
        return res.arrayBuffer();
      })
      .then(buffer => { assetsCache.set(uri, buffer); })
  );

  const allPromises = [...uriPromises, ...fnPromises];

  if (allPromises.length === 0) {
    onComplete();
    return;
  }

  Promise.all(allPromises)
    .then(() => onComplete())
    .catch(error => { console.error("加载 assets 失败:", error); });
}