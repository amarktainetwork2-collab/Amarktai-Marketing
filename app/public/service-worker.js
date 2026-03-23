/**
 * AmarktAI Marketing — Service Worker
 * Copyright 2026
 *
 * Enables offline support and makes the app installable as a PWA.
 */

const CACHE_NAME = 'amarktai-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: pre-cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for all routes; API routes are network-only
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always fetch API requests from network — never cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network-first strategy for all other requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache only successful GET responses for the shell assets
        if (
          response.ok &&
          request.method === 'GET' &&
          (url.pathname === '/' || url.pathname === '/manifest.json')
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback: serve cached '/' for navigation requests only
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Push notifications (for future approval alerts)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'AmarktAI';
  const options = {
    body: data.body || 'You have new content ready for review.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'amarktai-notification',
    data: { url: data.url || '/dashboard/approval' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click: open the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});
