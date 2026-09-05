

// vite.config.js
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  const baseUrl = '/three-assets/';
  const assetBaseUrl = mode === 'development'
    ? '/asset-proxy/'
    : 'https://three.rainbowgem.dpdns.org/';

  return {
    // 将 'your-repo-name' 替换为你真实的 GitHub 仓库名称
    // 例如你的仓库是 https://github.com/john/my-project，这里就写 '/my-project/'
    base: baseUrl,
    define: {
      'import.meta.env.VITE_BASE_URL': JSON.stringify(baseUrl),
      __ASSET_BASE_URL__: JSON.stringify(assetBaseUrl),
    },
    server: {
      proxy: {
        '/asset-proxy': {
          target: 'https://three.rainbowgem.dpdns.org',
          changeOrigin: true,
          secure: true,
          rewrite: path => path.replace(/^\/asset-proxy/, ''),
        },
      },
    }, plugins: [glsl(),
    {
      name: 'auto-inject-jsx-factory',
      enforce: 'pre',
      transform(code, id) {
        // 过滤掉 Vite 可能带有的 query 参数（如 ?vue, ?jsx）
        const [filename] = id.split('?');

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
