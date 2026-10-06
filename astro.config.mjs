import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // 部署地址：GitHub Pages 用户主页仓库
  site: 'https://zhanghanboke.github.io',

  integrations: [mdx(), sitemap()],

  markdown: {
    // 代码高亮：浅色 / 深色两套主题，跟随站点主题自动切换
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      wrap: true,
    },
  },

  build: {
    // 构建产物目录
    assets: '_astro',
  },

  devToolbar: {
    enabled: false,
  },

  vite: {
    build: {
      // 默认的 lightningcss 会把 backdrop-filter 改写成只剩 -webkit- 前缀版本，
      // 而 Firefox 只认标准属性 —— 结果就是 Firefox 上毛玻璃整个失效。
      // 换 esbuild 压缩：只做压缩，不动前缀，标准属性 + -webkit- 两份都保留。
      cssMinify: 'esbuild',
    },
  },
});
