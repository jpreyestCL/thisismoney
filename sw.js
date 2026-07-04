// Service worker de This is Money: el juego funciona OFFLINE una vez visitado.
// - index.html: red primero (para recibir las actualizaciones del deploy), caché de respaldo
// - assets y CDN de three.js: caché primero (no cambian casi nunca)
const VERSION = 'tim-v1';
const CORE = ['./', './index.html', './manifest.webmanifest',
  './assets/img_58.png', './assets/edificio.glb', './assets/tienda.glb', './assets/papa_anim.glb'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isIndex = e.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname === '/';
  if (isIndex) {   // red primero: siempre la última versión si hay internet
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // resto (assets, three.js del CDN): caché primero
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); }
    return r;
  })));
});
