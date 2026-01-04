
const CACHE_NAME = 'sehati-cache-v2';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// Listener Notifikasi dengan Tombol Aksi
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const options = {
      body: `Jadwal obat: ${event.data.medName}. Segera minum untuk kesehatan Anda!`,
      icon: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png',
      vibrate: [500, 200, 500, 200, 500, 200, 500],
      tag: `med-${event.data.medId}`, // Unik per obat
      renotify: true,
      requireInteraction: true, // Notifikasi tidak akan hilang sampai di-swipe/diklik
      actions: [
        { action: 'taken', title: '✅ SAYA SUDAH MINUM', icon: '' },
        { action: 'snooze', title: '⏰ TUNDA 10 MENIT', icon: '' }
      ],
      data: {
        medId: event.data.medId,
        medName: event.data.medName,
        time: event.data.time
      }
    };

    self.registration.showNotification('WAKTUNYA MINUM OBAT!', options);
  }
});

// Menangani klik pada tombol di Notifikasi Popup
self.addEventListener('notificationclick', (event) => {
  const { action, notification, data } = event;
  notification.close();

  if (action === 'taken') {
    // Kirim pesan ke aplikasi untuk mencatat riwayat
    broadcastToClients({ type: 'MED_TAKEN', ...data });
  } else if (action === 'snooze') {
    // Kirim pesan ke aplikasi untuk mengatur snooze
    broadcastToClients({ type: 'MED_SNOOZE', ...data });
  } else {
    // Jika user klik area notifikasi (bukan tombol), buka aplikasi
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) return clientList[0].focus();
        return clients.openWindow('/');
      })
    );
  }
});

function broadcastToClients(message) {
  clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage(message));
  });
}
