import "./NewsAdPopup.scss";

export function createNewsAdPopup(
  imgSrc: string,
  text: string,
  linkUrl: string,
  duration: number = 5000, 
) {
  let autoCloseTimer: number | null = null;

  const show = () => {
    // 使用双层 requestAnimationFrame 确保浏览器已经渲染了初始的 translateX(150%) 状态
    // 这样添加 show 类名时，必定会触发 1.5 秒的滑入动画，绝不会闪现
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.classList.add("show");
      });
    });

    if (duration > 0) {
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      // 注意：自动关闭的定时器需要加上 1500ms 的进场动画时间，否则展示时间会不够
      autoCloseTimer = window.setTimeout(() => {
        hide();
      }, duration + 1500); 
    }
  };

  const hide = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
    container.classList.remove("show");
  };

  const container = document.createElement("div");
  container.className = "news-ad-popup";

  const closeButton = document.createElement("button");
  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.addEventListener("click", hide);

  const link = document.createElement("a");
  link.href = linkUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.className = "ad-content";

  const image = document.createElement("img");
  image.src = imgSrc;
  image.alt = "ad banner";
  image.width = 320;
  image.height = 160;

  const title = document.createElement("p");
  title.textContent = text;

  link.append(image, title);
  container.append(closeButton, link);

  return {
    element: container,
    show,
    hide,
  };
}
