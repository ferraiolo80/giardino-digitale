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
                    // console.log(`[Service Worker] Serving from cache: ${event.request.url}`); // Commentato per ridurre verbosità
                    return response;
                }
                // Nessuna cache hit - recupera dalla rete
                // console.log(`[Service Worker] Fetching from network: ${event.request.url}`); // Commentato per ridurre verbosità
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
