// Builds the installable tablet app (GitHub Pages) from ../ChoreRacer.html.
// Run: node build.mjs   (then commit + push this folder)
import { readFileSync, writeFileSync } from "node:fs";

const page = readFileSync(new URL("../ChoreRacer.html", import.meta.url), "utf8");
const version = Date.now().toString(36);

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#171B26">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Chore Racer">
<meta name="robots" content="noindex">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;
const tail = `
<script>
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(()=>{}));
</script>
</body>
</html>
`;
writeFileSync(new URL("index.html", import.meta.url), head + page + tail);

writeFileSync(new URL("manifest.webmanifest", import.meta.url), JSON.stringify({
  name: "Chore Racer",
  short_name: "Chore Racer",
  description: "Race through your chores, earn coins, spend them in the shop.",
  start_url: "./",
  scope: "./",
  display: "standalone",
  orientation: "any",
  background_color: "#171B26",
  theme_color: "#171B26",
  icons: [
    { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
  ]
}, null, 2));

// offline support: keep the app files, update them when online
writeFileSync(new URL("sw.js", import.meta.url), `const CACHE = "chore-racer-${version}";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && new URL(e.request.url).origin === location.origin) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(m => m || caches.match("index.html"))));
});
`);
console.log("built", version);
