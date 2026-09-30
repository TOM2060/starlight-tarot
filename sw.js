/* ============================================================
   星语 · Starlight Tarot — Service Worker
   ------------------------------------------------------------
   目的：加到主屏之后，断网也能打开。

   策略
     · 导航请求  network-first —— 优先拿新的，没网时回退缓存
     · 静态资源  stale-while-revalidate —— 先给缓存立刻显示，
       同时后台悄悄更新，下次访问就是新的
   这样既不会在地铁里打不开，也不会让你一直看着旧版本。

   版本号：改动静态资源后把 VERSION 加一，用户下次访问会自动更新。
   仅在 HTTPS（或 localhost）下注册，本地局域网 HTTP 不会注册。
   ============================================================ */

const VERSION = 'starlight-v1';
const CACHE = `starlight-${VERSION}`;
const SHELL = './index.html';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll([SHELL, './']))
      .catch(() => {}),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // 清掉旧版本缓存
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 页面导航：先联网，断了才用缓存
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(CACHE);
        c.put(SHELL, fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(SHELL)) || Response.error();
      }
    })());
    return;
  }

  // 静态资源：缓存立刻出，后台更新
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const network = fetch(req).then((res) => {
      if (res && res.ok) {
        caches.open(CACHE).then((c) => c.put(req, res.clone()));
      }
      return res;
    }).catch(() => null);

    return cached || (await network) || Response.error();
  })());
});
