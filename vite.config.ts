

// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 将 'your-repo-name' 替换为你真实的 GitHub 仓库名称
  // 例如你的仓库是 https://github.com/john/my-project，这里就写 '/my-project/'
  base: '/three-assets/',
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    // 自动注入 import，这样你就不需要在每个 TSX 文件顶层手动 import h 和 Fragment 了
    jsxInject: `import { h, Fragment } from '/src/h.ts'`
  }
})