var CACHE = "smartcity-v8";
var CORE = [
  "./",
  "index.html",
  "about.html",
  "gallery.html",
  "book-online.html",
  "partner-with-us.html",
  "contact.html",
  "pushpa.html",
  "manohar-layout.html",
  "maruthi-phase-1.html",
  "maruthi-phase-2.html",
  "sri-sai.html",
  "sharadeesh-layout.html",
  "sri-saila-township.html",
  "assets/css/ux.css",
  "assets/js/ux.js",
  "manifest.json",
  "assets/img/logo.png",
"assets/icons/icon-192.png",
"assets/icons/icon-512.png",
"assets/icons/icon-512-maskable.png",
"assets/icons/apple-touch-icon.png",
"assets/icons/favicon-16.png",
"assets/icons/favicon-32.png",
"favicon.ico",
  "assets/img/hero/kailash-gyawali-A8A6sFI8344-unsplash-scaled.jpg",
  "assets/img/hero/kent-tupas-2jfZ2Vj06sk-unsplash-scaled.jpg",
  "assets/img/hero/michael-lee-YhGQiKeSBLQ-unsplash-scaled.jpg",
  "assets/img/smartcitydeveloper1.png",
  "assets/img/smartcitydeveloper2.png",
  "assets/img/smartcitydeveloper3.png",
  "assets/img/smartcitydeveloper4.png",
  "assets/img/smartcitydeveloper5.png",
  "assets/img/smartcitydeveloper6.png",
  "assets/img/smartcitydeveloper7.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(CORE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      }).catch(function () {
        return caches.match(request).then(function (hit) {
          return hit || caches.match("index.html");
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (response) {
        if (response && response.ok && request.url.indexOf(self.location.origin) === 0) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      }).catch(function () {
        if (request.destination === "image") return caches.match("assets/img/logo.png");
        return new Response("", { status: 503, statusText: "Offline" });
      });
    })
  );
});