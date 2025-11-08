// Service Worker for Push Notifications
// This file handles push notifications in the background

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push notification received');
  
  if (!event.data) {
    console.log('[Service Worker] No data in push event');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
    return;
  }

  const title = data.title || 'Dieu veille sur nos enfants';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: data.url || '/',
      id: data.id,
    },
    tag: data.tag || 'default',
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If a Window tab matching the notification URL already exists, focus it
      const url = event.notification.data.url || '/';
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
