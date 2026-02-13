const CACHE_NAME = 'lampu-checkin-v1';
const urlsToCache = [
  '/checkin-app.html',
  '/manifest.json',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - try network first, then cache
  if (url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone response and cache it
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
  );
});

// Background sync for offline check-ins
self.addEventListener('sync', event => {
  if (event.tag === 'sync-checkins') {
    event.waitUntil(syncCheckIns());
  }
});

async function syncCheckIns() {
  // Get pending check-ins from IndexedDB
  const db = await openDB();
  const tx = db.transaction('pending-checkins', 'readonly');
  const store = tx.objectStore('pending-checkins');
  const pendingCheckIns = await store.getAll();
  
  // Try to sync each one
  for (const checkIn of pendingCheckIns) {
    try {
      const response = await fetch(checkIn.url, {
        method: 'PATCH',
        headers: checkIn.headers,
        body: JSON.stringify(checkIn.body)
      });
      
      if (response.ok) {
        // Remove from pending
        const deleteTx = db.transaction('pending-checkins', 'readwrite');
        const deleteStore = deleteTx.objectStore('pending-checkins');
        await deleteStore.delete(checkIn.id);
      }
    } catch (error) {
      console.error('Sync failed for check-in:', checkIn.id, error);
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lampu-checkin-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Store for pending check-ins
      if (!db.objectStoreNames.contains('pending-checkins')) {
        db.createObjectStore('pending-checkins', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store for cached quotas
      if (!db.objectStoreNames.contains('quotas')) {
        const quotaStore = db.createObjectStore('quotas', { keyPath: 'USER_ID' });
        quotaStore.createIndex('CODE', 'CODE', { unique: false });
        quotaStore.createIndex('STATUS', 'STATUS', { unique: false });
      }
    };
  });
}
