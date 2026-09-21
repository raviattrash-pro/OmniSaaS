// Progressive Web App Service Worker for OmniSaaS Universal Platform
const CACHE_NAME = 'omni-saas-v2';
const ASSETS = [
  './index.html',
  './styles.css',
  './config.js',
  './app.js',
  './manifest.json',
  './modules/student-management.js',
  './modules/movex-booking.js',
  './modules/hotel-booking.js',
  './modules/food-ordering.js',
  './modules/ecommerce.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First with Cache Fallback for instant fresh updates
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return networkRes;
      })
      .catch(() => caches.match(e.request))
  );
});
