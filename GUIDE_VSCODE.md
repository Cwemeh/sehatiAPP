
# 🛠 Panduan Pengembangan SeHati di VS Code

Dokumen ini berisi instruksi detail untuk menjalankan, menguji, dan mengembangkan aplikasi **SeHati** di lingkungan lokal menggunakan Visual Studio Code.

---

## 📂 Struktur Folder Proyek

Aplikasi ini menggunakan struktur folder yang terorganisir untuk memudahkan pemeliharaan kode. Berikut adalah susunan foldernya:

```text
SeHati-Project/
├── components/          # Komponen UI yang dapat digunakan kembali
│   └── Layout.tsx       # Bingkai utama aplikasi (Header, Navigasi, Alarm)
├── screens/             # Halaman utama (Views) aplikasi
│   ├── Dashboard.tsx    # Tampilan beranda dan jadwal hari ini
│   ├── MedicationList.tsx # Daftar semua obat yang terdaftar
│   ├── AddMedication.tsx # Formulir tambah obat baru
│   ├── EditMedication.tsx # Formulir ubah data obat
│   ├── History.tsx      # Catatan riwayat minum obat
│   ├── Settings.tsx     # Pengaturan (Mode Gelap, Cloud Sync, dll)
│   ├── Onboarding.tsx   # Layar sambutan untuk pengguna baru
│   └── Help.tsx         # Pusat bantuan dan panduan
├── services/            # Logika eksternal dan API
│   ├── storageService.ts    # Utilitas manajemen LocalStorage
│   └── googleDriveService.ts # Integrasi sinkronisasi Google Drive
├── store/               # State Management (Manajemen Data)
│   └── useStore.ts      # Pusat data aplikasi menggunakan Zustand
├── index.html           # File HTML utama (Entry Point)
├── index.tsx            # Inisialisasi React
├── App.tsx              # Komponen utama dan Routing
├── types.ts             # Definisi tipe data (TypeScript)
├── constants.tsx        # Data statis (Tips kesehatan, daftar warna)
├── sw.js                # Service Worker untuk fitur PWA & Notifikasi
├── manifest.json        # Konfigurasi instalasi aplikasi di HP
├── package.json         # Daftar library dan script perintah
└── tsconfig.json        # Konfigurasi TypeScript
```

---

## 1. Persiapan Awal (Prerequisites)

Sebelum membuka kode, pastikan perangkat Anda sudah memiliki:

1.  **Node.js (Versi 18 atau lebih baru)**: Diperlukan untuk menjalankan NPM dan Vite.
    *   Unduh di: [nodejs.org](https://nodejs.org/)
2.  **Visual Studio Code**: Editor kode utama.
3.  **Ekstensi VS Code yang Direkomendasikan**:
    *   *ESLint*: Untuk deteksi kesalahan kode otomatis.
    *   *Prettier*: Untuk merapikan format kode saat disimpan.
    *   *Tailwind CSS IntelliSense*: Memberikan saran otomatis saat menulis class CSS.

---

## 2. Langkah-Langkah Instalasi

Ikuti urutan ini dengan teliti:

### Langkah A: Menyiapkan Folder
1. Buat folder baru di komputer Anda (misal: `Proyek-SeHati`).
2. Masukkan semua file aplikasi ke dalam folder tersebut sesuai dengan struktur folder di atas.
3. Buka VS Code, pilih **File > Open Folder...**, lalu arahkan ke folder proyek tersebut.

### Langkah B: Instalasi Library (Dependencies)
1. Buka terminal di dalam VS Code (**Ctrl + `** atau **Terminal > New Terminal**).
2. Ketik perintah berikut dan tekan Enter:
   ```bash
   npm install
   ```
   *Perintah ini akan membaca `package.json` dan mengunduh semua library (React, Lucide, Zustand, Tailwind) ke folder `node_modules`.*

---

## 3. Menjalankan Aplikasi

Setelah instalasi selesai, Anda siap menjalankan aplikasi:

1. Di terminal VS Code, ketik:
   ```bash
   npm run dev
   ```
2. Anda akan melihat pesan di terminal: `  ➜  Local:   http://localhost:5173/`.
3. Klik link tersebut sambil menahan tombol **Ctrl** (atau **Cmd** di Mac).
4. Aplikasi akan terbuka di browser Anda.

---

## 4. Tips Pengembangan (Development Tips)

### A. Hot Module Replacement (HMR)
Vite mendukung HMR. Artinya, setiap kali Anda mengubah kode di VS Code (misal: mengubah warna teks di `Dashboard.tsx`) dan menekal **Ctrl+S**, browser akan otomatis memperbarui tampilan tanpa perlu melakukan *refresh* manual.

### B. Mode Gelap & Mode Lansia
Untuk menguji tampilan dalam berbagai kondisi:
1. Buka aplikasi di browser.
2. Masuk ke halaman **Setelan**.
3. Aktifkan/Matikan sakelar **Mode Gelap** atau **Mode Lansia**.
4. Perhatikan bagaimana Tailwind CSS secara dinamis mengubah ukuran teks dan warna.

### C. Menguji Alarm & Suara
Browser sering memblokir suara yang diputar secara otomatis.
*   **Penting**: Setelah membuka aplikasi, lakukan setidaknya satu interaksi (klik apa saja) agar browser memberikan izin kepada `AudioContext` untuk memutar nada alarm saat jadwal tiba.

### D. Fitur PWA (Progressive Web App)
Untuk menguji fitur PWA (seperti instalasi ke desktop):
1. Gunakan browser **Chrome** atau **Edge**.
2. Klik ikon "Install" yang muncul di ujung bilah alamat (URL bar).
3. Aplikasi akan terinstal sebagai aplikasi mandiri yang bisa dibuka tanpa browser.

---

## 5. Pemecahan Masalah (Troubleshooting)

*   **Error "npm not found"**: Pastikan Node.js sudah terinstal dan Anda sudah me-restart VS Code setelah instalasi Node.js.
*   **Suara Alarm tidak berbunyi**: Periksa setelan browser. Pastikan *Sound* tidak di-mute untuk `localhost`.
*   **Google Drive Sync Gagal**: Fitur ini membutuhkan koneksi internet. Jika Anda mendapatkan error 401, coba putuskan koneksi di Setelan dan hubungkan kembali untuk mendapatkan token baru.

---

**SeHati Development Team**  
*Selamat berkarya dan membantu meningkatkan kesehatan keluarga Indonesia!*
