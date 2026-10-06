---
title: 博客重启：从 Hexo 换到 Astro
date: 2026-10-06
tags: [Astro, 博客, 前端]
category: 折腾
description: 四年前搭的 Hexo 博客，源码早就丢了，只剩一堆生成的 HTML。这次干脆推倒重来，换成 Astro 从头写一遍。
---

这个博客最早的版本是 2022 年 1 月搭起来的，Hexo 6 + Stun 主题。

一直没怎么管它，直到今天想更新一下，才发现一个尴尬的事实：
**当年写文章的那个源码目录，早就找不到了。**

克隆下来的仓库里只有一个 `main` 分支，提交记录清一色是 `Site updated: ...`，
里面是 `index.html`、`css/index.css`、一堆已经渲染好的静态页面——
说白了就是 `hexo generate` 吐出来的成品。文章 Markdown、`_config.yml`、主题文件，一个都没有。

## 为什么不接着用

理论上可以在现有静态文件上手工加文章：

1. 新建 `2026/10/06/文章名/index.html`
2. 把文章页面模板复制一份，改标题和正文
3. 改 `index.html` 的文章列表
4. 改 `archives/index.html` 和 `archives/2026/index.html`
5. 别忘了分页和标签页

改一篇要动五六个文件，而且前端资源路径、`CONFIG` 里的 root 都得对。
更致命的是，这套流程**没有任何可维护性**——下次想改个样式，得在几万字压缩过的 HTML 里翻。

所以结论很直接：重做。

## 为什么选 Astro

候选方案有三个：继续用 Hexo、换 Hugo、换 Astro。

| 方案 | 优点 | 对本机的麻烦 |
| --- | --- | --- |
| Hexo | 熟悉，主题多 | 需要重建整个工程和主题配置，Stun 主题已久未更新 |
| Hugo | 构建极快，单二进制 | 要先单独装 `hugo.exe` 并配 PATH |
| **Astro** | Markdown 原生，零运行时 JS，生态好 | Node 环境现成，直接开跑 |

我的 Node 环境是现成的（v22.22.2），Astro 不需要额外装任何二进制就能跑起来，
而 Hugo 还得先解决"往 `C:\Program Files` 写文件会被拦"的问题。
加上 Astro 的岛屿架构对博客这种内容站点特别合适——默认输出纯静态 HTML，几乎没有 JavaScript。

那就 Astro。

## 这套新站点长什么样

目录结构是标准的 Astro 项目：

```text
blog-source/
├── src/
│   ├── components/       # 页头、页脚、文章卡片、目录…
│   ├── content/
│   │   └── posts/        # ← 文章都放这里，Markdown 文件
│   ├── layouts/          # 页面骨架
│   ├── pages/            # 路由（文件名 = URL）
│   ├── styles/           # 设计系统
│   └── content.config.ts # frontmatter 字段定义
├── public/               # 静态资源（头像、favicon）
└── astro.config.mjs
```

写一篇新文章，就是在 `src/content/posts/` 下建一个 `.md` 文件：

```markdown
---
title: 文章标题
date: 2026-10-06
tags: [Java, 后端]
category: 技术笔记
---

正文从这里开始。
```

保存，页面就出来了。归档、标签、RSS 全部自动生成。

## 功能清单

这次重写顺手补了不少原来没有的东西：

- **深色模式** —— 跟随系统，也可以手动切换，选择记在 localStorage 里
- **文章目录** —— 右侧自动生成，滚动时高亮当前章节
- **阅读进度条** —— 文章页顶部一条细线
- **标签系统** —— 标签云 + 每个标签的独立聚合页
- **归档页** —— 按年份分组的时间线
- **RSS 订阅** —— `/rss.xml`
- **响应式** —— 手机上单列布局，导航收成抽屉
- **零外链依赖** —— 图标全是内联 SVG，没有 CDN，断网也能正常显示

## 部署方式也换了

之前是本地 `hexo generate` 然后手动推 `public/` 的内容。
现在改成 GitHub Actions：源码推到仓库，Actions 自动构建并发布到 GitHub Pages。

好处是**再也不会出现"源码丢失"这种事**——源 Markdown、配置、样式全都在仓库里，
换台电脑 `git clone` 就能接着写。

至于原来的那些静态 HTML，随它去吧，如果哪天有人点进旧链接，重定向到首页就好。
