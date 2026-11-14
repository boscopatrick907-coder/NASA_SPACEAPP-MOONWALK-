// Angular creates hashed bundle names. Generate the cache list AFTER each production build.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/marswalk/browser/', import.meta.url));
async function list(directory) {
  const results = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await list(name));
    else if (entry.name !== 'sw.js') results.push(name);
  }
  return results;
}
const files = (await list(root)).sort();
const fingerprint = createHash('sha256');
for (const file of files) {
  fingerprint.update(path.relative(root, file));
  fingerprint.update(await readFile(file));
}
const version = 'marswalk-angular-v1-' + fingerprint.digest('hex').slice(0, 16);
const paths = ['./', ...files.map(file => path.relative(root, file).split(path.sep).join('/'))];
const worker = `const VERSION = ${JSON.stringify(version)};
const CACHE = VERSION + '-' + self.registration.scope;
const FILES = ${JSON.stringify(paths)};
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
`;
await writeFile(path.join(root, 'sw.js'), worker);
console.log('Prepared offline worker:', paths.length, 'local assets; version', version);
