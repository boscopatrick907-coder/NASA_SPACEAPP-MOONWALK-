/* Bump VERSION whenever a local asset changes. Cache is scoped per installation path. */
const VERSION = 'marswalk-v1';
const CACHE = VERSION + '-' + self.registration.scope;
const FILES = [
  './', 'index.html', 'css/styles.css', 'js/app.js', 'js/map.js',
  'js/route.js', 'js/storage.js', 'js/offline.js',
  'data/manifest.json', 'data/demo-targets.json',
  'assets/boxwork-context.jpg', 'assets/icon.svg', 'manifest.webmanifest',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css'
];
const urls = FILES.map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(urls);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('marswalk-') && key.endsWith(self.registration.scope) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type !== 'CHECK_CACHE' || !event.ports[0]) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const matches = await Promise.all(urls.map(url => cache.match(url)));
    event.ports[0].postMessage({ready: matches.every(Boolean), version: VERSION});
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request, {ignoreSearch: event.request.mode === 'navigate'});
    if (cached) return cached;
    try {return await fetch(event.request);}
    catch {
      if (event.request.mode === 'navigate') {
        const page = await cache.match(new URL('index.html', self.registration.scope).href);
        if (page) return page;
      }
      return new Response('Asset unavailable offline.', {status: 503, headers: {'Content-Type': 'text/plain'}});
    }
  })());
});
