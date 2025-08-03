// Basic service worker implementation for offline functionality
class ServiceWorker {
    constructor() {
        this.cacheName = 'offline-cache-v1';
        this.assetsToCache = [
            '/',
            '/src/service-worker.js',
            '/get_lists'
        ];
    }

    async install() {
        console.log('Installing service worker...');
        const cache = await caches.open(this.cacheName);
        const response = await fetch('https://localhost/');
        if (response.ok) {
            await cache.put('/', new Response(response.body, { 
                headers: { 'Content-Type': 'text/html; charset=UTF-8' }
            }));
            this.assetsToCache.forEach(asset => {
                caches.open(this.cacheName)
                    .then(cache => cache.add(asset));
            });
        }
    }

    async fetch(event) {
        console.log('Service worker intercepting request:', event.request.url);
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            console.log('Returning cached response:', event.request.url);
            return cachedResponse;
        }
        
        // If no cache, return a basic offline message
        return new Response('Offline - No connection', { 
            headers: { 'Content-Type': 'text/plain' }, 
            status: 408 
        });
    }
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/src/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
                registration.installer.install();
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}