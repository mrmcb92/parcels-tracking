const CACHE = "parcel-tracking-v17";
const SCOPE = self.registration.scope;
const APP_SHELL = [SCOPE, SCOPE + "index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const isHTML =
    req.mode === "navigate" ||
    (req.method === "GET" && (req.headers.get("accept") || "").includes("text/html"));

  // HTML/navigations: always fetch fresh from the network, bypassing the
  // browser's HTTP cache, so the latest build (and its hashed assets) is
  // never one version behind. Fall back to the cached app shell when offline.
  if (isHTML) {
    e.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(SCOPE + "index.html", copy));
          }
          return res;
        })
        .catch(() => caches.match(SCOPE + "index.html").then((r) => r || caches.match(SCOPE)))
    );
    return;
  }

  // Other GETs (hashed JS/CSS/images): network first, refresh cache.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && req.method === "GET") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
