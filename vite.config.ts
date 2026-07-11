

// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import glsl from 'vite-plugin-glsl';
import fs from 'fs';
import path from 'path';
import { transformSync } from 'esbuild';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // 将 'your-repo-name' 替换为你真实的 GitHub 仓库名称
    // 例如你的仓库是 https://github.com/john/my-project，这里就写 '/my-project/'
    base: env.VITE_BASE_URL,
    esbuild: {
      // jsxFactory: 'h',
      // jsxFragment: 'Fragment',
      // 自动注入 import，这样你就不需要在每个 TSX 文件顶层手动 import h 和 Fragment 了
      // jsxInject: `import { h, Fragment } from '/src/h.ts'`
    }, plugins: [glsl(),
    {
      name: 'auto-inject-jsx-factory',
      enforce: 'pre',
      transform(code, id) {
        // 过滤掉 Vite 可能带有的 query 参数（如 ?vue, ?jsx）
        const [filename] = id.split('?');

        // 只针对真正的 .tsx 和 .jsx 文件注入，完美的避开了 src/h.ts
        if (filename && (filename.endsWith('.tsx') || filename.endsWith('.jsx'))) {
          return {
            code: `import { h, Fragment } from '/src/h.ts';\n${code}`,
            map: null // 传 null 让 Vite 自动处理后续的 SourceMap 映射
          };
        }
      }
    }
    ]
  }
})