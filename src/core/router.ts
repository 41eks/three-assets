// import { routeOptionMap } from "../main";
import type { Page } from "../types/router";
export const routeMap = new Map<string, Page>();

export function startRouter() {
  window.addEventListener('hashchange', () => navigate(location.hash));
  navigate(location.hash || '#/');
}
let currentRoute = null;
function navigate(hash: string) {
  const next: Page = routeMap.get(hash) ?? routeMap.get('#/');

  // 离开当前页
  if (currentRoute?.leave) currentRoute.leave();

  // 进入新页
  // next?.enter();
  next?.enter();
  currentRoute = next;
}