// import { routeOptionMap } from "../main";
import type { Page } from "../types/router";
export const routeMap = new Map<string, Page>();
import { createNewsAdPopup } from "../component/NewsAdPopup";
export function startRouter() {
  window.addEventListener('hashchange', () => navigate(location.hash));
  navigate(location.hash || '#/');
}
let currentRoute = null;

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
}



// 假设 assetsCache 已经在外部定义
// export const assetsCache = new Map<string, ArrayBuffer>();

/**
 * 资源加载函数
 * @param assets 资源 URI 列表
 * @param onComplete 全部加载完成（或全部已缓存）时执行的回调
 */
function loadAssets(assets: string[], onComplete: () => void) {
  // 1. 过滤出还未被缓存的资源
  const missingAssets = assets.filter(uri => !assetsCache.has(uri));

  // 2. 关键点：如果没有缺失的资源（全部已加载），直接同步执行回调！没有异步等待过程。
  if (missingAssets.length === 0) {
    onComplete();
    return;
  }

  // 3. 有未缓存的资源，构建真正的网络请求 Promise 数组
  const downloadPromises = missingAssets.map(uri => {
    return fetch(uri)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${uri}: ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then(buffer => {
        assetsCache.set(uri, buffer); // 存入缓存
      });
  });

  // 4. 异步等待缺失资源的下载
  Promise.all(downloadPromises)
    .then(() => {
      onComplete();
    })
    .catch(error => {
      console.error("加载 assets 失败:", error);
      // 这里可以根据需求决定是否要在报错时继续执行 onComplete()
    });
}