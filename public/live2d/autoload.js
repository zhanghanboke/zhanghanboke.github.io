/**
 * 小涵的博客 · Live2D 看板娘加载器
 * 基于 stevenjoezhang/live2d-widget（MIT License）改造
 * 上游：https://github.com/stevenjoezhang/live2d-widget
 *
 * 与上游 autoload.js 的差异：
 *   1. 运行时资源（waifu.css / live2d.min.js / waifu-tips.js / waifu-tips.json）
 *      全部同源自持到 /live2d/ 下，不再依赖 jsDelivr 上的 widget 包
 *      —— 上游打 @latest 标签，哪天发个不兼容的新版就会把看板娘直接搞挂。
 *   2. 模型仍走 jsDelivr（单个模型几 MB，不适合塞进 Git 仓库），但带多镜像降级：
 *      cdn → fastly → gcore → testingcf，选中的镜像记进 localStorage，下次直接用。
 *   3. 桌面端门控（>= 768px）+ window.load 后空闲时再加载，不抢首屏带宽和主线程。
 *   4. 支持 ?live2d=off / ?live2d=on 手动开关（写入 localStorage，永久生效）。
 *
 * 快捷操作：
 *   ?live2d=off   永久关掉看板娘
 *   ?live2d=on    重新打开
 */
(function () {
  'use strict';

  var BASE = '/live2d/';

  /* 模型源：按顺序探测，第一个通的会被记住 */
  var MIRRORS = [
    'https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/',
    'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
    'https://gcore.jsdelivr.net/gh/fghrsh/live2d_api/',
    'https://testingcf.jsdelivr.net/gh/fghrsh/live2d_api/',
  ];

  var MIRROR_KEY = 'live2d-mirror';
  var OFF_KEY = 'live2d-off';
  var PROBE_TIMEOUT = 6000;

  /* ---------- 0. 开关与门控 ---------- */

  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function store(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* 隐私模式 / 禁用存储：忽略，不影响功能 */
    }
  }

  function drop(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      /* 同上 */
    }
  }

  var forced = '';
  try {
    forced = new URLSearchParams(location.search).get('live2d') || '';
  } catch (e) {
    /* 老浏览器没有 URLSearchParams：忽略手动开关 */
  }
  if (forced === 'off') store(OFF_KEY, '1');
  if (forced === 'on') drop(OFF_KEY);
  if (read(OFF_KEY) === '1') return;

  /* 手机端 / 窄窗口不加载：既省流量，也避免小屏被挡住。
     screen.width 在部分环境（如无头浏览器、桌面端缩窄的窗口）并不可靠，
     所以和 innerWidth 取更小的那个一起判断；两者都取不到时不拦截。 */
  var screenW = (window.screen && window.screen.width) || Infinity;
  var innerW = window.innerWidth || Infinity;
  if (Math.min(screenW, innerW) < 768) return;

  /* ---------- 1. 资源装载 ---------- */

  function loadTag(url, type) {
    return new Promise(function (resolve, reject) {
      var tag;
      if (type === 'css') {
        tag = document.createElement('link');
        tag.rel = 'stylesheet';
        tag.href = url;
      } else {
        tag = document.createElement('script');
        tag.src = url;
        /* 动态插入的 script 默认 async，置 false 才会按插入顺序执行 */
        tag.async = false;
      }
      tag.onload = function () {
        resolve(url);
      };
      tag.onerror = function () {
        reject(new Error('资源加载失败: ' + url));
      };
      document.head.appendChild(tag);
    });
  }

  /* 探测镜像：拉一下 model_list.json（约 1.5KB），超时即判失败 */
  function probeMirror(url) {
    return new Promise(function (resolve, reject) {
      if (typeof fetch !== 'function') {
        reject(new Error('浏览器不支持 fetch'));
        return;
      }
      var timer = setTimeout(function () {
        reject(new Error('探测超时: ' + url));
      }, PROBE_TIMEOUT);
      fetch(url + 'model_list.json')
        .then(function (res) {
          clearTimeout(timer);
          if (res.ok) resolve(url);
          else reject(new Error('HTTP ' + res.status + ' @ ' + url));
        })
        .catch(function (err) {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /* 顺序探测：保证 MIRRORS 的优先级，并发会让"谁先返回"变成随机 */
  function probeAll(list) {
    return list.reduce(function (chain, url) {
      return chain.catch(function () {
        return probeMirror(url);
      });
    }, Promise.reject(new Error('开始探测')));
  }

  function pickMirror() {
    var cached = read(MIRROR_KEY);
    if (cached && MIRRORS.indexOf(cached) !== -1) {
      /* 命中缓存就直接用，万一这个镜像挂了再全量探测一遍 */
      return probeMirror(cached).catch(function () {
        return probeAll(MIRRORS);
      });
    }
    return probeAll(MIRRORS);
  }

  /* ---------- 2. 启动 ---------- */

  function boot() {
    pickMirror()
      .then(function (mirror) {
        store(MIRROR_KEY, mirror);
        window.__live2dMirror = mirror;
        return Promise.all([
          loadTag(BASE + 'waifu.css', 'css'),
          loadTag(BASE + 'live2d-theme.css', 'css'),
          loadTag(BASE + 'live2d.min.js', 'js'),
          loadTag(BASE + 'waifu-tips.js', 'js'),
        ]).then(function () {
          return mirror;
        });
      })
      .then(function (mirror) {
        if (typeof window.initWidget !== 'function') {
          throw new Error('waifu-tips.js 未就绪');
        }
        window.initWidget({
          waifuPath: BASE + 'waifu-tips.json',
          cdnPath: mirror,
        });
      })
      .catch(function (err) {
        /* 看板娘只是锦上添花：任何失败都静默降级，绝不打扰访客 */
        if (window.console && console.warn) {
          console.warn('[live2d] 看板娘加载失败：', err && err.message);
        }
      });
  }

  /* ---------- 3. 懒加载：等首屏彻底空闲 ---------- */

  function schedule() {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(boot, { timeout: 3000 });
    } else {
      setTimeout(boot, 1200);
    }
  }

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
})();
