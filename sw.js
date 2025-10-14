const CACHE_NAME = 'ems-pwa-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    // Add paths to your icons here if you create an 'icons' folder
    // '/icons/icon-192x192.png',
    // '/icons/icon-512x512.png'
];

// 1. Install the Service Worker and cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 2. Activate the Service Worker and clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 3. Fetch from cache (for offline access)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // If the request is in the cache, return it, otherwise fetch from network
                return response || fetch(event.request);
            })
    );
});
