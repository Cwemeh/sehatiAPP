
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, Bell, Pill, ShieldCheck, Heart, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Help: React.FC = () => {
  const navigate = useNavigate();
  const settings = useStore((state) => state.settings);

  const guides = [
    {
      icon: <Pill className="text-rose-500" />,
      title: "Cara Menambah Obat",
      desc: "Klik tombol '+' di pojok kanan atas beranda. Masukkan nama, dosis, dan pilih frekuensi yang sesuai (Harian, Hari Tertentu, atau Interval)."
    },
    {
      icon: <Bell className="text-amber-500" />,
      title: "Tentang Notifikasi",
      desc: "Alarm akan berdering pada jam yang ditentukan. Anda bisa memilih 'Sudah Minum' untuk mencatat riwayat atau 'Tunda' untuk diingatkan 10 menit lagi."
    },
    {
      icon: <Info className="text-blue-500" />,
      title: "Daftar Harian",
      desc: "Hanya obat yang belum diminum yang muncul di beranda. Obat dikelompokkan berdasarkan waktu (Pagi/Siang/Sore/Malam)."
    },
    {
      icon: <ShieldCheck className="text-emerald-500" />,
      title: "Keamanan Data",
      desc: "Seluruh data kesehatan Anda disimpan aman di perangkat ini. Kami tidak menyimpan data apa pun di server luar (Cloud)."
    }
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <ChevronLeft size={24} />
        </button>
        <h2 className={`font-black text-slate-900 dark:text-white ${settings.isSeniorMode ? 'text-3xl' : 'text-2xl'}`}>Pusat Bantuan</h2>
      </div>

      <div className="bg-rose-500 rounded-[32px] p-6 text-white shadow-xl shadow-rose-200 dark:shadow-none space-y-3">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <BookOpen size={24} />
        </div>
        <h3 className="text-xl font-black">Panduan SeHati v2.0</h3>
        <p className="text-sm font-medium opacity-90 leading-relaxed">
          Pahami cara kerja aplikasi untuk memaksimalkan disiplin pengobatan Anda.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Topik Utama</h4>
        <div className="grid gap-4">
          {guides.map((guide, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-[28px] border-2 border-slate-50 dark:border-slate-800 shadow-sm flex gap-4">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                {guide.icon}
              </div>
              <div className="space-y-1">
                <p className={`font-black text-slate-900 dark:text-white ${settings.isSeniorMode ? 'text-xl' : 'text-base'}`}>{guide.title}</p>
                <p className={`text-slate-500 dark:text-slate-400 font-medium leading-relaxed ${settings.isSeniorMode ? 'text-lg' : 'text-sm'}`}>{guide.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
        <Heart size={32} className="mx-auto text-rose-500" fill="currentColor" />
        <div className="space-y-1">
          <p className="font-black text-slate-800 dark:text-white">Punya Pertanyaan Lain?</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Kontak kami melalui email bantuan@sehati.id</p>
        </div>
      </div>
    </div>
  );
};
