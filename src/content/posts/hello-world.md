---
title: 这是一篇个人博客
date: 2022-01-27
updated: 2026-10-06
tags: [随笔, 博客]
category: 随笔
description: 博客开张的第一篇。当年用 Hexo 搭的，四年后翻出来重新写了一遍。
---

欢迎来到我的博客！这里是跟着 B 站视频一起搭起来的小站。

这篇是 2022 年 1 月 27 号发的第一篇，当时用的还是 Hexo + Stun 主题，
正文基本照搬了 Hexo 自带的 `hello world` 模板——那几段"Create a new post / Run server"的说明，
算是每个 Hexo 用户都见过的开场白。

四年后（2026 年 10 月）把站点整体重写了一遍，源码换成了 Astro，
但文章链接和标题都留着，这篇文章就当作一个书签吧。

## 当年的 Hexo 操作笔记

既然内容还在这儿，顺手留个档。

### 新建文章

```bash
$ hexo new "My New Post"
```

### 本地预览

```bash
$ hexo server
```

默认跑在 `http://localhost:4000`，改完 Markdown 会自动刷新。

### 生成静态文件

```bash
$ hexo generate
```

产物进 `public/` 目录，也就是现在这个仓库当年存放的东西。

### 部署

```bash
$ hexo deploy
```

配合 `hexo-deployer-git` 插件，一条命令就把 `public/` 推到 GitHub Pages。

## 后来出了什么问题

简单说：**源码丢了**。

`public/` 是生成的成品，本身不含任何 Markdown 原文、`_config.yml` 和主题文件。
把成品克隆下来，你只能看到一个装着单篇文章的 HTML 站点，
想加一篇文章都得手改好几个页面，而且下次生成全部覆盖。

这事儿的教训是：**源码和产物要分开管，而且源码一定要推到远端**。
现在这个新版本，源码就在博客仓库里，构建交给 GitHub Actions，不会再出现"只有成品没有原稿"的情况了。
