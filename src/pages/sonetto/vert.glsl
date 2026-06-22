
  varying vec2 vUv;
  void main() {
    vUv = uv; // 传递 UV 坐标给片元着色器
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // ✨ 删掉了 projectionMatrix 和 modelViewMatrix
    // 直接把平面的 [-1, 1] 顶点坐标作为屏幕坐标！
    //gl_Position = vec4(position.xy, 0.0, 1.0);
  }