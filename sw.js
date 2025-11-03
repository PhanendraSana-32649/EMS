const CACHE_NAME = 'ems-pwa-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/server-error.html',   // ✅ Make sure this file is cached!
];

// ✅ INSTALL — Cache all essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

// ✅ ACTIVATE — Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            )
        )
    );
});

// ✅ FETCH — Network first, if failed → use server-error.html
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                return response;
            })
            .catch(() => {
                // ✅ When fetch fails → show error page
                if (event.request.mode === 'navigate') {
                    return caches.match('/server-error.html');
                }
                return caches.match(event.request);
            })
    );
});
