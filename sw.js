// Service Worker - 乙浦飯店メニュー表 PWA
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'otoura-recipe-' + CACHE_VERSION;

// キャッシュ対象のアプリシェル
const APP_SHELL = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-180.png'
];

// インストール時にアプリシェルをキャッシュ
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  // 待機中のSWをすぐにアクティブ化
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key.startsWith('otoura-recipe-') && key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
  // 全クライアントを即座に制御下に置く
  self.clients.claim();
});

// フェッチ戦略: YouTube APIはNetwork Only、それ以外はCache First
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // YouTube API呼び出しはキャッシュしない
  if (url.hostname === 'www.googleapis.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache First: キャッシュにあればそれを返す、なければネットワーク
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(function(response) {
        // 正常なレスポンスのみキャッシュ
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});
