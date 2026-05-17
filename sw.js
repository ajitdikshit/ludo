// sw.js - Service Worker for Offline Ludo

const CACHE_NAME = 'ludo-game-cache-v1';

// List of all the files we want to save for offline use
const urlsToCache = [
    './',
    './index.html',
    './bots.js',
    './dice.mp3',
    './move.mp3',
    './safe.mp3',
    './win.mp3'
];

// 1. Install Step: Download and cache all files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache, downloading files...');
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Fetch Step: Intercept network requests and serve from cache if offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // If the file is in the cache, return it! 
                if (response) {
                    return response;
                }
                // Otherwise, fetch it from the internet normally
                return fetch(event.request);
            })
    );
});

// 3. Activate Step: Clean up old caches if we update the CACHE_NAME version
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});