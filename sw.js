const CACHE_NAME = "ludo-cache-v1";

// Hardcoded paths matching your repo name
const FILES_TO_CACHE = [
  "/ludo/",
  "/ludo/index.html",
  "/ludo/icon-192.png",
  "/ludo/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[SW] Caching Ludo app shell");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // Your awesome offline fallback logic
        if (event.request.mode === "navigate") {
          return caches.match("/Ludo/index.html");
        }
      });
    })
  );
});