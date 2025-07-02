// service-worker.js

const CACHE_NAME = 'giardino-digitale-cache-v1';
const urlsToCache = [
    './', // Cache the root path (index.html)
    './index.html',
    './App.js',
    './style.css',
    '/manifest.json',
    '/assets/icons/icon-192x192.png', // <-- VERIFICA QUESTI PERCORSI E NOMI FILE
    '/assets/icons/icon-512x512.png', // <-- VERIFICA QUESTI PERCORSI E NOMI FILE
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css',
    'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/10.11.0/firebase-storage-compat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js'
    '/assets/category_icons/alberi.png
    '/assets/category_icons/arbusti.png
    '/assets/category_icons/erbe-aromatiche.png
    '/assets/category_icons/fiori.png
    '/assets/category_icons/ortaggi.png
    '/assets/category_icons/piante.png
    '/assets/category_icons/pianta-grasse.png
    '/assets/category_icons/succulente.png
    // Aggiungi qui anche le icone delle categorie se sono locali e non placeholder
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
                // Prova a cachare tutte le risorse. Se una fallisce, l'intero addAll fallisce.
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('[Service Worker] Cache addAll failed:', error);
                // Puoi aggiungere qui una diagnostica più specifica se necessario,
                // ma spesso l'errore del browser è già sufficientemente descrittivo.
                // L'errore "Request failed" significa che il browser non è riuscito a scaricare il file.
                // Ciò è quasi sempre dovuto a un percorso errato o a un file mancante (HTTP 404).
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

// Fetch event: serving from cache or network
self.addEventListener('fetch', event => {
    // IMPORTANT: Only try to cache http or https requests.
    // Ignore chrome-extension://, data:, etc.
    if (event.request.url.startsWith('http') || event.request.url.startsWith('https')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    // No cache hit - fetch from network
                    return fetch(event.request).then(
                        fetchResponse => {
                            // Check if we received a valid response
                            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                                return fetchResponse;
                            }

                            // IMPORTANT: Clone the response. A response is a stream
                            // and can only be consumed once. We must clone it so that
                            // the browser can consume one and we can consume the other.
                            const responseToCache = fetchResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });

                            return fetchResponse;
                        }
                    );
                })
                .catch(error => {
                    console.error('Fetch failed:', error);
                    // You could serve an offline page here
                    // return caches.match('/offline.html');
                })
        );
    } else {
        // For non-http/https requests, just let them go to the network
        // (or fail if they are unsupported by the browser directly)
        return; 
    }
});
