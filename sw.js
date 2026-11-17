const CACHE = 'weightlog-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) {
    // fonts: cache as they load, fall back to cache offline
    e.respondWith(caches.open(CACHE).then(c => fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }).catch(() => c.match(e.request))));
    return;
  }
  // own files: network first so updates arrive, cache when offline
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
});
