import type { CollectionEntry } from 'astro:content';

/** 统一日期格式：2026-10-06 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 归档页用的「10-06」短日期 */
export function formatShort(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}-${d}`;
}

/** 把 Markdown 正文压成一段纯文本摘要 */
export function getExcerpt(body: string = '', length = 108): string {
  const text = body
    // 去掉代码块
    .replace(/```[\s\S]*?```/g, ' ')
    // 去掉 HTML 注释与标签
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    // 图片整体丢掉
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    // 链接只留文字
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // 标题、列表、引用等行首符号
    .replace(/^[#>\-*+\d.\s]+/gm, ' ')
    // 强调符号
    .replace(/[*_~`|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > length ? text.slice(0, length) + '…' : text;
}

/** 粗估阅读时长（分钟），中文按 350 字/分、英文按 200 词/分 */
export function readingTime(body: string = ''): number {
  const clean = body.replace(/```[\s\S]*?```/g, ' ');
  const cjk = (clean.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = (clean.match(/[a-zA-Z]+/g) || []).length;
  const minutes = cjk / 350 + words / 200;
  return Math.max(1, Math.round(minutes));
}

/** 按年份分组，年份倒序、组内日期倒序 */
export function groupByYear(posts: CollectionEntry<'posts'>[]) {
  const map = new Map<number, CollectionEntry<'posts'>[]>();

  for (const post of posts) {
    const year = post.data.date.getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }

  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({
      year,
      posts: items.sort((a, b) => b.data.date.getTime() - a.data.date.getTime()),
    }));
}

/** 统计标签及其出现次数，按次数倒序 */
export function collectTags(posts: CollectionEntry<'posts'>[]) {
  const counter = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }

  return [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

/** 统计分类及其出现次数 */
export function collectCategories(posts: CollectionEntry<'posts'>[]) {
  const counter = new Map<string, number>();

  for (const post of posts) {
    const category = post.data.category;
    if (category) counter.set(category, (counter.get(category) ?? 0) + 1);
  }

  return [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}
