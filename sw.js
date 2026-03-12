const CACHE_NAME = 'adventure-v9-zen';

// The essential shell of your app
const ASSETS = [
  '/',
  '/index.html',
  '/script.js?v=zen', // Must match exactly what is in your HTML file
  '/manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting(); // Forces the browser to install the new version immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim()); // Takes control of the page instantly without requiring a refresh
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', e => {
  // CRITICAL: Ignore Firebase database calls. Only cache our local interface files.
  if (!e.request.url.startsWith(self.location.origin)) return;

  // Stale-While-Revalidate Strategy
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      // 1. Initiate the background network fetch
      const fetchPromise = fetch(e.request).then(networkResponse => {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Silently fail if offline, the user won't notice because they see the cache
      });

      // 2. Return the cache instantly if it exists. If not, wait for the network.
      return cachedResponse || fetchPromise;
    })
  );
});
