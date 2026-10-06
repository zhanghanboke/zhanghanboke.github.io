import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * 文章集合。
 * 写文章 → 在 src/content/posts/ 下建 .md 文件即可，
 * frontmatter 字段定义见下方 schema，构建时会自动校验。
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),

  schema: z.object({
    /** 文章标题（必填） */
    title: z.string(),

    /** 发布日期，写成 2026-10-06 即可，会自动转成日期 */
    date: z.coerce.date(),

    /** 最后修改日期（可选） */
    updated: z.coerce.date().optional(),

    /** 摘要，不填会从正文自动截取 */
    description: z.string().optional(),

    /** 标签，如 tags: [Java, 后端] */
    tags: z.array(z.string()).default([]),

    /** 分类，如 category: 技术笔记 */
    category: z.string().optional(),

    /** 封面图路径（可选）。放 public/ 下用 / 开头，没填就不显示缩略图 */
    cover: z.string().optional(),

    /** 草稿：true 时不会出现在任何列表和构建产物里 */
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
