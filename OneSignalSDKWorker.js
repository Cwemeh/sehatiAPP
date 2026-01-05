// 1. Import Script OneSignal (Wajib diletakkan paling atas)
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// 2. Logika PWA & Caching SeHati (Pindahan dari sw.js lama)
const CACHE_NAME = "sehati-cache-v3.0";
const ASSETS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      console.log("SeHati SW (OneSignal Integrated): Aktif dan siap.");
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// 3. Logika Notifikasi Lokal (Pindahan dari sw.js lama)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { medId, medName, time, image, dosage } = event.data;

    const options = {
      body: `Waktunya ${dosage} (${medName}). Sehat dimulai dari disiplin!`,
      icon: "https://cdn-icons-png.flaticon.com/512/3004/3004458.png",
      badge: "https://cdn-icons-png.flaticon.com/512/3004/3004458.png",
      image: image || undefined,
      vibrate: [500, 150, 500, 150, 500],
      tag: `med-${medId}`,
      renotify: true,
      requireInteraction: true,
      actions: [
        { action: "taken", title: "✅ SUDAH DIMINUM" },
        { action: "snooze", title: "⏰ TUNDA 10 MENIT" },
      ],
      data: { medId, medName, time },
    };

    event.waitUntil(
      self.registration.showNotification("PENGINGAT OBAT SEHATI", options)
    );
  }
});

// Handler klik notifikasi (Perlu disesuaikan agar tidak bentrok dengan OneSignal)
self.addEventListener("notificationclick", (event) => {
  // Cek apakah ini notifikasi lokal kita (berdasarkan data custom kita)
  if (
    event.notification.data &&
    (event.notification.data.medId || event.action)
  ) {
    const { action, notification } = event;
    const data = notification.data;

    notification.close();

    if (action === "taken") {
      event.waitUntil(
        broadcastToClients({ type: "MED_TAKEN_FROM_SW", ...data })
      );
    } else if (action === "snooze") {
      event.waitUntil(
        broadcastToClients({ type: "MED_SNOOZE_FROM_SW", ...data })
      );
    } else {
      event.waitUntil(
        clients
          .matchAll({ type: "window", includeUncontrolled: true })
          .then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow("/");
          })
      );
    }
  }
  // Jika bukan notifikasi lokal, biarkan OneSignal menanganinya
});

async function broadcastToClients(message) {
  const allClients = await clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  for (const client of allClients) {
    client.postMessage(message);
  }
}
