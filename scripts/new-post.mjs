#!/usr/bin/env node
/**
 * 快速新建一篇文章。
 *
 * 用法：
 *   npm run new -- "文章标题"
 *   npm run new -- "文章标题" my-post-slug
 *
 * 会在 src/content/posts/ 下生成一个带好 frontmatter 的 Markdown 文件。
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '..', 'src', 'content', 'posts');

const [title, slugArg] = process.argv.slice(2);

if (!title) {
  console.error('\n用法: npm run new -- "文章标题" [英文短链]\n');
  process.exit(1);
}

/** 只有纯 ASCII 标题才能自动转出可读 slug */
const autoSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const stamp = `${dateStr}-${pad(now.getHours())}${pad(now.getMinutes())}`;

let slug = slugArg?.trim() || autoSlug(title);
if (!slug) {
  // 纯中文标题没有 ASCII slug，用时间戳兜底
  slug = `post-${stamp}`;
  console.log('提示：标题不含英文，已用时间戳作为文件名。想改成可读短链，请传第二个参数。');
}

const filename = `${slug}.md`;
const target = join(POSTS_DIR, filename);

if (existsSync(target)) {
  console.error(`\n文件已存在：${target}\n换个短链再试。\n`);
  process.exit(1);
}

const template = `---
title: ${title}
date: ${dateStr}
tags: []
category: 
description: 
---

在这里写正文。

## 小标题

正文内容。
`;

mkdirSync(POSTS_DIR, { recursive: true });
writeFileSync(target, template, 'utf8');

console.log(`\n已创建：src/content/posts/${filename}`);
console.log('运行 npm run dev 预览，写完直接 git push 就会自动发布。\n');
