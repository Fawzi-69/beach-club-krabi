/* Cache hors-ligne : la demo doit tourner meme si le wifi du club lache. */
var V='bck-v1';
var CORE=[
 './','index.html',
 'media/spk-en.mp4','media/spk-th.mp4','media/loop1.mp4','media/loop2.mp4',
 'media/waitress.webp','media/concierge.webp'
];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(V).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(u.pathname.indexOf('/media/')>-1){
    /* medias : cache d'abord (les videos ne changent pas), reseau en complement */
    e.respondWith(caches.match(e.request).then(function(r){
      return r||fetch(e.request).then(function(n){
        if(n.ok)caches.open(V).then(function(c){c.put(e.request,n.clone())});
        return n;
      });
    }));
  }else{
    /* pages : reseau d'abord (pour recevoir les mises a jour), cache en secours */
    e.respondWith(fetch(e.request).then(function(n){
      if(n.ok)caches.open(V).then(function(c){c.put(e.request,n.clone())});
      return n;
    }).catch(function(){return caches.match(e.request).then(function(r){return r||caches.match('index.html')})}));
  }
});
