const CACHE_NAME = 'dashboard-v1';
const ASSETS = [
  '/',
  '/dashboard.html',
  '/styles.css',
  // aggiungi altri asset statici
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.url.includes('/api/instradatore_task')) {
    // Network first per API
    event.respondWith(
      fetch(request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache first per altri asset statici
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
    );
  }
});
