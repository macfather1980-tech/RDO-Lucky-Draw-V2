// 1. 這裡非常重要！每次你修改代碼並重新上傳後，
// 請手動把這裡的 v1 改成 v2, v3, v4...
// 這會強迫瀏覽器刪除舊的快取並重新安裝新版本。
const CACHE_VERSION = 'rdo-app-v3'; 

const cacheName = `rdo-cache-${CACHE_VERSION}`;

const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './sw.js'
];

// 安裝階段：將檔案存入快取
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('Caching assets for version:', CACHE_VERSION);
            return cache.addAll(assets);
        }).then(() => self.skipWaiting() ) // 強制讓新 SW 立即啟動
    );
});

// 激活階段：刪除舊版本的快取
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== cacheName) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 立即接管頁面
    );
});

// 攔截請求：離線模式的核心
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // 如果快取裡有，就直接用快取的；沒有的話，再去網路抓
            return response || fetch(event.request);
        }).catch(() => {
            // 如果網路斷了，且快取也沒東西，這才是真的錯誤
            return Promise.reject('Network error and not in cache');
        })
    );
});
