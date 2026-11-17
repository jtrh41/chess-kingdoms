// Chess Kingdoms offline helper. VERSION changes with every build so updates arrive on their own.
const VERSION = 'ck-7cddd071b159';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ck-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const scope = new URL(self.registration.scope).pathname, path = new URL(req.url).pathname;
  if (path === scope || path === scope + 'index.html') {   // newest game first, saved copy when offline
    e.respondWith(Promise.race([fetch(req, { cache: 'no-store' }), new Promise((_, no) => setTimeout(no, 5000))])
      .then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); } return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
