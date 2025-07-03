const CACHE_NAME = 'giardino-digitale-cache-v1'; // Incrementa la versione della cache ad ogni aggiornamento significativo
const urlsToCache = [
    '/',
    '/index.html',
    '/App.js',
    '/style.css',
    '/manifest.json',
    // Aggiungi qui altri asset statici che vuoi pre-caching
    // ad esempio, le tue icone di categoria
    '/assets/category_icons/flower.png',
    '/assets/category_icons/succulent.png',
    '/assets/category_icons/herbaceous.png',
    '/assets/category_icons/tree.png',
    '/assets/category_icons/shrub.png',
    '/assets/category_icons/vegetable.png',
    '/assets/category_icons/aromatic-herb.png',
    '/assets/category_icons/shade.png',
    '/assets/category_icons/partial-shade.png',
    '/assets/category_icons/full-sun.png',
    '/assets/category_icons/default.png',
    // CDN di terze parti (Firebase, React, Font Awesome, Tailwind)
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone@7.24.6/babel.min.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'
];

// Install event: cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Pre-caching assets...');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('[Service Worker] Errore durante il pre-caching:', error);
            })
    );
    self.skipWaiting(); // Attiva il nuovo service worker immediatamente
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Attivando Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando cache vecchia:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Prende il controllo delle pagine esistenti
});

// Fetch event: serve assets from cache or network
self.addEventListener('fetch', (event) => {
    // Per le richieste di navigazione (es. index.html), usa una strategia network-first
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Se la rete non è disponibile, restituisci la versione in cache di index.html
                return caches.match('/index.html');
            })
        );
        return;
    }

    // Per altri asset (CSS, JS, immagini), usa una strategia cache-first con fallback a network
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Cache the new response if it's valid
                return caches.open(CACHE_NAME).then((cache) => {
                    // Evita di cachare richieste non-GET o quelle con status non-OK
                    if (fetchResponse.status === 200 && event.request.method === 'GET') {
                        cache.put(event.request, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            }).catch((error) => {
                console.error('[Service Worker] Fetch fallito:', event.request.url, error);
                // Puoi aggiungere un fallback per le immagini o altri asset qui
                // ad esempio, restituire un'immagine placeholder
                // return caches.match('/path/to/offline-image.png');
            });
        })
    );
});

// Listener per i messaggi dall'applicazione per forzare l'attivazione del Service Worker
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
