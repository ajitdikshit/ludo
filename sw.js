const CACHE_NAME = 'ludo-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './bots.js',
  './dice.mp3',
  './move.mp3',
  './win.mp3',
  './safe.mp3',
  './beat.mp3',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install Event: Cache all assets instantly
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clear out any old versions of the cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Required by Chrome to pass PWA Install criteria
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return the cached version if it exists, otherwise fetch from the network
      return cachedResponse || fetch(event.request);
    })
  );
});