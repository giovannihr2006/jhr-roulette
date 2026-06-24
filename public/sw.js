/**
 * Service Worker for GHR Ruleta Royale
 * Provides offline support and caching
 */

const CACHE_NAME = 'ghr-ruleta-v1'
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json'
]

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets')
                return cache.addAll(ASSETS_TO_CACHE)
            })
            .then(() => {
                console.log('[SW] Install complete')
                return self.skipWaiting()
            })
            .catch((error) => {
                console.error('[SW] Install failed:', error)
            })
    )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name)
                            return caches.delete(name)
                        })
                )
            })
            .then(() => {
                console.log('[SW] Activate complete')
                return self.clients.claim()
            })
    )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse
                }

                // Fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-success responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response
                        }

                        // Clone the response
                        const responseToCache = response.clone()

                        // Cache the fetched response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache)
                            })

                        return response
                    })
                    .catch(() => {
                        // Offline fallback for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html')
                        }
                        return new Response('Offline', { status: 503 })
                    })
            })
    )
})

// Message handler for manual cache updates
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting()
    }
})
