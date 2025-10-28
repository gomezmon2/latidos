/**
 * Service Worker para Latidos
 * Maneja notificaciones push y caché offline
 */

const CACHE_NAME = 'latidos-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activación del Service Worker
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
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'Latidos';
  const options = {
    body: data.body || '',
    icon: '/logo.png',
    badge: '/badge.png',
    tag: data.tag || 'latidos-notification',
    data: data.data || {},
    requireInteraction: false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Buscar si ya hay una ventana abierta de la aplicación
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin)) {
            // Enviar mensaje a la ventana existente para que navegue
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: urlToOpen
            });
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Manejo de mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
