# 🏥 SeHati - Pengingat Obat Pintar & Sahabat Lansia

**SeHati** adalah aplikasi manajemen pengobatan progresif (PWA) yang dirancang untuk memastikan kepatuhan minum obat dengan cara yang intuitif, aman, dan inklusif. Aplikasi ini mengutamakan aksesibilitas, terutama bagi lansia (Senior Mode).

---

## 🛠️ Panduan Pengembangan (Developer Guide)

Aplikasi ini dibangun menggunakan arsitektur **Modern Single Page Application (SPA)** dengan fokus pada performa dan fungsionalitas offline.

### 1. Arsitektur State Management

Aplikasi menggunakan **Zustand** (`store/useStore.ts`) sebagai pusat kebenaran (Source of Truth).

- **Persistensi**: State disimpan secara otomatis di `localStorage` menggunakan middleware persist.
- **Modul**: State mencakup data obat (`medications`), riwayat (`history`), jadwal yang sudah diambil (`takenSchedules`), alarm yang ditunda (`snoozedAlerts`), dan pengaturan pengguna (`settings`).

### 2. Alur Kerja Penjadwalan & Alarm

Aplikasi memantau waktu secara real-time untuk memicu alarm:

- **Checker Loop**: Di dalam `components/Layout.tsx`, terdapat `setInterval` yang berjalan setiap 15 detik.
- **Logika Deteksi**: Mengecek waktu saat ini terhadap array `schedules` pada setiap obat, dengan mempertimbangkan `frequencyType` (Harian, Hari Spesifik, atau Interval).
- **Multi-Channel Notification**:
  - **In-App Overlay**: Muncul pop-up layar penuh dengan suara alarm (`AudioContext`).
  - **System Notification (PWA)**: Melalui `OneSignalSDKWorker.js` (Service Worker), mengirim notifikasi push ke sistem operasi yang mendukung interaksi langsung (Tombol Sudah Minum/Tunda).

### 3. Alur Kerja Sinkronisasi Awan (Cloud Sync)

Sinkronisasi menggunakan **Google Drive API v3 (AppData Folder)**.

- **Keamanan**: Folder AppData bersifat tersembunyi; hanya aplikasi SeHati yang bisa mengakses file cadangan tersebut.
- **Otentikasi**: Menggunakan Google Identity Services (GIS) untuk mendapatkan `accessToken`.
- **Auto-Sync**: Setiap kali ada perubahan state (tambah/hapus obat atau riwayat), aplikasi akan memicu upload otomatis jika fitur cloud aktif.

### 4. Sistem Aksesibilitas (Senior Mode)

Sistem ini bekerja dengan memanfaatkan variabel `isSeniorMode` di dalam state settings.

- **Visual Scaling**: Tailwind CSS secara kondisional mengubah ukuran teks (misal: `text-base` menjadi `text-xl`) dan ukuran target sentuh (padding dan besar ikon).
- **Slide to Confirm**: Mekanisme geser (`SlideConfirm` di `screens/Dashboard.tsx`) dirancang untuk mencegah klik yang tidak disengaja oleh pengguna dengan tremor.

---

## 🚀 Fitur Utama & Fungsionalitas

### 1. Manajemen Obat Cerdas

- **Identitas Visual**: Mendukung pengambilan foto obat dan pemilihan warna kategori (Blue, Emerald, Rose, Amber, Purple, Indigo).
- **Ikon Adaptif**: Ikon berubah otomatis sesuai jenis sediaan (Tablet, Kapsul, Sirup, Salep, Tetes, Suntik).
- **Penjadwalan Fleksibel**:
  - **Daily**: Rutinitas harian.
  - **Specific Days**: Untuk obat yang tidak dikonsumsi setiap hari.
  - **Interval**: Menghitung jeda hari berdasarkan tanggal mulai.

### 2. Pengaturan Suara & Vibrasi

- **Nada Gentle**: Sine wave lembut untuk pengingat yang tidak mengejutkan.
- **Nada Urgent**: Square wave tegas untuk memastikan kepatuhan.
- **Silent**: Mode diam dengan getaran (`Vibration API`) jika didukung perangkat.

### 3. Pelacakan Stok & Inventaris

- **Auto-Deduct**: Stok berkurang otomatis setiap kali obat ditandai "Sudah Minum".
- **Threshold Alert**: Peringatan visual muncul di Dashboard jika stok berada di bawah batas minimum.

### 4. Ekspor Data Medis

- Pengguna dapat mengunduh riwayat pengobatan dalam format **CSV** untuk kebutuhan konsultasi dengan dokter atau tenaga medis.

---

## 💻 Tech Stack

- **Library Utama**: React 19, React Router 7.
- **Ikon**: Lucide React.
- **Styling**: Tailwind CSS (Native Dark Mode).
- **Offline**: Service Worker (PWA).

Dibuat dengan dedikasi untuk meningkatkan kualitas kesehatan keluarga.
