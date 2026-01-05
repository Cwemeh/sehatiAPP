
const CACHE_NAME = 'sehati-cache-v3.0';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      console.log('SeHati SW: Aktif dan siap menangani pengingat.');
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// Menangani permintaan notifikasi dari aplikasi utama
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { medId, medName, time, image, dosage } = event.data;
    
    const options = {
      body: `Waktunya ${dosage} ${medName} (${time}). Sehat dimulai dari disiplin!`,
      icon: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png',
      image: image || undefined,
      vibrate: [500, 150, 500, 150, 500],
      tag: `med-${medId}`, // Mencegah notifikasi menumpuk untuk obat yang sama
      renotify: true,
      requireInteraction: true,
      actions: [
        { action: 'taken', title: '✅ SUDAH DIMINUM' },
        { action: 'snooze', title: '⏰ TUNDA 10 MENIT' }
      ],
      data: { medId, medName, time }
    };

    event.waitUntil(
      self.registration.showNotification('PENGINGAT OBAT SEHATI', options)
    );
  }
});

// Menangani klik pada notifikasi atau tombol aksinya
self.addEventListener('notificationclick', (event) => {
  const { action, notification, data } = event;
  notification.close();

  if (action === 'taken') {
    event.waitUntil(broadcastToClients({ type: 'MED_TAKEN_FROM_SW', ...data }));
  } else if (action === 'snooze') {
    event.waitUntil(broadcastToClients({ type: 'MED_SNOOZE_FROM_SW', ...data }));
  } else {
    // Fokus kembali ke aplikasi jika notifikasi diklik biasa
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) return clientList[0].focus();
        return clients.openWindow('/');
      })
    );
  }
});

async function broadcastToClients(message) {
  const allClients = await clients.matchAll({ includeUncontrolled: true, type: 'window' });
  for (const client of allClients) {
    client.postMessage(message);
  }
}
