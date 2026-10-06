/**
 * 站点总配置 —— 想改标题、简介、导航、社交链接，改这里就够了。
 */

export const SITE = {
  /** 站点标题（浏览器标签、页头、页脚都会用） */
  title: '小涵的博客',

  /** 副标题 / 一句话签名 */
  subtitle: '大家好，我是小涵',

  /** 作者名，出现在文章页与页脚 */
  author: '张涵',

  /** 站点描述，用于 SEO 与 RSS */
  description: '武汉商学院软件工程在读。记录技术笔记、项目复盘与一些胡思乱想。',

  /** 部署地址（末尾不要带斜杠） */
  url: 'https://zhanghanboke.github.io',

  /** 语言 */
  lang: 'zh-CN',

  /** 首页文章列表每页篇数（预留分页用） */
  postsPerPage: 10,

  /** 头像，放在 public/ 下用 / 开头；留空字符串则不显示头像 */
  avatar: '/avatar.svg',

  /** 顶部导航 */
  nav: [
    { text: '首页', href: '/' },
    { text: '归档', href: '/archive/' },
    { text: '标签', href: '/tags/' },
    { text: '关于', href: '/about/' },
  ],

  /** 社交链接（首页 hero 与页脚显示） */
  socials: [
    {
      name: 'GitHub',
      href: 'https://github.com/zhanghanboke',
      icon: 'github',
    },
    {
      name: '哔哩哔哩',
      href: 'https://space.bilibili.com/3546742010153897',
      icon: 'bilibili',
    },
    {
      name: '邮箱',
      href: 'mailto:2832242119@qq.com',
      icon: 'mail',
    },
  ],

  /** 页脚版权起始年份 */
  since: 2022,

  /** 文章底部版权声明 */
  license: {
    name: 'CC BY-NC-SA 4.0',
    href: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh',
  },
} as const;

export type Social = (typeof SITE.socials)[number];
