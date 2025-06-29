// service-worker.js

const CACHE_NAME = 'giardino-digitale-cache-v1';
const urlsToCache = [
    './', // Cache the root path (index.html)
    './index.html',
    './App.js',
    './style.css',
    '/assets/icons/icon-192x192.png', // Assicurati questi percorsi siano corretti
    '/assets/icons/icon-592x592.png',
    // Aggiungi qui anche le icone delle categorie se sono locali
    // Esempio: '/assets/category_icons/fiori-estivi.png',
    // Font Awesome e Firebase CDN non verranno cachati dal service worker locale,
    // dato che sono serviti da terze parti. Il browser si occupa della loro cache.
];

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('[Service Worker] Cache addAll failed:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Assicurati che il service worker controlli immediatamente i client attivi
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Intercetta solo le richieste GET per evitare problemi con POST (es. Firebase writes)
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - restituisci la risposta cachata
                if (response) {
                    console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                    return response;
                }
                // Nessuna cache hit - recupera dalla rete
                console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Controlla se la risposta è valida per la cache
                        // Non cachiamo richieste di range (es. video), estensioni chrome, ecc.
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clona la risposta perché lo stream può essere letto solo una volta
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch((error) => {
                                console.warn(`[Service Worker] Failed to cache ${event.request.url}:`, error);
                            });
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error(`[Service Worker] Fetch failed for ${event.request.url}:`, error);
                        // Puoi aggiungere un fallback per pagine offline qui se necessario
                        // Esempio: return caches.match('/offline.html');
                    });
            })
    );
});
