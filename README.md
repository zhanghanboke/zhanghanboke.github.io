# 小涵的博客

基于 [Astro](https://astro.build) 构建的个人博客。纯静态输出，零运行时框架，写文章只需要一个 Markdown 文件。

> 这个站点的前身是 2022 年用 Hexo + Stun 主题搭的版本，2026 年 10 月整体重写。

---

## 快速开始

```bash
npm install        # 安装依赖（首次）
npm run dev        # 本地预览 → http://localhost:4321
npm run build      # 构建静态文件到 dist/
npm run preview    # 预览构建产物
```

---

## 写一篇新文章

### 方式一：命令行生成（推荐）

```bash
npm run new -- "文章标题" my-article
```

第二个参数是文件名（会变成 URL），不传的话：
- 标题是英文 → 自动转成短链
- 标题是中文 → 用时间戳兜底，例如 `post-2026-10-06-2015`

### 方式二：手动建文件

在 `src/content/posts/` 下新建一个 `.md` 文件：

```markdown
---
title: 文章标题
date: 2026-10-06
tags: [Java, 后端]
category: 技术笔记
description: 摘要，不写会自动从正文截取
---

正文从这里开始。
```

### frontmatter 字段说明

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 文章标题 |
| `date` | ✅ | 发布日期，写 `2026-10-06` 即可 |
| `updated` | | 最后修改日期 |
| `tags` | | 标签数组，如 `[Java, 后端]` |
| `category` | | 单个分类名 |
| `description` | | 摘要，用于列表页、SEO 和 RSS |
| `draft` | | 写 `true` 表示草稿，不会出现在站点里 |

保存后页面就出来了 —— 归档、标签、RSS 全部自动生成，不用手动改任何列表。

---

## 改站点信息

**都在 `src/site.config.ts` 一个文件里**：

- 站点标题、副标题、描述、作者
- 顶部导航菜单
- 社交链接（GitHub / B站 / 邮箱）
- 首页每页文章数
- 页脚起始年份、版权协议

改完重新构建就生效。

---

## 新增一个页面

在 `src/pages/` 下建 `.astro` 文件，**文件名就是 URL**：

```text
src/pages/links.astro   →  /links/
src/pages/now.astro     →  /now/
```

---

## 定制外观

| 想改什么 | 去哪里 |
| --- | --- |
| 颜色、圆角、字号、间距 | `src/styles/global.css` 顶部的 CSS 变量 |
| 页面骨架 | `src/layouts/` |
| 页头、文章卡片、目录等组件 | `src/components/` |
| 文章正文排版 | `src/styles/global.css` 里的 `.prose` 段落 |

主题色只改两个变量就够：`--accent`（浅色模式）和 `[data-theme='dark']` 下的 `--accent`。

---

## 看板娘（Live2D）

左下角那只，基于 [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget)（MIT），
资源全部自持在 `public/live2d/` 下，不在构建流程里。

| 文件 | 作用 |
| --- | --- |
| `autoload.js` | 加载器（本站自己写的，见下） |
| `live2d-theme.css` | 主题适配层（本站自己写的） |
| `waifu.css` | 上游原版样式 |
| `live2d.min.js` | Live2D Cubism 2 运行时 |
| `waifu-tips.js` | 看板娘主体逻辑（上游原版，未改动） |
| `waifu-tips.json` | 悬停/点击提示语（选择器已按本站 DOM 重写） |

### 和上游原版的区别

1. **资源自持**：上游 `autoload.js` 从 `jsDelivr@latest` 拉 css/js，上游一发新版就可能把站点搞挂；
   现在同源加载 `/live2d/`，只有**模型**还走 CDN。
2. **模型镜像降级**：依次探测 `cdn → fastly → gcore → testingcf` 四个 jsDelivr 镜像，
   哪个通就用哪个，并记进 `localStorage`，之后直接复用。
3. **桌面端门控 + 懒加载**：窗口宽度 < 768px 完全不加载；桌面端等到 `window.load`
   之后的空闲时段才启动，不抢首屏。
4. **不引入图标字体**：上游工具栏用的是 Font Awesome 类名，这里用 `mask-image` +
   内联 SVG 替代（`live2d-theme.css`），少一个 ~300KB 的请求，图标颜色还能跟随深浅色主题。
5. **失败静默降级**：任何环节出错都只往 console 打一条 warn，不影响页面正常使用。

### 换模型 / 换默认造型

可用模型列在模型源的 `model_list.json` 里，共 7 组：

| 索引 | 模型 |
| --- | --- |
| 0 | Potion-Maker/Pio |
| 1 | Potion-Maker/Tia ← **默认** |
| 2 | bilibili-live/22 |
| 3 | bilibili-live/33 |
| 4 | ShizukuTalk（雫，2 种材质） |
| 5 | HyperdimensionNeptunia（海王星系列，20 种） |
| 6 | KantaiCollection/murakumo |

默认造型由上游 `waifu-tips.js` 里 `initModel()` 的 `modelId` 决定（当前是 `1`）。
不改代码也可以：把鼠标移到看板娘上，用工具栏第 3、4 个图标现场切换，
选择会存进 `localStorage`。

### 关掉它

访问任意页面时带上参数即可（会写进 `localStorage`，永久生效）：

```text
https://zhanghanboke.github.io/?live2d=off     # 关掉
https://zhanghanboke.github.io/?live2d=on      # 重新打开
```

点工具栏最后一个 ✕ 也可以关，但那只管 24 小时（上游逻辑）。

### 改提示语

直接编辑 `public/live2d/waifu-tips.json`：

- `mouseover` / `click` 里的 `selector` 用 CSS 选择器匹配元素，`text` 是随机挑一句显示
- **顺序即优先级**，命中第一条就停，所以具体的选择器要写在前面
- 注意事件委托用的是 `event.target.matches()`，匹配的是**最深层元素**，
  所以带图标的链接要写成 `.nav-link, .nav-link *` 才能覆盖到里面的 `<svg>`
- `seasons` 是节日彩蛋，按日期区间匹配，不用动

---

## 目录结构

```text
blog-source/
├── .github/workflows/deploy.yml   # 自动部署工作流
├── public/                        # 原样拷贝的静态资源
│   ├── avatar.jpg                 # 头像
│   ├── favicon.png
│   ├── apple-touch-icon.png
│   ├── bg/bg.jpg                  # 背景壁纸
│   └── live2d/                    # 看板娘（见上文「看板娘」一节）
├── scripts/new-post.mjs           # 新建文章的脚本
├── src/
│   ├── components/                # Icon / Header / Footer / PostCard / Toc / Live2DWidget
│   ├── content/
│   │   ├── posts/                 # ← 文章都放这里
│   │   └── ...
│   ├── content.config.ts          # frontmatter 字段校验规则
│   ├── layouts/
│   │   ├── BaseLayout.astro       # 全站骨架（head、主题切换、返回顶部、看板娘挂载点）
│   │   └── PostLayout.astro       # 文章页骨架（目录、版权、上下篇）
│   ├── pages/
│   │   ├── index.astro            # 首页
│   │   ├── archive.astro          # 归档
│   │   ├── about.astro            # 关于
│   │   ├── 404.astro
│   │   ├── rss.xml.js             # RSS
│   │   ├── posts/[...slug].astro  # 文章详情
│   │   └── tags/                  # 标签云 + 单标签页
│   ├── styles/global.css          # 设计系统
│   ├── utils/post.ts              # 日期格式化、摘要、阅读时长等
│   └── site.config.ts             # 站点配置
├── astro.config.mjs
└── package.json
```

---

## 部署

推送到 `main` 分支 → GitHub Actions 自动构建 → 发布到 GitHub Pages。

**首次部署需要在 GitHub 仓库里设置一次**：

`Settings` → `Pages` → `Source` 选择 **GitHub Actions**（不要选 "Deploy from a branch"）。

之后每次写完文章：

```bash
git add .
git commit -m "新增文章：xxx"
git push
```

大约一分钟后站点就更新了。工作流进度可以在仓库的 `Actions` 标签页看。

---

## 技术栈

- **Astro 7** —— 静态站点生成，默认零 JS（只有主题切换、目录高亮等少量脚本）
- **Shiki** —— 代码高亮，浅色/深色双主题随站点切换
- **@astrojs/rss** / **@astrojs/sitemap** —— RSS 与站点地图
- 图标全部内联 SVG，不依赖任何图标字体或 CDN
