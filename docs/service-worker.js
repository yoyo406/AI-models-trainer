/**
 * gpt.js — Service Worker
 * Strategy: network-first for documents, stale-while-revalidate for local assets.
 */

const CACHE_NAME = 'gptjs-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './vendor/tf.min.js',
  './vendor/tf-backend-webgpu.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ── INSTALL: pre-cache all static assets ──────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Activate immediately, don't wait for old SW to die
  self.skipWaiting();
});

// ── ACTIVATE: delete old caches ───────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// ── FETCH: network-first documents, stale-while-revalidate local assets ────
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put('./index.html', response.clone());
        }
        return response;
      } catch (_) {
        return caches.match('./index.html');
      }
    })());
    return;
  }

  const update = fetch(request).then(async response => {
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  });
  event.waitUntil(update.catch(() => {}));
  event.respondWith(caches.match(request).then(cached => cached || update));
});
