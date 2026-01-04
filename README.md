# SeHati - Dokumentasi Teknis Pengembangan (v2.0)

SeHati adalah aplikasi Progressive Web App (PWA) manajemen pengingat obat yang dirancang dengan arsitektur modern, mengedepankan privasi (Local-First) dan aksesibilitas tinggi.

## 🚀 Arsitektur & Teknologi
- **Frontend**: React 19 (ESM) dengan TypeScript.
- **Styling**: Tailwind CSS (Utility-first, responsive, dark mode support).
- **State Management**: Zustand dengan middleware `persist` (Menggantikan React Context untuk performa lebih baik dan penyimpanan otomatis ke localStorage).
- **Routing**: React Router 7 (HashRouter).
- **Icons**: Lucide React.
- **Offline**: Service Worker (sw.js).

## 📂 Struktur Folder di Komputer (Arsitektur Terbaru)
Pastikan Anda menyusun file di komputer Anda seperti ini. File `AppContext.tsx` sudah tidak diperlukan lagi:

```text
sehati-app/
├── components/
│   └── Layout.tsx
├── screens/
│   ├── AddMedication.tsx
│   ├── Dashboard.tsx
│   ├── EditMedication.tsx
│   ├── Help.tsx
│   ├── History.tsx
│   ├── MedicationList.tsx
│   ├── Onboarding.tsx
│   └── Settings.tsx
├── store/
│   └── useStore.ts
├── App.tsx
├── constants.tsx
├── index.html
├── index.tsx
├── manifest.json
├── metadata.json
├── README.md
├── sw.js
└── types.ts
```

## 💻 Development
1. **Install Dependencies**: `npm install`
2. **Run Application**: `npm run dev`
3. The application will be available at `http://localhost:5173/`

## 🌍 Panduan Deployment Singkat
1. **GitHub**: Buat repositori `sehati-app` dan unggah semua file di atas.
2. **Vercel**: Hubungkan repositori GitHub Anda dan pilih **Framework: Other**.
3. **PWA**: Buka link dari Vercel di HP, lalu pilih **"Tambah ke Layar Utama"**.

## 🛡️ Catatan Privasi
Semua data (Nama, Obat, Riwayat) disimpan secara lokal di browser/perangkat pengguna menggunakan `localStorage` melalui mekanisme **Zustand Persist**. Tidak ada data yang dikirim ke server luar.

---
**Tips**: Jika Anda sebelumnya memiliki file `storageService.ts` atau `AppContext.tsx`, Anda bisa menghapusnya agar folder proyek Anda tetap bersih dan ringan.