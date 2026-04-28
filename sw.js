/* 기리고 · Service Worker v5 — repo: grigo */
const CACHE = 'girigo-v5';
const BASE = '/grigo';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

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

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE') {
    const delay = e.data.delay || 300000;
    const msg   = e.data.msg   || 'Dileğin kabul edildi.';
    setTimeout(() => {
      self.registration.showNotification('기리고 · Girigo', {
        body: msg,
        icon: BASE + '/icon-512.png',
        badge: BASE + '/icon-192.png',
        vibrate: [400, 150, 400, 150, 800],
        tag: 'girigo-accept',
        requireInteraction: true,
        silent: false
      });
    }, delay);
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      for (const c of cls) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(BASE + '/');
    })
  );
});
