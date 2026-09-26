const CACHE_NAME = "mrs-sites-900-v1";
const BASE = self.registration.scope;

const CORE_ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "mrs-icon-192.png",
  BASE + "mrs-icon-512.png",
  BASE + "mrs-signature-black.png",
  BASE + "mrs-signature-white.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request)
          .then(cached => cached || caches.match(BASE))
      )
  );
});
