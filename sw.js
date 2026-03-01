const CACHE_NAME = 'cym-tracker-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './app.js',
  './admin-app.js',
  './components/Layout.js',
  './components/Alert.js',
  './components/Loading.js',
  './utils/db.js',
  'https://resource.trickle.so/vendor_lib/unpkg/react@18/umd/react.production.min.js',
  'https://resource.trickle.so/vendor_lib/unpkg/react-dom@18/umd/react-dom.production.min.js',
  'https://resource.trickle.so/vendor_lib/unpkg/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://resource.trickle.so/vendor_lib/unpkg/lucide-static@0.516.0/font/lucide.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like API calls to Trickle DB or others unless they are explicitly cached assets
  if (!event.request.url.startsWith(self.location.origin) && !ASSETS_TO_CACHE.includes(event.request.url)) {
      return;
  }

  // Network First for HTML pages to ensure fresh content
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Stale-While-Revalidate for other resources
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
            // Check if valid response before caching
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                 cache.put(event.request, networkResponse.clone());
            }
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('push', function(event) {
  let data = { title: 'New Notification', body: 'You have a new update from CYM Tracker', icon: 'https://placehold.co/192x192/dc2626/ffffff?text=CYM' };
  
  if (event.data) {
    try {
        const json = event.data.json();
        data = { ...data, ...json };
    } catch (e) {
        data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.icon,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || self.location.origin
    },
    actions: [
      {action: 'explore', title: 'View Details'}
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then( windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (var i = 0; i < windowClients.length; i++) {
            var client = windowClients[i];
            // If so, just focus it.
            if (client.url === event.notification.data.url && 'focus' in client) {
                return client.focus();
            }
        }
        // If not, then open the target URL in a new window/tab.
        if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url);
        }
    })
  );
});
