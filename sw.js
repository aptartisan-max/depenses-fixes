// sw.js — Service worker (cache-first strategy for app shell)
const CACHE_NAME = 'depenses-shell-v1'
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'gallery/icon-192.svg',
  'gallery/icon-512.svg'
]

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const req = event.request
  // Only handle GET requests
  if (req.method !== 'GET') return

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached
      return fetch(req).then(resp => {
        // Put a copy in cache for future requests (optional for cross-origin)
        try{
          const resClone = resp.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone))
        }catch(e){/* ignore if opaque or fails */}
        return resp
      }).catch(() => {
        // Fallback to cache index.html for navigation requests
        if (req.mode === 'navigate') return caches.match('index.html')
        return new Response('Offline', {status: 503, statusText: 'Offline'})
      })
    })
  )
})
