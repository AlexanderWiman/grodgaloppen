// Offline support: the whole game is cached on first visit.
// Pages are served from the cache at once and refreshed in the background,
// so a new version shows up on the next start.
const CACHE='frograce-v18';
const FILES=['./','index.html','style.css','audio.js','village.js','garden.js','world.js','race.js','leaderboard.js','frogs.js','saga.js','seasons.js','fishing.js','house.js','shop.js','progress.js','fireflies.js','memory.js','queen.js','jul.js','skogen.js','tradgard.js','astrid.js','app.js','i18n.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','assets/astrid-crown.webp','assets/astrid-portrait.webp','assets/astrid-start.webp','assets/skogsdrottningen-portratt.webp','assets/skogsdrottningen-glanta.webp','assets/skogsdrottningen-slott.webp'];

self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin)return;
  // Local preview (python -m http.server) always loads fresh files.
  if(location.hostname==='localhost'||location.hostname==='127.0.0.1')return;
  e.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(req,{ignoreSearch:true});
    const fresh=fetch(req).then(res=>{if(res.ok)cache.put(req,res.clone());return res}).catch(()=>cached);
    return cached||fresh;
  }));
});
