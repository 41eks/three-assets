
  uniform sampler2D map;
  varying vec2 vUv;

  void main() {
    // vUv.y 在 WebGL 中是从下到上 (0.0 到 1.0)
    // 视频上半部分 (颜色): y 范围是 0.5 到 1.0
    vec2 colorUv = vec2(vUv.x, vUv.y * 0.5 + 0.5);
    // 视频下半部分 (黑白蒙版): y 范围是 0.0 到 0.5
    vec2 alphaUv = vec2(vUv.x, vUv.y * 0.5);

    // 分别采样颜色和蒙版
    vec4 color = texture2D(map, colorUv);
    vec4 mask = texture2D(map, alphaUv);

    // 方式一：平滑透明 (推荐)
    // 直接使用蒙版的红色通道作为透明度，边缘会非常平滑
    // float alpha = mask.r;

    // 方式二：硬边缘透明 (完全模拟你原来的 Canvas 代码 <= 90 的逻辑)
    // 90 / 255.0 ≈ 0.353
    float alpha = step(0.353, mask.r);

    // 输出最终颜色
    gl_FragColor = vec4(color.rgb, alpha);
  }