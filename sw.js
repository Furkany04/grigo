/* 기리고 · Service Worker v4 */
const CACHE = 'girigo-v4';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

/* ── INSTALL ── */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

/* ── ACTIVATE ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── FETCH (offline cache) ── */
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      }
      return res;
    }))
  );
});

/* ── MESSAGE: uygulama bildirim zamanlar ── */
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE') {
    const delay = e.data.delay || 300000;
    const msg   = e.data.msg   || 'Dileğin kabul edildi.';

    setTimeout(() => {
      self.registration.showNotification('기리고 · Girigo', {
        body: msg,
        icon: '/icon-512.png',
        badge: '/icon-192.png',
        /* Titreşim: 400ms titre, 150ms dur, 400ms titre, 150ms dur, 800ms titre */
        vibrate: [400, 150, 400, 150, 800],
        tag: 'girigo-accept',
        requireInteraction: true,   // bildirim kapatılana kadar ekranda kalır
        silent: false
      });
    }, delay);
  }
});

/* ── BİLDİRİME TIKLANINCA ── */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      // Açık pencere varsa odaklan
      for (const c of cls) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          return c.focus();
        }
      }
      // Yoksa yeni aç
      return clients.openWindow('/');
    })
  );
});
