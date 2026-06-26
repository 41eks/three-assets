import { createState } from "../core/solid.js";
import "./NewsAdPopup.scss";

export function createNewsAdPopup(
  imgSrc: string,
  text: string,
  linkUrl: string,
  duration: number = 5000, 
) {
  const visibleState = createState(false);
  let autoCloseTimer: number | null = null;

  const show = () => {
    // 使用双层 requestAnimationFrame 确保浏览器已经渲染了初始的 translateX(150%) 状态
    // 这样添加 show 类名时，必定会触发 1.5 秒的滑入动画，绝不会闪现
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        visibleState.set(true);
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
    visibleState.set(false);
  };

  const container = (
    <div
      className={() =>
        `news-ad-popup ${visibleState.get() ? "show" : ""}`
      }
    >
      <button className="close-btn" onClick={hide}>
        ×
      </button>

      <a href={linkUrl} target="_blank" rel="noreferrer" className="ad-content">
        <img src={imgSrc} alt="ad banner" />
        <p>{() => text}</p>
      </a>
    </div>
  ) as HTMLElement;

  return {
    element: container,
    show,
    hide,
  };
}