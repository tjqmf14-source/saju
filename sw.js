const CACHE='naesaju-shell-v1';
const SHELL=[
  '/',
  '/index.html',
  '/site-v12.css',
  '/src/premium-ui.js',
  '/manifest.webmanifest',
  '/oracle/logo-mark.svg'
];

self.addEventListener('install',(event)=>{
  event.waitUntil(caches.open(CACHE).then((cache)=>cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',(event)=>{
  event.waitUntil(
    caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE).map((key)=>caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',(event)=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached)=>cached || fetch(event.request).then((response)=>{
      if(!response || response.status!==200) return response;
      const copy=response.clone();
      caches.open(CACHE).then((cache)=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match('/index.html')))
  );
});
