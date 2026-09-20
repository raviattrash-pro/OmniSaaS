// Minimal Progressive Web App Service Worker for Universal White-Label Platform
const CACHE_NAME = 'uniplatform-v1';
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
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
