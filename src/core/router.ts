const routes = {};

export function addRoute(hash, { enter, leave }) {
  routes[hash] = { enter, leave };
}

let currentRoute = null;

export function startRouter() {
  window.addEventListener('hashchange', () => navigate(location.hash));
  navigate(location.hash || '#/');
}

function navigate(hash) {
  const next = routes[hash] ?? routes['#/'];

  // 离开当前页
  if (currentRoute?.leave) currentRoute.leave();

  // 进入新页
  next?.enter();
  currentRoute = next;
}