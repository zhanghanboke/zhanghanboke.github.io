import type { CollectionEntry } from 'astro:content';

/**
 * 日期一律按东八区格式化，**不跟随构建机的本地时区**。
 *
 * 为什么必须锁时区：本地开发是 UTC+8，GitHub Actions 是 UTC。
 * frontmatter 的 date 一旦带时刻（如 2026-10-06T02:00:00+08:00），
 * 用 getFullYear()/getMonth()/getDate() 取值就会跟着构建机走 ——
 * 云端构建出来的日期可能比本地少一天（凌晨发布的文章尤其明显）。
 * 锁定 Asia/Shanghai 后两边结果完全一致。
 *
 * 附带好处：下面这组函数只依赖 formatToParts，不再散落 getXxx() 调用，
 * 以后要改时区只动一个常量。
 */
const TIME_ZONE = 'Asia/Shanghai';

/* en-CA 的短日期格式恰好就是 YYYY-MM-DD */
const isoDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 统一日期格式：2026-10-06（按东八区） */
export function formatDate(date: Date): string {
  return isoDay.format(date);
}

/** 归档页用的「10-06」短日期 */
export function formatShort(date: Date): string {
  return formatDate(date).slice(5);
}

/** 取年份数字（按东八区），归档分组用 */
export function formatYear(date: Date): number {
  return Number(formatDate(date).slice(0, 4));
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

/** 正文字数（中文按字、英文按词），用于列表项展示 */
export function wordCount(body: string = ''): number {
  const clean = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  const cjk = (clean.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = (clean.match(/[a-zA-Z]+/g) || []).length;
  return cjk + words;
}

/** 按年份分组，年份倒序、组内日期倒序 */
export function groupByYear(posts: CollectionEntry<'posts'>[]) {
  const map = new Map<number, CollectionEntry<'posts'>[]>();

  for (const post of posts) {
    const year = formatYear(post.data.date);
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
