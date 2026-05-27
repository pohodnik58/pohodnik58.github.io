const CACHE = 'poh-cache-v8';
const urls = ['index.html', 'manifest.json', 'crEl.js', 'db.js', 'scripts.js', 'styles.css'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(urls)));
  self.skipWaiting();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
self.addEventListener('activate', e => e.waitUntil(clients.claim()));


