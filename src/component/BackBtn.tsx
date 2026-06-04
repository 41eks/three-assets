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

export const backBtn = (
  <a
    href="#/"
    style={btnStyle}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    ← 首页
  </a>
) as HTMLElement; // 断言为 HTMLElement 以便后续操作 style
